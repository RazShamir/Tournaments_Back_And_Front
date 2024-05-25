# Generated by Django 4.2 on 2023-09-28 10:25

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('tournaments_app', '0003_alter_match_match_id_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='match',
            name='match_id',
            field=models.UUIDField(default=uuid.UUID('1a96acc2-92eb-4a67-b457-421a09f09652'), primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='match',
            name='match_type',
            field=models.IntegerField(choices=[(1, 'Swiss Bo1'), (2, 'Single Elimination Bo1'), (3, 'Swiss Bo3'), (4, 'Single Elimination Bo3')], default=1),
        ),
        migrations.AlterField(
            model_name='participants',
            name='participant_id',
            field=models.UUIDField(default=uuid.UUID('8b12cf76-96cd-4474-8d12-97912eaf276b')),
        ),
    ]