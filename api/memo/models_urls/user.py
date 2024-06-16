from django.urls import path

from ..views.user import (
    UserCreateView,
    UserListView,
    UserRetrieveView,
    UserUpdateView,
)

urlpatterns = [
    path("new/", UserCreateView.as_view(), name="new"),
    path("list/", UserListView.as_view(), name="list"),
    path("<int:pk>/update", UserUpdateView.as_view(), name="update"),
    path("<int:pk>/find", UserRetrieveView.as_view(), name="find"),
]
