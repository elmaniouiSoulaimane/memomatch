from django.urls import re_path
from .consumers.main import GameConsumer

websocket_urlpatterns = [
    re_path(r"ws/memomatch/(?P<action>\w+)/(?P<room_name>\w+)", GameConsumer.as_asgi(), name="room"),
]