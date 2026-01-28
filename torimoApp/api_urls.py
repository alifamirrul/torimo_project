from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .api_views import (
    ExerciseViewSet, MealViewSet, DailyLogViewSet,
    analyze_nutrition, analyze_nutrition_image,
    suggest_nutrition, assistant_chat, assistant_status, search_foods,
    notes_collection, note_detail, user_profile_view, barcode_meal_create,
    contact_support,
)

# Accept both with and without trailing slash to avoid 404s depending on client config
router = DefaultRouter(trailing_slash='/?')
router.register(r'exercises', ExerciseViewSet, basename='exercises')
router.register(r'meals', MealViewSet, basename='meals')
router.register(r'logs', DailyLogViewSet, basename='logs')

urlpatterns = [
    # Register custom meal routes before the router so they are not shadowed by /meals/<pk>/
    path('meals/barcode/', barcode_meal_create, name='meals-barcode-create'),
    path('meals/barcode', barcode_meal_create, name='meals-barcode-create-no-slash'),
    path('', include(router.urls)),
    path('nutrition/analyze/', analyze_nutrition, name='nutrition-analyze'),
    path('nutrition/vision-analyze/', analyze_nutrition_image, name='nutrition-vision-analyze'),
    path('nutrition/suggest/', suggest_nutrition, name='nutrition-suggest'),
    path('nutrition/search/', search_foods, name='nutrition-search'),
    path('assistant/chat/', assistant_chat, name='assistant-chat'),
    path('assistant/status/', assistant_status, name='assistant-status'),
    # Provide a slashless variant to avoid 404 when client forgets trailing slash
    path('assistant/status', assistant_status, name='assistant-status-no-slash'),
    path('support/contact/', contact_support, name='support-contact'),
    path('support/contact', contact_support, name='support-contact-no-slash'),
    path('notes/', notes_collection, name='notes-collection'),
    path('notes/<str:note_id>/', note_detail, name='notes-detail'),
    path('user-profiles/', user_profile_view, name='userprofile-create'),
    path('meals/barcode/', barcode_meal_create, name='meals-barcode-create'),
]
