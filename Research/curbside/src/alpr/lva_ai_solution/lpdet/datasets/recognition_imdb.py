import torch
import numpy as np
import _pickle as pickle

from .imdb import ImageDataset, random_scale
from ..utils.image import imnormalize, img_scale_transform
from ..parallel import DataContainer


class RecognitionDataset(ImageDataset):

    def __init__(self, **kwargs):
        super(RecognitionDataset, self).__init__(**kwargs)

    def load_annotations(self, anno_path):
        with open(anno_path, 'rb') as f:
            infos = pickle.load(f)
        self.img_infos = infos['images']
        self.classes = infos['classes']
        self.country_classes = infos['country_classes']

    def prepare_train_img(self, idx):
        img_info = self.img_infos[idx]

        # load image & annotations
        img = self.storage[img_info['filename']].astype(np.float32)
        gt_bboxes = img_info['ann']['bboxes'].copy()
        gt_labels = img_info['ann']['labels'].copy()
        gt_country = int(img_info['ann']['country'])
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
            gt_labels = gt_labels[valid_inds]

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
        # img = img.copy()

        ignore_inds = np.where(gt_labels < 0)[0]
        gt_bboxes_ignore = gt_bboxes[ignore_inds]
        gt_inds = np.where(gt_labels >= 0)[0]
        gt_bboxes = gt_bboxes[gt_inds]
        gt_labels = gt_labels[gt_inds]

        img_meta = dict(
            ori_shape=(img_info['height'], img_info['width'], 3),
            img_shape=img_shape,
            pad_shape=pad_shape,
            scale_factor=scale_factor)
        data = dict(
            img=DataContainer(torch.from_numpy(img).float(), stack=True),
            img_meta=DataContainer(img_meta, cpu_only=True),
            gt_bboxes=DataContainer(torch.from_numpy(gt_bboxes).float(), stack=False, cpu_only=False),
            gt_bboxes_ignore=DataContainer(torch.from_numpy(gt_bboxes_ignore).float(), stack=False, cpu_only=False),
            gt_labels=DataContainer(torch.LongTensor(gt_labels), stack=False, cpu_only=False),
            gt_countries=DataContainer(torch.LongTensor([gt_country]), stack=False, cpu_only=False)
        )
        return data

    def prepare_test_img(self, idx):
        img_info = self.img_infos[idx]
        # load image & annotations
        img = self.storage[img_info['filename']].astype(np.float32)

        gt_bboxes = img_info['ann']['bboxes'].copy()
        gt_labels = img_info['ann']['labels'].copy()
        order = gt_bboxes[:, 0].argsort()
        gt_labels = gt_labels[order]
        gt_chars = [self.classes[i] for i in gt_labels]

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
            scale_factor=scale_factor,
            gt_chars=gt_chars,
        )
        data = dict(
            img=DataContainer(torch.from_numpy(img).float(), stack=True),
            img_meta=DataContainer(img_meta, cpu_only=True),
        )
        return data
