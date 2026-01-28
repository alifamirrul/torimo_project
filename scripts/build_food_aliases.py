import json  # JSON処理
import os  # OS関連
import re  # 正規表現
import sys  # システム関連
import unicodedata  # Unicode正規化
from pathlib import Path  # パス操作


ROOT = Path(__file__).resolve().parents[1]  # プロジェクトルート


def nkfc(s: str) -> str:  # NFKC正規化関数
    return unicodedata.normalize('NFKC', s or '')  # 文字を正規化


def strip_spaces(s: str) -> str:  # 空白除去関数
    return re.sub(r'[\s\u3000]+', '', s or '')  # 半角/全角空白を除去


def remove_paren_content(s: str) -> str:  # 括弧内除去関数
    if not s:  # 空文字チェック
        return s  # そのまま返す
    # （…） / (…) / ［…］ / […]  # 対象の括弧
    s = re.sub(r'（[^）]*）', '', s)  # 全角丸括弧を削除
    s = re.sub(r'\([^)]*\)', '', s)  # 半角丸括弧を削除
    s = re.sub(r'［[^］]*］', '', s)  # 全角角括弧を削除
    s = re.sub(r'\[[^\]]*\]', '', s)  # 半角角括弧を削除
    s = re.sub(r'＜[^＞]*＞', '', s)  # 全角山括弧を削除
    s = re.sub(r'<[^>]*>', '', s)  # 半角山括弧を削除
    return s  # 結果を返す


COMMON_REPLACEMENTS = {  # 共通の置換辞書
    # rice - multiple writing systems  # ご飯の表記ゆれ
    'ライス': 'ご飯',  # カタカナ→漢字
    'ごはん': 'ご飯',  # ひらがな→漢字
    'ゴハン': 'ご飯',  # カタカナ→漢字
    '白ごはん': 'ご飯',  # 語彙統一
    '白飯': 'ご飯',  # 語彙統一
    'はくはん': 'ご飯',  # 語彙統一
    'ハクハン': 'ご飯',  # 語彙統一
    '御飯': 'ご飯',  # 旧表記→統一
    'めし': 'ご飯',  # 俗称→統一
    'メシ': 'ご飯',  # 俗称→統一
    # miso soup  # みそ汁の表記ゆれ
    '味噌汁': 'みそ汁',  # 漢字→ひらがな
    'みそスープ': 'みそ汁',  # 表記統一
    '味噌スープ': 'みそ汁',  # 表記統一
    'ミソ汁': 'みそ汁',  # カタカナ→ひらがな
    'ミソシル': 'みそ汁',  # 表記統一
    'みそしる': 'みそ汁',  # 表記統一
    # chicken variations  # 鶏肉の表記ゆれ
    'チキンステーキ': '鶏肉ステーキ',  # 英語→日本語
    'とりにくステーキ': '鶏肉ステーキ',  # ひらがな→漢字
    # yakitori  # 焼き鳥の表記ゆれ
    '焼鳥': '焼き鳥',  # 表記統一
    'やきとり': '焼き鳥',  # ひらがな→漢字
    'ヤキトリ': '焼き鳥',  # カタカナ→漢字
    # poultry cuts (common shorthand)  # 鶏肉部位の表記ゆれ
    'ささみ': '鶏ささみ',  # 部位を補足
    'ササミ': '鶏ささみ',  # カタカナ→漢字
    '笹身': '鶏ささみ',  # 表記統一
    '胸肉': '鶏胸肉',  # 部位を補足
    'むね肉': '鶏胸肉',  # ひらがな→漢字
    'ムネ肉': '鶏胸肉',  # カタカナ→漢字
    'むねにく': '鶏胸肉',  # ひらがな→漢字
    'ムネニク': '鶏胸肉',  # カタカナ→漢字
    'もも肉': '鶏もも肉',  # 部位を補足
    'モモ肉': '鶏もも肉',  # カタカナ→漢字
    'ももにく': '鶏もも肉',  # ひらがな→漢字
    'モモニク': '鶏もも肉',  # カタカナ→漢字
    '腿肉': '鶏もも肉',  # 表記統一
    # teas  # お茶の表記ゆれ
    '日本茶': '緑茶',  # 表記統一
    'にほんちゃ': '緑茶',  # ひらがな→漢字
    'ニホンチャ': '緑茶',  # カタカナ→漢字
    'お茶': '茶',  # 短縮
    'おちゃ': '茶',  # 短縮
    'オチャ': '茶',  # 短縮
    '御茶': '茶',  # 短縮
    'グリーンティー': '緑茶',  # 英語→日本語
    '緑ちゃ': '緑茶',  # 表記統一
    '禄茶': '緑茶',  # 誤字修正
    'りょくちゃ': '緑茶',  # ひらがな→漢字
    'リョクチャ': '緑茶',  # カタカナ→漢字
}  # 辞書終端


def apply_common_replacements(s: str) -> str:  # 共通置換を適用
    out = s  # 作業用文字列
    for k, v in COMMON_REPLACEMENTS.items():  # 置換辞書を反復
        out = out.replace(k, v)  # 置換を実行
    return out  # 結果を返す


# Cooking method tokens and their loose synonyms  # 調理法トークン
COOK_METHOD_GROUPS = [  # 調理法の同義語グループ
    {'焼き', '焼', 'グリル', 'ロースト'},  # 焼く系
    {'揚げ', 'フライ', '唐揚げ'},  # 揚げる系
    {'炒め', 'ソテー'},  # 炒める系
    {'煮', '煮込み'},  # 煮る系
    {'蒸し'},  # 蒸す系
    {'茹で', 'ゆで', 'ボイル'},  # 茹でる系
]  # グループ終端
COOK_METHODS = sorted({t for g in COOK_METHOD_GROUPS for t in g}, key=len, reverse=True)  # 調理法を長い順に整列

# Ingredient synonyms (bi-directional expansion)  # 食材の同義語ペア
ING_SYNONYM_PAIRS = [  # 同義語ペア一覧
    # Fish & Seafood - Kanji/Hiragana/Katakana/English  # 魚介の同義語
    ('鮭', 'さけ'),  # 鮭の別表記
    ('鮭', 'サケ'),  # 鮭の別表記
    ('鮭', 'サーモン'),  # 鮭の別表記
    ('鮭', 'salmon'),  # 鮭の英語
    ('鯖', 'さば'),  # 鯖の別表記
    ('鯖', 'サバ'),  # 鯖の別表記
    ('鯖', 'mackerel'),  # 鯖の英語
    ('鰤', 'ぶり'),  # 鰤の別表記
    ('鰤', 'ブリ'),  # 鰤の別表記
    ('鰤', 'yellowtail'),  # 鰤の英語
    ('鮪', 'まぐろ'),  # 鮪の別表記
    ('鮪', 'マグロ'),  # 鮪の別表記
    ('鮪', 'tuna'),  # 鮪の英語
    ('鯵', 'あじ'),  # 鯵の別表記
    ('鯵', 'アジ'),  # 鯵の別表記
    ('鰯', 'いわし'),  # 鰯の別表記
    ('鰯', 'イワシ'),  # 鰯の別表記
    ('鰯', 'sardine'),  # 鰯の英語
    ('鰹', 'かつお'),  # 鰹の別表記
    ('鰹', 'カツオ'),  # 鰹の別表記
    ('鰹', 'bonito'),  # 鰹の英語
    ('鯛', 'たい'),  # 鯛の別表記
    ('鯛', 'タイ'),  # 鯛の別表記
    ('鰈', 'かれい'),  # 鰈の別表記
    ('鰈', 'カレイ'),  # 鰈の別表記
    ('鰈', 'flounder'),  # 鰈の英語
    ('秋刀魚', 'さんま'),  # 秋刀魚の別表記
    ('秋刀魚', 'サンマ'),  # 秋刀魚の別表記
    ('鰻', 'うなぎ'),  # 鰻の別表記
    ('鰻', 'ウナギ'),  # 鰻の別表記
    ('鰻', 'eel'),  # 鰻の英語
    ('鱈', 'たら'),  # 鱈の別表記
    ('鱈', 'タラ'),  # 鱈の別表記
    ('鱈', 'cod'),  # 鱈の英語
    ('海老', 'えび'),  # 海老の別表記
    ('海老', 'エビ'),  # 海老の別表記
    ('海老', 'shrimp'),  # 海老の英語
    ('烏賊', 'いか'),  # 烏賊の別表記
    ('烏賊', 'イカ'),  # 烏賊の別表記
    ('烏賊', 'squid'),  # 烏賊の英語
    ('蛸', 'たこ'),  # 蛸の別表記
    ('蛸', 'タコ'),  # 蛸の別表記
    ('蛸', 'octopus'),  # 蛸の英語
    ('帆立', 'ほたて'),  # 帆立の別表記
    ('帆立', 'ホタテ'),  # 帆立の別表記
    ('帆立', 'scallop'),  # 帆立の英語
    
    # Meat - Kanji/Hiragana/Katakana/English  # 肉類の同義語
    ('鶏', 'とり'),  # 鶏の別表記
    ('鶏', 'トリ'),  # 鶏の別表記
    ('鶏', 'チキン'),  # 鶏の別表記
    ('鶏', 'chicken'),  # 鶏の英語
    ('豚', 'ぶた'),  # 豚の別表記
    ('豚', 'ブタ'),  # 豚の別表記
    ('豚', 'ポーク'),  # 豚の別表記
    ('豚', 'pork'),  # 豚の英語
    ('牛', 'うし'),  # 牛の別表記
    ('牛', 'ウシ'),  # 牛の別表記
    ('牛', 'ビーフ'),  # 牛の別表記
    ('牛', 'beef'),  # 牛の英語
    ('羊', 'ひつじ'),  # 羊の別表記
    ('羊', 'ヒツジ'),  # 羊の別表記
    ('羊', 'ラム'),  # 羊の別表記
    ('羊', 'lamb'),  # 羊の英語
    ('胸肉', 'むね肉'),  # 胸肉の別表記
    ('胸肉', 'むねにく'),  # 胸肉の別表記
    ('胸肉', 'ムネニク'),  # 胸肉の別表記
    ('胸肉', 'breast'),  # 胸肉の英語
    ('腿肉', 'もも肉'),  # もも肉の別表記
    ('腿肉', 'ももにく'),  # もも肉の別表記
    ('腿肉', 'モモニク'),  # もも肉の別表記
    ('腿肉', 'thigh'),  # もも肉の英語
    ('挽肉', 'ひき肉'),  # 挽肉の別表記
    ('挽肉', 'ひきにく'),  # 挽肉の別表記
    ('挽肉', 'ヒキニク'),  # 挽肉の別表記
    ('挽肉', 'ground'),  # 挽肉の英語
    
    # Vegetables - Kanji/Hiragana/Katakana/English  # 野菜の同義語
    ('人参', 'にんじん'),  # 人参の別表記
    ('人参', 'ニンジン'),  # 人参の別表記
    ('人参', 'carrot'),  # 人参の英語
    ('胡瓜', 'きゅうり'),  # 胡瓜の別表記
    ('胡瓜', 'キュウリ'),  # 胡瓜の別表記
    ('胡瓜', 'cucumber'),  # 胡瓜の英語
    ('大根', 'だいこん'),  # 大根の別表記
    ('大根', 'ダイコン'),  # 大根の別表記
    ('大根', 'daikon'),  # 大根の英語
    ('南瓜', 'かぼちゃ'),  # 南瓜の別表記
    ('南瓜', 'カボチャ'),  # 南瓜の別表記
    ('南瓜', 'pumpkin'),  # 南瓜の英語
    ('茄子', 'なす'),  # 茄子の別表記
    ('茄子', 'ナス'),  # 茄子の別表記
    ('茄子', 'eggplant'),  # 茄子の英語
    ('法蓮草', 'ほうれん草'),  # 法蓮草の別表記
    ('法蓮草', 'ほうれんそう'),  # 法蓮草の別表記
    ('法蓮草', 'ホウレンソウ'),  # 法蓮草の別表記
    ('法蓮草', 'spinach'),  # 法蓮草の英語
    ('甘藍', 'キャベツ'),  # キャベツの別表記
    ('甘藍', 'きゃべつ'),  # キャベツの別表記
    ('甘藍', 'cabbage'),  # キャベツの英語
    ('玉葱', 'たまねぎ'),  # 玉葱の別表記
    ('玉葱', 'タマネギ'),  # 玉葱の別表記
    ('玉葱', 'onion'),  # 玉葱の英語
    ('蕃茄', 'トマト'),  # トマトの別表記
    ('蕃茄', 'とまと'),  # トマトの別表記
    ('蕃茄', 'tomato'),  # トマトの英語
    ('馬鈴薯', 'じゃがいも'),  # じゃがいもの別表記
    ('馬鈴薯', 'ジャガイモ'),  # じゃがいもの別表記
    ('馬鈴薯', 'potato'),  # じゃがいもの英語
    ('甘藷', 'さつまいも'),  # さつまいもの別表記
    ('甘藷', 'サツマイモ'),  # さつまいもの別表記
    ('薩摩芋', 'さつまいも'),  # さつまいもの別表記
    ('薩摩芋', 'サツマイモ'),  # さつまいもの別表記
    ('葱', 'ねぎ'),  # 葱の別表記
    ('葱', 'ネギ'),  # 葱の別表記
    ('葱', 'onion'),  # 葱の英語
    ('葱', 'scallion'),  # 葱の英語
    ('蓮根', 'れんこん'),  # 蓮根の別表記
    ('蓮根', 'レンコン'),  # 蓮根の別表記
    ('蓮根', 'lotus'),  # 蓮根の英語
    ('牛蒡', 'ごぼう'),  # 牛蒡の別表記
    ('牛蒡', 'ゴボウ'),  # 牛蒡の別表記
    ('牛蒡', 'burdock'),  # 牛蒡の英語
    ('椎茸', 'しいたけ'),  # 椎茸の別表記
    ('椎茸', 'シイタケ'),  # 椎茸の別表記
    ('椎茸', 'shiitake'),  # 椎茸の英語
    ('榎茸', 'えのき'),  # 榎茸の別表記
    ('榎茸', 'エノキ'),  # 榎茸の別表記
    ('榎茸', 'enoki'),  # 榎茸の英語
    ('占地', 'しめじ'),  # 占地の別表記
    ('占地', 'シメジ'),  # 占地の別表記
    ('占地', 'shimeji'),  # 占地の英語
    ('小松菜', 'こまつな'),  # 小松菜の別表記
    ('小松菜', 'コマツナ'),  # 小松菜の別表記
    ('小松菜', 'komatsuna'),  # 小松菜の英語
    ('白菜', 'はくさい'),  # 白菜の別表記
    ('白菜', 'ハクサイ'),  # 白菜の別表記
    ('白菜', 'napa'),  # 白菜の英語
    ('水菜', 'みずな'),  # 水菜の別表記
    ('水菜', 'ミズナ'),  # 水菜の別表記
    ('水菜', 'mizuna'),  # 水菜の英語
    ('春菊', 'しゅんぎく'),  # 春菊の別表記
    ('春菊', 'シュンギク'),  # 春菊の別表記
    ('春菊', 'shungiku'),  # 春菊の英語
    ('豆苗', 'とうみょう'),  # 豆苗の別表記
    ('豆苗', 'トウミョウ'),  # 豆苗の別表記
    ('枝豆', 'えだまめ'),  # 枝豆の別表記
    ('枝豆', 'エダマメ'),  # 枝豆の別表記
    ('枝豆', 'edamame'),  # 枝豆の英語
    ('蒜', 'にんにく'),  # にんにくの別表記
    ('蒜', 'ニンニク'),  # にんにくの別表記
    ('蒜', 'garlic'),  # にんにくの英語
    ('獅子唐', 'ししとう'),  # ししとうの別表記
    ('獅子唐', 'シシトウ'),  # ししとうの別表記
    ('獅子唐', 'shishito'),  # ししとうの英語
    ('花椰菜', 'カリフラワー'),  # カリフラワーの別表記
    ('花椰菜', 'かりふらわー'),  # カリフラワーの別表記
    ('花椰菜', 'cauliflower'),  # カリフラワーの英語
    ('芹', 'セロリ'),  # セロリの別表記
    ('芹', 'せろり'),  # セロリの別表記
    ('芹', 'celery'),  # セロリの英語
    ('石刁柏', 'アスパラガス'),  # アスパラの別表記
    ('石刁柏', 'あすぱらがす'),  # アスパラの別表記
    ('石刁柏', 'asparagus'),  # アスパラの英語
    ('秋葵', 'オクラ'),  # オクラの別表記
    ('秋葵', 'おくら'),  # オクラの別表記
    ('秋葵', 'okra'),  # オクラの英語
    ('筍', 'たけのこ'),  # たけのこの別表記
    ('筍', 'タケノコ'),  # たけのこの別表記
    ('筍', 'bamboo'),  # たけのこの英語
    ('茗荷', 'みょうが'),  # みょうがの別表記
    ('茗荷', 'ミョウガ'),  # みょうがの別表記
    ('茗荷', 'myoga'),  # みょうがの英語
    ('韮', 'にら'),  # にらの別表記
    ('韮', 'ニラ'),  # にらの別表記
    ('韮', 'garlic chive'),  # にらの英語
    ('西蘭花', 'ブロッコリー'),  # ブロッコリーの別表記
    ('西蘭花', 'ぶろっこりー'),  # ブロッコリーの別表記
    ('西蘭花', 'broccoli'),  # ブロッコリーの英語
    ('青椒', 'ピーマン'),  # ピーマンの別表記
    ('青椒', 'ぴーまん'),  # ピーマンの別表記
    ('青椒', 'pepper'),  # ピーマンの英語
    ('紫蘇', 'しそ'),  # しその別表記
    ('紫蘇', 'シソ'),  # しその別表記
    ('紫蘇', 'shiso'),  # しその英語
    ('莴苣', 'レタス'),  # レタスの別表記
    ('莴苣', 'れたす'),  # レタスの別表記
    ('莴苣', 'lettuce'),  # レタスの英語
    
    # Common terms  # 共通用語の同義語
    ('卵', 'たまご'),  # 卵の別表記
    ('卵', 'タマゴ'),  # 卵の別表記
    ('卵', '玉子'),  # 卵の別表記
    ('卵', 'egg'),  # 卵の英語
    ('野菜', 'やさい'),  # 野菜の別表記
    ('野菜', 'ヤサイ'),  # 野菜の別表記
    ('野菜', 'vegetable'),  # 野菜の英語
    ('魚', 'さかな'),  # 魚の別表記
    ('魚', 'サカナ'),  # 魚の別表記
    ('魚', 'fish'),  # 魚の英語
    ('魚介', 'ぎょかい'),  # 魚介の別表記
    ('魚介', 'ギョカイ'),  # 魚介の別表記
    ('魚介', 'seafood'),  # 魚介の英語
    ('刺身', 'さしみ'),  # 刺身の別表記
    ('刺身', 'サシミ'),  # 刺身の別表記
    ('刺身', 'sashimi'),  # 刺身の英語
    ('寿司', 'すし'),  # 寿司の別表記
    ('寿司', 'スシ'),  # 寿司の別表記
    ('寿司', '鮨'),  # 寿司の別表記
    ('寿司', '鮓'),  # 寿司の別表記
    ('寿司', 'sushi'),  # 寿司の英語
    ('肉', 'にく'),  # 肉の別表記
    ('肉', 'ニク'),  # 肉の別表記
    ('肉', 'meat'),  # 肉の英語
    ('飯', 'めし'),  # 飯の別表記
    ('飯', 'メシ'),  # 飯の別表記
    ('飯', 'ご飯'),  # 飯の別表記
    ('飯', 'ごはん'),  # 飯の別表記
    ('飯', 'rice'),  # 飯の英語
]  # 同義語ペア終端
ING_SYNONYMS = {}  # 同義語辞書
for a, b in ING_SYNONYM_PAIRS:  # 同義語ペアを反復
    ING_SYNONYMS.setdefault(a, set()).add(b)  # 相互登録
    ING_SYNONYMS.setdefault(b, set()).add(a)  # 相互登録


def expand_synonyms(s: str) -> set[str]:  # 同義語を展開
    out = {s}  # 初期集合
    for key, syns in ING_SYNONYMS.items():  # 同義語辞書を走査
        if key in s:  # 含まれる場合
            for syn in syns:  # 同義語を適用
                out.add(s.replace(key, syn))  # 置換結果を追加
    # Also expand cooking method synonyms within same group  # 調理法も展開
    for group in COOK_METHOD_GROUPS:  # グループごとに確認
        present = [t for t in group if t in s]  # 含まれるトークン
        if present:  # 含まれる場合
            # replace first present token by other tokens in group  # 置換を展開
            t0 = present[0]  # 代表トークン
            for alt in group:  # 他のトークンへ置換
                if alt != t0:  # 同一以外
                    out.add(s.replace(t0, alt))  # 置換結果を追加
    return out  # 結果を返す


def expand_order_permutations(s: str) -> set[str]:  # 語順入替を生成
    """調理法トークンが含まれる場合、語順入替の別名を生成する。  # 説明
    例: 焼き鮭 -> 鮭焼き / 鮭の焼き / 焼鮭 / 焼きサーモン（同義語でさらに展開）  # 例
    """  # ドックストリング終端
    out = {s}  # 初期集合
    base = s  # 基本文字列
    for m in COOK_METHODS:  # 調理法トークンを走査
        if m in base:  # トークンが含まれる場合
            rest = base.replace(m, '')  # トークンを除去
            rest = re.sub(r'[\s\u3000]+', '', rest)  # 空白を除去
            rest = rest.replace('の', '')  # 「の」を除去
            if rest:  # 残りがあれば
                out.update({  # 置換候補を追加
                    f"{rest}{m}",  # 前後入替
                    f"{rest}の{m}",  # 「の」を挿入
                    f"{m}{rest}",  # 元の順序
                    f"{m}の{rest}",  # 「の」を挿入
                })  # 追加終端
    return out  # 結果を返す


def variants_for_name(name: str) -> set[str]:  # 料理名のバリエーション生成
    vars: set[str] = set()  # 変種集合
    if not name:  # 空文字チェック
        return vars  # 空集合を返す
    base = name.strip()  # 前後空白を除去
    base = apply_common_replacements(base)  # 共通置換を適用

    # NFKC width normalization  # 正規化
    w = nkfc(base)  # 文字幅を正規化
    # Remove extra spaces (ASCII and full-width)  # 空白除去
    w_ns = strip_spaces(w)  # 空白を削除
    # Remove bullets/center dots  # 中点除去
    w_ns = w_ns.replace('・', '')  # 中点を削除

    # No parentheses variant  # 括弧除去
    no_paren = remove_paren_content(w)  # 括弧内を削除
    no_paren_ns = strip_spaces(no_paren).replace('・', '')  # 空白と中点を削除

    # Soft hyphen/dash normalizations  # ハイフン統一
    w_ns = w_ns.replace('‐', '-').replace('‑', '-').replace('—', '-').replace('－', '-')  # ハイフン統一
    no_paren_ns = no_paren_ns.replace('‐', '-').replace('‑', '-').replace('—', '-').replace('－', '-')  # ハイフン統一

    # Lowercase ascii portion for safety  # 英字小文字化
    # Split tokens on whitespace-like delimiters and recombine key fragments  # トークン分割
    tokens = [t for t in re.split(r'[\s・/|]+', nkfc(no_paren)) if t]  # トークン抽出

    seed = {w, w_ns, no_paren, no_paren_ns, w.lower(), w_ns.lower(), no_paren_ns.lower()}  # 初期候補
    if tokens:  # トークンがある場合
        # add last token and incremental joins to capture core food names  # 主要語を追加
        seed.update(tokens)  # トークンを追加
        seed.add(''.join(tokens))  # 結合語を追加
        if len(tokens) >= 2:  # 2語以上の場合
            seed.add(''.join(tokens[-2:]))  # 末尾2語の結合
        seed.add(tokens[-1])  # 末尾トークン

    # Expand with synonyms and cooking permutations  # 同義語と順序を展開
    expanded: set[str] = set()  # 展開集合
    for s0 in seed:  # 初期候補を走査
        if not s0:  # 空文字はスキップ
            continue  # 次へ
        # First order permutations (焼き鮭 <-> 鮭焼き)  # 語順入替
        perm = expand_order_permutations(s0)  # 語順候補を生成
        for s1 in perm:  # 候補を走査
            expanded.add(s1)  # 候補を追加
            # Then apply synonym swaps on each  # 同義語置換
            for s2 in expand_synonyms(s1):  # 同義語を展開
                expanded.add(s2)  # 展開結果を追加

    # Normalize spacing/dots again and add  # 再正規化
    final_set = set()  # 最終集合
    for v in (seed | expanded):  # 候補を結合して走査
        if not v:  # 空文字を除外
            continue  # 次へ
        vv = nkfc(v)  # NFKC正規化
        vv = strip_spaces(vv).replace('・', '')  # 空白と中点を除去
        final_set.add(vv)  # 正規化文字列を追加
        if re.fullmatch(r'[A-Za-z\s]+', vv):  # 英字のみ判定
            final_set.add(vv.lower())  # 小文字版を追加
            final_set.add(vv.title())  # タイトルケースを追加

    vars.update(final_set)  # 変種集合に反映

    return {v for v in vars if v}  # 空文字除外して返す


def main():  # メイン処理
    # Ensure project root in sys.path  # ルートを検索パスへ追加
    sys.path.insert(0, str(ROOT))  # ルートパスを先頭に追加
    # Prepare Django settings for importing app code  # Django設定
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'torimo.settings')  # 設定を指定
    try:  # 例外処理開始
        import django  # type: ignore  # Djangoを読み込み
        django.setup()  # Django初期化
    except Exception as e:  # 初期化失敗
        print('Failed to setup Django:', e, file=sys.stderr)  # エラー出力
        sys.exit(1)  # 異常終了
    try:  # 例外処理開始
        from torimoApp.api_views import load_csv_dataset  # データ読み込み関数
    except Exception as e:  # 失敗時
        print('Failed to import load_csv_dataset:', e, file=sys.stderr)  # エラー出力
        sys.exit(1)  # 異常終了

    rows = load_csv_dataset()  # CSVデータを取得
    names = [r['name'] for r in rows]  # 名前一覧を作成
    alias_map = {}  # 別名→正規名
    reverse = {}  # 正規名→別名一覧

    for nm in names:  # 料理名を走査
        canon = nm  # 正規名を設定
        vset = variants_for_name(nm)  # 変種集合を生成
        reverse[canon] = sorted(vset)  # 逆引きを保存
        for v in vset:  # 別名を走査
            # first writer wins to avoid flip-flops  # 最初の登録を優先
            alias_map.setdefault(v, canon)  # まだ無ければ登録

    out_dir = ROOT / 'data'  # 出力ディレクトリ
    out_dir.mkdir(parents=True, exist_ok=True)  # ディレクトリ作成
    (out_dir / 'food_aliases.json').write_text(  # 出力ファイルを書き込み
        json.dumps({'alias_to_canonical': alias_map, 'canonical_to_variants': reverse}, ensure_ascii=False, indent=2),  # JSON生成
        encoding='utf-8'  # 文字コード
    )  # 書き込み終了

    print(f'Wrote {len(alias_map)} aliases for {len(reverse)} foods -> {out_dir / "food_aliases.json"}')  # 完了ログ


if __name__ == '__main__':  # 直接実行時
    main()  # メイン実行
