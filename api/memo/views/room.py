from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated

from ..models.room import Room
from ..serializers.room import RoomSerializer


class RoomCreateView(CreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = []


class RoomListView(ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = []


class RoomRetrieveView(RetrieveAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = []


class RoomUpdateView(UpdateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = []

