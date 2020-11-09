"""
Django settings for iaso project.

Generated by 'django-admin startproject' using Django 1.9.7.

For more information on this file, see
https://docs.djangoproject.com/en/1.9/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.9/ref/settings/
"""

import os
from datetime import timedelta

STAGING = os.environ.get("STAGING", "").lower() == "true"
TESTING = os.environ.get("TESTING", "").lower() == "true"
FLAVOR = "iaso"
print("FLAVOR", FLAVOR)
# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get("DEBUG", "").lower() == "true"
USE_CACHE = os.environ.get("CACHE", "").lower() == "true"
DEV_SERVER = os.environ.get("DEV_SERVER", "").lower() == "true"
ENVIRONMENT = os.environ.get("IASO_ENVIRONMENT", "development").lower()


ALLOWED_HOSTS = ["*"]

# Tell django to view requests as secure(ssl) that have this header set
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True


AWS_STORAGE_BUCKET_NAME = os.environ.get("AWS_STORAGE_BUCKET_NAME", "")
CLOUDFRONT_DOMAIN = os.environ.get("CLOUDFRONT_DOMAIN", "")
AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID", "")
AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY", "")

# HSTS
# SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
if not DEBUG:
    SECURE_HSTS_SECONDS = 31_536_000  # 1 year

# Logging

LOGGING_LEVEL = os.getenv("DJANGO_LOGGING_LEVEL", "INFO")
if TESTING:
    # We don't want to see log output when running tests
    LOGGING_LEVEL = "CRITICAL"


ENKETO = {
    "ENKETO_DEV": os.getenv("ENKETO_DEV"),
    "ENKETO_API_TOKEN": os.getenv("ENKETO_API_TOKEN"),
    "ENKETO_URL": os.getenv("ENKETO_URL"),
    "ENKETO_API_SURVEY_PATH": "/api_v2/survey",
    "ENKETO_API_INSTANCE_PATH": "/api_v2/instance",
}

TEST_RUNNER = "redgreenunittest.django.runner.RedGreenDiscoverRunner"

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {"default": {"format": "%(asctime)s %(name)s -- %(message)s"}},
    "filters": {"no_static": {"()": "hat.common.log_filter.StaticUrlFilter"}},
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default",
            # Don't pollute the log output with lots of static url request in development
            "filters": ["no_static"] if DEBUG else None,
        }
    },
    "loggers": {
        "django": {"handlers": ["console"], "level": LOGGING_LEVEL},
        "hat": {"handlers": ["console"], "level": LOGGING_LEVEL},
        "rq": {"handlers": ["console"], "level": LOGGING_LEVEL},
        # 'django.db.backends': {
        #     'level': 'DEBUG',
        #     'handlers': ['console', ],
        # },
    },
}

# AWS expects python logs to be stored in this folder
AWS_LOG_FOLDER = "/opt/python/log"
if os.path.isdir(AWS_LOG_FOLDER):
    if os.access(AWS_LOG_FOLDER, os.W_OK):
        print("Logging to django log")
        LOGGING["handlers"]["file"] = {
            "class": "logging.FileHandler",
            "level": "DEBUG",
            "filename": os.path.join(AWS_LOG_FOLDER, "django.log"),
        }
        for logger in LOGGING["loggers"].values():
            logger["handlers"].append("file")
        LOGGING["loggers"]["hat"]["level"] = "DEBUG"
    else:
        print(
            f"WARNING: we seem to be running on AWS but {AWS_LOG_FOLDER} is not writable, check ebextensions"
        )

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.messages",
    "django.contrib.sessions",
    "django.contrib.staticfiles",
    "django.contrib.gis",
    "django.contrib.postgres",
    # "django_rq",
    "storages",
    "corsheaders",
    "rest_framework",
    "webpack_loader",
    "django_ltree",
    "hat.sync",
    "hat.vector_control",
    "hat.audit",
    "hat.menupermissions",
    "iaso",
    "django_extensions",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "hat.users.middleware.ThreadLocalMiddleware",
]

ROOT_URLCONF = "hat.urls"


# Allow cors for all origins but only for the sync endpoint
CORS_ORIGIN_ALLOW_ALL = True
CORS_URLS_REGEX = r"^/sync/.*$"


TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": ["./hat/templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.template.context_processors.media",
                "django.contrib.messages.context_processors.messages",
                "hat.common.context_processors.appversions",
                "hat.common.context_processors.environment",
            ]
        },
    }
]

WSGI_APPLICATION = "hat.wsgi.application"


# Database

DB_NAME = os.environ.get("RDS_DB_NAME", "postgres")
DB_USERNAME = os.environ.get("RDS_USERNAME", "postgres")
DB_PASSWORD = os.environ.get("RDS_PASSWORD", None)
DB_HOST = os.environ.get("RDS_HOSTNAME", "db")
DB_PORT = os.environ.get("RDS_PORT", 5432)
SNS_NOTIFICATION_TOPIC = os.environ.get("SNS_NOTIFICATION_TOPIC", None)

DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "NAME": DB_NAME,
        "USER": DB_USERNAME,
        "PASSWORD": DB_PASSWORD,
        "HOST": DB_HOST,
        "PORT": DB_PORT,
    }
}


def is_superuser(u):
    return u.is_superuser


# Password validation

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# Internationalization

# switch webpack.dev and webpack.prod as well if changing here
LANGUAGE_CODE = "en"

LOCALE_PATHS = ["/opt/app/hat/locale/", "hat/locale/"]

TIME_ZONE = "UTC"

USE_I18N = True

USE_L10N = True

USE_TZ = True

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))

LOGIN_URL = "/login"
LOGIN_REDIRECT_URL = "/"

# Files

SHARED_DIR = "/opt/shared"

# Version Display

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.9/howto/static-files/
STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(PROJECT_ROOT, "assets/bundles")
STATICFILES_DIRS = [os.path.join(BASE_DIR, "hat/assets/webpack")]

# Javascript/CSS Files:
WEBPACK_LOADER = {
    "DEFAULT": {
        "BUNDLE_DIR_NAME": "/",  # used in prod
        "STATS_FILE": os.path.join(
            PROJECT_ROOT,
            "assets/webpack",
            "webpack-stats.json"
            if DEBUG and not os.environ.get("TEST_PROD", None)
            else "webpack-stats-prod.json",
        ),
    }
}


REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "iaso.api.auth.authentication.CsrfExemptSessionAuthentication",
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("hat.api.authentication.UserAccessPermission",),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.LimitOffsetPagination",
    "PAGE_SIZE": None,
    "DEFAULT_THROTTLE_RATES": {"anon": "200/day"},
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=3650),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=3651),
}

MEDIA_ROOT = os.path.join(BASE_DIR, "media")
if DEBUG:
    MEDIA_URL = "/media/"
    STATIC_URL = "/static/"
else:
    MEDIA_URL = "https://%s.s3.amazonaws.com/" % AWS_STORAGE_BUCKET_NAME
    STATIC_URL = "https://s3.eu-central-1.amazonaws.com/%s/" % AWS_STORAGE_BUCKET_NAME
AWS_S3_CUSTOM_DOMAIN = CLOUDFRONT_DOMAIN
PREPEND_WWW = not DEBUG and not STAGING
SECURE_SSL_REDIRECT = not DEBUG

#############


if not DEBUG:
    DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"
    STATICFILES_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"

AWS_S3_OBJECT_PARAMETERS = {"CacheControl": "max-age=86400"}

AWS_S3_FILE_OVERWRITE = False
S3_USE_SIGV4 = True
AWS_S3_SIGNATURE_VERSION = "s3v4"
AWS_S3_HOST = "s3.eu-central-1.amazonaws.com"
AWS_S3_REGION_NAME = "eu-central-1"

CACHES = {"default": {"BACKEND": "django.core.cache.backends.dummy.DummyCache"}}


AUTH_PROFILE_MODULE = "hat.users.Profile"