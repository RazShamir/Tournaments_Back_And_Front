# Generated by Django 4.2 on 2023-10-14 15:27

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('tournaments_app', '0012_tournaments_published_alter_match_match_id_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='match',
            name='tie',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='match',
            name='match_id',
            field=models.UUIDField(default=uuid.UUID('19589f3e-9013-48eb-87a6-7515687fc324'), primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='participants',
            name='participant_id',
            field=models.UUIDField(default=uuid.UUID('2d590950-a179-4d8f-a4dd-38d8edcde7c9')),
        ),
    ]