from rest_framework import serializers
from .models import User
from .models import Transaction

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'insta_name']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'insta_name', 'followers', 'following', 'fans', 'unfollowers']

class TransactionSerializer(serializers.ModelSerializer):
    to_user = UserSerializer()

    class Meta:
        model = Transaction
        fields = ['from_user', 'to_user', 'action', 'timestamp']