# Generated by Django 5.0.1 on 2024-04-04 21:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('server', '0004_remove_user_last_updated_user_isprocessed_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='isProcessed',
        ),
        migrations.AddField(
            model_name='user',
            name='last_updated',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AlterField(
            model_name='user',
            name='username',
            field=models.CharField(default='', max_length=100, unique=True),
        ),
    ]