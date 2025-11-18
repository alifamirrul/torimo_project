import json
import os
import re
import sys
import unicodedata
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def nkfc(s: str) -> str:
    return unicodedata.normalize('NFKC', s or '')


def strip_spaces(s: str) -> str:
    return re.sub(r'[\s\u3000]+', '', s or '')


def remove_paren_content(s: str) -> str:
    if not s:
        return s
    # （…） / (…) / ［…］ / […]
    s = re.sub(r'（[^）]*）', '', s)
    s = re.sub(r'\([^)]*\)', '', s)
    s = re.sub(r'［[^］]*］', '', s)
    s = re.sub(r'\[[^\]]*\]', '', s)
    s = re.sub(r'＜[^＞]*＞', '', s)
    s = re.sub(r'<[^>]*>', '', s)
    return s


COMMON_REPLACEMENTS = {
    # rice - multiple writing systems
    'ライス': 'ご飯',
    'ごはん': 'ご飯',
    'ゴハン': 'ご飯',
    '白ごはん': 'ご飯',
    '白飯': 'ご飯',
    'はくはん': 'ご飯',
    'ハクハン': 'ご飯',
    '御飯': 'ご飯',
    'めし': 'ご飯',
    'メシ': 'ご飯',
    # miso soup
    '味噌汁': 'みそ汁',
    'みそスープ': 'みそ汁',
    '味噌スープ': 'みそ汁',
    'ミソ汁': 'みそ汁',
    'ミソシル': 'みそ汁',
    'みそしる': 'みそ汁',
    # chicken variations
    'チキンステーキ': '鶏肉ステーキ',
    'とりにくステーキ': '鶏肉ステーキ',
    # yakitori
    '焼鳥': '焼き鳥',
    'やきとり': '焼き鳥',
    'ヤキトリ': '焼き鳥',
    # poultry cuts (common shorthand)
    'ささみ': '鶏ささみ',
    'ササミ': '鶏ささみ',
    '笹身': '鶏ささみ',
    '胸肉': '鶏胸肉',
    'むね肉': '鶏胸肉',
    'ムネ肉': '鶏胸肉',
    'むねにく': '鶏胸肉',
    'ムネニク': '鶏胸肉',
    'もも肉': '鶏もも肉',
    'モモ肉': '鶏もも肉',
    'ももにく': '鶏もも肉',
    'モモニク': '鶏もも肉',
    '腿肉': '鶏もも肉',
    # teas
    '日本茶': '緑茶',
    'にほんちゃ': '緑茶',
    'ニホンチャ': '緑茶',
    'お茶': '茶',
    'おちゃ': '茶',
    'オチャ': '茶',
    '御茶': '茶',
    'グリーンティー': '緑茶',
    '緑ちゃ': '緑茶',
    '禄茶': '緑茶',
    'りょくちゃ': '緑茶',
    'リョクチャ': '緑茶',
}


def apply_common_replacements(s: str) -> str:
    out = s
    for k, v in COMMON_REPLACEMENTS.items():
        out = out.replace(k, v)
    return out


# Cooking method tokens and their loose synonyms
COOK_METHOD_GROUPS = [
    {'焼き', '焼', 'グリル', 'ロースト'},
    {'揚げ', 'フライ', '唐揚げ'},
    {'炒め', 'ソテー'},
    {'煮', '煮込み'},
    {'蒸し'},
    {'茹で', 'ゆで', 'ボイル'},
]
COOK_METHODS = sorted({t for g in COOK_METHOD_GROUPS for t in g}, key=len, reverse=True)

# Ingredient synonyms (bi-directional expansion)
ING_SYNONYM_PAIRS = [
    # Fish & Seafood - Kanji/Hiragana/Katakana/English
    ('鮭', 'さけ'),
    ('鮭', 'サケ'),
    ('鮭', 'サーモン'),
    ('鮭', 'salmon'),
    ('鯖', 'さば'),
    ('鯖', 'サバ'),
    ('鯖', 'mackerel'),
    ('鰤', 'ぶり'),
    ('鰤', 'ブリ'),
    ('鰤', 'yellowtail'),
    ('鮪', 'まぐろ'),
    ('鮪', 'マグロ'),
    ('鮪', 'tuna'),
    ('鯵', 'あじ'),
    ('鯵', 'アジ'),
    ('鰯', 'いわし'),
    ('鰯', 'イワシ'),
    ('鰯', 'sardine'),
    ('鰹', 'かつお'),
    ('鰹', 'カツオ'),
    ('鰹', 'bonito'),
    ('鯛', 'たい'),
    ('鯛', 'タイ'),
    ('鰈', 'かれい'),
    ('鰈', 'カレイ'),
    ('鰈', 'flounder'),
    ('秋刀魚', 'さんま'),
    ('秋刀魚', 'サンマ'),
    ('鰻', 'うなぎ'),
    ('鰻', 'ウナギ'),
    ('鰻', 'eel'),
    ('鱈', 'たら'),
    ('鱈', 'タラ'),
    ('鱈', 'cod'),
    ('海老', 'えび'),
    ('海老', 'エビ'),
    ('海老', 'shrimp'),
    ('烏賊', 'いか'),
    ('烏賊', 'イカ'),
    ('烏賊', 'squid'),
    ('蛸', 'たこ'),
    ('蛸', 'タコ'),
    ('蛸', 'octopus'),
    ('帆立', 'ほたて'),
    ('帆立', 'ホタテ'),
    ('帆立', 'scallop'),
    
    # Meat - Kanji/Hiragana/Katakana/English
    ('鶏', 'とり'),
    ('鶏', 'トリ'),
    ('鶏', 'チキン'),
    ('鶏', 'chicken'),
    ('豚', 'ぶた'),
    ('豚', 'ブタ'),
    ('豚', 'ポーク'),
    ('豚', 'pork'),
    ('牛', 'うし'),
    ('牛', 'ウシ'),
    ('牛', 'ビーフ'),
    ('牛', 'beef'),
    ('羊', 'ひつじ'),
    ('羊', 'ヒツジ'),
    ('羊', 'ラム'),
    ('羊', 'lamb'),
    ('胸肉', 'むね肉'),
    ('胸肉', 'むねにく'),
    ('胸肉', 'ムネニク'),
    ('胸肉', 'breast'),
    ('腿肉', 'もも肉'),
    ('腿肉', 'ももにく'),
    ('腿肉', 'モモニク'),
    ('腿肉', 'thigh'),
    ('挽肉', 'ひき肉'),
    ('挽肉', 'ひきにく'),
    ('挽肉', 'ヒキニク'),
    ('挽肉', 'ground'),
    
    # Vegetables - Kanji/Hiragana/Katakana/English
    ('人参', 'にんじん'),
    ('人参', 'ニンジン'),
    ('人参', 'carrot'),
    ('胡瓜', 'きゅうり'),
    ('胡瓜', 'キュウリ'),
    ('胡瓜', 'cucumber'),
    ('大根', 'だいこん'),
    ('大根', 'ダイコン'),
    ('大根', 'daikon'),
    ('南瓜', 'かぼちゃ'),
    ('南瓜', 'カボチャ'),
    ('南瓜', 'pumpkin'),
    ('茄子', 'なす'),
    ('茄子', 'ナス'),
    ('茄子', 'eggplant'),
    ('法蓮草', 'ほうれん草'),
    ('法蓮草', 'ほうれんそう'),
    ('法蓮草', 'ホウレンソウ'),
    ('法蓮草', 'spinach'),
    ('甘藍', 'キャベツ'),
    ('甘藍', 'きゃべつ'),
    ('甘藍', 'cabbage'),
    ('玉葱', 'たまねぎ'),
    ('玉葱', 'タマネギ'),
    ('玉葱', 'onion'),
    ('蕃茄', 'トマト'),
    ('蕃茄', 'とまと'),
    ('蕃茄', 'tomato'),
    ('馬鈴薯', 'じゃがいも'),
    ('馬鈴薯', 'ジャガイモ'),
    ('馬鈴薯', 'potato'),
    ('甘藷', 'さつまいも'),
    ('甘藷', 'サツマイモ'),
    ('薩摩芋', 'さつまいも'),
    ('薩摩芋', 'サツマイモ'),
    ('葱', 'ねぎ'),
    ('葱', 'ネギ'),
    ('葱', 'onion'),
    ('葱', 'scallion'),
    ('蓮根', 'れんこん'),
    ('蓮根', 'レンコン'),
    ('蓮根', 'lotus'),
    ('牛蒡', 'ごぼう'),
    ('牛蒡', 'ゴボウ'),
    ('牛蒡', 'burdock'),
    ('椎茸', 'しいたけ'),
    ('椎茸', 'シイタケ'),
    ('椎茸', 'shiitake'),
    ('榎茸', 'えのき'),
    ('榎茸', 'エノキ'),
    ('榎茸', 'enoki'),
    ('占地', 'しめじ'),
    ('占地', 'シメジ'),
    ('占地', 'shimeji'),
    ('小松菜', 'こまつな'),
    ('小松菜', 'コマツナ'),
    ('小松菜', 'komatsuna'),
    ('白菜', 'はくさい'),
    ('白菜', 'ハクサイ'),
    ('白菜', 'napa'),
    ('水菜', 'みずな'),
    ('水菜', 'ミズナ'),
    ('水菜', 'mizuna'),
    ('春菊', 'しゅんぎく'),
    ('春菊', 'シュンギク'),
    ('春菊', 'shungiku'),
    ('豆苗', 'とうみょう'),
    ('豆苗', 'トウミョウ'),
    ('枝豆', 'えだまめ'),
    ('枝豆', 'エダマメ'),
    ('枝豆', 'edamame'),
    ('蒜', 'にんにく'),
    ('蒜', 'ニンニク'),
    ('蒜', 'garlic'),
    ('獅子唐', 'ししとう'),
    ('獅子唐', 'シシトウ'),
    ('獅子唐', 'shishito'),
    ('花椰菜', 'カリフラワー'),
    ('花椰菜', 'かりふらわー'),
    ('花椰菜', 'cauliflower'),
    ('芹', 'セロリ'),
    ('芹', 'せろり'),
    ('芹', 'celery'),
    ('石刁柏', 'アスパラガス'),
    ('石刁柏', 'あすぱらがす'),
    ('石刁柏', 'asparagus'),
    ('秋葵', 'オクラ'),
    ('秋葵', 'おくら'),
    ('秋葵', 'okra'),
    ('筍', 'たけのこ'),
    ('筍', 'タケノコ'),
    ('筍', 'bamboo'),
    ('茗荷', 'みょうが'),
    ('茗荷', 'ミョウガ'),
    ('茗荷', 'myoga'),
    ('韮', 'にら'),
    ('韮', 'ニラ'),
    ('韮', 'garlic chive'),
    ('西蘭花', 'ブロッコリー'),
    ('西蘭花', 'ぶろっこりー'),
    ('西蘭花', 'broccoli'),
    ('青椒', 'ピーマン'),
    ('青椒', 'ぴーまん'),
    ('青椒', 'pepper'),
    ('紫蘇', 'しそ'),
    ('紫蘇', 'シソ'),
    ('紫蘇', 'shiso'),
    ('莴苣', 'レタス'),
    ('莴苣', 'れたす'),
    ('莴苣', 'lettuce'),
    
    # Common terms
    ('卵', 'たまご'),
    ('卵', 'タマゴ'),
    ('卵', '玉子'),
    ('卵', 'egg'),
    ('野菜', 'やさい'),
    ('野菜', 'ヤサイ'),
    ('野菜', 'vegetable'),
    ('魚', 'さかな'),
    ('魚', 'サカナ'),
    ('魚', 'fish'),
    ('魚介', 'ぎょかい'),
    ('魚介', 'ギョカイ'),
    ('魚介', 'seafood'),
    ('刺身', 'さしみ'),
    ('刺身', 'サシミ'),
    ('刺身', 'sashimi'),
    ('寿司', 'すし'),
    ('寿司', 'スシ'),
    ('寿司', '鮨'),
    ('寿司', '鮓'),
    ('寿司', 'sushi'),
    ('肉', 'にく'),
    ('肉', 'ニク'),
    ('肉', 'meat'),
    ('飯', 'めし'),
    ('飯', 'メシ'),
    ('飯', 'ご飯'),
    ('飯', 'ごはん'),
    ('飯', 'rice'),
]
ING_SYNONYMS = {}
for a, b in ING_SYNONYM_PAIRS:
    ING_SYNONYMS.setdefault(a, set()).add(b)
    ING_SYNONYMS.setdefault(b, set()).add(a)


def expand_synonyms(s: str) -> set[str]:
    out = {s}
    for key, syns in ING_SYNONYMS.items():
        if key in s:
            for syn in syns:
                out.add(s.replace(key, syn))
    # Also expand cooking method synonyms within same group
    for group in COOK_METHOD_GROUPS:
        present = [t for t in group if t in s]
        if present:
            # replace first present token by other tokens in group
            t0 = present[0]
            for alt in group:
                if alt != t0:
                    out.add(s.replace(t0, alt))
    return out


def expand_order_permutations(s: str) -> set[str]:
    """If a cooking method token is present, generate swapped-order aliases.
    e.g., 焼き鮭 -> 鮭焼き / 鮭の焼き / 焼鮭 / 焼きサーモン (later via synonyms)
    """
    out = {s}
    base = s
    for m in COOK_METHODS:
        if m in base:
            rest = base.replace(m, '')
            rest = re.sub(r'[\s\u3000]+', '', rest)
            rest = rest.replace('の', '')
            if rest:
                out.update({
                    f"{rest}{m}",
                    f"{rest}の{m}",
                    f"{m}{rest}",
                    f"{m}の{rest}",
                })
    return out


def variants_for_name(name: str) -> set[str]:
    vars: set[str] = set()
    if not name:
        return vars
    base = name.strip()
    base = apply_common_replacements(base)

    # NFKC width normalization
    w = nkfc(base)
    # Remove extra spaces (ASCII and full-width)
    w_ns = strip_spaces(w)
    # Remove bullets/center dots
    w_ns = w_ns.replace('・', '')

    # No parentheses variant
    no_paren = remove_paren_content(w)
    no_paren_ns = strip_spaces(no_paren).replace('・', '')

    # Soft hyphen/dash normalizations
    w_ns = w_ns.replace('‐', '-').replace('‑', '-').replace('—', '-').replace('－', '-')
    no_paren_ns = no_paren_ns.replace('‐', '-').replace('‑', '-').replace('—', '-').replace('－', '-')

    # Lowercase ascii portion for safety
    # Split tokens on whitespace-like delimiters and recombine key fragments
    tokens = [t for t in re.split(r'[\s・/|]+', nkfc(no_paren)) if t]

    seed = {w, w_ns, no_paren, no_paren_ns, w.lower(), w_ns.lower(), no_paren_ns.lower()}
    if tokens:
        # add last token and incremental joins to capture core food names
        seed.update(tokens)
        seed.add(''.join(tokens))
        if len(tokens) >= 2:
            seed.add(''.join(tokens[-2:]))
        seed.add(tokens[-1])

    # Expand with synonyms and cooking permutations
    expanded: set[str] = set()
    for s0 in seed:
        if not s0:
            continue
        # First order permutations (焼き鮭 <-> 鮭焼き)
        perm = expand_order_permutations(s0)
        for s1 in perm:
            expanded.add(s1)
            # Then apply synonym swaps on each
            for s2 in expand_synonyms(s1):
                expanded.add(s2)

    # Normalize spacing/dots again and add
    final_set = set()
    for v in (seed | expanded):
        if not v:
            continue
        vv = nkfc(v)
        vv = strip_spaces(vv).replace('・', '')
        final_set.add(vv)
        if re.fullmatch(r'[A-Za-z\s]+', vv):
            final_set.add(vv.lower())
            final_set.add(vv.title())

    vars.update(final_set)

    return {v for v in vars if v}


def main():
    # Ensure project root in sys.path
    sys.path.insert(0, str(ROOT))
    # Prepare Django settings for importing app code
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'torimo.settings')
    try:
        import django  # type: ignore
        django.setup()
    except Exception as e:
        print('Failed to setup Django:', e, file=sys.stderr)
        sys.exit(1)
    try:
        from torimoApp.api_views import load_csv_dataset
    except Exception as e:
        print('Failed to import load_csv_dataset:', e, file=sys.stderr)
        sys.exit(1)

    rows = load_csv_dataset()
    names = [r['name'] for r in rows]
    alias_map = {}
    reverse = {}

    for nm in names:
        canon = nm
        vset = variants_for_name(nm)
        reverse[canon] = sorted(vset)
        for v in vset:
            # first writer wins to avoid flip-flops
            alias_map.setdefault(v, canon)

    out_dir = ROOT / 'data'
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / 'food_aliases.json').write_text(
        json.dumps({'alias_to_canonical': alias_map, 'canonical_to_variants': reverse}, ensure_ascii=False, indent=2),
        encoding='utf-8'
    )

    print(f'Wrote {len(alias_map)} aliases for {len(reverse)} foods -> {out_dir / "food_aliases.json"}')


if __name__ == '__main__':
    main()
