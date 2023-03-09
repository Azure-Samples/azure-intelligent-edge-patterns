import torch
from torch import nn

from ..builder import HEADS
from ...utils import obj_from_dict, normal_init, xavier_init


@HEADS.register_module
class ConvPoolingLinear(nn.Module):

    def __init__(self,
                 in_channels,
                 convs,
                 pooling,
                 linears):
        super(ConvPoolingLinear, self).__init__()
        self.conv, in_channels = _build_convs(in_channels, convs)
        self.pooling = obj_from_dict(pooling, nn)
        in_channels = in_channels * pooling.output_size[0] * pooling.output_size[1]
        self.linear, _ = _build_linear(in_channels, linears)

    def forward(self, feat):
        n = feat.size(0)
        feat = self.pooling(self.conv(feat)).view(n, -1)
        feat = self.linear(feat)
        return feat

    def init_weights(self):
        for m in self.modules():
            if isinstance(m, nn.Linear):
                normal_init(m, std=0.01)
            elif isinstance(m, nn.Conv2d):
                xavier_init(m)


def _build_convs(in_channels, convs):
    if isinstance(convs, int):
        convs = [convs]
    num_convs = len(convs)
    s = []
    for i in range(num_convs):
        s.append(nn.Conv2d(in_channels=in_channels, out_channels=convs[i], kernel_size=1))
        if i < num_convs - 1:
            s.append(nn.ReLU(inplace=True))
        in_channels = convs[i]
    s = nn.Sequential(*s)
    return s, in_channels


def _build_linear(in_channels, linears):
    if isinstance(linears, int):
        linears = [linears]
    num_linears = len(linears)
    s = []
    for i in range(num_linears):
        s.append(nn.Linear(in_features=in_channels, out_features=linears[i]))
        if i < num_linears - 1:
            s.append(nn.ReLU(inplace=True))
        in_channels = linears[i]
    s = nn.Sequential(*s)
    return s, in_channels
