"""
URL configuration for torimo project.

The urlpatterns list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views: Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve as static_serve

urlpatterns = [
    path('admin/', admin.site.urls),
    # REST API endpoints (DRF router + custom views)
    path('api/', include('torimoApp.api_urls')),
    # Legacy Django pages + React index fallback
    path('', include('torimoApp.urls')),
    # Serve built frontend assets when Vite build exists
    re_path(r'^assets/(?P<path>.*)$', static_serve, {
        'document_root': settings.BASE_DIR / 'frontend' / 'dist' / 'assets'
    }),
    re_path(r'^icons/(?P<path>.*)$', static_serve, {
        'document_root': settings.BASE_DIR / 'frontend' / 'dist' / 'icons'
    }),
    re_path(r'^(?P<path>(manifest\.webmanifest|vite\.svg|favicon\.ico|registerSW\.js|sw\.js|workbox-[\w.-]+\.js))$', static_serve, {
        'document_root': settings.BASE_DIR / 'frontend' / 'dist'
    }),
]
