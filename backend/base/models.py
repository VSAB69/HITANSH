from django.db import models
from django.contrib.auth.models import AbstractUser

# Custom User model with role support
class User(AbstractUser):
    ROLE_CHOICES = [
    ('admin', 'Admin'),
    ('client', 'Client'),
]


    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')


    def __str__(self):
        return f"{self.username} ({self.role})"


class Todo(models.Model):
    name = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='todo')

    def __str__(self):
        return f"{self.name} - {self.owner.username}"
