# Generated by Django 2.1.11 on 2020-05-20 08:24

import django.contrib.postgres.fields.jsonb
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("vector_control", "0029_apiimport_has_problem")]

    operations = [
        migrations.AddField(
            model_name="apiimport",
            name="exception",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="apiimport",
            name="headers",
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, null=True),
        ),
    ]