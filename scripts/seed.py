import os, sys  # 標準ライブラリを読み込み
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # プロジェクトルートを取得
sys.path.insert(0, BASE_DIR)  # ルートを検索パスに追加
os.environ.setdefault('DJANGO_SETTINGS_MODULE','torimo.settings')  # Django設定を指定
import django  # Django本体を読み込み
django.setup()  # Djangoを初期化
print('Supabase now stores all meals/exercises/logs. Seed data via Supabase SQL or the dashboard.')  # 注意メッセージを出力
