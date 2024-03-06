from drf_writable_nested.serializers import WritableNestedModelSerializer
from memo.models.room import Room


class RoomSerializer(WritableNestedModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'name', 'created_at', 'updated_at']
