# Generated by Django 2.0 on 2018-12-20 15:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("vector_control", "0012_apiimport_json_body")]

    operations = [
        migrations.AddField(
            model_name="gpsimport",
            name="count",
            field=models.IntegerField(blank=True, default=0, null=True),
        )
    ]