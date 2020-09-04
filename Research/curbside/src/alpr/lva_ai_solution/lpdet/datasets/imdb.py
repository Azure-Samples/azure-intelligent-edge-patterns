from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals

import os
import numpy as np
import cv2
import torch
from torch.utils.data import Dataset
import _pickle as pickle

from . import dataset_catalog
from .storage import FileWrapper, ZipWrapper
from .transforms import build_transform
from ..utils.image import imnormalize, img_scale_transform
from ..parallel import DataContainer


class ImageDataset(Dataset):
    """ Custom dataset for plate detection.
        Annotation format:
        {
            'classes': ['__background__', '0', '1'], character class name
            'images': [
                {
                    'filename': 'a.jpg',
                    'width': 1280,
                    'height': 720,
                    'ann': {
                        'bboxes': <np.ndarray> (n, 4)  #(x1, y1, x2, y2)
                        'labels': <np.ndarray> (n, )
                        'country': <int>
                },
                ...
            ]
        }
        The `ann` field is optional for testing.
    """

    def __init__(self,
                 dataset_name,
                 data_root_dir,
                 img_scale,
                 img_norm_cfg,
                 sample_prob=None,
                 transforms=None,
                 size_divisor=None,
                 use_zip=False,
                 test_mode=False):

        # Load annotations
        anno_path = os.path.join(data_root_dir, dataset_catalog.get_ann_fn(dataset_name))
        self.load_annotations(anno_path)

        if sample_prob is not None:
            if 0.0 < sample_prob < 1.0:
                num_imgs = len(self.img_infos)
                num_kept = int(sample_prob * num_imgs)
                kept_inds = np.random.permutation(num_imgs)[:num_kept]
                self.img_infos = [self.img_infos[i] for i in kept_inds]

        # Construct image storage backend.
        if use_zip:
            self.storage = ZipWrapper(os.path.join(data_root_dir, dataset_catalog.get_zip_file(dataset_name)))
        else:
            self.storage = FileWrapper(os.path.join(data_root_dir, dataset_catalog.get_im_dir(dataset_name)))

        # filter images with no annotation during training
        if not test_mode:
            valid_inds = self._filter_imgs()
            print("Filter images {} -> {}".format(len(self.img_infos), len(valid_inds)))
            self.img_infos = [self.img_infos[i] for i in valid_inds]

        # in test mode or not
        self.test_mode = test_mode

        # (long_edge, short_edge) or [(long1, short1), (long2, short2), ...]
        self.img_scales = img_scale if isinstance(img_scale, list) else [img_scale]

        self.img_norm_cfg = img_norm_cfg
        self.size_divisor = size_divisor

        if not test_mode:
            self._set_group_flag()
            self.data_augmenter = build_transform(transforms) if transforms is not None else None

    def __len__(self):
        return len(self.img_infos)

    def __getitem__(self, idx):
        if self.test_mode:
            return self.prepare_test_img(idx)
        while True:
            data = self.prepare_train_img(idx)
            if data is None:
                pool = np.where(self.flag == self.flag[idx])[0]
                idx = np.random.choice(pool)
                continue
            return data

    def load_annotations(self, anno_path):
        with open(anno_path, 'rb') as f:
            infos = pickle.load(f)
        self.img_infos = infos['images']
        self.classes = infos['classes']

    def _filter_imgs(self, min_size=32):
        """ Filter images which are too small."""
        valid_inds = []
        for i, img_info in enumerate(self.img_infos):
            bboxes = img_info['ann']['bboxes']
            if len(bboxes) == 0:
                continue
            w = np.max(bboxes[:, 0::2], axis=1) - np.min(bboxes[:, 0::2], axis=1)
            h = np.max(bboxes[:, 1::2], axis=1) - np.min(bboxes[:, 1::2], axis=1)
            size_inds = np.logical_and(w > 6, h > 6)
            if not np.all(size_inds):
                continue
            if min(img_info['width'], img_info['height']) >= min_size:
                valid_inds.append(i)
        return valid_inds

    def _set_group_flag(self):
        """Set flag according to image aspect ratio.

        Images with aspect ratio greater than 1 will be set as group 1,
        otherwise group 0.
        """
        self.flag = np.zeros(len(self), dtype=np.uint8)
        for i in range(len(self)):
            img_info = self.img_infos[i]
            if img_info['width'] / img_info['height'] > 1:
                self.flag[i] = 1

    def prepare_test_img(self, idx):
        img_info = self.img_infos[idx]
        # load image & annotations
        img = self.storage[img_info['filename']].astype(np.float32)

        img, img_shape, pad_shape, scale_factor = \
            img_scale_transform(img, self.img_scales[0], size_divisor=self.size_divisor, keep_ratio=True)

        # image normalization
        img = imnormalize(img, **self.img_norm_cfg)

        # convert to [C, H, W]
        img = img.transpose(2, 0, 1)  # (C, H, W]

        img_meta = dict(
            ori_shape=(img_info['height'], img_info['width'], 3),
            img_shape=img_shape,
            pad_shape=pad_shape,
            scale_factor=scale_factor)
        data = dict(
            img=DataContainer(torch.from_numpy(img).float(), stack=True),
            img_meta=DataContainer(img_meta, cpu_only=True),
        )
        return data

    def prepare_train_img(self, idx):
        img_info = self.img_infos[idx]

        # load image & annotations
        img = self.storage[img_info['filename']].astype(np.float32)
        gt_bboxes = img_info['ann']['bboxes'].copy()
        gt_labels = img_info['ann']['labels'].copy()

        # skip the image if there is no valid gt bbox
        if len(gt_bboxes) == 0:
            return None

        # apply data augmentation
        if self.data_augmenter is not None:
            img, gt_bboxes = self.data_augmenter(img, gt_bboxes)
            w = np.max(gt_bboxes[:, 0::2], axis=1) - np.min(gt_bboxes[:, 0::2], axis=1) + 1
            h = np.max(gt_bboxes[:, 1::2], axis=1) - np.min(gt_bboxes[:, 1::2], axis=1) + 1
            valid_inds = np.where((w >= 8) & (h >= 8))[0]
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

        gt_bboxes = gt_bboxes * np.tile(scale_factor, 4)
        gt_bboxes[:, 0::2] = np.clip(gt_bboxes[:, 0::2], 0, img_shape[1] - 1)
        gt_bboxes[:, 1::2] = np.clip(gt_bboxes[:, 1::2], 0, img_shape[0] - 1)
        # img = img.copy()

        img_meta = dict(
            ori_shape=(img_info['height'], img_info['width'], 3),
            img_shape=img_shape,
            pad_shape=pad_shape,
            scale_factor=scale_factor)
        data = dict(
            img=DataContainer(torch.from_numpy(img).float(), stack=True),
            img_meta=DataContainer(img_meta, cpu_only=True),
            gt_bboxes=DataContainer(torch.from_numpy(gt_bboxes).float(), stack=False, cpu_only=False),
            gt_labels=DataContainer(torch.LongTensor(gt_labels), stack=False, cpu_only=False)
        )
        return data


def random_scale(scale_list):
    num_scales = len(scale_list)
    if num_scales == 1:
        img_scale = scale_list[0]
    else:
        img_scale = scale_list[np.random.randint(num_scales)]
    return img_scale

