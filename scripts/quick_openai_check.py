import os, json, sys, pathlib
# Ensure project root on sys.path
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
os.environ.setdefault('DJANGO_SETTINGS_MODULE','torimo.settings')
import django
django.setup()
from django.test import Client
c=Client()
resp=c.get('/api/assistant/status/')
print('STATUS', resp.status_code, resp.json())
payload={
  'messages':[{'role':'user','content':'こんにちは、今日のタンパク質目標は？'}],
  'profile':{'age':30,'gender':'男性','height_cm':175,'weight_kg':70,'goal_calories':2200}
}
resp=c.post('/api/assistant/chat/', data=json.dumps(payload), content_type='application/json')
print('CHAT', resp.status_code)
try:
    print(resp.json())
except Exception:
    print('RESP TEXT', resp.content[:500])
