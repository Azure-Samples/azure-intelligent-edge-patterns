import torch
from torch import nn
import numpy as np
import cv2
import time

from .constants import US_CHARACTERS, US_REGIONS
from ..utils.image import imnormalize, img_scale_transform


def edit_distance(str_a, str_b):
    la, lb = len(str_a), len(str_b)
    dis_table = np.zeros((la+1, lb+1))
    dis_table[0, :] = np.arange(lb+1)
    dis_table[:, 0] = np.arange(la+1)
    for i in range(1, la+1):
        for j in range(1, lb+1):
            if str_a[i-1] == str_b[j-1]:
                dis_table[i, j] = dis_table[i-1, j-1]
            else:
                dis_table[i, j] = 1 + min(dis_table[i-1, j-1], dis_table[i, j-1], dis_table[i-1, j])
    return 1 - dis_table[la, lb] / max(la, lb)


def det_and_recognize(detector,
                      recognizer,
                      img,
                      det_score_thresh=0.7,
                      det_img_scale=(480, 360),
                      rec_img_scale=(144, 72),
                      img_mean=(102.9801, 115.9465, 122.7717),
                      img_std=(1.0, 1.0, 1.0),
                      to_rgb=False,
                      device='cuda:0'):

    dst_corners = np.array([[0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0]], np.float32) * rec_img_scale

    # detection
    corners = plate_detect(detector,
                           img,
                           img_scale=det_img_scale,
                           img_mean=img_mean,
                           img_std=img_std,
                           to_rgb=to_rgb,
                           device=device)
    valid_inds = np.where(corners[:, -1] > det_score_thresh)[0]
    corners = corners[valid_inds, :]
    score = corners[:, -1]

    # crop plate images
    plate_imgs_list = []
    for i in range(len(corners)):
        src_corners = corners[i, 0:8].reshape(4, 2)
        h_mat = cv2.findHomography(src_corners, dst_corners)[0]
        plate_imgs_list.append([cv2.warpPerspective(img, h_mat, rec_img_scale)])

    result_list = []
    # recognition
    for plate_id, plate_imgs in enumerate(plate_imgs_list):
        recog_results = plate_recognition(recognizer,
                                          plate_imgs,
                                          img_mean=img_mean,
                                          img_std=img_std,
                                          to_rgb=to_rgb,
                                          device=device)

        if len(recog_results) == 1:
            index = 0
        else:
            # get pair-wise edit distance. ( this method is also ported from Yucheng's code.
            string_list = [r[0] for r in recog_results]
            loss_mat = np.zeros((len(string_list), len(string_list)), np.float32)
            score_mat = np.array([r[1] for r in recog_results], np.float32).reshape(-1, 1)
            for i in range(loss_mat.shape[0]):
                for j in range(i+1, loss_mat.shape[0]):
                    loss_mat[i, j] = loss_mat[j, i] = edit_distance(string_list[i], string_list[j])
            index = np.argmax(np.dot(loss_mat, score_mat).reshape(-1))

        pred_string = recog_results[index][0]
        pred_score = recog_results[index][1]
        result_list.append(dict(corners=corners[plate_id], string=pred_string, score=pred_score))

    return result_list


def plate_recognition(recognizer,
                      img,
                      top_k=1,
                      img_mean=(102.9801, 115.9465, 122.7717),
                      img_std=(1.0, 1.0, 1.0),
                      to_rgb=False,
                      device='cuda:0'):
    """
    Recognize license plate on the source image.

    Args:
        recognizer (nn.Module): license plate recognizer PyTorch module
        img (np.ndarray or list): the input image in shape
        top_k (int): how many candidates will be reserved.
        img_mean (tuple(float, float, float)): the predefined mean values in echo color channel.
        img_std (tuple(float, float, float)): the predefined std values in echo color channel.
        to_rgb (bool): if revert color channels or not. (OpenCV will store image in [B, G, R] while PIL uses [R, G, B]
        device (str): backend device for CNN model

    """

    single_input = False
    if isinstance(img, list):
        for i, i_img in enumerate(img):
            assert isinstance(i_img, np.ndarray)
            if i_img.ndim == 3:
                # from [H, W, C] to [1, H, W, C]
                img[i] = np.expand_dims(img[i], axis=0)
        img = np.concatenate(img, axis=0)  # [N, H, W, C]
    elif isinstance(img, np.ndarray):
        if img.ndim == 3:
            img = np.expand_dims(img, axis=0)
            single_input = True
    else:
        raise TypeError("Unknown type '{}'".format(type(img)))

    img = (img - img_mean) / img_std
    if to_rgb:
        img = np.ascontiguousarray(img[..., ::-1])

    img_meta = [dict(
        img_shape=img.shape[1:],
        pad_shape=img.shape[1:],
        scale_factor=1.0
    )]

    img = img.transpose((0, 3, 1, 2))  # (C, H, W]
    img = torch.FloatTensor(img).to(device)

    results = []
    with torch.no_grad():
        for i in range(img.size(0)):
            # plates is a list, [np.ndarray(N, 6), ...]. [x1, y1, x2, y2, score, cls_id]
            i_results = recognizer(img=img[i].unsqueeze_(0), img_meta=img_meta, return_loss=False)
            # plate_scores = [np.prod(plate[:, 4]) for plate in dets]
            # Generally, the score of echo plate should be the mean or production of characters' scores.
            # But in Yucheng's code, a non-linear function to firstly applied for characters' scores.
            # I am not sure why this trick will work.
            dets = i_results['dets']
            plate_scores = [np.mean((plate[:, 4] - 0.2)**2)/0.64 for plate in dets]

            plate_characters = [''.join([US_CHARACTERS[int(c)] for c in plate[:, 5]]) for plate in dets]
            plates = list(zip(plate_characters, plate_scores, dets))

            if top_k > 1 and len(plates) > 1:
                kept_inds = np.argsort(plate_scores)[::-1][:min(top_k, len(plates))]
                plates = [plates[i] for i in kept_inds]
            else:
                plates = plates[0]

            results.append(plates)

    if single_input:
        results = results[0]

    return results


class DebugTimer(object):

    def __init__(self):
        self.time_list = []
        self.name_list = []
        self.tic = time.time()

    def init(self):
        self.time_list = []
        self.name_list = []
        self.tic = time.time()

    def set(self, name):
        self.time_list.append(time.time() - self.tic)
        self.name_list.append(name)
        self.tic = time.time()

    def show(self):
        print('')
        sum_time = sum(self.time_list)
        for i in range(len(self.time_list)):
            print('{}, {:.5f}({:.2f}%)'.format(self.name_list[i], self.time_list[i], self.time_list[i] / sum_time * 100.0))


def plate_detect(detector,
                 img,
                 img_scale=(480, 360),
                 img_mean=(102.9801, 115.9465, 122.7717),
                 img_std=(1.0, 1.0, 1.0),
                 to_rgb=False,
                 device='cuda:0'):
    """
    Detection license plate on the source image.

    Args:
        detector (nn.Module): license plate detection PyTorch module.
        img (np.ndarray or torch.Tensor): the input image.
        img_scale (tuple(int, int)): the input size of image.
        img_mean (tuple(float, float, float)): the predefined mean values in echo color channel.
        img_std (tuple(float, float, float)): the predefined std values in echo color channel.
        to_rgb (bool): if revert color channels or not. (OpenCV will store image in [B, G, R] while PIL uses [R, G, B]
        device (str): backend device for CNN model

    Returns:
        pred_corners (np.ndarray): the detected license plate, numpy.ndarray in shape of [N, 9]

    """

    if isinstance(img, list):
        return [plate_detect(detector, i) for i in img]

    img = img.astype(np.float32)

    assert hasattr(detector, 'test_cfg') and detector.test_cfg is not None, \
        "Cannot find test configuration in model."

    # Step 1, resize image to suitable size
    img_resize, img_shape, pad_shape, scale_factor = \
        img_scale_transform(img, img_scale, size_divisor=32, keep_ratio=True)

    # Step 2, prepare data
    img = img.transpose(2, 0, 1)  # (C, H, W]
    img_resize = img_resize.transpose(2, 0, 1)
    img_meta = [dict(
        ori_shape=(img.shape[1], img.shape[2], 3),
        img_shape=img_shape,
        pad_shape=pad_shape,
        scale_factor=scale_factor
    )]

    img = torch.FloatTensor(img).to(device).unsqueeze(0)
    img_resize = torch.FloatTensor(img_resize).to(device).unsqueeze(0)

    # Step 3, Normalize
    for i in range(3):
        img[0, i].sub_(img_mean[i])
        img[0, i].div_(img_std[i])
        img_resize[0, i].sub_(img_mean[i])
        img_resize[0, i].div_(img_std[i])

    # Step 4, forward network
    with torch.no_grad():
        # pred_corners is a matrix in shape of [N, 9], (x1, y1, x2, y2, x3, y3, x4, y4, score)
        pred_corners = detector(img=img_resize, img_ori=img, img_meta=img_meta, return_loss=False).cpu().numpy()

    return pred_corners

