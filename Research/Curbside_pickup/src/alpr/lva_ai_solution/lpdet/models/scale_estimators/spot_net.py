import torch
import torch.nn as nn
import numpy as np
from torch.nn.functional import interpolate
from math import ceil

from .. import builder
from ..builder import SCALE_ESTIMATOR

from ...core import weighted_sigmoid_focal_loss
from ...utils import multi_apply


@SCALE_ESTIMATOR.register_module
class SpotNet(nn.Module):

    def __init__(self,
                 backbone,
                 neck=None,
                 base_channels=128,
                 feat_strides=(4, 8, 16, 32),
                 feat_channels=(256, 256, 256, 256),
                 min_level=1,
                 max_level=8,
                 size_levels=((1, 2), (3, 4), (5, 6), (7, 8)),
                 train_cfg=None,
                 test_cfg=None):

        super(SpotNet, self).__init__()

        self.backbone = builder.build_backbone(backbone)

        if neck is not None:
            self.neck = builder.build_neck(neck)

        self.feat_strides = feat_strides
        self.num_feats = len(self.feat_strides)
        self.size_levels = size_levels
        self.min_level = min_level
        self.max_level = max_level
        self.level2feat_index = {}
        for feat_index, size_level in enumerate(size_levels):
            for lv in size_level:
                self.level2feat_index[lv] = feat_index

        self.spot_heads = nn.ModuleList()
        for i in range(self.num_feats):
            self.spot_heads.append(nn.Sequential(
                nn.Conv2d(feat_channels[i], base_channels, kernel_size=3, padding=1, stride=1),
                nn.ReLU(inplace=True),
                nn.Conv2d(base_channels, len(size_levels[i]), kernel_size=1)
            ))

        self.train_cfg = train_cfg
        self.test_cfg = test_cfg

    def forward(self, img, img_meta, return_loss=True, **kwargs):
        if return_loss:
            return self.forward_train(img, img_meta, **kwargs)
        else:
            return self.forward_test(img, img_meta, **kwargs)

    def forward_test(self, img, img_meta, **kwargs):
        img_r, img_shape, pad_shape, scale_factor = img_scale_transform(img,
                                                                        self.train_cfg.input_size,
                                                                        self.train_cfg.size_devisor,
                                                                        self.train_cfg.size_remainder)
        feats = self.backbone(img_r)
        if self.with_neck:
            feats = self.neck(feats)

        # Apply for spot head
        spots_list = [self.spot_heads[i](feats[i]) for i in range(self.num_feats)]

        return spots_list, img_shape, pad_shape

    def forward_train(self, img, img_meta, gt_bboxes):
        img_r, img_shape, pad_shape, scale_factor = img_scale_transform(img,
                                                                        self.train_cfg.input_size,
                                                                        self.train_cfg.size_devisor,
                                                                        self.train_cfg.size_remainder)
        losses = {}

        gt_bboxes = [gt * scale_factor for gt in gt_bboxes]

        feats = self.backbone(img_r)
        if self.with_neck:
            feats = self.neck(feats)

        # Apply for spot head
        spots_list = [self.spot_heads[i](feats[i]) for i in range(self.num_feats)]

        # generate ground-truth spot maps
        feat_sizes = [feat.shape[2:4] for feat in feats]

        labels_list = self.spot_target(feat_sizes, gt_bboxes_list=gt_bboxes)
        num_total_samples = sum([labels.sum() for labels in labels_list]) + 1
        losses['cls_loss'] = multi_apply(self.loss_single,
                                         spots_list,
                                         labels_list,
                                         num_total_samples=num_total_samples)[0]
        return losses

    def loss_single(self, spots, labels, num_total_samples):
        labels = labels.reshape(-1)
        label_weights = torch.ones_like(labels)
        spots = spots.permute(0, 2, 3, 1).contiguous().view(-1, 1)
        loss_cls = weighted_sigmoid_focal_loss(spots,
                                               labels.long(),
                                               label_weights,
                                               gamma=self.train_cfg.focal_gamma,
                                               alpha=self.train_cfg.focal_alpha,
                                               avg_factor=num_total_samples)
        return loss_cls

    def spot_target_single(self, point_maps, gt_bboxes):
        gt_ctrs = (gt_bboxes[:, 0:2] + gt_bboxes[:, 2:4]) / 2
        gt_sizes = torch.sqrt(torch.prod(torch.abs(gt_bboxes[:, 2:4] - gt_bboxes[:, 0:2]), dim=1))
        gt_levels = torch.round(torch.log2(torch.clamp(gt_sizes, min=0.0001)))
        gt_levels.clamp_(min=self.min_level, max=self.max_level)
        gt_levels = gt_levels.cpu().numpy().astype(np.int32)
        gt_maps = [p.new_zeros(*p.size()[0:2]) for p in point_maps]

        for i, lv in enumerate(gt_levels):
            dist = torch.sum(torch.abs(point_maps[lv - self.min_level] - gt_ctrs[i].view(1, 1, 2)), dim=2)
            gt_maps[lv - self.min_level][dist <= self.train_cfg.dist_thresholds[lv - self.min_level]] = 1

        return gt_maps

    def spot_target(self, feat_sizes, gt_bboxes_list):
        point_maps = []
        for i in range(self.min_level, self.max_level+1):
            feat_size = feat_sizes[self.level2feat_index[i]]
            grid_y, grid_x = torch.meshgrid([torch.arange(0, feat_size[0]),
                                             torch.arange(0, feat_size[1])])
            point_map = torch.cat((grid_x.unsqueeze(-1), grid_y.unsqueeze(-1)), dim=-1).type_as(gt_bboxes_list[0])
            point_map = point_map * self.feat_strides[self.level2feat_index[i]]
            point_maps.append(point_map)

        labels_list = [[] for i in range(self.num_feats)]
        for i in range(len(gt_bboxes_list)):
            gt_maps = self.spot_target_single(point_maps, gt_bboxes_list[i])
            for j in range(self.num_feats):
                labels_list[j].append(
                    torch.cat([gt_maps[lv - self.min_level].unsqueeze(-1)
                               for lv in self.size_levels[j]], dim=-1).unsqueeze(0)
                )

        labels_list = [torch.cat(_, dim=0) for _ in labels_list]
        return labels_list

    @property
    def with_neck(self):
        return hasattr(self, 'neck') and self.neck is not None


def img_scale_transform(img, scale, size_divisor=None, size_remainder=None):
    h, w = img.shape[-2:]

    max_long_edge = max(scale)
    max_short_edge = min(scale)
    scale_factor = min(max_long_edge / max(h, w), max_short_edge / min(h, w))
    new_size = int(h * float(scale_factor) + 0.5), int(w * float(scale_factor) + 0.5)

    img = interpolate(img, size=new_size, mode='bilinear')

    img_shape = img.shape[-2:]
    if size_divisor is not None:
        if size_remainder is None:
            size_remainder = 0
        if (img.shape[2] - size_remainder) % size_divisor != 0:
            pad_h = int(ceil(img.shape[2] / size_divisor)) * size_divisor + size_remainder
        else:
            pad_h = img.shape[2]
        if (img.shape[3] - size_remainder) % size_divisor != 0:
            pad_w = int(ceil(img.shape[3] / size_divisor)) * size_divisor + size_remainder
        else:
            pad_w = img.shape[3]
        pad_shape = (pad_h, pad_w)
        img = impad(img, pad_shape)
    else:
        pad_shape = img_shape
    return img, img_shape, pad_shape, scale_factor


def impad(img, shape, pad_val=0):
    """Pad an image to a certain shape.

    Args:
        img (torch.Tensor): Image to be padded [n, c, h, w].
        shape (tuple): Expected padding shape [h, w].
        pad_val (float): Values to be filled in padding areas.

    Returns:
        pad_img (torch.Tensor): The padded image.
    """
    shape = img.shape[0:-2] + shape
    assert len(shape) == len(img.shape)
    for i in range(len(shape) - 1):
        assert shape[i] >= img.shape[i]
    img_pad = img.new_full(shape, pad_val)
    img_pad[..., 0:img.shape[2], 0:img.shape[3]] = img
    return img_pad
