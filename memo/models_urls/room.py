from django.urls import path

from ..views.room import (
    RoomCreateView,
    RoomListView,
    RoomRetrieveView,
    RoomUpdateView,
)

urlpatterns = [
    path("new/", RoomCreateView.as_view(), name="new"),
    path("list/", RoomListView.as_view(), name="list"),
    path("<int:pk>/update", RoomUpdateView.as_view(), name="update"),
    path("<int:pk>/find", RoomRetrieveView.as_view(), name="find"),
]
