import logging
from torch import nn
from ..builder import BACKBONES

from ...utils import constant_init, kaiming_init, load_checkpoint

__all__ = ['MobileNetV2']


def _make_divisible(v, divisor, min_value=None):
    """
    This function is taken from the original tf repo.
    It ensures that all layers have a channel number that is divisible by 8
    It can be seen here:
    https://github.com/tensorflow/models/blob/master/research/slim/nets/mobilenet/mobilenet.py
    """
    if min_value is None:
        min_value = divisor
    new_v = max(min_value, int(v + divisor / 2) // divisor * divisor)
    # Make sure that round down does not go down by more than 10%.
    if new_v < 0.9 * v:
        new_v += divisor
    return new_v


class ConvBNReLU(nn.Sequential):
    def __init__(self, in_planes, out_planes, kernel_size=3, stride=1, groups=1):
        padding = (kernel_size - 1) // 2
        super(ConvBNReLU, self).__init__(
            nn.Conv2d(in_planes, out_planes, kernel_size, stride, padding, groups=groups, bias=False),
            nn.BatchNorm2d(out_planes),
            nn.ReLU6(inplace=True)
        )


class InvertedResidual(nn.Module):
    def __init__(self, inp, oup, stride, expand_ratio):
        super(InvertedResidual, self).__init__()
        self.stride = stride
        assert stride in [1, 2]

        hidden_dim = int(round(inp * expand_ratio))
        self.use_res_connect = self.stride == 1 and inp == oup

        layers = []
        if expand_ratio != 1:
            # pw
            layers.append(ConvBNReLU(inp, hidden_dim, kernel_size=1))
        layers.extend([
            # dw
            ConvBNReLU(hidden_dim, hidden_dim, stride=stride, groups=hidden_dim),
            # pw-linear
            nn.Conv2d(hidden_dim, oup, 1, 1, 0, bias=False),
            nn.BatchNorm2d(oup),
        ])
        self.conv = nn.Sequential(*layers)

    def forward(self, x):
        if self.use_res_connect:
            return x + self.conv(x)
        else:
            return self.conv(x)


@BACKBONES.register_module
class MobileNetV2(nn.Module):
    def __init__(self,
                 width_mult=1.0,
                 input_channel=32,
                 inverted_residual_setting=None,
                 round_nearest=8,
                 norm_eval=True,
                 pretrained=None):
        """
        MobileNet V2 main class

        Args:
            width_mult (float): Width multiplier - adjusts number of channels in each layer by this amount
            inverted_residual_setting: Network structure
            round_nearest (int): Round the number of channels in each layer to be a multiple of this number
            Set to 1 to turn off rounding
        """
        super(MobileNetV2, self).__init__()
        block = InvertedResidual

        if inverted_residual_setting is None:
            inverted_residual_setting = [
                # t, c, n, s, output
                [1, 16, 1, 1, False],
                [6, 24, 2, 2, True],
                [6, 32, 3, 2, True],
                [6, 64, 4, 2, True],
                [6, 96, 3, 1, False],
                [6, 160, 3, 2, True],
            ]

        # only check the first element, assuming user knows t,c,n,s are required
        if len(inverted_residual_setting) == 0 or len(inverted_residual_setting[0]) != 5:
            raise ValueError("inverted_residual_setting should be non-empty "
                             "or a 5-element list, got {}".format(inverted_residual_setting))

        # building first layer
        input_channel = _make_divisible(input_channel * width_mult, round_nearest)
        self.stem_conv = ConvBNReLU(3, input_channel, stride=2)

        conv_count = 1
        # building inverted residual blocks
        block_list = []
        for t, c, n, s, out_flag in inverted_residual_setting:
            output_channel = _make_divisible(c * width_mult, round_nearest)
            for i in range(n):
                stride = s if i == 0 else 1
                block_list.append(block(input_channel, output_channel, stride, expand_ratio=t))
                input_channel = output_channel
            if out_flag:
                setattr(self, 'conv{}'.format(conv_count), nn.Sequential(*block_list))
                block_list = []
                conv_count += 1

        self.conv_count = conv_count - 1
        self.pretrained = pretrained
        self.norm_eval = norm_eval
        self.init_weights()

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

    def train(self, mode=True):
        super(MobileNetV2, self).train(mode)
        if mode and self.norm_eval:
            for m in self.modules():
                # trick: eval have effect on BatchNorm only
                if isinstance(m, nn.BatchNorm2d):
                    m.eval()

    def forward(self, x):
        x = self.stem_conv(x)
        out = []
        for i in range(1, self.conv_count + 1):
            x = getattr(self, 'conv{}'.format(i))(x)
            out.append(x)
        return out
