# Portions Copyright (c) Microsoft Corporation under the MIT license

# Copyright 2016 Paul Balanca. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ==============================================================================

import math
import numpy as np

def compute_layer_anchors(img_shape, feat_shape, sizes, ratios, step):
    """
    Compute SSD default anchor boxes for one feature layer.

    Determine the relative position grid of the centers, and the relative
    width and height.

    Arguments:
      img_shape: Image shape;
      feat_shape: Feature shape, used for computing relative position grids;
      size: Absolute reference sizes;
      ratios: Ratios to use on these features;
      step: Layer's step;   
    Return:
      y, x, h, w: Relative x and y grids, and height and width.
    """

    offset = 0.5
    dtype = np.float32

    # Compute the position grid: simple way.
    # y, x = np.mgrid[0:feat_shape[0], 0:feat_shape[1]]
    # y = (y.astype(dtype) + offset) / feat_shape[0]
    # x = (x.astype(dtype) + offset) / feat_shape[1]
    # Weird SSD-Caffe computation using steps values...
    y, x = np.mgrid[0:feat_shape[0], 0:feat_shape[1]]
    y = (y.astype(dtype) + offset) * step / img_shape[0]
    x = (x.astype(dtype) + offset) * step / img_shape[1]

    # Expand dims to support easy broadcasting.
    y = np.expand_dims(y, axis=-1)
    x = np.expand_dims(x, axis=-1)

    # Compute relative height and width.
    # Tries to follow the original implementation of SSD for the order.
    num_anchors = len(sizes) + len(ratios)
    h = np.zeros((num_anchors, ), dtype=dtype)
    w = np.zeros((num_anchors, ), dtype=dtype)
    # Add first anchor boxes with ratio=1.
    h[0] = sizes[0] / img_shape[0]
    w[0] = sizes[0] / img_shape[1]
    di = 1
    if len(sizes) > 1:
        h[1] = math.sqrt(sizes[0] * sizes[1]) / img_shape[0]
        w[1] = math.sqrt(sizes[0] * sizes[1]) / img_shape[1]
        di += 1
    for i, r in enumerate(ratios):
        h[i+di] = sizes[0] / img_shape[0] / math.sqrt(r)
        w[i+di] = sizes[0] / img_shape[1] * math.sqrt(r)
    return y, x, h, w


def compute_anchors(img_shape=(300, 300)):
    """
    Compute SSD model anchors for all 6 layers.
    """
    layers_shape = [
        [37, 37, 4],
        [19, 19, 6],
        [10, 10, 6],
        [5, 5, 6],
        [3, 3, 4],
        [1, 1, 4]]

    anchor_sizes = [
        (21.0, 45.0),
        (45.0, 99.0),
        (99.0, 153.0),
        (153.0, 207.0),
        (207.0, 261.0),
        (261.0, 315.0)]

    anchor_ratios = [
        [2, .5],
        [2, .5, 3, 1./3],
        [2, .5, 3, 1./3],
        [2, .5, 3, 1./3],
        [2, .5],
        [2, .5]]

    anchor_steps = [8, 16, 32, 64, 100, 300]

    anchor_offset = 0.5

    anchors = []
    for i, s in enumerate(layers_shape):
        layer_anchors = compute_layer_anchors(img_shape, s,
                                              anchor_sizes[i],
                                              anchor_ratios[i],
                                              anchor_steps[i])
        anchors.append(layer_anchors)

    return anchors


def decode_layer_boxes(localizations,
                       anchor_bboxes,
                       prior_scaling=[0.1, 0.1, 0.2, 0.2]):
    """Compute the relative bounding boxes from the layer features and
    reference anchor bounding boxes.

    Return:
      numpy array Nx4: ymin, xmin, ymax, xmax
    """
    # Reshape for easier broadcasting.
    l_shape = localizations.shape
    localizations = np.reshape(localizations,
                               (-1, l_shape[-2], l_shape[-1]))
    yref, xref, href, wref = anchor_bboxes
    xref = np.reshape(xref, [-1, 1])
    yref = np.reshape(yref, [-1, 1])

    # Compute center, height and width
    cx = localizations[:, :, 0] * wref * prior_scaling[0] + xref
    cy = localizations[:, :, 1] * href * prior_scaling[1] + yref
    w = wref * np.exp(localizations[:, :, 2] * prior_scaling[2])
    h = href * np.exp(localizations[:, :, 3] * prior_scaling[3])
    # bboxes: ymin, xmin, xmax, ymax.
    bboxes = np.zeros_like(localizations)
    bboxes[:, :, 0] = cy - h / 2.
    bboxes[:, :, 1] = cx - w / 2.
    bboxes[:, :, 2] = cy + h / 2.
    bboxes[:, :, 3] = cx + w / 2.
    # Back to original shape.
    bboxes = np.reshape(bboxes, l_shape)

    return bboxes


def select_layer_boxes(predictions, localizations, anchors,
                       select_threshold, img_shape, num_classes):
    """Extract classes, scores and bounding boxes from features in one layer.

    Return:
      classes, scores, bboxes: Numpy arrays...
    """

    localizations = decode_layer_boxes(localizations, anchors)

    # Reshape features to: Batches x N x N_labels | 4.
    p_shape = predictions.shape
    batch_size = p_shape[0] if len(p_shape) == 5 else 1
    predictions = np.reshape(predictions, (batch_size, -1, p_shape[-1]))
    l_shape = localizations.shape
    localizations = np.reshape(localizations, (batch_size, -1, l_shape[-1]))

    # Boxes selection: use threshold or score > no-label criteria.
    if select_threshold is None or select_threshold == 0:
        # Class prediction and scores: assign 0. to 0-class
        classes = np.argmax(predictions, axis=2)
        scores = np.amax(predictions, axis=2)
        mask = (classes > 0)
        classes = classes[mask]
        scores = scores[mask]
        bboxes = localizations[mask]
    else:
        sub_predictions = predictions[:, :, 1:]
        idxes = np.where(sub_predictions > select_threshold)
        classes = idxes[-1]+1
        scores = sub_predictions[idxes]
        bboxes = localizations[idxes[:-1]]

    return classes, scores, bboxes


def clip_bboxes(bbox_ref, bboxes):
    """Clip bounding boxes with respect to reference bbox.
    """
    bboxes = np.copy(bboxes)
    bboxes = np.transpose(bboxes)
    bbox_ref = np.transpose(bbox_ref)
    bboxes[0] = np.maximum(bboxes[0], bbox_ref[0])
    bboxes[1] = np.maximum(bboxes[1], bbox_ref[1])
    bboxes[2] = np.minimum(bboxes[2], bbox_ref[2])
    bboxes[3] = np.minimum(bboxes[3], bbox_ref[3])
    bboxes = np.transpose(bboxes)
    return bboxes


def sort_bboxes(classes, scores, bboxes, top_k=400):
    """Sort bounding boxes by decreasing order and keep only the top_k
    """
    # if priority_inside:
    #     inside = (bboxes[:, 0] > margin) & (bboxes[:, 1] > margin) & \
    #         (bboxes[:, 2] < 1-margin) & (bboxes[:, 3] < 1-margin)
    #     idxes = np.argsort(-scores)
    #     inside = inside[idxes]
    #     idxes = np.concatenate([idxes[inside], idxes[~inside]])
    idxes = np.argsort(-scores)
    classes = classes[idxes][:top_k]
    scores = scores[idxes][:top_k]
    bboxes = bboxes[idxes][:top_k]
    return classes, scores, bboxes


def jaccard_bboxes(bboxes1, bboxes2):
    """Computing jaccard index between bboxes1 and bboxes2.
    Note: bboxes1 and bboxes2 can be multi-dimensional, but should broacastable.
    """
    bboxes1 = np.transpose(bboxes1)
    bboxes2 = np.transpose(bboxes2)

    # Intersection bbox and volume.
    int_ymin = np.maximum(bboxes1[0], bboxes2[0])
    int_xmin = np.maximum(bboxes1[1], bboxes2[1])
    int_ymax = np.minimum(bboxes1[2], bboxes2[2])
    int_xmax = np.minimum(bboxes1[3], bboxes2[3])

    int_h = np.maximum(int_ymax - int_ymin, 0.)
    int_w = np.maximum(int_xmax - int_xmin, 0.)
    int_vol = int_h * int_w

    # Union volume.
    vol1 = (bboxes1[2] - bboxes1[0]) * (bboxes1[3] - bboxes1[1])
    vol2 = (bboxes2[2] - bboxes2[0]) * (bboxes2[3] - bboxes2[1])
    jaccard = int_vol / (vol1 + vol2 - int_vol)
    return jaccard


def select_bboxes(classes, scores, bboxes, nms_threshold=0.45):
    """Apply non-maximum selection to bounding boxes.
    """
    keep_bboxes = np.ones(scores.shape, dtype=np.bool)
    for i in range(scores.size-1):
        if keep_bboxes[i]:
            # Computer overlap with bboxes which are following.
            overlap = jaccard_bboxes(bboxes[i], bboxes[(i+1):])
            # Overlap threshold for keeping + checking part of the same class
            keep_overlap = np.logical_or(
                overlap < nms_threshold, classes[(i+1):] != classes[i])
            keep_bboxes[(i+1):] = np.logical_and(keep_bboxes[(i+1):],
                                                 keep_overlap)

    idxes = np.where(keep_bboxes)
    return classes[idxes], scores[idxes], bboxes[idxes]


def resize_boxes(bbox_ref, bboxes):
    """Resize bounding boxes based on a reference bounding box,
    assuming that the latter is [0, 0, 1, 1] after transform.
    """
    bboxes = np.copy(bboxes)

    # Translate.
    bboxes[:, 0] -= bbox_ref[0]
    bboxes[:, 1] -= bbox_ref[1]
    bboxes[:, 2] -= bbox_ref[0]
    bboxes[:, 3] -= bbox_ref[1]

    # Resize.
    resize = [bbox_ref[2] - bbox_ref[0], bbox_ref[3] - bbox_ref[1]]
    bboxes[:, 0] /= resize[0]
    bboxes[:, 1] /= resize[1]
    bboxes[:, 2] /= resize[0]
    bboxes[:, 3] /= resize[1]
    return bboxes

def softmax(x, axis):
    """Compute softmax for the specified axis."""
    e_x = np.exp(x - np.expand_dims(np.max(x, axis=axis), axis))
    return e_x / np.expand_dims(np.sum(e_x, axis=axis), axis)

def extract_detections(predictions, localizations, ssd_anchors,
                       select_threshold=0.5, img_shape=(300, 300), num_classes=21):
    """Extract classes, scores and bounding boxes from network output layers.

    Return:
      classes, scores, bboxes: Numpy arrays...
    """
    l_classes = []
    l_scores = []
    l_bboxes = []
    rbbox_img = [0.0, 0.0, 1.0, 1.0]


    for i in range(len(predictions)):
        classes, scores, bboxes = select_layer_boxes(
            softmax(predictions[i], axis=4), localizations[i], ssd_anchors[i],
            select_threshold, img_shape, num_classes)
        l_classes.append(classes)
        l_scores.append(scores)
        l_bboxes.append(bboxes)

    classes = np.concatenate(l_classes, 0)
    scores = np.concatenate(l_scores, 0)
    bboxes = np.concatenate(l_bboxes, 0)

    bboxes = clip_bboxes(rbbox_img, bboxes)

    classes, scores, bboxes = sort_bboxes(classes, scores, bboxes, top_k=400)
    classes, scores, bboxes = select_bboxes(
        classes, scores, bboxes, nms_threshold=0.45)
    bboxes = resize_boxes(rbbox_img, bboxes)

    return classes, scores, bboxes

def postprocess(network_output, ssd_anchors = compute_anchors(), select_threshold=0.5, nms_threshold=.45):
    predictions = []
    localisations = []

    has_batch_dim = (len(network_output[0].shape) == 5)
    if not has_batch_dim:
        for out in network_output:
            out = np.expand_dims(out, axis=0)
            assert len(out.shape) == 5

    return extract_detections(network_output[0:6], network_output[6:12], ssd_anchors)

if __name__ == "__main__":
    print("Done!")
