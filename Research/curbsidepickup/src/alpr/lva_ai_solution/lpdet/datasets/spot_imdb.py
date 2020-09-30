from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals

import os
import numpy as np
import torch
import logging

from .imdb import ImageDataset, random_scale

from ..parallel import DataContainer
from ..utils.image import imnormalize, img_scale_transform


class SpotDataset(ImageDataset):
    """ Custom dataset for plate detection.
        Annotation format:
        {
            'classes': ['__background__', 'plate'], character class name
            'images': [
                {
                    'filename': 'a.jpg',
                    'width': 1280,
                    'height': 720,
                    'ann': {
                        'corners': <np.ndarray> (n, 8)  #(x1, y1, x2, y2, x3, y3, x4, y4)
                },
                ...
            ]
        }
        The `ann` field is optional for testing.
    """

    def __init__(self, max_img_scale=None, **kwargs):
        super(SpotDataset, self).__init__(**kwargs)
        self.max_img_scale = max_img_scale

    def prepare_train_img(self, idx):
        img_info = self.img_infos[idx]

        # load image & annotations
        img = self.storage[img_info['filename']]
        if img is None:
            print("Cannot load image from {} {}".format(idx, img_info['filename']))
            return None
        img = img.astype(np.float32)
        gt_corners = img_info['ann']['corners'].copy()
        # skip the image if there is no valid gt bbox
        if len(gt_corners) == 0:
            return None

        gt_bboxes = np.zeros((gt_corners.shape[0], 4), dtype=np.float32)
        gt_bboxes[:, 0] = np.min(gt_corners[:, 0::2], axis=1)
        gt_bboxes[:, 1] = np.min(gt_corners[:, 1::2], axis=1)
        gt_bboxes[:, 2] = np.max(gt_corners[:, 0::2], axis=1)
        gt_bboxes[:, 3] = np.max(gt_corners[:, 1::2], axis=1)

        if self.max_img_scale is not None:
            h, w = img.shape[0:2]
            max_long_edge = max(self.max_img_scale)
            max_short_edge = min(self.max_img_scale)
            scale_factor = min(max_long_edge / max(h, w), max_short_edge / min(h, w))
            if scale_factor < 1:
                img, img_shape, pad_shape, scale_factor = \
                    img_scale_transform(img, self.max_img_scale, size_divisor=None, keep_ratio=True)
                gt_bboxes[:, 0::2] *= scale_factor[0]
                gt_bboxes[:, 1::2] *= scale_factor[1]
        # apply data augmentation
        if self.data_augmenter is not None:
            img, gt_bboxes = self.data_augmenter(img, gt_bboxes)
            w = gt_bboxes[:, 2] - gt_bboxes[:, 0] + 1
            h = gt_bboxes[:, 3] - gt_bboxes[:, 1] + 1
            valid_inds = np.where((w >= 2) & (h >= 2))[0]
            if len(valid_inds) == 0:
                return None
            gt_bboxes = gt_bboxes[valid_inds, :]

        # randomly sample a scale
        img_scale = random_scale(self.img_scales)
        img, img_shape, pad_shape, scale_factor = \
            img_scale_transform(img, img_scale, size_divisor=self.size_divisor, keep_ratio=True)

        # image normalization
        img = imnormalize(img, **self.img_norm_cfg)

        # convert to [C, H, W]
        img = img.transpose(2, 0, 1)  # (C, H, W]

        gt_bboxes = gt_bboxes * np.tile(scale_factor, 2)
        gt_bboxes[:, 0::2] = np.clip(gt_bboxes[:, 0::2], 0, img_shape[1] - 1)
        gt_bboxes[:, 1::2] = np.clip(gt_bboxes[:, 1::2], 0, img_shape[0] - 1)

        img_meta = dict(
            img_shape=img_shape,
            pad_shape=pad_shape,
            scale_factor=scale_factor)
        data = dict(
            img=DataContainer(torch.from_numpy(img).float(), stack=True),
            img_meta=DataContainer(img_meta, cpu_only=True),
            gt_bboxes=DataContainer(torch.from_numpy(gt_bboxes).float())
        )
        return data

    def _filter_imgs(self, min_size=32):
        """ Filter images which are too small."""
        valid_inds = []
        for i, img_info in enumerate(self.img_infos):
            bboxes = img_info['ann']['corners']
            if len(bboxes) == 0:
                continue
            w = np.max(bboxes[:, 0::2], axis=1) - np.min(bboxes[:, 0::2], axis=1)
            h = np.max(bboxes[:, 1::2], axis=1) - np.min(bboxes[:, 1::2], axis=1)
            size_inds = np.logical_and(w > 2, h > 2)
            if not np.all(size_inds):
                continue
            if min(img_info['width'], img_info['height']) >= min_size:
                valid_inds.append(i)
        return valid_inds

    def prepare_test_img(self, idx):
        raise NotImplementedError
