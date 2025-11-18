from django.contrib import admin
from .models import Exercise, Meal, DailyLog


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
	list_display = ('name', 'duration_minutes', 'calories_burned')


@admin.register(Meal)
class MealAdmin(admin.ModelAdmin):
	list_display = ('name', 'calories', 'category')
	list_filter = ('category',)


@admin.register(DailyLog)
class DailyLogAdmin(admin.ModelAdmin):
	list_display = ('date', 'total_calories_in', 'total_calories_out')
	filter_horizontal = ('exercises', 'meals')
