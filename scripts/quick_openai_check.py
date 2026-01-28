import os, json, sys, pathlib  # 標準ライブラリを読み込み
# Ensure project root on sys.path  # プロジェクトルートを検索パスに追加
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))  # ルートパスを先頭に追加
os.environ.setdefault('DJANGO_SETTINGS_MODULE','torimo.settings')  # Django設定を指定
import django  # Django本体を読み込み
django.setup()  # Djangoを初期化
from django.test import Client  # テスト用HTTPクライアント
c=Client()  # クライアント生成
resp=c.get('/api/assistant/status/')  # ステータスAPIを呼び出し
print('STATUS', resp.status_code, resp.json())  # ステータス結果を出力
payload={  # リクエストペイロードを作成
  'messages':[{'role':'user','content':'こんにちは、今日のタンパク質目標は？'}],  # チャットメッセージ
  'profile':{'age':30,'gender':'男性','height_cm':175,'weight_kg':70,'goal_calories':2200}  # プロフィール情報
}  # ペイロード終端
resp=c.post('/api/assistant/chat/', data=json.dumps(payload), content_type='application/json')  # チャットAPI呼び出し
print('CHAT', resp.status_code)  # チャットAPI結果を出力
try:  # 例外処理開始
    print(resp.json())  # JSONレスポンスを出力
except Exception:  # 例外が発生した場合
    print('RESP TEXT', resp.content[:500])  # 生レスポンスを出力
