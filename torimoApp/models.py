from django.db import models
from django.utils import timezone


class Exercise(models.Model):
	name = models.CharField(max_length=100)
	duration_minutes = models.PositiveIntegerField(help_text='Duration in minutes')
	calories_burned = models.PositiveIntegerField(blank=True, null=True)

	def __str__(self):
		return f"{self.name} ({self.duration_minutes} min)"


class Meal(models.Model):
	CATEGORY_CHOICES = [
		('breakfast', 'Breakfast'),
		('lunch', 'Lunch'),
		('dinner', 'Dinner'),
		('snack', 'Snack'),
	]
	name = models.CharField(max_length=150)
	calories = models.PositiveIntegerField()
	category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='snack')
	protein = models.FloatField(default=0.0)
	fat = models.FloatField(default=0.0)
	carbs = models.FloatField(default=0.0)
	consumed_at = models.DateField(default=timezone.now)

	def __str__(self):
		return f"{self.name} ({self.calories} kcal)"


class DailyLog(models.Model):
	date = models.DateField()
	exercises = models.ManyToManyField(Exercise, blank=True)
	meals = models.ManyToManyField(Meal, blank=True)
	notes = models.TextField(blank=True)

	class Meta:
		ordering = ['-date']

	def total_calories_in(self):
		return sum(m.calories for m in self.meals.all())

	def total_calories_out(self):
		return sum(e.calories_burned or 0 for e in self.exercises.all())

	def __str__(self):
		return f"Log {self.date}"
