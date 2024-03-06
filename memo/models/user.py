from django.db import models

from memo.models.room import Room


class User(models.Model):
    created_at = models.DateField(null=True, blank=True, auto_now_add=True)
    user_name = models.CharField(null=False, blank=False, max_length=25)
    avatar = models.ImageField(null=True, blank=True, upload_to='')
    points = models.IntegerField()
    room = models.ForeignKey(Room)
