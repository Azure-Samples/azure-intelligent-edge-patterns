"""
Websocket router
"""
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.conf.urls import url

from vision_on_edge.notifications.consumers import NotificationConsumer

application = ProtocolTypeRouter({
    # (http->django views is added by default)
    'websocket':
    AllowedHostsOriginValidator(
        URLRouter([
            url(r"notifications", NotificationConsumer),
        ]))
})
