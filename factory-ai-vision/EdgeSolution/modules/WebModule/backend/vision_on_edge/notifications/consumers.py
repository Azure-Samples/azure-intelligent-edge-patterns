"""App Consumers.
"""

# pylint: disable=unused-import
import asyncio  # noqa: F401

# pylint: enable=unused-import
import logging

from asgiref.sync import async_to_sync
from channels.generic.websocket import JsonWebsocketConsumer

logger = logging.getLogger(__name__)


class NotificationConsumer(JsonWebsocketConsumer):
    """NotificationConsumer"""

    def connect(self):
        """websocket connect"""

        # self.channel_name = "notification"
        async_to_sync(self.channel_layer.group_add)("notification", self.channel_name)
        self.accept()

    def disconnect(self, message):
        """websocket close"""
        pass

    def websocket_receive(self, message):
        """websocket receive"""
        logger.info("recieve %s", message)
        self.send("Connected")
        self.channel_layer.group_send(
            "link", {"type": "link.send", "message": "msg from websocket"}
        )

    def notification_send(self, event):
        """websocket send"""
        logger.info("notification_send!")
        self.send_json(event)
