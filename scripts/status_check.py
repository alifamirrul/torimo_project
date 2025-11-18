import os, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
os.environ.setdefault('DJANGO_SETTINGS_MODULE','torimo.settings')
import django
django.setup()
from django.test import Client
c=Client()
print(c.get('/api/assistant/status/').json())
