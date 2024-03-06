from django.db import models


class Room(models.Model):
    created_at = models.DateField(null=True, blank=True, auto_now_add=True)
    name = models.CharField(max_length="15")
    password = models.CharField(max_length="<PASSWORD>")

