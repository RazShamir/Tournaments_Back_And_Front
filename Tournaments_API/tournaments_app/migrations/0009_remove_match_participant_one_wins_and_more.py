# Generated by Django 4.2 on 2023-10-04 17:54

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('tournaments_app', '0008_alter_match_match_id_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='match',
            name='participant_one_wins',
        ),
        migrations.RemoveField(
            model_name='match',
            name='participant_two_wins',
        ),
        migrations.AddField(
            model_name='match',
            name='match_result',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='match',
            name='match_id',
            field=models.UUIDField(default=uuid.UUID('7d3cbab9-fabd-4f8a-83cf-34f77013e53b'), primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='participants',
            name='participant_id',
            field=models.UUIDField(default=uuid.UUID('7ace3362-ea66-489a-85fd-5fdf5523c69f')),
        ),
    ]