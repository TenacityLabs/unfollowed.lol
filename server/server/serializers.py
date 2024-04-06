from rest_framework import serializers
from .models import User
from .models import Transaction
import humanize
from django.utils import timezone


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
        fields = '__all__'

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        timestamp = instance.timestamp
        
        # Assuming 'timestamp' is a datetime object and using Django's timezone support
        now = timezone.now()
        if timestamp:
            delta = now - timestamp
            human_readable = humanize.naturaltime(delta)
            ret['timestamp'] = human_readable
        return ret
