import torch
from math import ceil
import torch.nn as nn
import torch.nn.functional as F

from ..builder import HEADS
from ...ops.nms import nms_wrapper
from ...utils import normal_init, xavier_init, multi_apply
from ...core import corner2bbox, bbox2corner, weighted_cross_entropy, \
    weighted_smoothl1, accuracy, multiclass_nms


class _Flatten(nn.Module):
    def forward(self, x):
        num = x.size(0)
        return x.view(num, -1)


@HEADS.register_module
class SimpleFCHead(nn.Module):

    def __init__(self,
                 input_size=(48, 180),
                 target_means=0.0,
                 target_stds=0.1):
        super(SimpleFCHead, self).__init__()

        self.input_size = input_size  # H, W
        self.target_means = target_means if isinstance(target_means, list) else [target_means] * 8
        self.target_stds = target_means if isinstance(target_stds, list) else [target_stds] * 8

        # TODO(guangting): decouple the network structure and head into two classes.
        _conv_feat_h = ceil(self.input_size[0] / 8.0)
        _conv_feat_w = ceil(self.input_size[1] / 8.0)

        self.net = nn.Sequential(
            nn.Conv2d(in_channels=3, out_channels=64, kernel_size=5, padding=2),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=3, stride=2, padding=1),
            nn.Conv2d(in_channels=64, out_channels=64, kernel_size=5, padding=2),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=3, stride=2, padding=1),
            nn.Conv2d(in_channels=64, out_channels=128, kernel_size=3, padding=1, stride=2),
            nn.ReLU(inplace=True),
            _Flatten(),
            nn.Linear(in_features=128*_conv_feat_h*_conv_feat_w, out_features=64),
            nn.ReLU(inplace=True),
            nn.Linear(in_features=64, out_features=32),
            nn.ReLU(inplace=True)
        )

        self.reg_head = nn.Linear(32, 8)  # [x1, y1, x2, y2, x3, y3, x4, y4]
        self.cls_head = nn.Linear(32, 2)  # True or False

    def init_weights(self):
        for module in self.net.modules():
            if isinstance(module, nn.Conv2d):
                xavier_init(module)
            elif isinstance(module, nn.Linear):
                normal_init(module, std=0.01, bias=0.0)
        normal_init(self.reg_head, std=0.01)
        normal_init(self.cls_head, std=0.01)

    def forward(self, x):
        n, c, h, w = x.size()
        assert h == self.input_size[0] and w == self.input_size[1]
        feat = self.net(x)
        cls_score = self.cls_head(feat)
        bbox_pred = self.reg_head(feat)
        return cls_score, bbox_pred

    def loss(self,
             cls_scores,
             corner_deltas,
             labels,
             label_weights,
             corner_targets,
             corner_weights):
        pos_inds = labels > 0
        losses = dict()
        losses['loss_cls'] = weighted_cross_entropy(cls_scores, labels, label_weights, reduce=True)
        losses['acc'] = accuracy(cls_scores, labels)
        losses['loss_reg'] = weighted_smoothl1(
            corner_deltas[pos_inds],
            corner_targets[pos_inds],
            corner_weights[pos_inds],
            avg_factor=corner_targets.size(0)
        )
        return losses

    def get_target(self, sampling_results, crop_rois, gt_corners, corner_train_cfg):
        pos_proposals = [res.pos_bboxes for res in sampling_results]
        neg_proposals = [res.neg_bboxes for res in sampling_results]
        pos_corners = [gt_corners[i][res.pos_assigned_gt_inds] for i, res in enumerate(sampling_results)]
        pos_rois = []

        crop_boxes = crop_rois[:, 1:5]
        crop_inds = crop_rois[:, 0]
        for i, res in enumerate(sampling_results):
            npos = len(res.pos_inds)
            inds = torch.nonzero(torch.eq(crop_inds, i)).view(-1)
            pos_rois.append(crop_boxes[inds[0:npos]])

        labels, label_weights, corner_targets, corner_weights = multi_apply(corner_target_single,
            pos_proposals,
            neg_proposals,
            pos_corners,
            pos_rois,
            cfg=corner_train_cfg,
            target_means=self.target_means,
            target_stds=self.target_stds)

        # concat together
        labels = torch.cat(labels, 0)
        label_weights = torch.cat(label_weights, 0)
        corner_targets = torch.cat(corner_targets, 0)
        corner_weights = torch.cat(corner_weights, 0)
        return labels, label_weights, corner_targets, corner_weights

    def get_det_corners(self, rois, cls_scores, corner_deltas, cfg):
        scores = F.softmax(cls_scores, dim=1)
        roi_size = rois[:, 2:4] - rois[:, 0:2] + 1.0
        roi_size_ext = roi_size.repeat(1, 4)

        _means = torch.tensor(self.target_means).type_as(corner_deltas).view(1, 8)
        _stds = torch.tensor(self.target_stds).type_as(corner_deltas).view(1, 8)
        corner_deltas = corner_deltas * _stds + _means
        pred_corners = corner_deltas * roi_size_ext + bbox2corner(rois)

        # apply for NMS
        pred_bboxes = corner2bbox(pred_corners)
        nms_cfg_ = cfg.nms
        nms_type = nms_cfg_.pop('type', 'nms')
        nms_op = getattr(nms_wrapper, nms_type)
        cls_inds = scores[:, 1] > cfg.score_thr
        if not cls_inds.any():
            pred_scores = rois.new_zeros((0, ))
            pred_corners = rois.new_zeros((0, 8))
        else:
            _scores = scores[cls_inds, 1]
            _bboxes = pred_bboxes[cls_inds, :]
            pred_corners = pred_corners[cls_inds, :]
            cls_dets = torch.cat([_bboxes, _scores[:, None]], dim=1)
            _, inds = nms_op(cls_dets, **nms_cfg_)
            pred_corners = pred_corners[inds, :]
            pred_scores = _scores[inds]
        return pred_scores, pred_corners


def corner_target_single(pos_proposals,
                         neg_proposals,
                         pos_corners,
                         pos_rois,
                         cfg,
                         target_means,
                         target_stds):
    num_pos = pos_proposals.size(0)
    num_neg = neg_proposals.size(0)
    num_samples = num_pos + num_neg
    labels = pos_proposals.new_zeros(num_samples, dtype=torch.long)
    label_weights = pos_proposals.new_zeros(num_samples)
    corner_targets = pos_proposals.new_zeros(num_samples, 8)
    corner_weights = pos_proposals.new_zeros(num_samples, 8)
    if num_pos > 0:
        labels[:num_pos] = 1
        pos_weight = 1.0 if cfg.pos_weight <= 0 else cfg.pos_weight
        label_weights[:num_pos] = pos_weight

        roi_size = pos_rois[:, 2:4] - pos_rois[:, 0:2] + 1.0
        roi_size_ext = roi_size.repeat(1, 4)
        corner_targets[:num_pos] = (pos_corners - bbox2corner(pos_rois)) / roi_size_ext
        corner_weights[:num_pos] = 1.0
        _means = torch.tensor(target_means).type_as(corner_targets).view(1, 8)
        _stds = torch.tensor(target_stds).type_as(corner_targets).view(1, 8)
        corner_targets = (corner_targets - _means) / _stds

    if num_neg > 0:
        label_weights[-num_neg:] = 1.0
    return labels, label_weights, corner_targets, corner_weights
