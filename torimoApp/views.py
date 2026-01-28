from django.http import HttpResponse, HttpResponseRedirect
from django.conf import settings
from pathlib import Path


def index(request):
        """Serve the React app if built, otherwise redirect to Vite dev server (when DEBUG).

        Fallback: simple landing page with links.
        """
        # 1) If a production build exists at frontend/dist, serve that index.html directly
        try:
                root = Path(settings.BASE_DIR)
                dist_index = root / 'frontend' / 'dist' / 'index.html'
                if dist_index.exists():
                        html = dist_index.read_text(encoding='utf-8')
                        return HttpResponse(html, content_type='text/html; charset=utf-8')
        except Exception:
                pass

        # 2) If in DEBUG, redirect to Vite dev server if user hits backend root by mistake
        if getattr(settings, 'DEBUG', False):
            dev_url = getattr(settings, 'FRONTEND_DEV_SERVER_URL', 'http://localhost:5173/')
            dev_url = (dev_url.rstrip('/') or 'http://localhost:5173') + '/'
            return HttpResponseRedirect(dev_url)

        # 3) Minimal fallback page – now static because application data lives in Supabase
        html = f"""
        <!DOCTYPE html>
        <html lang=\"ja\">
        <head>
            <meta charset=\"utf-8\" />
            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
            <title>Torimo</title>
            <style>body{{font-family:system-ui,-apple-system,Segoe UI,Roboto;line-height:1.5;padding:24px}} .muted{{color:#6b7280}}</style>
        </head>
        <body>
            <h1>Torimo Backend</h1>
            <p class=\"muted\">React フロントエンドが未ビルドです。開発中は Vite 開発サーバーを起動して <a href=\"http://localhost:5173/\">http://localhost:5173/</a> を開いてください。<br/>本番用は frontend/dist をビルド後、/ に配信されます。</p>
            <p>Torimo の全データは Supabase に保存されます。Django は API プロキシと AI 補助のみを担当します。</p>
            <p><a href=\"/api/\">API ルートへ</a></p>
        </body>
        </html>
        """
        return HttpResponse(html, content_type='text/html; charset=utf-8')


def exercises_list(request):
    return HttpResponse('Exercises are now managed exclusively in Supabase.', content_type='text/plain')


def meals_list(request):
    return HttpResponse('Meals are now managed exclusively in Supabase.', content_type='text/plain')


def logs_list(request):
    return HttpResponse('Daily logs are now managed exclusively in Supabase.', content_type='text/plain')


def log_detail(request, pk):
    return HttpResponse('Daily log details live in Supabase.', content_type='text/plain')
