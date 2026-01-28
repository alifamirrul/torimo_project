from django.urls import path, include
from . import views
from .api_views import analyze_nutrition, suggest_nutrition, assistant_chat, assistant_status

urlpatterns = [
    path('', views.index, name='index'),
    # HTML pages
    path('exercises/', views.exercises_list, name='exercises_list'),
    path('meals/', views.meals_list, name='meals_list'),
    path('logs/', views.logs_list, name='logs_list'),
    path('logs/<int:pk>/', views.log_detail, name='log_detail'),
]

