# Generated by Django 5.0.1 on 2024-04-04 22:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('server', '0005_remove_user_isprocessed_user_last_updated_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='avatar_url',
            field=models.URLField(blank=True),
        ),
    ]
