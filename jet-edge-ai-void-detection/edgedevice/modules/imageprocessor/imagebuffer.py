# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import threading

class ImageBuffer(object):
    """A simple buffer for storing received images.
    
    This first implementation delivers the most recently added ImageBody
    in round-robin fashion, doing one camera after another.
    """
    class BufferEntry(object):
        def __init__(self, cameraId, body):
            self.cameraiId = cameraId
            self.body = body

    def __init__(self):
        self.entry_list = []
        self.entry_dict = {}
        self.list_index = 0
        self.lock = threading.Lock()

    def add(self, body):
        """Add a received image to the processing buffer"""
        with self.lock:
            found = self.entry_dict.get(body.cameraId, None)
            if found is None:
                entry = ImageBuffer.BufferEntry(body.cameraId, body)
                self.entry_dict[body.cameraId] = entry
                self.entry_list.append(entry)
                found = entry
            found.body = body

    def get_next(self):
        """Return the next image to process, or None if no image is waiting"""
        with self.lock:
            for i in range(0, len(self.entry_list)):
                self.list_index += 1
                self.list_index = self.list_index % len(self.entry_list)
                if self.entry_list[self.list_index].body is not None:
                    result = self.entry_list[self.list_index].body
                    self.entry_list[self.list_index].body = None
                    return result
