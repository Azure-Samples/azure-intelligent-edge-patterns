import warnings

import torch.nn as nn

from .conv_ws import ConvWS2d
from .norm import build_norm_layer
from ...utils import kaiming_init, constant_init

conv_cfg = {
    'Conv': nn.Conv2d,
    'ConvWS': ConvWS2d,
    # TODO: octave conv
}


def build_conv_layer(cfg, *args, **kwargs):
    """ Build convolution layer

    Args:
        cfg (None or dict): cfg should contain:
            type (str): identify conv layer type.
            layer args: args needed to instantiate a conv layer.

    Returns:
        layer (nn.Module): created conv layer
    """
    if cfg is None:
        cfg_ = dict(type='Conv')
    else:
        assert isinstance(cfg, dict) and 'type' in cfg
        cfg_ = cfg.copy()

    layer_type = cfg_.pop('type')
    if layer_type not in conv_cfg:
        raise KeyError('Unrecognized norm type {}'.format(layer_type))
    else:
        conv_layer = conv_cfg[layer_type]

    layer = conv_layer(*args, **kwargs, **cfg_)

    return layer


class ConvModule(nn.Module):

    def __init__(self,
                 in_channels,
                 out_channels,
                 kernel_size,
                 stride=1,
                 padding=0,
                 dilation=1,
                 groups=1,
                 bias=True,
                 conv_cfg=None,
                 normalize=None,
                 activation='relu',
                 inplace=True,
                 activate_last=True):
        super(ConvModule, self).__init__()
        assert conv_cfg is None or isinstance(conv_cfg, dict)
        assert normalize is None or isinstance(normalize, dict)
        self.with_norm = normalize is not None
        self.with_activatation = activation is not None
        self.with_bias = bias
        self.activation = activation
        self.activate_last = activate_last

        if self.with_norm and self.with_bias:
            warnings.warn('ConvModule has norm and bias at the same time')

        self.conv = build_conv_layer(
            conv_cfg,
            in_channels,
            out_channels,
            kernel_size,
            stride,
            padding,
            dilation,
            groups,
            bias=bias)

        self.in_channels = self.conv.in_channels
        self.out_channels = self.conv.out_channels
        self.kernel_size = self.conv.kernel_size
        self.stride = self.conv.stride
        self.padding = self.conv.padding
        self.dilation = self.conv.dilation
        self.transposed = self.conv.transposed
        self.output_padding = self.conv.output_padding
        self.groups = self.conv.groups

        if self.with_norm:
            norm_channels = out_channels if self.activate_last else in_channels
            self.norm_name, norm = build_norm_layer(normalize, norm_channels)
            self.add_module(self.norm_name, norm)

        if self.with_activatation:
            assert activation in ['relu'], 'Only ReLU supported.'
            if self.activation == 'relu':
                self.activate = nn.ReLU(inplace=inplace)

        # Default using msra init
        self.init_weights()

    @property
    def norm(self):
        return getattr(self, self.norm_name)

    def init_weights(self):
        nonlinearity = 'relu' if self.activation is None else self.activation
        kaiming_init(self.conv, nonlinearity=nonlinearity)
        if self.with_norm:
            constant_init(self.norm, 1, bias=0)

    def forward(self, x, activate=True, norm=True):
        if self.activate_last:
            x = self.conv(x)
            if norm and self.with_norm:
                x = self.norm(x)
            if activate and self.with_activatation:
                x = self.activate(x)
        else:
            if norm and self.with_norm:
                x = self.norm(x)
            if activate and self.with_activatation:
                x = self.activate(x)
            x = self.conv(x)
        return x
