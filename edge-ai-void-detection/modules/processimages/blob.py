"""
Defines the BlobUploader class.
"""

from azure.storage.blob import BlockBlobService, PublicAccess


class BlobUploader(object):
    """
    A simple helper class for uploading image data to blob storage.
    """

    def __init__(self, container_name, connection_string):
        """
        Initialize a new BlobUploader.
        """
        self.container_name = container_name
        self.block_blob_service = BlockBlobService(connection_string=connection_string)

    def upload(self, camera_id, base_name, extension , data):
        """
        Upload data to blob storage.

        :param str camera_id:
            The ID of the camera that took the image.
        :param str base_name:
            The base filename of the file in storage, without extension.
            The camera module provides this, and it should be a string
            representation of the date and time at which the image was
            captured, such as 2019-06-15T13:45:30.459Z
        :param str extension:
            The file extension specifying the type of image, such as
            "jpg", "png", etc. The leading dot character should not
            be included.
        :param bytes data:
            The content of the blob to be uploaded.
        """
        blob_name = camera_id + '/' + base_name + '.' + extension
        self.block_blob_service.create_blob_from_bytes(self.container_name,
                                                       blob_name,
                                                       data)
