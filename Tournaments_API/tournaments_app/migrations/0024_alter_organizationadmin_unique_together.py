# Generated by Django 4.2 on 2023-11-02 12:41

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('tournaments_app', '0023_remove_playerstats_tournament'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='organizationadmin',
            unique_together={('organization_id', 'user')},
        ),
    ]