from rest_framework import serializers
from .models import User, Todo
from rest_framework_simplejwt.tokens import RefreshToken


from rest_framework import serializers
from .models import User

from rest_framework import serializers
from .models import User

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    role = serializers.ChoiceField(
        choices=User.ROLE_CHOICES,
        required=False,
        allow_blank=True
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']

    def validate_role(self, value):
        # If frontend sends "" → default to client
        if value in ("", None):
            return "client"
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        role = validated_data.pop("role", "client")

        user = User(**validated_data, role=role)
        user.set_password(password)
        user.save()
        return user




class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']


class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = ['id', 'name', 'completed']
