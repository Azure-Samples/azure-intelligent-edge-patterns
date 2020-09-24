import numpy as np
import torch
import torch.nn as nn
from itertools import product

from .. import builder
from ..builder import RECOGNIZERS
from ...core import bbox2roi, bbox2result, build_assigner, build_sampler, bbox_overlaps
from ...apis import US_CHARACTERS


@RECOGNIZERS.register_module
class FasterRCNN(nn.Module):

    def __init__(self,
                 backbone,
                 concat_region=True,
                 neck=None,
                 shared_head=None,
                 rpn_head=None,
                 character_head=None,
                 country_head=None,
                 bbox_roi_extractor=None,
                 bbox_head=None,
                 train_cfg=None,
                 test_cfg=None):
        super(FasterRCNN, self).__init__()
        self.backbone = builder.build_backbone(backbone)

        if neck is not None:
            self.neck = builder.build_neck(neck)

        self.rpn_head = builder.build_head(rpn_head)

        self.character_head = builder.build_head(character_head)
        self.country_head = builder.build_head(country_head)

        self.shared_head = builder.build_shared_head(shared_head)

        self.bbox_roi_extractor = builder.build_roi_extractor(
                bbox_roi_extractor)
        self.bbox_head = builder.build_head(bbox_head)

        self.train_cfg = train_cfg
        self.test_cfg = test_cfg

        self.concat_region = concat_region
        self.init_weights()

    def init_weights(self):
        self.backbone.init_weights()
        if self.with_neck:
            self.neck.init_weights()
        self.rpn_head.init_weights()
        self.character_head.init_weights()
        self.country_head.init_weights()
        self.shared_head.init_weights()
        self.bbox_head.init_weights()

    def extract_feat(self, img):
        x = self.backbone(img)
        if self.with_neck:
            x = self.neck(x)
        return x

    def test_rpn(self, img, img_meta, **kwargs):
        # Step 1, forward network
        x = self.extract_feat(img)  # backbone feature
        # RPN
        rpn_outs = self.rpn_head(x)
        proposal_inputs = rpn_outs + (img_meta, self.test_cfg.proposal)
        proposal_list = self.rpn_head.get_bboxes(*proposal_inputs)
        rois = bbox2roi(proposal_list)
        return rois

    def forward(self, img, img_meta, rpn_only=False, return_loss=True, **kwargs):

        if rpn_only:
            return self.test_rpn(img, img_meta, **kwargs)

        if return_loss:
            return self.forward_train(img, img_meta, **kwargs)
        else:
            return self.forward_test(img, img_meta, **kwargs)

    def forward_test(self, img, img_meta, **kwargs):
        # TODO(guangting): enable multiple images testing.
        assert img.size(0) == 1, "Support batchsize==1 in inference."

        # Step 1, forward network
        x = self.extract_feat(img)  # backbone feature
        num_ch = self.character_head.get_length(self.character_head(x[0]))  # number of characters
        countries = self.country_head(x[0])  # country classification
        # RPN
        rpn_outs = self.rpn_head(x)
        proposal_inputs = rpn_outs + (img_meta, self.test_cfg.proposal)
        proposal_list = self.rpn_head.get_bboxes(*proposal_inputs)
        rois = bbox2roi(proposal_list)
        roi_inds = rois[:, 0].contiguous().long()
        roi_countries = countries[roi_inds, :].contiguous().detach()
        # BBox head
        bbox_feats = self.bbox_roi_extractor(x[:self.bbox_roi_extractor.num_inputs], rois)
        bbox_feats = self.shared_head(bbox_feats)
        if self.concat_region:
            bbox_feats = torch.cat([bbox_feats, roi_countries], dim=1)
        cls_score, bbox_pred = self.bbox_head(bbox_feats)
        # Step 2, get detection results.
        det_bboxes, det_labels = self.bbox_head.get_det_bboxes(
            rois,
            cls_score,
            bbox_pred,
            img_shape=img_meta[0]['img_shape'],
            scale_factor=img_meta[0]['scale_factor'],
            rescale=False,
            cfg=self.test_cfg.rcnn
        )
        bbox_results = bbox2result(det_bboxes, det_labels,
                                   self.bbox_head.num_classes)

        # final_dets = brute_force_select(bbox_results, num_ch[0])
        # final_dets = select_dets(bbox_results, num_ch[0])
        final_dets = bf_select(bbox_results, num_ch[0])
        final_dets = [det2character_classes(dets) for dets in final_dets]

        return dict(dets=final_dets, bboxes=bbox_results)

    def forward_train(self,
                      img,
                      img_meta,
                      gt_bboxes,
                      gt_labels,
                      gt_countries,
                      gt_bboxes_ignore=None):

        # extract feature from backbone & FPN neck
        x = self.extract_feat(img)

        losses = dict()

        # get RPN output
        rpn_outs = self.rpn_head(x)
        rpn_loss_inputs = rpn_outs + (gt_bboxes, img_meta,
                                      self.train_cfg.rpn)
        rpn_losses = self.rpn_head.loss(
            *rpn_loss_inputs, gt_bboxes_ignore=gt_bboxes_ignore)
        losses.update(rpn_losses)

        # Get proposals from RPN
        proposal_inputs = rpn_outs + (img_meta, self.train_cfg.proposal)
        proposal_list = self.rpn_head.get_bboxes(*proposal_inputs)

        # number of characters head
        num_ch = self.character_head(x[0])
        losses['loss_num_ch'] = self.character_head.loss(num_ch, gt_bboxes)

        # country head
        countries = self.country_head(x[0])
        losses['loss_country'] = self.country_head.loss(countries, gt_countries)

        bbox_assigner = build_assigner(self.train_cfg.rcnn.assigner)
        bbox_sampler = build_sampler(self.train_cfg.rcnn.sampler, context=self)
        num_imgs = img.size(0)
        if gt_bboxes_ignore is None:
            gt_bboxes_ignore = [None for _ in range(num_imgs)]
        sampling_results = []
        for i in range(num_imgs):
            assign_result = bbox_assigner.assign(proposal_list[i], gt_bboxes[i], gt_bboxes_ignore[i], gt_labels[i])
            sampling_result = bbox_sampler.sample(
                    assign_result,
                    proposal_list[i],
                    gt_bboxes[i],
                    gt_labels[i],
                    feats=[lvl_feat[i][None] for lvl_feat in x])
            sampling_results.append(sampling_result)

        # bbox head forward and loss
        rois = bbox2roi([res.bboxes for res in sampling_results])
        roi_inds = rois[:, 0].contiguous().long()
        roi_countries = countries[roi_inds, :].contiguous().detach()
        # TODO: a more flexible way to decide which feature maps to use
        bbox_feats = self.bbox_roi_extractor(x[:self.bbox_roi_extractor.num_inputs], rois)
        bbox_feats = self.shared_head(bbox_feats)
        if self.concat_region:
            bbox_feats = torch.cat([bbox_feats, roi_countries], dim=1)
        cls_score, bbox_pred = self.bbox_head(bbox_feats)

        bbox_targets = self.bbox_head.get_target(sampling_results, gt_bboxes, gt_labels, self.train_cfg.rcnn)
        loss_bbox = self.bbox_head.loss(cls_score, bbox_pred, *bbox_targets)
        losses.update(loss_bbox)

        return losses

    @property
    def with_neck(self):
        return hasattr(self, 'neck') and self.neck is not None

    @property
    def with_shared_head(self):
        return hasattr(self, 'shared_head') and self.shared_head is not None

    @property
    def with_bbox(self):
        return hasattr(self, 'bbox_head') and self.bbox_head is not None

    @property
    def with_mask(self):
        return hasattr(self, 'mask_head') and self.mask_head is not None


def select_dets(bboxes_results, num_chars, overlap_thresh=0.25):
    """ Select the target charaters from detection results.

    Args:
        bboxes_results (list[numpy.ndarray]): detection boxes
        num_chars (int): the predicted length of license plates.

    Returns:
        None
    """
    # group all bboxes results into one numpy.ndarray
    dets = np.concatenate(bboxes_results, axis=0)  # [N, 5]
    det_classes = np.zeros((dets.shape[0], ), dtype=np.int32)
    count = 0
    for cls_idx, bboxes_result in enumerate(bboxes_results):
        det_classes[count:count + bboxes_result.shape[0]] = cls_idx + 1
        count += bboxes_result.shape[0]
    dets = np.concatenate((dets, det_classes[:, None]), axis=1)

    num_dets = sum([bboxes_result.shape[0] for bboxes_result in bboxes_results])
    if num_dets <= num_chars:
        # raise NotImplementedError
        # return [dets], dets, None
        return [dets]

    # calculate overlaps between detected bboxes
    overlaps = bbox_overlaps(
        np.ascontiguousarray(dets[:, :4], dtype=np.float),
        np.ascontiguousarray(dets[:, :4], dtype=np.float))
    # overlaps = overlaps - np.eye(overlaps.shape[0])

    need_choose = np.zeros((overlaps.shape[0], ), np.bool)
    choose_list = []
    for i in range(overlaps.shape[0]):
        if need_choose[i]:
            continue
        cur_list = np.where(overlaps[i, i:] > overlap_thresh)[0] + i
        need_choose[cur_list] = True
        if len(cur_list) > 1:
            choose_list.append(cur_list.tolist())

    order = dets[:, 4].argsort()[::-1]
    keep = order[:num_chars]
    final = [dets[keep, :]]
    for select_inds in product(*choose_list):
        final_dets = dets[list(select_inds)]
        order = final_dets[:, 4].argsort()[::-1]
        keep = order[:num_chars]
        final.append(final_dets[keep, :])
    return final


def brute_force_select(bboxes_results, num_chars, alpha=0.5):
    # group all bboxes results into one numpy.ndarray
    dets = np.concatenate(bboxes_results, axis=0)  # [N, 5]
    det_classes = np.zeros((dets.shape[0], ), dtype=np.int32)
    count = 0
    for cls_idx, bboxes_result in enumerate(bboxes_results):
        det_classes[count:count + bboxes_result.shape[0]] = cls_idx + 1
        count += bboxes_result.shape[0]
    dets = np.concatenate((dets, det_classes[:, None]), axis=1)
    if dets.shape[0] <= num_chars:
        return [dets]

    sort_inds = np.argsort(dets[:, 4])[::-1]
    dets = dets[sort_inds]

    thresh = min(0.01, dets[num_chars, 4])
    keep_inds = np.where(dets[:, 4] >= thresh)[0][:12]  # keep maximum 12 objs
    dets = dets[keep_inds, :]
    num_dets = dets.shape[0]
    if num_dets <= num_chars:
        return [dets]

    # calculate overlaps between detected bboxes
    overlaps = bbox_overlaps(
            np.ascontiguousarray(dets[:, :4], dtype=np.float),
            np.ascontiguousarray(dets[:, :4], dtype=np.float))
    overlaps[np.arange(num_dets), np.arange(num_dets)] = 0.0

    y = np.array(list(product([0, 1], repeat=num_dets)), np.int32)
    inds = np.where(y.sum(axis=1) == num_chars)[0]
    y = y[inds].astype(np.float32)
    overlap_penalty = (y.dot(overlaps) * y).sum(axis=1) * alpha
    scores = y.dot(dets[:, 4].reshape(num_dets, 1))
    final_scores = scores.reshape(-1) - overlap_penalty.reshape(-1)
    max_idx = np.argmax(final_scores)

    dets = dets[y[max_idx] > 0, :]
    return [dets]


def bf_select(bboxes_results, num_chars, score_thresh=0.10, alpha=0.5, beta=0.4):
    # group all bboxes results into one numpy.ndarray
    dets = np.concatenate(bboxes_results, axis=0)  # [N, 5]
    det_classes = np.zeros((dets.shape[0],), dtype=np.int32)
    count = 0
    for cls_idx, bboxes_result in enumerate(bboxes_results):
        det_classes[count:count + bboxes_result.shape[0]] = cls_idx + 1
        count += bboxes_result.shape[0]
    dets = np.concatenate((dets, det_classes[:, None]), axis=1)

    if score_thresh > 0:
        inds = np.where(dets[:, 4] >= score_thresh)[0]
        dets = dets[inds, :]

    if len(dets) > 12:
        argsort = dets[:, 4].argsort()[::-1]
        argsort = argsort[:12]
        dets = dets[argsort, :]
    num_dets = len(dets)
    # thresh = min(0.05, dets[num_chars, 4])
    # inds = np.where(dets[:, 4] >= thresh)[0]
    # if inds.shape[0] > 12:
    #     inds = inds[:12]
    # dets = dets[inds, :]
    # num_dets = len(dets)
    # if num_dets <= num_chars:
    #     return dets

    # calculate overlaps between detected bboxes
    overlaps = bbox_overlaps(
        np.ascontiguousarray(dets[:, :4], dtype=np.float32),
        np.ascontiguousarray(dets[:, :4], dtype=np.float32))
    overlaps[np.arange(num_dets), np.arange(num_dets)] = 0.0

    overlaps = np.where(overlaps < 0.20, 0.0, overlaps)

    y_int = np.array(list(product([0, 1], repeat=num_dets)), np.int32)
    # y_int = y_int[inds]
    y = y_int.astype(np.float32)

    overlap_penalty = (y.dot(overlaps) * y).sum(axis=1) * alpha
    length_penalty = np.abs(np.sum(y, axis=1) - num_chars) * beta
    scores = y.dot(dets[:, 4].reshape(num_dets, 1))
    final_scores = scores.reshape(-1) - overlap_penalty.reshape(-1) - length_penalty
    max_idx = np.argmax(final_scores)

    dets = dets[y_int[max_idx] > 0, :]
    return [dets]


def det2character_classes(dets):
    x1 = dets[:, 0]
    order = x1.argsort()
    return dets[order, :]
