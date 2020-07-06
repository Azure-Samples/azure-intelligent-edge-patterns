import asyncio
import logging

from channels.consumer import AsyncConsumer
from channels.db import database_sync_to_async

from .models import Notification

logger = logging.getLogger(__name__)


class NotificationConsumer(AsyncConsumer):
    async def websocket_connect(self, event):
        logger.info("connect %s", event)
        await self.send({
            "type": "websocket.accept",
            })
        await self.send({
            "type": "websocket.send",
            "text": "Hello"
            })

    async def websocket_receive(self, event):
        logger.info("recieve %s", event)
        await self.send({
            "type": "websocket.send",
            "text": "Got it!"
            })

    async def websocker_disconnect(self, event):
        logger.info("disconnect %s", event)
        await self.send({
            "type": "websocket.send",
            "text": "Bye"
            })
