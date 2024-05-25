# Generated by Django 4.2 on 2023-09-28 10:27

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('tournaments_app', '0004_alter_match_match_id_alter_match_match_type_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='match',
            name='match_id',
            field=models.UUIDField(default=uuid.UUID('6dc03452-13c9-45b4-a2a1-05c71d5d8b6d'), primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='participants',
            name='participant_id',
            field=models.UUIDField(default=uuid.UUID('349a1d29-0f6c-4109-b2e3-b63b66ceedb6')),
        ),
    ]