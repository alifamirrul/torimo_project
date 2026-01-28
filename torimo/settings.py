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

def _env_bool(name: str, default: bool = False) -> bool:
    v = os.environ.get(name)
    if v is None:
        return default
    return str(v).strip().lower() in {'1', 'true', 'yes', 'y', 'on'}


# Keep local dev convenient, but don't hard-code insecure production defaults.
DEBUG = _env_bool('DEBUG', True)

# Comma-separated hosts, e.g. "example.com,api.example.com".
# Defaults to local-only hosts.
_hosts = os.environ.get('DJANGO_ALLOWED_HOSTS') or os.environ.get('ALLOWED_HOSTS')
if _hosts:
    ALLOWED_HOSTS = [h.strip() for h in _hosts.split(',') if h.strip()]
elif DEBUG:
    # In debug mode allow any host so phones/tablets on the LAN can hit the dev server
    ALLOWED_HOSTS = ['*']
else:
    ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '[::1]']

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
    'torimo.middleware.supabase_auth.SupabaseAuthMiddleware',
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

# URL for the Vite dev server when running the frontend separately.
FRONTEND_DEV_SERVER_URL = os.environ.get('FRONTEND_DEV_SERVER_URL', 'http://localhost:5173/')

# Development CORS setting for React dev server. Restrict in production.
# Allow-all must be explicitly opted in, but default to permissive when DEBUG to make LAN testing easy.
CORS_ALLOW_ALL_ORIGINS = _env_bool('CORS_ALLOW_ALL_ORIGINS', False)

# Default to Vite dev server origins (allow multiple ports like 5173/5174).
_cors = os.environ.get('CORS_ALLOWED_ORIGINS', '')
_cors_list = [o.strip() for o in _cors.split(',') if o.strip()]
_default_cors = [
    f'http://localhost:{port}' for port in (5173, 5174, 4173, 4174)
] + [
    f'http://127.0.0.1:{port}' for port in (5173, 5174, 4173, 4174)
]
CORS_ALLOWED_ORIGINS = list(dict.fromkeys(_default_cors + _cors_list))

if DEBUG and not _cors_list and not CORS_ALLOW_ALL_ORIGINS:
    # When developing locally, default to allowing every origin so devices on the
    # same Wi-Fi can hit the API without additional settings.
    CORS_ALLOW_ALL_ORIGINS = True

# Allow any localhost/127.0.0.1 port via regex so hot-reload ports keep working in dev.
CORS_ALLOWED_ORIGIN_REGEXES = [
    r'^https?://localhost(?::\d+)?$',
    r'^https?://127\.0\.0\.1(?::\d+)?$',
]

# Django REST Framework default settings (basic)
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ]
}

# Allow larger JSON uploads for base64 images (increase from default ~2.5MB)
# Safe for development; consider tuning in production or using multipart uploads.
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10 MB

# Email (Support contact)
EMAIL_HOST = os.environ.get('EMAIL_HOST', '')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '587'))
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
EMAIL_USE_TLS = _env_bool('EMAIL_USE_TLS', True)
EMAIL_USE_SSL = _env_bool('EMAIL_USE_SSL', False)
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER or 'no-reply@torimo-app.com')
SUPPORT_INBOX_EMAIL = os.environ.get('SUPPORT_INBOX_EMAIL', '')

if EMAIL_HOST:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
else:
    # Fallback for local dev: emails are printed to console
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
