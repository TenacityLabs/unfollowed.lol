from django.db import models
from django.db.models import JSONField

class User(models.Model):
    username = models.CharField(max_length=100, default='', blank=False, null=False)
    insta_name = models.CharField(max_length=100, blank=True, null=True)
    avatar_url = models.URLField(max_length=400, blank=True)
    followers = JSONField(default=list, blank=True)
    following = JSONField(default=list, blank=True)
    fans = JSONField(default=list, blank=True)
    unfollowers = JSONField(default=list, blank=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username
    
class Transaction(models.Model):
    from_user = JSONField()
    to_user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=10)
    timestamp = models.DateTimeField(auto_now_add=True)