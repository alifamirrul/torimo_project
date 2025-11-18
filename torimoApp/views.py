from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse, HttpResponseRedirect
from django.conf import settings
from pathlib import Path
from .models import Exercise, Meal, DailyLog


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
                # Default Vite port
                return HttpResponseRedirect('http://localhost:5173/')

        # 3) Minimal fallback page
        exercises_count = Exercise.objects.count()
        meals_count = Meal.objects.count()
        logs = DailyLog.objects.order_by('-date')[:5]
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
            <ul>
                <li>Exercises: {exercises_count}</li>
                <li>Meals: {meals_count}</li>
                <li>最近のログ: {len(list(logs))} 件</li>
            </ul>
            <p><a href=\"/api/\">API ルートへ</a></p>
        </body>
        </html>
        """
        return HttpResponse(html, content_type='text/html; charset=utf-8')


def exercises_list(request):
    exercises = Exercise.objects.all()
    return render(request, 'exercises.html', {'exercises': exercises})


def meals_list(request):
    meals = Meal.objects.all()
    return render(request, 'meals.html', {'meals': meals})


def logs_list(request):
    logs = DailyLog.objects.all()
    return render(request, 'logs.html', {'logs': logs})


def log_detail(request, pk):
    log = get_object_or_404(DailyLog, pk=pk)
    return render(request, 'log_detail.html', {'log': log})
