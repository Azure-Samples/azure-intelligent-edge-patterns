from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals

import zipfile
import io
import os
import cv2
import numpy as np


class ZipWrapper(object):

    def __init__(self, root_path, cache_into_memory=True):

        if cache_into_memory:
            print("Loading zip file into memory...")
            f = open(root_path, 'rb')
            self.zip_content = f.read()
            f.close()
            print("Done...")
            self.zip_file = zipfile.ZipFile(io.BytesIO(self.zip_content), 'r')
        else:
            self.zip_file = zipfile.ZipFile(root_path, 'r')

    def __getitem__(self, key):
        buf = self.zip_file.read(name=key)
        img = cv2.imdecode(np.fromstring(buf, dtype=np.uint8), cv2.IMREAD_COLOR)
        return img

    def __del__(self):
        self.zip_file.close()


class FileWrapper(object):
    def __init__(self, root_path):
        self.root_path = root_path

    def __getitem__(self, key):
        img = cv2.imread(os.path.join(self.root_path, key), cv2.IMREAD_COLOR)
        return img
