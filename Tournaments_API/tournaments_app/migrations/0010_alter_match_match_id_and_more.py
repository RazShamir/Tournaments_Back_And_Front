# Generated by Django 4.2 on 2023-10-06 08:40

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('tournaments_app', '0009_remove_match_participant_one_wins_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='match',
            name='match_id',
            field=models.UUIDField(default=uuid.UUID('14ff30d4-ad59-41d8-aee2-e3bc8b28f2bd'), primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='participants',
            name='participant_id',
            field=models.UUIDField(default=uuid.UUID('93c71c86-8bb4-4ba9-9f7c-ace600ee6991')),
        ),
        migrations.AlterField(
            model_name='participants',
            name='tournament',
            field=models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='participants', to='tournaments_app.tournaments'),
        ),
    ]