# Generated by Django 4.2 on 2023-10-20 13:14

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('tournaments_app', '0016_alter_playerstats_tournament'),
    ]

    operations = [
        migrations.CreateModel(
            name='TournamentAdmin',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tournament', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='tournaments_app.tournaments')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'tournament')},
            },
        ),
        migrations.AddField(
            model_name='tournaments',
            name='admins',
            field=models.ManyToManyField(related_name='administered_tournaments', through='tournaments_app.TournamentAdmin', to=settings.AUTH_USER_MODEL),
        ),
    ]
