from django.db import models

class User(models.Model):
    username = models.CharField(max_length=100, unique=True)
    full_name = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.username
