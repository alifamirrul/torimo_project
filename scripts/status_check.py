import os, sys, pathlib  # 標準ライブラリを読み込み
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # ルートパスを検索パスへ追加
os.environ.setdefault('DJANGO_SETTINGS_MODULE','torimo.settings')  # Django設定を指定
import django  # Django本体を読み込み
django.setup()  # Djangoを初期化
from django.test import Client  # テスト用HTTPクライアント
c=Client()  # クライアント生成
print(c.get('/api/assistant/status/').json())  # ステータスJSONを出力
