from django.db import models

class User(models.Model):
    username = models.CharField(max_length=100, unique=True)
    insta_name = models.CharField(max_length=100, blank=True, null=True)
    followers = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='user_followers')
    following = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='user_following')
    fans = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='user_fans')
    unfollowers = models.ManyToManyField('self', symmetrical=False, blank=True,related_name='user_unfollowers')
    isProcessed = models.BooleanField(default=False)



    def __str__(self):
        return self.username
