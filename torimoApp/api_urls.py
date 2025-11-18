from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .api_views import (
    ExerciseViewSet, MealViewSet, DailyLogViewSet,
    analyze_nutrition, analyze_nutrition_image,
    suggest_nutrition, assistant_chat, assistant_status, search_foods
)

# Accept both with and without trailing slash to avoid 404s depending on client config
router = DefaultRouter(trailing_slash='/?')
router.register(r'exercises', ExerciseViewSet)
router.register(r'meals', MealViewSet)
router.register(r'logs', DailyLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('nutrition/analyze/', analyze_nutrition, name='nutrition-analyze'),
    path('nutrition/vision-analyze/', analyze_nutrition_image, name='nutrition-vision-analyze'),
    path('nutrition/suggest/', suggest_nutrition, name='nutrition-suggest'),
    path('nutrition/search/', search_foods, name='nutrition-search'),
    path('assistant/chat/', assistant_chat, name='assistant-chat'),
    path('assistant/status/', assistant_status, name='assistant-status'),
    # Provide a slashless variant to avoid 404 when client forgets trailing slash
    path('assistant/status', assistant_status, name='assistant-status-no-slash'),
]
