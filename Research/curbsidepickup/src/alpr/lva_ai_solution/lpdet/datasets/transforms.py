import sys
import cv2
import math
import torch
import numpy as np
import random
import numpy.random as npr
import addict
from imgaug import augmenters as iaa
from imgaug import BoundingBoxesOnImage, BoundingBox

from ..core import bbox_overlaps


def build_transform(cfg):
    if isinstance(cfg, list):
        transforms = []
        for i_cfg in cfg:
            transforms.append(build_transform(i_cfg))
        return Compose(transforms)
    elif isinstance(cfg, addict.Dict):
        _cfg = cfg.copy()
        transform_type = _cfg.pop('type')
        transform_cls = getattr(sys.modules[__name__], transform_type)
        return transform_cls(**_cfg)
    else:
        raise TypeError("Unknown type {}".format(type(cfg)))


class Compose(object):
    """Composes several transforms together."""

    def __init__(self, transforms):
        self.transforms = transforms

    def __call__(self, img, bbox=None):
        for t in self.transforms:
            img, bbox = t(img, bbox)
        return img, bbox


class RandomExpand(object):

    def __init__(self, prob=0.2, mean=(0, 0, 0), to_rgb=True, ratio_range=(1, 3)):
        self._prob = prob
        if to_rgb:
            self.mean = mean[::-1]
        else:
            self.mean = mean
        self.min_ratio, self.max_ratio = ratio_range

    def __call__(self, img, boxes):
        if npr.rand() > self._prob:
            return img, boxes

        h, w, c = img.shape
        ratio = npr.uniform(self.min_ratio, self.max_ratio)
        expand_img = np.full((int(h * ratio), int(w * ratio), c),
                             self.mean).astype(img.dtype)
        left = int(npr.uniform(0, w * ratio - w))
        top = int(npr.uniform(0, h * ratio - h))
        expand_img[top:top + h, left:left + w] = img
        img = expand_img
        boxes += np.tile((left, top), 2)
        return img, boxes


class RandomCrop(object):

    def __init__(self, prob=0.20, min_crop_size=0.3):
        self._prob = prob
        self.min_crop_size = min_crop_size

    def __call__(self, img, boxes):
        if npr.rand() > self._prob:
            return img, boxes

        h, w, c = img.shape

        # random hundreds of crop boxes and select a proper one
        new_w = npr.uniform(self.min_crop_size * w, w, size=(400, ))
        new_h = npr.uniform(self.min_crop_size * h, h, size=(400, ))
        ratio = new_h / new_w
        valid_inds = np.where((ratio >= 0.5) & (ratio <= 2))[0]
        if len(valid_inds) == 0:
            return img, boxes
        new_w = new_w[valid_inds, np.newaxis]
        new_h = new_h[valid_inds, np.newaxis]
        left = npr.uniform(w - new_w)
        top = npr.uniform(h - new_h)
        patch = np.hstack((left, top, left + new_w, top + new_h)).astype(np.float32)

        if boxes is None or len(boxes) == 0:
            patch = patch[0]
        else:
            _t_boxes = torch.from_numpy(boxes).float()
            _t_overlaps = bbox_overlaps(_t_boxes, torch.from_numpy(patch).float(), mode='iof')
            overlaps = _t_overlaps.numpy()
            rects = _t_boxes.numpy() # [n, 4]
            valid_inds = np.where(overlaps.max(axis=0) > 0.85)[0]
            if len(valid_inds) == 0:
                return img, boxes
            select_idx = npr.choice(valid_inds)
            patch = patch[select_idx]

        # crop from the image
        patch = np.round(patch).astype(np.int32)
        img = img[patch[1]:patch[3], patch[0]:patch[2]]

        # adjust the box
        if boxes is None or len(boxes) == 0:
            return img, boxes

        center = (rects[:, :2] + rects[:, 2:]) / 2
        mask = (center[:, 0] > patch[0]) * (center[:, 1] > patch[1]) * \
               (center[:, 0] < patch[2]) * (center[:, 1] < patch[3])
        boxes = boxes[mask]
        boxes[:, 0::2] = np.clip(boxes[:, 0::2], a_min=patch[0], a_max=patch[2])
        boxes[:, 1::2] = np.clip(boxes[:, 1::2], a_min=patch[1], a_max=patch[3])
        boxes -= np.tile(patch[:2], 2)

        return img, boxes


class MotionBlur(object):

    def __init__(self, prob=0.05, length_var=10, max_length=20):
        self._prob = prob
        self._length_var = length_var
        self._max_length = max_length

    def __call__(self, img, bbox):
        # TODO(guangting): currently, this implementation is slow.
        if npr.rand() < self._prob:
            length = min(abs(random.gauss(0, self._length_var)), self._max_length)
            angle = random.randrange(-179, 180, 2)
            kernel, anchor = self.generate_psf(length, angle)
            img = cv2.filter2D(img, -1, kernel, anchor=anchor)
        return img, bbox

    @staticmethod
    def generate_psf(length, angle):
        """ ported from Huayang's code. """
        EPS = np.finfo(float).eps
        alpha = (angle - math.floor(angle / 180) * 180) / 180 * math.pi
        cosalpha = math.cos(alpha)
        sinalpha = math.sin(alpha)
        if cosalpha < 0:
            xsign = -1
        elif angle == 90:
            xsign = 0
        else:
            xsign = 1
        psfwdt = 1
        sx = int(math.fabs(length * cosalpha + psfwdt * xsign - length * EPS))
        sy = int(math.fabs(length * sinalpha + psfwdt - length * EPS))
        psf1 = np.zeros((sy, sx))
        half = length / 2
        for i in range(0, sy):
            for j in range(0, sx):
                psf1[i][j] = i * math.fabs(cosalpha) - j * sinalpha
                rad = math.sqrt(i * i + j * j)
                if rad >= half and math.fabs(psf1[i][j]) <= psfwdt:
                    temp = half - math.fabs((j + psf1[i][j] * sinalpha) / cosalpha)
                    psf1[i][j] = math.sqrt(psf1[i][j] * psf1[i][j] + temp * temp)
                psf1[i][j] = psfwdt + EPS - math.fabs(psf1[i][j])
                if psf1[i][j] < 0:
                    psf1[i][j] = 0
        anchor = (0, 0)
        if angle < 90 and angle > 0:
            psf1 = np.fliplr(psf1)
            anchor = (psf1.shape[1] - 1, 0)
        elif angle > -90 and angle < 0:
            psf1 = np.fliplr(psf1)
            anchor = (psf1.shape[1] - 1, psf1.shape[0] - 1)
        elif angle < -90:
            psf1 = np.flipud(psf1)
            anchor = (0, psf1.shape[0] - 1)
        psf1 = psf1 / psf1.sum()
        return psf1, anchor


class Noisy(object):
    def __init__(self, prob=0.1, sigma_var=5, max_sigma=10):
        self._prob = prob
        self._sigma_var = sigma_var
        self._max_sigma = max_sigma

    def __call__(self, img, boxes):
        if npr.rand() < self._prob:
            if npr.choice(2):
                residual = npr.uniform(-self._sigma_var, self._sigma_var, img.shape)
            else:
                sigma = min(abs(random.gauss(0, self._sigma_var)), self._max_sigma)
                residual = npr.randn(*img.shape) * sigma
            img = img + residual.astype(np.float32)
        return img, boxes


class ShuffleBBoxes(object):
    def __init__(self, prob=0.1):
        self._prob = prob

    def __call__(self, img, boxes):

        if len(boxes) < 2:
            return img, boxes

        if npr.rand() < self._prob:
            boxes_int = np.round(boxes).astype(np.int32)
            boxes_int[:, 0:4:2] = np.clip(boxes_int[:, 0:4:2], a_min=0, a_max=img.shape[1]-1)
            boxes_int[:, 1:4:2] = np.clip(boxes_int[:, 1:4:2], a_min=0, a_max=img.shape[0]-1)
            boxes_w = boxes_int[:, 2] - boxes_int[:, 0]
            boxes_h = boxes_int[:, 3] - boxes_int[:, 1]
            if np.any(boxes_w < 2) or np.any(boxes_h < 2):
                return img, boxes

            # crop character patches
            img_patches = []
            for i_box in boxes_int:
                img_patches.append(
                    img[i_box[1]:i_box[3], i_box[0]:i_box[2], :].copy()
                )
            # shuffle box index
            inds = np.random.permutation(len(boxes))
            img_cp = img.copy()
            boxes_cp = boxes.copy()
            for dst, src in enumerate(inds):
                if src == dst:
                    continue
                dst_box = boxes_int[dst]
                dst_w, dst_h = dst_box[2:4] - dst_box[0:2]
                dst_patch = cv2.resize(img_patches[src], dsize=(dst_w, dst_h))
                img_cp[dst_box[1]:dst_box[3], dst_box[0]:dst_box[2], :] = dst_patch
                boxes_cp[src, :] = boxes[dst, :]
            img = img_cp
            boxes = boxes_cp
        return img, boxes


class Sharpen(object):
    def __init__(self, prob=0.05, alpha=0.5):
        self._prob = prob
        self._alpha = alpha

    def __call__(self, img, boxes):
        if npr.rand() < self._prob:
            img = iaa.Sharpen(alpha=(0, self._alpha)).augment_image(img)
        return img, boxes


class Erosion(object):
    def __init__(self, prob=0.05, dilate_size=2):
        self._dilate_size = dilate_size
        self._prob = prob

    def __call__(self, img, boxes):
        if npr.rand() < self._prob:
            img = cv2.dilate(img, cv2.getStructuringElement(cv2.MORPH_RECT,
                                                            (self._dilate_size, self._dilate_size)))
        return img, boxes


class AspectRatioChange(object):
    def __init__(self, prob=0.25, var=0.1, max_ratio=2.0):
        self._prob = prob
        self._var = var
        self._max_ratio = max_ratio

    def __call__(self, img, boxes):
        if npr.rand() < self._prob:
            r = random.gauss(1.0, self._var)
            r = min(max(r, 1.0 / self._max_ratio), self._max_ratio)
            img = cv2.resize(img, dst=None, dsize=None, fx=r, fy=1.0)
            boxes[:, 0::2] = boxes[:, 0::2] * r
        return img, boxes


class Affine(object):
    def __init__(self,
                 prob=0.3,
                 shear=(-16, 16),
                 scale=(0.95, 1.05),
                 rotate=(-5, 5),
                 translate={'x': (-0.08, 0.08), 'y': (-0.03, 0.03)}):
        self._prob = prob
        self._shear = shear
        self._scale = scale
        self._rotate = rotate
        self._translate = translate

    def __call__(self, img, boxes):
        assert boxes.shape[1] == 4, "Support bounding boxes only."
        if npr.rand() < self._prob:
            boxes_iaa = _numpy2iabbox(boxes, img.shape)
            trans = iaa.Affine(shear=self._shear, scale=self._scale, rotate=self._rotate,
                               translate_percent=self._translate).to_deterministic()
            img = trans.augment_image(img)
            boxes_iaa = trans.augment_bounding_boxes([boxes_iaa])[0].clip_out_of_image()
            boxes = _iabbox2numpy(boxes_iaa)
        return img, boxes


class Shadow(object):
    def __init__(self,
                 prob=0.05,
                 coor_lim=0.45,
                 value_var=0.5):
        self._prob = prob
        self._coor_lim = coor_lim
        self._value_var = value_var

    def __call__(self, img, boxes):
        if npr.rand() < self._prob:
            y1 = npr.uniform(-self._coor_lim, self._coor_lim) + 0.5
            y2 = npr.uniform(-self._coor_lim, self._coor_lim) + 0.5
            k = (y2 - y1) / img.shape[1]

            value = min(abs(random.gauss(0.0, 0.2)), self._value_var) + 1
            im_orig = cv2.cvtColor(img, cv2.COLOR_BGR2YUV)

            light = np.clip(im_orig[:, :, 0] * value, a_min=16, a_max=235)
            dark = np.clip(im_orig[:, :, 0] / value, a_min=16, a_max=235)

            x = np.arange(img.shape[1], dtype=np.float32)
            y = np.arange(img.shape[0], dtype=np.float32)
            xx, yy = np.meshgrid(x, y)
            cond = yy > (xx * k + y1) * img.shape[0]

            im_orig[:, :, 0] = np.where(cond, light, dark)
            img = cv2.cvtColor(im_orig, cv2.COLOR_YUV2BGR)
        return img, boxes


class Invert(object):
    def __init__(self, prob=0.1):
        self._prob = prob

    def __call__(self, img, boxes):
        if npr.rand() < self._prob:
            img = 255 - img
        return img, boxes


class PhotoMetricDistortion(object):

    def __init__(self,
                 prob=1.0,
                 brightness_delta=32,
                 contrast_range=(0.5, 1.5),
                 saturation_range=(0.5, 1.5),
                 hue_delta=18):
        self._prob = prob
        self.brightness_delta = brightness_delta
        self.contrast_lower, self.contrast_upper = contrast_range
        self.saturation_lower, self.saturation_upper = saturation_range
        self.hue_delta = hue_delta

    def __call__(self, img, boxes):
        if npr.rand() > self._prob:
            return img, boxes

        if npr.randint(2):
            delta = npr.uniform(-self.brightness_delta, self.brightness_delta, )
            img += delta

        # mode == 0 --> do random contrast first
        # mode == 1 --> do random contrast last
        mode = npr.randint(2)
        if mode == 1:
            if npr.randint(2):
                alpha = npr.uniform(self.contrast_lower, self.contrast_upper)
                img *= alpha

        # convert color from BGR to HSV
        # img = np.round(np.clip(img, a_min=0, a_max=255)).astype(np.uint8)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        # random saturation
        if npr.randint(2):
            img[..., 1] *= npr.uniform(self.saturation_lower, self.saturation_upper)

        # random hue
        if npr.randint(2):
            img[..., 0] += npr.uniform(-self.hue_delta, self.hue_delta)
            img[..., 0][img[..., 0] > 360] -= 360
            img[..., 0][img[..., 0] < 0] += 360

        img = cv2.cvtColor(img, cv2.COLOR_HSV2BGR)

        # random contrast
        if mode == 0:
            if npr.randint(2):
                alpha = npr.uniform(self.contrast_lower, self.contrast_upper)
                img *= alpha
        img = np.clip(img, 0, 255)

        return img, boxes


class BlurDistortion(object):

    def __init__(self,
                 kernel_range=(3, 5, 7, 9, 11),
                 prob=0.2,
                 gaussian_prob=0.6,
                 median_prob=0.3,
                 average_prob=0.0,
                 motion_prob=0.1):
        self._kernel_range = kernel_range
        self._prob = prob
        self._blur_types = np.array([gaussian_prob, median_prob, average_prob, motion_prob])
        self._blur_types = self._blur_types / self._blur_types.sum()  # norm to sum 1

    def __call__(self, img, boxes):
        if npr.rand() < self._prob:
            mode = npr.choice(4, p=self._blur_types)
            ksize = npr.choice(self._kernel_range)
            if mode == 0:
                img = cv2.GaussianBlur(img, (ksize, ksize), 0)
            elif mode == 1:
                ksize = npr.choice([3, 5])
                img = cv2.medianBlur(img, ksize, 0)
            elif mode == 2:
                img = cv2.blur(img, (ksize, ksize), 0)
            else:
                inds = np.arange(ksize, dtype=np.int32)
                ctr = (ksize - 1) // 2
                kmat = np.zeros((ksize, ksize), np.float32)
                direction = npr.choice(4)
                if direction == 0:
                    kmat[ctr, inds] = 1
                elif direction == 1:
                    kmat[inds, ctr] = 1
                elif direction == 2:
                    kmat[inds, inds] = 1
                else:
                    kmat[inds[::-1], inds] = 1
                kmat = kmat / kmat.sum()
                img = cv2.filter2D(img, -1, kmat, borderType=cv2.BORDER_REPLICATE)
        return img, boxes


def _numpy2iabbox(boxes, img_shape):
    return BoundingBoxesOnImage(
                [BoundingBox(x1=boxes[i, 0], y1=boxes[i, 1], x2=boxes[i, 2], y2=boxes[i, 3])
                 for i in range(len(boxes))],
                shape=img_shape)


def _iabbox2numpy(boxes_iaa):
    assert isinstance(boxes_iaa, BoundingBoxesOnImage)
    boxes = []
    for i in range(len(boxes_iaa.bounding_boxes)):
        ib = boxes_iaa.bounding_boxes[i]
        boxes.append([ib.x1, ib.y1, ib.x2, ib.y2])
    return np.array(boxes, dtype=np.float32)