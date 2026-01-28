import os
import threading
import time
from functools import wraps

import requests
import jwt
from jwt import InvalidTokenError
from django.http import JsonResponse

SUPABASE_URL = (os.environ.get('SUPABASE_URL') or '').rstrip('/')
SUPABASE_SERVICE_ROLE_KEY = (
    os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    or os.environ.get('SUPABASE_SERVICE_KEY')
    or ''
)
SUPABASE_JWT_SECRET = os.environ.get('SUPABASE_JWT_SECRET')
SUPABASE_JWT_AUDIENCE = os.environ.get('SUPABASE_JWT_AUDIENCE', 'authenticated')
SUPABASE_JWT_VERIFY_AUD = (os.environ.get('SUPABASE_JWT_VERIFY_AUD', '1').strip().lower() in {'1', 'true', 'yes', 'on'})

USERINFO_ENDPOINT = f"{SUPABASE_URL}/auth/v1/user" if SUPABASE_URL else None
CACHE_SECONDS = int(os.environ.get('SUPABASE_AUTH_CACHE_SECONDS', 55))


class SupabaseTokenError(Exception):
    """Raised when the provided Supabase JWT cannot be verified."""


class SupabaseTokenValidator:
    def __init__(self):
        self._cache = {}
        self._lock = threading.Lock()

    def _decode_locally(self, token: str):
        if not SUPABASE_JWT_SECRET:
            return None
        kwargs = {'algorithms': ['HS256']}
        if SUPABASE_JWT_VERIFY_AUD and SUPABASE_JWT_AUDIENCE:
            kwargs['audience'] = SUPABASE_JWT_AUDIENCE
        else:
            kwargs.setdefault('options', {})['verify_aud'] = False
        try:
            return jwt.decode(token, SUPABASE_JWT_SECRET, **kwargs)
        except InvalidTokenError:
            return None

    def validate(self, token: str):
        if not token:
            raise SupabaseTokenError('Missing bearer token')
        if not USERINFO_ENDPOINT or not SUPABASE_SERVICE_ROLE_KEY:
            local_payload = self._decode_locally(token)
            if local_payload:
                return local_payload
            raise SupabaseTokenError('Supabase auth is not configured on the server')

        now = time.time()
        with self._lock:
            cached = self._cache.get(token)
            if cached and cached['exp'] > now:
                return cached['user']

        local_payload = self._decode_locally(token)
        if local_payload:
            with self._lock:
                self._cache[token] = {'user': local_payload, 'exp': now + CACHE_SECONDS}
            return local_payload

        response = requests.get(
            USERINFO_ENDPOINT,
            headers={
                'Authorization': f'Bearer {token}',
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
            },
            timeout=6,
        )
        if response.status_code != 200:
            detail = response.text or ''
            raise SupabaseTokenError(
                f'Supabase rejected the provided token (status={response.status_code}, detail={detail[:200]!r})'
            )

        user = response.json()
        with self._lock:
            self._cache[token] = {'user': user, 'exp': now + CACHE_SECONDS}
        return user


_validator = SupabaseTokenValidator()


def _extract_bearer_token(request):
    header = request.META.get('HTTP_AUTHORIZATION', '')
    if not header:
        return None
    parts = header.split(' ', 1)
    if len(parts) != 2:
        return None
    scheme, token = parts
    if scheme.lower() != 'bearer':
        return None
    return token.strip()
def ensure_supabase_user(request):
    """Attach supabase_user and supabase_user_id to the request if a valid JWT is provided."""
    if getattr(request, 'supabase_user_id', None):
        return request.supabase_user

    token = _extract_bearer_token(request)
    if not token:
        raise SupabaseTokenError('Authorization header missing or malformed')

    user = _validator.validate(token)
    request.supabase_token = token
    request.supabase_user = user
    request.supabase_user_id = user.get('id') or user.get('sub') or user.get('user_id')
    if not request.supabase_user_id:
        raise SupabaseTokenError('Supabase token did not include a user identifier')
    return user


class SupabaseAuthMiddleware:
    """Best-effort middleware: attaches Supabase user info when a JWT is provided."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            token = _extract_bearer_token(request)
            if token:
                request._supabase_auth_middleware_seen_token = True
                ensure_supabase_user(request)
        except SupabaseTokenError as exc:
            request.supabase_auth_error = str(exc)
        else:
            if not token:
                request._supabase_auth_middleware_seen_token = False
        return self.get_response(request)


def require_supabase_auth(view_func):
    """Decorator that enforces Supabase JWT authentication on Django views."""

    @wraps(view_func)
    def _wrapped(request, *args, **kwargs):
        try:
            ensure_supabase_user(request)
        except SupabaseTokenError as exc:
            return JsonResponse({'detail': str(exc)}, status=401)
        return view_func(request, *args, **kwargs)

    return _wrapped
