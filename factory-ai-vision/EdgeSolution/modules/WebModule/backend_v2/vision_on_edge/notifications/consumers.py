# -*- coding: utf-8 -*-
"""Notification Consumer
"""

# pylint: disable=unused-import
import asyncio
# pylint: enable=unused-import
import logging

from channels.generic.websocket import AsyncJsonWebsocketConsumer

# from .models import Notification

logger = logging.getLogger(__name__)


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    """NotificationConsumer
    """

    async def websocket_connect(self, message):
        """websocket connect
        """
        # Auth here
        await self.accept()
        #self.channel_name = "notification"
        await self.channel_layer.group_add("notification", self.channel_name)
        logger.info("connect %s", message)

    async def websocket_receive(self, message):
        """websocket receive
        """
        logger.info("recieve %s", message)
        await self.send("Connected")
        await self.channel_layer.group_send("link", {
            "type": "link.send",
            "message": "msg from websocket",
        })

    async def websocket_disconnect(self, message):
        """websocket close
        """
        logger.info("disconnect %s", message)
        await self.close()
        await self.channel_layer.group_discard("link", self.channel_name)

    async def notification_send(self, event):
        """websocket send
        """
        logger.info("notification_send!!!!!!!!!!")
        await self.send_json(event)
