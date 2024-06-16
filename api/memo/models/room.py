from django.db import models


class Room(models.Model):
    created_at = models.DateField(null=False, blank=False, auto_now_add=True)
    updated_at = models.DateField(null=False, blank=False, auto_now=True)
    name = models.CharField(null=False, blank=False, max_length=15)
    password = models.CharField(null=False, blank=False, max_length=15)

