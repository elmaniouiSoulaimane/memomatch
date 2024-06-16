from rest_framework import serializers
from api.memo.models.room import Room


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = "__all__"
