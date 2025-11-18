import os, sys
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE','torimo.settings')
import django
django.setup()
from torimoApp.models import Exercise, Meal, DailyLog
from datetime import date

if Exercise.objects.count()==0:
    Exercise.objects.create(name='Running', duration_minutes=30, calories_burned=300)
    Exercise.objects.create(name='Cycling', duration_minutes=45, calories_burned=400)
if Meal.objects.count()==0:
    Meal.objects.create(name='Oatmeal', calories=350, category='breakfast')
    Meal.objects.create(name='Chicken Salad', calories=450, category='lunch')
if DailyLog.objects.count()==0:
    e = Exercise.objects.first()
    m = Meal.objects.first()
    log = DailyLog.objects.create(date=date.today(), notes='Sample log')
    log.exercises.add(e)
    log.meals.add(m)

print('Sample data ensured')
