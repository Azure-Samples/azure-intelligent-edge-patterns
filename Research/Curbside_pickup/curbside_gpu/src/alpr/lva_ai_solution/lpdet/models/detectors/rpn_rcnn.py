import logging
import torch
import torch.nn as nn

from ...core import bbox2roi, corner2bbox, build_assigner, build_sampler

from .. import builder
from ..builder import DETECTORS


@DETECTORS.register_module
class RPNRCNNDetector(nn.Module):

    def __init__(self,
                 backbone,
                 rpn_head,
                 roi_extractor,
                 corner_head,
                 neck=None,
                 train_cfg=None,
                 test_cfg=None):
        super(RPNRCNNDetector, self).__init__()
        self.backbone = builder.build_backbone(backbone)
        if neck is not None:
            self.neck = builder.build_neck(neck)

        self.rpn_head = builder.build_head(rpn_head)
        self.roi_extractor = builder.build_roi_extractor(roi_extractor)
        self.corner_head = builder.build_head(corner_head)

        self.train_cfg = train_cfg
        self.test_cfg = test_cfg

        self.init_weights()

    def init_weights(self):
        self.backbone.init_weights()
        self.rpn_head.init_weights()
        self.corner_head.init_weights()

        if self.with_neck:
            if isinstance(self.neck, nn.Sequential):
                for m in self.neck:
                    m.init_weights()
            else:
                self.neck.init_weights()

    def extract_feat(self, img):
        x = self.backbone(img)
        if self.with_neck:
            x = self.neck(x)
        return x

    def forward(self, img, img_ori, img_meta, return_loss=True, **kwargs):
        if return_loss:
            return self.forward_train(img, img_ori, img_meta, **kwargs)
        else:
            return self.forward_test(img, img_ori, img_meta, **kwargs)

    def forward_test(self, img, img_ori, img_meta, **kwargs):
        num_imgs = img.size(0)

        x = self.extract_feat(img)
        rpn_outs = self.rpn_head(x)
        proposal_inputs = rpn_outs + (img_meta, self.test_cfg.proposal)
        proposal_list = self.rpn_head.get_bboxes(*proposal_inputs)
        # forward
        crop_rois = []
        for i in range(num_imgs):
            bboxes = proposal_list[i]
            sf = torch.from_numpy(img_meta[i]['scale_factor']).view(1, 2).repeat(1, 2).type_as(bboxes)
            crop_rois.append(bboxes[:, 0:4] / sf)
        crop_rois = bbox2roi(crop_rois)
        crop_img = self.roi_extractor(img_ori, crop_rois)
        cls_scores, corner_deltas = self.corner_head(crop_img)
        pred_scores, pred_corners = self.corner_head.get_det_corners(crop_rois[:, 1:].contiguous(),
                                                                     cls_scores,
                                                                     corner_deltas,
                                                                     self.test_cfg.rcnn)
        return torch.cat([pred_corners, pred_scores[:, None]], dim=1)

    def forward_train(self, img, img_ori, img_meta, gt_corners):
        gt_bboxes = [corner2bbox(_) for _ in gt_corners]
        gt_labels = [torch.LongTensor(gt_bboxes[i].size(0)).to(gt_bboxes[i].device)
                     for i in range(len(gt_bboxes))]
        x = self.extract_feat(img)
        losses = dict()

        # RPN forward and loss
        rpn_outs = self.rpn_head(x)
        rpn_loss_intputs = rpn_outs + (gt_bboxes, img_meta, self.train_cfg.rpn)
        rpn_losses = self.rpn_head.loss(*rpn_loss_intputs)
        losses.update(rpn_losses)

        proposal_inputs = rpn_outs + (img_meta, self.train_cfg.proposal)
        proposal_list = self.rpn_head.get_bboxes(*proposal_inputs)

        # assign gts and sample proposals
        bbox_assigner = build_assigner(self.train_cfg.rcnn.assigner)
        bbox_sampler = build_sampler(self.train_cfg.rcnn.sampler, context=self)
        num_imgs = img.size(0)
        sampling_results = []
        for i in range(num_imgs):
            assign_result = bbox_assigner.assign(proposal_list[i], gt_bboxes[i], gt_labels[i])
            sampling_result = bbox_sampler.sample(
                    assign_result,
                    proposal_list[i],
                    gt_bboxes[i],
                    gt_labels[i],
                    feats=[lvl_feat[i][None] for lvl_feat in x])
            sampling_results.append(sampling_result)

        # to crop from the original image, the bounding-box should be rescaled into the original domain.
        crop_rois = []
        gt_corners_ori = []
        for i in range(num_imgs):
            bboxes = sampling_results[i].bboxes
            sf = torch.from_numpy(img_meta[i]['scale_factor']).view(1, 2).repeat(1, 2).type_as(bboxes)
            crop_rois.append(bboxes / sf)
            sf = sf.repeat(1, 2)
            gt_corners_ori.append(gt_corners[i] / sf)
        crop_rois = bbox2roi(crop_rois)
        crop_img = self.roi_extractor(img_ori, crop_rois)

        cls_scores, corner_deltas = self.corner_head(crop_img)
        corner_head_targets = self.corner_head.get_target(sampling_results,
                                                          crop_rois,
                                                          gt_corners_ori,
                                                          self.train_cfg.rcnn)
        corner_losses = self.corner_head.loss(cls_scores, corner_deltas, *corner_head_targets)
        losses.update(corner_losses)

        return losses

    @property
    def with_neck(self):
        return hasattr(self, 'neck') and self.neck is not None
