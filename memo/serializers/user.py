from drf_writable_nested.serializers import WritableNestedModelSerializer
from memo.models.user import User


class UserSerializer(WritableNestedModelSerializer):
    class Meta:
        model = User
        fields = "__all__"
