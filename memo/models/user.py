from django.db import models


class User(models.Model):
    created_at = models.DateField(null=False, blank=False, auto_now_add=True)
    user_name = models.CharField(null=False, blank=False, max_length=15)
    avatar = models.ImageField(null=False, blank=True, upload_to='')
    points = models.IntegerField(null=True, blank=True, default=0)
    room = models.ForeignKey("Room", on_delete=models.CASCADE, null=False, blank=False)
