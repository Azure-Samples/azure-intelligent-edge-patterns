from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals

import os

_IM_DIR = 'image_directory'
_ANN_FN = 'annotation_file'
_ZIP_FN = 'zip_file'

# Available datasets
_DATASETS = {
    'debug_mini': {
        _IM_DIR: 'detection/images',
        _ANN_FN: 'detection/annotations/debug_mini.pkl',
        _ZIP_FN: 'detection/zips/debug_mini.zip'
    },
    'train0514': {
        _IM_DIR: 'detection/images',
        _ANN_FN: 'detection/annotations/train0514.pkl',
        _ZIP_FN: 'detection/zips/JPEGImages.zip'
    },
    'us_train0701': {
        _IM_DIR: 'us_detection/images',
        _ANN_FN: 'us_detection/ImageSets/detection_train_0701.pkl',
        _ZIP_FN: 'us_detection/images/Images.zip'
    },
    'us_sub0701': {
        _IM_DIR: 'us_detection/images',
        _ANN_FN: 'us_detection/ImageSets/detection_train_subus.pkl',
        _ZIP_FN: 'us_detection/images/Images.zip'
    },
    'us_detection_0813': {
        _IM_DIR: 'us_detection/images',
        _ANN_FN: 'us_detection/ImageSets/detection_train_legalus_rm_prefix.pkl',
        _ZIP_FN: 'us_detection/images/LegalUS_detection.zip'
    },
    'china_train': {
        _IM_DIR: 'us_detection/images',
        _ANN_FN: 'us_detection/ImageSets/detection_china.pkl',
        _ZIP_FN: 'us_detection/images/ZH_Images.zip'
    },
    'us_test0701': {
        _IM_DIR: 'us_detection/images',
        _ANN_FN: 'us_detection/ImageSets/detection_test_0701.pkl',
        _ZIP_FN: 'us_detection/images/Images.zip'
    },
    'us_recognition_0701': {
        _IM_DIR: 'us_recognition/images',
        _ANN_FN: 'us_recognition/ImageSets/recognition_train_0701.pkl',
        _ZIP_FN: 'us_recognition/us_recognition.zip'
    },
    'us_recognition_0813': {
        _IM_DIR: 'us_recognition/images',
        _ANN_FN: 'us_recognition/ImageSets/recognition_train_legalus.pkl',
        _ZIP_FN: 'us_recognition/legalus_images.zip'
    },
    'us_recognition_sub_0701': {
        _IM_DIR: 'us_recognition/images',
        _ANN_FN: 'us_recognition/ImageSets/recognition_train_subus.pkl',
        _ZIP_FN: 'us_recognition/us_recognition.zip'
    },
    'us_recognition_sub_dist1': {
        _IM_DIR: 'us_recognition/images',
        _ANN_FN: 'us_recognition/ImageSets/recognition_train_subus_dist1.pkl',
        _ZIP_FN: 'us_recognition/us_recognition.zip'
    },
    'us_recognition_sub_dist2': {
        _IM_DIR: 'us_recognition/images',
        _ANN_FN: 'us_recognition/ImageSets/recognition_train_subus_dist2.pkl',
        _ZIP_FN: 'us_recognition/us_recognition.zip'
    },
    'us_recognition_sub_dist3': {
        _IM_DIR: 'us_recognition/images',
        _ANN_FN: 'us_recognition/ImageSets/recognition_train_subus_dist3.pkl',
        _ZIP_FN: 'us_recognition/us_recognition.zip'
    },
    'us_recognition_test_0701': {
        _IM_DIR: 'us_recognition/images',
        _ANN_FN: 'us_recognition/ImageSets/recognition_test_0701.pkl',
        _ZIP_FN: 'us_recognition/us_recognition.zip'
    },
    'china_recognition': {
        _IM_DIR: 'us_recognition/images',
        _ANN_FN: 'us_recognition/ImageSets/recognition_china.pkl',
        _ZIP_FN: 'us_recognition/china_plate.zip'
    },
}


def datasets():
    """Retrieve the list of available dataset names."""
    return _DATASETS.keys()


def contains(name):
    """Determine if the dataset is in the catalog."""
    return name in _DATASETS.keys()


def get_im_dir(name):
    """Retrieve the image directory for the dataset."""
    return os.path.join(_DATASETS[name][_IM_DIR])


def get_ann_fn(name):
    """Retrieve the annotation file for the dataset."""
    return os.path.join(_DATASETS[name][_ANN_FN])


def get_zip_file(name):
    """Retrieve the zip file for the dataset."""
    if _DATASETS[name][_ZIP_FN] == "":
        raise FileNotFoundError("Not support {} dataset in zip mode yet.".format(name))
    return os.path.join(_DATASETS[name][_ZIP_FN])
