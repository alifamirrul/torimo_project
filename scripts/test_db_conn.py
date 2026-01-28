import os  # OS関連機能
from dotenv import load_dotenv  # 環境変数読み込み
import psycopg  # PostgreSQLクライアント

load_dotenv()  # .envを読み込む
os.environ.setdefault('LC_MESSAGES', 'C')  # メッセージ言語を固定
os.environ.setdefault('LC_ALL', 'C')  # ロケールを固定
os.environ.setdefault('LANG', 'C')  # 言語設定を固定
url = os.getenv('SUPABASE_DB_URL')  # 接続URL取得
print('URL repr:', repr(url))  # URL確認

try:  # 例外処理開始
  with psycopg.connect(url) as conn:  # DBへ接続
    with conn.cursor() as cur:  # カーソル生成
      print('Connected!')  # 接続成功ログ
      cur.execute('SELECT NOW()')  # 現在時刻を取得
      print('NOW():', cur.fetchone())  # 結果を表示
except Exception as exc:  # エラー時
  import traceback  # トレースバック取得
  traceback.print_exc()  # 例外を表示
