from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals

import torch
import logging
from torch import nn
from torch.nn import functional as F
from ..builder import BACKBONES

from ...utils import constant_init, kaiming_init, load_checkpoint

__all__ = ['InceptionV2Lite']


@BACKBONES.register_module
class InceptionV2Lite(nn.Module):
    """ a lite version of InceptionV2 network. """
    def __init__(self,
                 norm_eval=True,
                 pretrained=None):
        super(InceptionV2Lite, self).__init__()
        self.net = [
            nn.Conv2d(3, 64, 7, 2, 3),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2, padding=0),
            nn.Conv2d(64, 128, 1, 1, 0),
            nn.ReLU(inplace=True),
            nn.Conv2d(128, 288, 3, 1, 1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2, padding=0),
            InceptionV2Block(288, (96, (96, 96), (96, 144, 144), 48)),
            InceptionV2Block(384, (96, (96, 144), (96, 144, 144), 96)),
        ]
        self.net = nn.Sequential(*self.net)
        self.norm_eval = norm_eval
        self.pretrained = pretrained

    def forward(self, x):
        return [self.net(x)]

    def train(self, mode=True):
        super(InceptionV2Lite, self).train(mode)
        if mode and self.norm_eval:
            for m in self.modules():
                # trick: eval have effect on BatchNorm only
                if isinstance(m, nn.BatchNorm2d):
                    m.eval()

    def init_weights(self):
        for m in self.modules():
            if isinstance(m, nn.Conv2d):
                kaiming_init(m)
            elif isinstance(m, (nn.BatchNorm2d, nn.GroupNorm)):
                constant_init(m, 1)
        if self.pretrained is not None:
            logger = logging.getLogger()
            logger.info('load backbone model from: {}'.format(self.pretrained))
            load_checkpoint(self, self.pretrained, strict=False, logger=logger)


class InceptionV2Block(nn.Module):
    def __init__(self, in_channel, block_channels=(96, (96, 144), (96, 144, 144), 48)):
        super(InceptionV2Block, self).__init__()
        self.branch_1x1 = BasicConv2d(in_channel, block_channels[0], bias=True, kernel_size=1)
        self.branch_3x3 = nn.Sequential(
            BasicConv2d(in_channel, block_channels[1][0], bias=True, kernel_size=1),
            BasicConv2d(block_channels[1][0], block_channels[1][1], bias=True, kernel_size=3, padding=1)
        )
        self.branch_double_3x3 = nn.Sequential(
            BasicConv2d(in_channel, block_channels[2][0], bias=True, kernel_size=1),
            BasicConv2d(block_channels[2][0], block_channels[2][1], bias=True, kernel_size=3, padding=1),
            BasicConv2d(block_channels[2][1], block_channels[2][2], bias=True, kernel_size=3, padding=1)
        )
        self.branch_proj = BasicConv2d(in_channel, block_channels[3], bias=True, kernel_size=1)

    def forward(self, x):

        feat_1x1 = self.branch_1x1(x)
        feat_3x3 = self.branch_3x3(x)
        feat_double_3x3 = self.branch_double_3x3(x)
        feat_proj = self.branch_proj(F.avg_pool2d(x, kernel_size=3, stride=1, padding=1))
        out_feat = torch.cat((feat_1x1, feat_3x3, feat_double_3x3, feat_proj), dim=1)
        return out_feat


class BasicConv2d(nn.Module):

    def __init__(self, in_channels, out_channels, **kwargs):
        super(BasicConv2d, self).__init__()
        self.conv = nn.Conv2d(in_channels, out_channels, **kwargs)
        self.bn = nn.BatchNorm2d(out_channels, eps=0.001)

    def forward(self, x):
        x = self.conv(x)
        x = self.bn(x)
        return F.relu(x, inplace=True)
