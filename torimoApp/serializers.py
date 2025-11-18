from rest_framework import serializers
from .models import Exercise, Meal, DailyLog


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ['id', 'name', 'duration_minutes', 'calories_burned']


class MealSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meal
        fields = ['id', 'name', 'calories', 'category', 'protein', 'fat', 'carbs', 'consumed_at']


class DailyLogSerializer(serializers.ModelSerializer):
    exercises = ExerciseSerializer(many=True, read_only=True)
    meals = MealSerializer(many=True, read_only=True)

    class Meta:
        model = DailyLog
        fields = ['id', 'date', 'exercises', 'meals', 'notes']
