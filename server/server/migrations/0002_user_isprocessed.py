# Generated by Django 5.0.1 on 2024-03-31 03:29

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("server", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="isProcessed",
            field=models.BooleanField(default=False),
        ),
    ]
