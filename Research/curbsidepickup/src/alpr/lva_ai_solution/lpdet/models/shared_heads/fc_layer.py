import logging

from torch import nn
from ...utils import normal_init
from ..builder import SHARED_HEADS



@SHARED_HEADS.register_module
class FCLayer(nn.Module):

    def __init__(self,
                 in_channels=256,
                 hidden_channels=256,
                 num_layers=2):
        super(FCLayer, self).__init__()
        linears = [hidden_channels for _ in range(num_layers)]
        self.linear, _ = _build_linear(in_channels, linears)

    def init_weights(self):
        for m in self.modules():
            if isinstance(m, (nn.Conv2d, nn.Linear)):
                normal_init(m, std=0.01)

    def forward(self, x):
        num = x.size(0)
        x = x.view(num, -1)
        return self.linear(x)


def _build_linear(in_channels, linears):
    if isinstance(linears, int):
        linears = [linears]
    num_linears = len(linears)
    s = []
    for i in range(num_linears):
        s.append(nn.Linear(in_features=in_channels, out_features=linears[i]))
        s.append(nn.ReLU(inplace=True))
        in_channels = linears[i]
    s = nn.Sequential(*s)
    return s, in_channels
