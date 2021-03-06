import logging
from django.conf import settings


class StaticUrlFilter(logging.Filter):
    # Filter out request that start with the static url
    def filter(self, record):  # type: ignore
        if record.module == "basehttp":
            return record.args[0].find(" {}".format(settings.STATIC_URL)) < 0
        return True
