from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables from project root .env (local development)
try:
    _ENV_PATH = Path(__file__).resolve().parent.parent / '.env'
    # Use override=True to ensure values from .env are loaded in dev even if process has stale vars
    _ok = load_dotenv(dotenv_path=str(_ENV_PATH), override=True)
    if not _ok:
        raise RuntimeError('dotenv not loaded')
except Exception:
    # Fallback manual loader (very simple parser: KEY=VALUE, ignores comments)
    try:
        p = Path(__file__).resolve().parent.parent / '.env'
        if p.exists():
            for line in p.read_text(encoding='utf-8', errors='ignore').splitlines():
                s = line.strip()
                if not s or s.startswith('#'):
                    continue
                if '=' in s:
                    k, v = s.split('=', 1)
                    k = k.strip()
                    v = v.strip().strip('"').strip("'")
                    os.environ.setdefault(k, v)
    except Exception:
        pass

BASE_DIR = Path(__file__).resolve().parent.parent

# Override via environment variable in .env: DJANGO_SECRET_KEY=...
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-reset-secret-key')
DEBUG = True
# Development: allow LAN access (restrict in production)
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'torimoApp',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'torimo.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'torimoApp' / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'torimo.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

STATIC_URL = 'static/'
STATICFILES_DIRS = [BASE_DIR / 'torimoApp' / 'static']
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Development CORS setting for React dev server. Restrict in production.
CORS_ALLOW_ALL_ORIGINS = True

# Django REST Framework default settings (basic)
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ]
}

# Allow larger JSON uploads for base64 images (increase from default ~2.5MB)
# Safe for development; consider tuning in production or using multipart uploads.
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10 MB
