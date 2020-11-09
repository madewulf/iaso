# Generated by Django 2.0 on 2019-06-28 09:33

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [("iaso", "0008_auto_20190627_2052")]

    operations = [
        migrations.CreateModel(
            name="InstanceFile",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.TextField(blank=True, null=True)),
                ("file", models.FileField(blank=True, null=True, upload_to="instancefiles/")),
            ],
        ),
        migrations.RemoveField(model_name="instance", name="name"),
        migrations.RemoveField(model_name="instance", name="org_unit_types"),
        migrations.AddField(
            model_name="instancefile",
            name="instance",
            field=models.ForeignKey(
                blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to="iaso.Instance"
            ),
        ),
    ]