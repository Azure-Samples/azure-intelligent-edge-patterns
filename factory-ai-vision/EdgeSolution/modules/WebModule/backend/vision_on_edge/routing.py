"""
Websocket router
"""
from django.conf.urls import url
from channels.routing import ProtocolTypeRouter, URLRouter

from notifications.consumers import NotificationConsumer
from channels.security.websocket import AllowedHostsOriginValidator

application = ProtocolTypeRouter({
    # (http->django views is added by default)
    'websocket':
    AllowedHostsOriginValidator(
        URLRouter([
            url(r"notifications", NotificationConsumer),
        ]))
})
