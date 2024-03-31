from django.db import models
from django.db.models import JSONField

class User(models.Model):
    username = models.CharField(max_length=100, unique=True)
    insta_name = models.CharField(max_length=100, blank=True, null=True)
    followers = JSONField(default=list, blank=True)
    following = JSONField(default=list, blank=True)
    fans = JSONField(default=list, blank=True)
    unfollowers = JSONField(default=list, blank=True)
    isProcessed = models.BooleanField(default=False)

    def __str__(self):
        return self.username
