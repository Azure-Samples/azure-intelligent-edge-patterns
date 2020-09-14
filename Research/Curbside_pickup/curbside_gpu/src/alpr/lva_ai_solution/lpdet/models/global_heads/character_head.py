import torch
from torch import nn
from torch.nn.functional import mse_loss

from .conv_pooling_linear import ConvPoolingLinear
from ..builder import HEADS


@HEADS.register_module
class CharacterHead(ConvPoolingLinear):

    def __init__(self, mean, std, **kwargs):
        self.mean = mean
        self.std = std
        super(CharacterHead, self).__init__(**kwargs)

    def get_length(self, pred_ch):
        # assert pred_ch.size(0) == 1, "support batchsize==1 when inference"
        pred_ch = pred_ch.cpu().view(-1).detach().numpy()
        # lens = list(map(lambda x: int(round(float(x) * self.std + self.mean)), pred_ch))
        lens = list(map(lambda x: float(x) * self.std + self.mean, pred_ch))
        return lens

    def loss(self, pred_ch, gt_bboxes):
        assert isinstance(pred_ch, torch.Tensor)
        gt_num_chs = pred_ch.new_tensor([gt_bbox.size(0) for gt_bbox in gt_bboxes])
        gt_num_chs = (gt_num_chs - self.mean) / self.std
        return mse_loss(pred_ch, gt_num_chs.unsqueeze(-1))

