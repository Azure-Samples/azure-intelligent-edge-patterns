from torch.nn.modules.module import Module
from ..functions.roi_crop import RoICropFunction


class RoICrop(Module):

    def __init__(self, out_size):
        super(RoICrop, self).__init__()
        self.out_size = out_size

    def forward(self, features, rois):
        return RoICropFunction.apply(features, rois, self.out_size)
