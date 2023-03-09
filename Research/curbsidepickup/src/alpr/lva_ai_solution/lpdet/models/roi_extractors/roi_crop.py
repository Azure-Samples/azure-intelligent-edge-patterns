from __future__ import division

import torch
import torch.nn as nn
from ...ops.roi_crop import RoICrop

from ..builder import ROI_EXTRACTORS


@ROI_EXTRACTORS.register_module
class ROICrop(nn.Module):
    def __init__(self, output_size, keep_ar=True, extend_ratio=0.0):
        super(ROICrop, self).__init__()
        self.output_size = output_size  # [h, w]
        self.extend_ratio = extend_ratio
        self.keep_ar = keep_ar
        self._ar = self.output_size[1] / self.output_size[0]  # w / h
        self.crop_op = RoICrop(output_size)

    def forward(self, source, rois):
        """ Crop a region from the source.
        Args:
            source: torch.Tensor in shape of [N, C, H, W]
            rois, torch.Tensor in shape of [M, 5]
        """

        if self.keep_ar:
            rois_h = (rois[:, 4] - rois[:, 2] + 1.0).unsqueeze(-1)
            rois_w = (rois[:, 3] - rois[:, 1] + 1.0).unsqueeze(-1)
            expected_rois_w = (rois_h * self._ar - rois_w) / 2.0
            expected_rois_h = (rois_w / self._ar - rois_h) / 2.0
            _zeros = torch.zeros_like(expected_rois_w)
            rois_delta_w = torch.cat([-expected_rois_w, _zeros, expected_rois_w, _zeros], dim=1)
            rois_delta_h = torch.cat([_zeros, -expected_rois_h, _zeros, expected_rois_h], dim=1)
            rois_delta = torch.where(expected_rois_w > 0,
                                     rois_delta_w,
                                     rois_delta_h)
            rois[:, 1:5] += rois_delta
        if self.extend_ratio > 0:
            rois_size = rois[:, 3:5] - rois[:, 1:3] + 1.0
            rois_delta = rois_size * (self.extend_ratio / 2.0)
            rois_delta = torch.cat([-rois_delta, rois_delta], dim=1)
            rois[:, 1:5] += rois_delta
        out = self.crop_op(source, rois)
        return out
