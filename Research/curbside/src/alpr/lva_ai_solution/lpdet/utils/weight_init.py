import torch
import numpy as np
import torch.nn as nn


def random_init_weights(model_modules, init_type='xavier_uniform'):
    """ Random initialize model weights.

    Args:
        model_modules: an iterator of torch.nn.Module.modules()

    Returns:
        None
    """
    if init_type == 'xavier_uniform':
        func = torch.nn.init.xavier_uniform_
    elif init_type == 'xavier_normal':
        func = torch.nn.init.xavier_normal_
    elif init_type == 'kaiming_uniform':
        func = torch.nn.init.kaiming_uniform_
    elif init_type == 'kaiming_normal':
        func = torch.nn.init.kaiming_normal_
    else:
        raise ValueError("unknown type {}".format(init_type))

    for m in model_modules:
        if isinstance(m, torch.nn.Conv2d):
            output_channel = m.weight.shape[0]
            num_groups = m.groups
            channels_per_group = int(output_channel / num_groups)
            for i in range(num_groups):
                st = channels_per_group * i
                end = channels_per_group * (i + 1)
                func(m.weight[st:end, :, :, :])
            if m.bias is not None:
                m.bias.data.zero_()
        if isinstance(m, torch.nn.modules.batchnorm._BatchNorm):
            if m.weight is not None:
                torch.nn.init.constant_(m.weight, 1.0)
            if m.bias is not None:
                torch.nn.init.constant_(m.bias, 0.0)
        if isinstance(m, torch.nn.Linear):
            if m.weight is not None:
                func(m.weight)
            if m.bias is not None:
                m.bias.data.zero_()


def constant_init(module, val, bias=0):
    nn.init.constant_(module.weight, val)
    if hasattr(module, 'bias') and module.bias is not None:
        nn.init.constant_(module.bias, bias)


def xavier_init(module, gain=1, bias=0, distribution='normal'):
    assert distribution in ['uniform', 'normal']
    if distribution == 'uniform':
        nn.init.xavier_uniform_(module.weight, gain=gain)
    else:
        nn.init.xavier_normal_(module.weight, gain=gain)
    if hasattr(module, 'bias') and module.bias is not None:
        nn.init.constant_(module.bias, bias)


def normal_init(module, mean=0, std=1, bias=0):
    nn.init.normal_(module.weight, mean, std)
    if hasattr(module, 'bias') and module.bias is not None:
        nn.init.constant_(module.bias, bias)


def uniform_init(module, a=0, b=1, bias=0):
    nn.init.uniform_(module.weight, a, b)
    if hasattr(module, 'bias') and module.bias is not None:
        nn.init.constant_(module.bias, bias)


def kaiming_init(module,
                 mode='fan_out',
                 nonlinearity='relu',
                 bias=0,
                 distribution='normal'):
    assert distribution in ['uniform', 'normal']
    if distribution == 'uniform':
        nn.init.kaiming_uniform_(
            module.weight, mode=mode, nonlinearity=nonlinearity)
    else:
        nn.init.kaiming_normal_(
            module.weight, mode=mode, nonlinearity=nonlinearity)
    if hasattr(module, 'bias') and module.bias is not None:
        nn.init.constant_(module.bias, bias)


def bias_init_with_prob(prior_prob):
    """ initialize conv/fc bias value according to giving probablity"""
    bias_init = float(-np.log((1 - prior_prob) / prior_prob))
    return bias_init
