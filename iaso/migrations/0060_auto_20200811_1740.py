# Generated by Django 3.0.3 on 2020-08-11 17:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("iaso", "0059_auto_20200811_1401")]

    operations = [
        migrations.RemoveField(model_name="orgunit", name="geom_source"),
        migrations.AddField(
            model_name="orgunit",
            name="validation_status",
            field=models.CharField(
                choices=[("new", "new"), ("valid", "valid"), ("rejected", "rejected")], default="NEW", max_length=25
            ),
            preserve_default=False,
        ),
        migrations.AlterField(model_name="orgunit", name="sub_source", field=models.TextField(blank=True, null=True)),
    ]