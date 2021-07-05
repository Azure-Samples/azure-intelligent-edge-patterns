import torch
from torch import nn

from .conv_pooling_linear import ConvPoolingLinear
from ..builder import HEADS
from ...core import weighted_cross_entropy


@HEADS.register_module
class CountryHead(ConvPoolingLinear):

    def __init__(self, **kwargs):
        super(CountryHead, self).__init__(**kwargs)

    def forward(self, feat):
        n = feat.size(0)
        feat = self.pooling(self.conv(feat)).view(n, -1)
        feat = self.linear(feat)
        return feat

    def loss(self, countries, gt_countries):

        num = countries.size(0)
        gt_countries = torch.cat(gt_countries)
        gt_countries = gt_countries.view(num)
        invalid_inds = (gt_countries <= 1)
        weights = torch.ones_like(gt_countries).float()
        weights[invalid_inds] = 0
        loss = weighted_cross_entropy(countries, gt_countries, weights)
        return loss
