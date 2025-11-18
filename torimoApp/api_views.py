from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Exercise, Meal, DailyLog
from .serializers import ExerciseSerializer, MealSerializer, DailyLogSerializer
import os
import re
import csv
import difflib
from pathlib import Path
    # Restore the canonicalize_name function
    # This function was accidentally modified and needs to be restored to its original state.

import requests
import json
from datetime import datetime
import base64
from dotenv import load_dotenv

# Ensure .env is loaded even if settings.py hasn't loaded it yet (defensive)
try:
    load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / '.env')
except Exception:
    pass


class ExerciseViewSet(viewsets.ModelViewSet):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer


class MealViewSet(viewsets.ModelViewSet):
    serializer_class = MealSerializer
    # Add explicit queryset so DRF router can auto-generate basename and avoid AssertionError
    queryset = Meal.objects.all()

    def get_queryset(self):
        qs = Meal.objects.all().order_by('-consumed_at', '-id')
        date_param = self.request.query_params.get('date')
        if date_param:
            try:
                parsed = datetime.strptime(date_param, '%Y-%m-%d').date()
            except ValueError:
                return qs.none()
            qs = qs.filter(consumed_at=parsed)
        return qs


class DailyLogViewSet(viewsets.ModelViewSet):
    queryset = DailyLog.objects.all()
    serializer_class = DailyLogSerializer


# ---------------- Nutrition Analysis (text-based) -----------------

OFFLINE_DB = {
    # key: canonical food name -> per 100g (unless noted via 'per_unit')
    'ご飯': {'per': '100g', 'calories': 168.0, 'protein': 2.5, 'fat': 0.3, 'carbs': 37.0},
    '白米': {'per': '100g', 'calories': 168.0, 'protein': 2.5, 'fat': 0.3, 'carbs': 37.0},
    'rice': {'per': '100g', 'calories': 168.0, 'protein': 2.5, 'fat': 0.3, 'carbs': 37.0},
    '鶏胸肉': {'per': '100g', 'calories': 165.0, 'protein': 31.0, 'fat': 3.6, 'carbs': 0.0},
    'chicken breast': {'per': '100g', 'calories': 165.0, 'protein': 31.0, 'fat': 3.6, 'carbs': 0.0},
    '卵': {'per_unit': {'grams': 50}, 'calories': 78.0, 'protein': 6.3, 'fat': 5.3, 'carbs': 0.6},
    'egg': {'per_unit': {'grams': 50}, 'calories': 78.0, 'protein': 6.3, 'fat': 5.3, 'carbs': 0.6},
    'バナナ': {'per': '100g', 'calories': 93.0, 'protein': 1.1, 'fat': 0.3, 'carbs': 24.1},
    'banana': {'per': '100g', 'calories': 93.0, 'protein': 1.1, 'fat': 0.3, 'carbs': 24.1},
    'りんご': {'per': '100g', 'calories': 54.0, 'protein': 0.2, 'fat': 0.1, 'carbs': 14.6},
    'apple': {'per': '100g', 'calories': 54.0, 'protein': 0.2, 'fat': 0.1, 'carbs': 14.6},
    'オートミール': {'per': '100g', 'calories': 380.0, 'protein': 13.7, 'fat': 5.7, 'carbs': 69.1},
    'oatmeal': {'per': '100g', 'calories': 380.0, 'protein': 13.7, 'fat': 5.7, 'carbs': 69.1},
    '牛乳': {'per': '100ml', 'calories': 67.0, 'protein': 3.3, 'fat': 3.8, 'carbs': 4.8},
    'milk': {'per': '100ml', 'calories': 67.0, 'protein': 3.3, 'fat': 3.8, 'carbs': 4.8},
    'ブロッコリー': {'per': '100g', 'calories': 33.0, 'protein': 4.3, 'fat': 0.5, 'carbs': 5.2},
    'broccoli': {'per': '100g', 'calories': 33.0, 'protein': 4.3, 'fat': 0.5, 'carbs': 5.2},
    'サーモン': {'per': '100g', 'calories': 208.0, 'protein': 20.0, 'fat': 13.0, 'carbs': 0.0},
    'salmon': {'per': '100g', 'calories': 208.0, 'protein': 20.0, 'fat': 13.0, 'carbs': 0.0},
    '食パン': {'per_unit': {'grams': 30}, 'calories': 79.0, 'protein': 2.5, 'fat': 1.3, 'carbs': 14.9},
    'bread slice': {'per_unit': {'grams': 30}, 'calories': 79.0, 'protein': 2.5, 'fat': 1.3, 'carbs': 14.9},
    'サラダ': {'per': '100g', 'calories': 20.0, 'protein': 1.5, 'fat': 0.2, 'carbs': 3.5},
    'salad': {'per': '100g', 'calories': 20.0, 'protein': 1.5, 'fat': 0.2, 'carbs': 3.5},
    # common dishes (approximate, per 100g)
    'みそ汁': {'per': '100g', 'calories': 35.0, 'protein': 2.1, 'fat': 1.5, 'carbs': 3.4},
    '味噌汁': {'per': '100g', 'calories': 35.0, 'protein': 2.1, 'fat': 1.5, 'carbs': 3.4},
    'miso soup': {'per': '100g', 'calories': 35.0, 'protein': 2.1, 'fat': 1.5, 'carbs': 3.4},
    '鶏肉ステーキ': {'per': '100g', 'calories': 180.0, 'protein': 27.0, 'fat': 7.0, 'carbs': 0.0},
    'チキンステーキ': {'per': '100g', 'calories': 180.0, 'protein': 27.0, 'fat': 7.0, 'carbs': 0.0},
    'chicken steak': {'per': '100g', 'calories': 180.0, 'protein': 27.0, 'fat': 7.0, 'carbs': 0.0},
    # minced meats (approximate, per 100g)
    '豚ひき肉': {'per': '100g', 'calories': 250.0, 'protein': 17.0, 'fat': 20.0, 'carbs': 0.0},
    '豚挽肉': {'per': '100g', 'calories': 250.0, 'protein': 17.0, 'fat': 20.0, 'carbs': 0.0},
    '豚ミンチ': {'per': '100g', 'calories': 250.0, 'protein': 17.0, 'fat': 20.0, 'carbs': 0.0},
}

UNIT_GRAMS = {
    'g': 1.0, 'gram': 1.0, 'grams': 1.0, 'グラム': 1.0,
    'kg': 1000.0,
    'ml': 1.0, 'ミリリットル': 1.0, # おおよそ水相当
    'l': 1000.0, 'リットル': 1000.0,
}

GENERIC_UNITS = {
    'cup': 240.0, 'cups': 240.0, 'カップ': 240.0,
    'bowl': 150.0, 'bowls': 150.0, '杯': 150.0, '茶碗': 150.0,
}

ITEM_BASE_WEIGHTS = {
    '卵': 50.0, 'egg': 50.0,
    'バナナ': 100.0, 'banana': 100.0,
    '食パン': 30.0, 'bread slice': 30.0,
    '焼き鳥': 80.0, # 1本あたりの目安
}


def normalize_food_name(name: str) -> str:
    if not name:
        return ''
    # Lowercase, strip, fullwidth -> ascii where safe
    s = name.strip().lower()
    try:
        import unicodedata
        s = unicodedata.normalize('NFKC', s)
    except Exception:
        pass
    # remove internal spaces (including Japanese space) to unify variants with/without space
    s = re.sub(r'[\s\u3000]+', '', s)
    return s


def canonicalize_name(name: str) -> str:
    if not name:
        return ''
    try:
        import unicodedata
        s = unicodedata.normalize('NFKC', name.strip())
    except Exception:
        s = name.strip()
    # Remove spaces & punctuation that commonly vary in user input
    s = re.sub(r'[\s\u3000・._\-—－‐]+', '', s)
    # Common replacements / expansions
    repl = {
        'ごはん': 'ご飯', '白ごはん': 'ご飯', '白飯': 'ご飯', 'ライス': 'ご飯', '飯': 'ご飯',
        '焼鳥': '焼き鳥', 'やきとり': '焼き鳥', 'やき鳥': '焼き鳥', '焼きとり': '焼き鳥',
        'チキンステーキ': '鶏肉ステーキ', 'みそスープ': 'みそ汁', '味噌スープ': 'みそ汁',
        '鶏胸': '鶏胸肉', '鶏むね肉': '鶏胸肉', '胸肉': '鶏胸肉',
        '鶏もも': '鶏もも肉', 'もも肉': '鶏もも肉', 'ささみ': '鶏ささみ',
        '挽肉': 'ひき肉', 'ﾐﾝﾁ': 'ミンチ', 'ミンチ': 'ひき肉',
    }
    for k, v in repl.items():
        if k in s:
            s = s.replace(k, v)
    return s


def parse_text_to_items(text: str):
    """Parse free text into a list of {name, quantity, unit}.
    Supports separators (commas, Japanese punctuation, newlines, 'と', 'and'),
    and repeated name+quantity pairs in one line like: "白ごはん150g 焼き鳥 200g".
    """
    if not text:
        return []

    # Normalize common separators to commas
    norm = text
    for ch in ['；', '；', '、', '，', '・', '/', '／', '|', '｜']:
        norm = norm.replace(ch, ',')
    norm = norm.replace('\r', '\n')
    norm = re.sub(r'\s+と\s+|\band\b', ',', norm, flags=re.IGNORECASE)

    # First pass: explicit separators (comma/newline)
    chunks = []
    for part in re.split(r'[\n,]+', norm):
        t = part.strip()
        if t:
            chunks.append(t)

    items: list[dict] = []

    # Pattern for repeated pairs inside a chunk
    unit_pat = r'(g|grams|gram|グラム|kg|ml|l|ミリリットル|リットル|cup|cups|カップ|bowl|bowls|杯|茶碗|個|piece|pieces|枚|slice|slices|本|串)'
    pair_pat = re.compile(rf'(?P<name>[^0-9]+?)\s*(?P<qty>\d+(?:\.\d+)?)\s*(?P<unit>{unit_pat})?', re.IGNORECASE)

    def add_item(name, qty=None, unit=None):
        name = (name or '').strip()
        if not name:
            return
        unit_l = (unit or '').lower()
        try:
            qty_f = float(qty) if qty is not None else None
        except Exception:
            qty_f = None
        items.append({'name': name, 'quantity': qty_f, 'unit': unit_l})

    for c in chunks:
        matches = list(pair_pat.finditer(c))
        if matches:
            consumed = [False] * len(c)
            for m in matches:
                n = (m.group('name') or '').strip()
                q = m.group('qty')
                u = m.group('unit')
                if n or q:
                    add_item(n, q, u)
                for i in range(m.start(), m.end()):
                    consumed[i] = True
            # leftover words without numbers (e.g., standalone names)
            leftover = ''.join(ch if not consumed[i] else ' ' for i, ch in enumerate(c))
            for piece in leftover.split():
                if piece.strip():
                    # avoid adding units-only pieces
                    if not re.fullmatch(unit_pat, piece.strip(), flags=re.IGNORECASE):
                        add_item(piece.strip())
        else:
            # No pairs found; treat as a single name chunk
            add_item(c)

    return items


def fdc_lookup(name: str):
    api_key = os.environ.get('FOODDATA_API_KEY')
    if not api_key:
        return None
    try:
        r = requests.get(
            'https://api.nal.usda.gov/fdc/v1/foods/search',
            params={'query': name, 'pageSize': 1, 'api_key': api_key}, timeout=6
        )
        r.raise_for_status()
        data = r.json()
        foods = data.get('foods') or []
        if not foods:
            return None
        food = foods[0]
        nutrients = {n.get('nutrientName'): n.get('value') for n in (food.get('foodNutrients') or [])}
        # FDC values often per 100g
        return {
            'per': '100g',
            'calories': float(nutrients.get('Energy', 0.0)),
            'protein': float(nutrients.get('Protein', 0.0)),
            'fat': float(nutrients.get('Total lipid (fat)', 0.0)),
            'carbs': float(nutrients.get('Carbohydrate, by difference', 0.0)),
        }
    except Exception:
        return None


def offline_lookup(name: str):
    key = name.strip().lower()
    if key in OFFLINE_DB:
        return OFFLINE_DB[key]
    # try some light normalization for Japanese common terms
    # map hiragana variants
    if 'ごはん' in name:
        return OFFLINE_DB['ご飯']
    if 'ご飯' in name or 'ライス' in name:
        return OFFLINE_DB['ご飯']
    if '鶏' in name and '胸' in name:
        return OFFLINE_DB['鶏胸肉']
    if '卵' in name:
        return OFFLINE_DB['卵']
    if 'バナナ' in name:
        return OFFLINE_DB['バナナ']
    if 'サラダ' in name:
        return OFFLINE_DB['サラダ']
    if ('ひき肉' in name or '挽肉' in name or 'ミンチ' in name) and '豚' in name:
        return OFFLINE_DB['豚ひき肉']
    return None


CSV_CACHE = None
CSV_MATCH_INDEX = None
ALIAS_MAP = None
ALIAS_NORM = None


def _gemini_configured():
    try:
        import google.generativeai as _genai  # type: ignore
        _ = _genai
    except Exception:
        return False
    return bool(os.environ.get('GOOGLE_API_KEY'))


def _gemini_generate_text(prompt: str, model_env: str = 'GEMINI_MODEL_TEXT', default_model: str = 'gemini-1.5-flash', temperature: float = 0.4, max_output_tokens: int | None = 720) -> str | None:
    if not _gemini_configured():
        return None
    try:
        import google.generativeai as genai  # type: ignore
        genai.configure(api_key=os.environ.get('GOOGLE_API_KEY'))
        model_name = os.environ.get(model_env, default_model)
        # Normalize possible Vertex-style names like "models/gemini-2.5-pro"
        if isinstance(model_name, str) and model_name.startswith('models/'):
            model_name = model_name.split('/', 1)[1]
        model = genai.GenerativeModel(model_name)
        kwargs = {}
        if max_output_tokens is not None:
            kwargs['generation_config'] = {'max_output_tokens': max_output_tokens, 'temperature': temperature}
        resp = model.generate_content(prompt, **kwargs)
        return (getattr(resp, 'text', None) or '').strip()
    except Exception:
        return None


def ai_parse_text_to_items(text: str):
    """Use Gemini to parse items from free text. Return list of {name, quantity, unit}."""
    if not text or not _gemini_configured():
        return []
    instruction = (
        "You extract meals from text into a strict JSON object with an 'items' array. "
        "Each item has fields: name (Japanese), quantity (number), unit (string). "
        "Supported units: g, kg, ml, l, 個, 本, 串, 枚, 杯, cup, cups, bowl, bowls. "
        "If unit is missing, leave unit empty and quantity null. Output ONLY JSON."
    )
    prompt = f"{instruction}\nText: {text}\nReturn JSON with shape: {{\"items\":[{{\"name\":\"\",\"quantity\":null,\"unit\":\"\"}}]}}"
    content = _gemini_generate_text(prompt, model_env='GEMINI_MODEL_TEXT', default_model='gemini-1.5-flash', temperature=0.2, max_output_tokens=400) or ''
    try:
        data = json.loads(content) if content else {}
    except Exception:
        m = re.search(r'\{[\s\S]*\}$', content)
        data = json.loads(m.group(0)) if m else {}
    items = data.get('items') or []
    out = []
    for it in items:
        nm = (it.get('name') or '').strip()
        qty = it.get('quantity')
        unit = (it.get('unit') or '').strip()
        if nm:
            try:
                qtyf = float(qty) if qty is not None else None
            except Exception:
                qtyf = None
            out.append({'name': nm, 'quantity': qtyf, 'unit': unit})
    return out


def ai_normalize_name(name: str) -> str | None:
    """Use Gemini to output a single canonical Japanese food name."""
    if not name or not _gemini_configured():
        return None
    instruction = (
        "Output only the canonical Japanese food name with no extra text. "
        "Normalize spacing and script variants (e.g., ライス→ご飯, 焼鳥→焼き鳥)."
    )
    prompt = f"{instruction}\nName: {name}\nOutput only the canonical Japanese food name."
    content = _gemini_generate_text(prompt, model_env='GEMINI_MODEL_TEXT', default_model='gemini-1.5-flash', temperature=0.0, max_output_tokens=16) or ''
    return content.strip() or None


def ai_profile_chat(messages: list[dict], profile: dict) -> str:
    """Generate a nutrition assistant reply using Gemini. Falls back to rule-based text if key/model unavailable.

    messages: list of {role: 'user'|'assistant', content: '...'}
    profile: {age?, gender?, height_cm?, weight_kg?, goal_calories?}
    """
    # Build profile summary
    age = profile.get('age')
    gender = profile.get('gender') or '不明'
    height = profile.get('height_cm')
    weight = profile.get('weight_kg')
    goal = profile.get('goal_calories')
    summary_parts = []
    if age: summary_parts.append(f"年齢:{age}歳")
    if gender: summary_parts.append(f"性別:{gender}")
    if height: summary_parts.append(f"身長:{height}cm")
    if weight: summary_parts.append(f"体重:{weight}kg")
    if goal: summary_parts.append(f"目標:{goal}kcal/日")
    profile_summary = ' / '.join(summary_parts) if summary_parts else 'プロフィール情報なし'

    if not _gemini_configured():
        # Simple rule-based fallback: echoes last user question with generic advice
        last_user = ''
        for m in reversed(messages):
            if m.get('role') == 'user':
                last_user = m.get('content') or ''
                break
        adv = []
        if weight and goal:
            # Rough protein target: 1.6g per kg body weight
            p_target = round(weight * 1.6)
            adv.append(f"推奨タンパク質目標は約 {p_target}g/日 です。")
        if goal and weight:
            adv.append("バランス: タンパク質25%, 脂質25%, 炭水化物50% を目安に。")
        if not adv:
            adv.append("具体的な目標があれば教えてください。")
        return f"[ルールベース回答]\n{profile_summary}\n質問: {last_user}\n" + '\n'.join(adv)
    system = (
        "You are a Japanese nutrition and meal planning assistant. Provide concise, actionable advice. "
        "Use user's profile to personalize macros and meal suggestions. Respond in Japanese. "
        "If suggesting a one-day meal plan, list meals with bullet points including approximate P/F/C and kcal. "
        "Avoid medical claims; encourage balanced whole foods and adequate hydration."
    )
    profile_msg = f"ユーザープロフィール: {profile_summary}. 現在日時: {datetime.utcnow().isoformat()}Z"
    convo_lines = []
    for m in messages[-10:]:
        role = m.get('role')
        content = (m.get('content') or '').strip()
        if role in ('user', 'assistant') and content:
            prefix = 'ユーザー' if role == 'user' else 'アシスタント'
            convo_lines.append(f"{prefix}: {content}")
    convo_text = '\n'.join(convo_lines)
    prompt = f"{system}\n{profile_msg}\n会話履歴:\n{convo_text}\n---\n日本語で回答してください。"
    content = _gemini_generate_text(prompt, model_env='GEMINI_MODEL_TEXT', default_model='gemini-1.5-flash', temperature=0.4, max_output_tokens=720) or ''
    return content or "回答生成に失敗しました。後で再度お試しください。"


def load_csv_dataset():
    global CSV_CACHE, CSV_MATCH_INDEX
    if CSV_CACHE is not None:
        return CSV_CACHE

    # Detect dataset path: env var or default data/foods.csv
    root = Path(__file__).resolve().parents[1]
    default_path = root / 'data' / 'foods_custom.csv'
    alt_sample = root / 'data' / 'foods_custom.sample.csv'
    csv_path = os.environ.get('FOOD_CSV_PATH')
    if csv_path:
        p = Path(csv_path)
    elif default_path.exists():
        p = default_path
    elif alt_sample.exists():
        p = alt_sample
    else:
        CSV_CACHE = []
        CSV_MATCH_INDEX = []
        return CSV_CACHE

    entries: dict[str, dict] = {}

    def merge_entry(name: str, base_update: dict | None = None, per_unit_update: dict | None = None):
        nm = (name or '').strip()
        if not nm:
            return
        existing = entries.get(nm)
        base = existing.get('base', {}).copy() if existing else {}
        if base_update:
            for key, value in base_update.items():
                if value is None:
                    continue
                base[key] = value
        if per_unit_update:
            per_unit = base.get('per_unit', {}).copy()
            for key, value in per_unit_update.items():
                if value is None:
                    continue
                if key == 'nutrients':
                    per_unit['nutrients'] = value
                else:
                    per_unit[key] = value
            base['per_unit'] = per_unit
        entries[nm] = {'name': nm, 'base': base}

    def derive_per_unit_grams(existing_base: dict | None, nutrients: dict) -> float | None:
        if not existing_base or existing_base.get('per') != '100g':
            return None
        ratios = []
        for key in ('calories', 'protein', 'fat', 'carbs'):
            base_val = existing_base.get(key)
            unit_val = nutrients.get(key)
            if base_val and unit_val:
                ratios.append(unit_val / base_val)
        if not ratios:
            return None
        approx = max(sum(ratios) / len(ratios), 0.01)
        return round(approx * 100.0, 1)

    def add_simple_csv(text: str, source_tag: str):
        if not text:
            return
        lines = [ln for ln in text.splitlines() if ln.strip()]
        if not lines:
            return
        reader = csv.DictReader(lines)

        def fnum(val):
            try:
                return float(str(val).strip())
            except Exception:
                return 0.0

        for row in reader:
            if not row:
                continue
            name = (row.get('name') or row.get('food') or row.get('食品名') or row.get('食 品 名') or '').strip()
            if not name:
                continue
            per = (row.get('per') or row.get('basis') or '').strip()
            per_unit_grams = row.get('per_unit_grams') or row.get('unit_grams') or row.get('grams_per_unit')
            try:
                per_unit_grams = float(per_unit_grams) if per_unit_grams not in (None, '') else None
            except Exception:
                per_unit_grams = None
            unit_label_raw = row.get('count_unit') or row.get('unit_label') or row.get('serving_unit') or ''
            unit_label = unit_label_raw.strip()
            calories = fnum(row.get('calories') or row.get('kcal') or row.get('エネルギー(kcal)'))
            protein = fnum(row.get('protein') or row.get('タンパク質(g)') or row.get('たんぱく質'))
            fat = fnum(row.get('fat') or row.get('脂質(g)') or row.get('脂質'))
            carbs = fnum(row.get('carbs') or row.get('carbohydrates') or row.get('炭水化物(g)') or row.get('炭水化物'))
            nutrients = {
                'calories': calories,
                'protein': protein,
                'fat': fat,
                'carbs': carbs,
            }
            existing = entries.get(name)
            existing_base = existing['base'] if existing else None
            base_update: dict | None = None

            if per_unit_grams is not None:
                grams_val = per_unit_grams
            else:
                grams_val = derive_per_unit_grams(existing_base, nutrients)
            if grams_val is None and (per_unit_grams is not None or unit_label):
                grams_val = 100.0

            per_unit_update = None
            if per_unit_grams is not None or unit_label:
                per_unit_update = {
                    'grams': grams_val,
                    'label': unit_label or None,
                    'nutrients': nutrients,
                }

            per_norm = (per or '').strip().lower()
            if per_unit_update and existing_base is None:
                grams_for_scale = per_unit_update.get('grams') or 100.0
                scale = 100.0 / grams_for_scale if grams_for_scale else 1.0
                base_update = {
                    'per': '100g',
                    'calories': round(calories * scale, 4),
                    'protein': round(protein * scale, 4),
                    'fat': round(fat * scale, 4),
                    'carbs': round(carbs * scale, 4),
                    'source': source_tag,
                }
            elif per_unit_update:
                # Preserve existing base macros; only tag source if not already present
                if existing_base and 'source' not in existing_base:
                    base_update = {'source': source_tag}
            else:
                per_value = per_norm if per_norm in ('100g', '100ml') else '100g'
                base_update = {
                    'per': per_value,
                    'calories': calories,
                    'protein': protein,
                    'fat': fat,
                    'carbs': carbs,
                    'source': source_tag,
                }

            merge_entry(name, base_update, per_unit_update)

    try:
        content = None
        try:
            content = p.read_text(encoding='utf-8-sig')
        except Exception:
            # Fallback for JP datasets saved as CP932/Shift_JIS
            content = p.read_text(encoding='cp932')

        # Detect Japanese MEXT-style dataset with multi-row headers
        if '成分識別子' in content and 'ENERC_KCAL' in content:
            lines = [ln.strip('\n\r') for ln in content.splitlines() if ln.strip() != '']
            # Find the machine-friendly header (codes)
            header_idx = next((i for i, ln in enumerate(lines) if '成分識別子' in ln and 'ENERC_KCAL' in ln), None)
            if header_idx is None:
                raise ValueError('Header not found in JP dataset')
            headers = [h.strip().strip('"') for h in lines[header_idx].split(',')]
            idx_map = {h: i for i, h in enumerate(headers) if h}

            def find_first_data_row(start):
                for j in range(start+1, len(lines)):
                    if re.match(r'^\d{2},\d+,\d+,', lines[j]):
                        return j
                return None

            data_start = find_first_data_row(header_idx)
            if data_start is None:
                raise ValueError('No data rows found in JP dataset')

            # Helper to parse numeric cell (remove parentheses, *, Tr, etc.)
            def parse_num(cell: str) -> float:
                s = (cell or '').replace('Tr', '0').replace('−', '0').replace('-', '0').replace('*', '')
                s_no_paren = re.sub(r'\(.*?\)', '', s)
                m = re.search(r'-?\d+(?:\.\d+)?', s_no_paren)
                if not m:
                    m = re.search(r'-?\d+(?:\.\d+)?', s)
                try:
                    return float(m.group()) if m else 0.0
                except Exception:
                    return 0.0

            # JP format: name column is 4th col (index 3), nutrient columns align with header by +3 offset
            def get_by_code(cells, code):
                h = idx_map.get(code)
                if h is None:
                    return 0.0
                d = h + 3  # offset: data has 3 leading cols before REFUSE
                if d < len(cells):
                    return parse_num(cells[d])
                return 0.0

            for k in range(data_start, len(lines)):
                if not re.match(r'^\d{2},\d+,\d+,', lines[k]):
                    # stop on footer/notes
                    continue
                cells = [c.strip().strip('"') for c in lines[k].split(',')]
                if len(cells) < 10:
                    continue
                name = cells[3].strip()
                if not name:
                    continue
                kcal = get_by_code(cells, 'ENERC_KCAL')
                protein = get_by_code(cells, 'PROT-')
                fat = get_by_code(cells, 'FAT-')
                # Prefer total carbohydrate (by difference)
                carbs = 0.0
                for code in ['CHOCDF-', 'CHOAVL', 'CHOAVLM', 'CHOAVLDF-']:
                    v = get_by_code(cells, code)
                    if v > 0:
                        carbs = v
                        break

                base = {
                    'per': '100g',
                    'calories': kcal,
                    'protein': protein,
                    'fat': fat,
                    'carbs': carbs,
                    'source': 'jp-standard',
                }
                merge_entry(name, base, None)

        else:
            # Simple CSV with English/JP headers
            add_simple_csv(content, 'simple-csv')

        custom_path = root / 'data' / 'foods_custom.csv'
        if custom_path.exists():
            try:
                custom_text = custom_path.read_text(encoding='utf-8-sig')
            except Exception:
                custom_text = custom_path.read_text(encoding='cp932')
            add_simple_csv(custom_text, 'custom-csv')

        rows = list(entries.values())

        CSV_CACHE = rows
        CSV_MATCH_INDEX = [normalize_food_name(r['name']) for r in rows]
        return CSV_CACHE
    except Exception:
        CSV_CACHE = []
        CSV_MATCH_INDEX = []
        return CSV_CACHE


def _norm_alias_key(s: str) -> str:
    # Canonicalize then aggressive normalization (strip spaces, punctuation, casefold)
    base = canonicalize_name(s)
    try:
        import unicodedata
        base = unicodedata.normalize('NFKC', base)
    except Exception:
        pass
    base = re.sub(r'[\s\u3000・_\-—－‐]+', '', base)
    return base.lower()

def _similarity(a: str, b: str) -> float:
    """Composite similarity: sequence ratio * Jaccard of 2-gram sets."""
    if not a or not b:
        return 0.0
    import difflib
    seq = difflib.SequenceMatcher(None, a, b).ratio()
    def ngrams(s):
        return {s[i:i+2] for i in range(len(s)-1)} if len(s) > 1 else {s}
    A = ngrams(a)
    B = ngrams(b)
    inter = len(A & B)
    union = len(A | B) or 1
    jac = inter / union
    # Weighted blend
    return (seq * 0.6) + (jac * 0.4)


def load_alias_map():
    global ALIAS_MAP, ALIAS_NORM
    if ALIAS_MAP is not None:
        return ALIAS_MAP
    try:
        root = Path(__file__).resolve().parents[1]
        p = root / 'data' / 'food_aliases.json'
        if not p.exists():
            ALIAS_MAP = {}
            ALIAS_NORM = {}
            return ALIAS_MAP
        import json
        data = json.loads(p.read_text(encoding='utf-8'))
        ALIAS_MAP = data.get('alias_to_canonical') or {}
        # Build normalized alias index for fast lookup
        ALIAS_NORM = {}
        for alias, canon in ALIAS_MAP.items():
            k = _norm_alias_key(alias)
            if k and (k not in ALIAS_NORM):
                ALIAS_NORM[k] = canon
        return ALIAS_MAP
    except Exception:
        ALIAS_MAP = {}
        ALIAS_NORM = {}
        return ALIAS_MAP


def alias_lookup(name: str):
    """Resolve a name to canonical CSV name using multi stage match with composite similarity."""
    if not name:
        return None
    load_alias_map()
    if not ALIAS_NORM:
        return None
    key = _norm_alias_key(name)
    # 1) exact
    if key in ALIAS_NORM:
        return ALIAS_NORM[key]
    # 2) contains heuristic
    for ak, canon in ALIAS_NORM.items():
        if ak in key or key in ak:
            return canon
    # 3) best similarity
    best = None
    best_score = 0.0
    for ak, canon in ALIAS_NORM.items():
        sc = _similarity(key, ak)
        if sc > best_score:
            best_score = sc
            best = canon
    if best and best_score >= 0.68:  # tuned cutoff
        return best
    return None


def csv_lookup(name: str):
    data = load_csv_dataset()
    if not data:
        return None
    key_raw = name
    key = normalize_food_name(name)
    # alias first
    canon = alias_lookup(key_raw)
    if canon:
        for r in data:
            if canonicalize_name(r['name']) == canonicalize_name(canon):
                return r['base']
    # direct & space-insensitive exact
    for r in data:
        nm_norm = normalize_food_name(r['name'])
        if nm_norm == key:
            return r['base']
    # substring
    for r in data:
        nm_norm = normalize_food_name(r['name'])
        if nm_norm in key or key in nm_norm:
            return r['base']
    # composite similarity over all
    best = None
    best_score = 0.0
    for r in data:
        nm_norm = normalize_food_name(r['name'])
        sc = _similarity(key, nm_norm)
        if sc > best_score:
            best_score = sc
            best = r['base']
    if best and best_score >= 0.7:
        return best
    return None


def resolve_food_nutrition(name: str):
    name = canonicalize_name(name)
    # 1) CSV dataset (highest priority if provided)
    data = csv_lookup(name)
    if data:
        return data | {'source': 'csv'}
    # 2) USDA FDC
    data = fdc_lookup(name)
    if data:
        return data | {'source': 'fdc'}
    # 3) Offline fallback
    data = offline_lookup(name)
    if data:
        return data | {'source': 'offline-db'}
    return None


def compute_serving_grams(food_name: str, qty, unit, base_info):
    # unit -> grams
    if qty is None and (not unit):
        # default 100g or 1 unit
        if base_info.get('per_unit'):
            return base_info['per_unit']['grams']
        return 100.0
        # direct gram/milliliter input should scale per 100g entries exactly
        if unit in UNIT_GRAMS:
            return qty * UNIT_GRAMS[unit]
    if unit in GENERIC_UNITS:
        return qty * GENERIC_UNITS[unit]
    # piece-based
    if unit in ['個', 'piece', 'pieces', '枚', 'slice', 'slices', '本', '串']:
        # prefer per_unit if provided
        if base_info.get('per_unit'):
            return qty * base_info['per_unit']['grams']
        # use item base weight mapping as heuristic
        bw = ITEM_BASE_WEIGHTS.get(food_name.strip().lower())
        if bw:
            return qty * bw
        return qty * 100.0
    # unknown: assume grams if qty present
    if qty is not None:
        return qty
    return 100.0


@api_view(['POST'])
def analyze_nutrition(request):
    body = request.data or {}
    text = (body.get('text') or '').strip()
    items = body.get('items') or []

    foods = items if items else parse_text_to_items(text)
    if not foods:
        # Try AI parser when rule-based parsing yields nothing
        ai_items = ai_parse_text_to_items(text)
        if ai_items:
            foods = ai_items
    analyzed = []
    totals = {'calories': 0.0, 'protein': 0.0, 'fat': 0.0, 'carbs': 0.0}

    for it in foods:
        name = (it.get('name') or '').strip()
        if not name:
            continue
        base = resolve_food_nutrition(name)
        if not base:
            # Try AI normalization to get a better canonical name
            ai_name = ai_normalize_name(name)
            if ai_name:
                base = resolve_food_nutrition(ai_name)
                if base:
                    name = ai_name
            # Provide suggestions from CSV index (top 3)
            suggestions = []
            if CSV_MATCH_INDEX:
                key = normalize_food_name(canonicalize_name(name))
                suggestions = difflib.get_close_matches(key, CSV_MATCH_INDEX, n=3, cutoff=0.6)
            analyzed.append({'name': name, 'found': False, 'suggestions': suggestions})
            continue
        raw_qty = it.get('quantity')
        try:
            qty_val = float(raw_qty) if raw_qty not in (None, '') else 1.0
        except (TypeError, ValueError):
            qty_val = 1.0
        unit_val = (it.get('unit') or '')
        unit_lower = unit_val.lower()

        grams = compute_serving_grams(name.lower(), qty_val, unit_lower, base)
        per_unit_info = base.get('per_unit')
        is_weight_unit = unit_lower in UNIT_GRAMS

        if per_unit_info and not is_weight_unit:
            label = unit_val or per_unit_info.get('label') or ''
            qty_display = f"{qty_val:g}"
            if label:
                per = f"{qty_display} {label}" if re.match(r'^[A-Za-z]', label) else f"{qty_display}{label}"
            else:
                per = f"{qty_display} unit"

            per_unit_nutrients = per_unit_info.get('nutrients') or {}
            unit_grams = per_unit_info.get('grams') or 100.0

            def per_unit_value(key: str) -> float:
                if key in per_unit_nutrients and per_unit_nutrients[key] is not None:
                    return float(per_unit_nutrients[key])
                base_val = base.get(key) or 0.0
                return base_val * (unit_grams / 100.0)

            calories = round(per_unit_value('calories') * qty_val, 1)
            protein = round(per_unit_value('protein') * qty_val, 1)
            fat = round(per_unit_value('fat') * qty_val, 1)
            carbs = round(per_unit_value('carbs') * qty_val, 1)
        else:
            # Treat as gram-based serving using per-100g macros
            factor = grams / 100.0
            per = f"{int(round(grams))}g"
            calories = round((base.get('calories') or 0.0) * factor, 1)
            protein = round((base.get('protein') or 0.0) * factor, 1)
            fat = round((base.get('fat') or 0.0) * factor, 1)
            carbs = round((base.get('carbs') or 0.0) * factor, 1)

        analyzed.append({
            'name': name,
            'grams': grams,
            'per': per,
            'calories': calories,
            'protein': protein,
            'fat': fat,
            'carbs': carbs,
            'found': True,
            'source': base.get('source', 'unknown')
        })
        totals['calories'] += calories
        totals['protein'] += protein
        totals['fat'] += fat
        totals['carbs'] += carbs

    totals = {k: round(v, 1) for k, v in totals.items()}

    return Response({'items': analyzed, 'totals': totals}, status=status.HTTP_200_OK)


@api_view(['POST'])
def analyze_nutrition_image(request):
    """Analyze a meal photo and estimate items with rough kcal/P/F/C.

    Accepts one of:
      - multipart form with 'image' file
      - JSON with 'image_base64' (data URL or base64 string)
      - JSON with 'image_url'
    Returns: { items: [{name, calories, protein, fat, carbs}], totals }
    """
    # Extract image as data URL (preferred) or URL
    image_url = None
    image_bytes = None
    image_mime = 'image/jpeg'
    if 'image' in request.FILES:
        try:
            content = request.FILES['image'].read()
            image_bytes = content
            # Build data URL for OpenAI vision
            b64 = base64.b64encode(content).decode('ascii')
            image_url = f"data:image/jpeg;base64,{b64}"
        except Exception:
            return Response({'error': 'Invalid image'}, status=400)
    else:
        data = request.data or {}
        img_b64 = data.get('image_base64')
        if img_b64:
            if img_b64.startswith('data:'):
                image_url = img_b64
                # parse header
                try:
                    header, b64data = img_b64.split(',', 1)
                    if ';base64' in header:
                        mt = header.split(';')[0].split(':')[-1] or 'image/jpeg'
                        image_mime = mt
                        image_bytes = base64.b64decode(b64data)
                except Exception:
                    image_bytes = None
            else:
                # assume raw base64 jpeg
                image_bytes = base64.b64decode(img_b64)
                b64 = base64.b64encode(image_bytes).decode('ascii')
                image_url = f"data:{image_mime};base64,{b64}"
        else:
            image_url = data.get('image_url')

    if not image_url:
        return Response({'error': 'No image provided'}, status=400)

    # Build a strict JSON instruction for the model
    system = (
        "You analyze a meal photo and output ONLY valid JSON with 'items' array. "
        "Each item has fields: name (Japanese), calories (number, kcal), protein (g), fat (g), carbs (g). "
        "If unsure, make a reasonable estimate. Do not include extra commentary."
    )

    def parse_items_from_text(text: str):
        data = {}
        try:
            data = json.loads(text)
        except Exception:
            m = re.search(r'\{[\s\S]*\}$', text)
            if m:
                try:
                    data = json.loads(m.group(0))
                except Exception:
                    data = {}
        items = data.get('items') if isinstance(data, dict) else None
        out = []
        if isinstance(items, list):
            for it in items:
                name = str(it.get('name') or '').strip()
                if not name:
                    continue
                def f(key):
                    try:
                        v = float(it.get(key))
                        return max(0.0, round(v, 1))
                    except Exception:
                        return 0.0
                out.append({
                    'name': name,
                    'calories': round(f('calories')),
                    'protein': f('protein'),
                    'fat': f('fat'),
                    'carbs': f('carbs'),
                })
        return out

    try:
        # Gemini only
        try:
            import google.generativeai as genai
        except Exception:
            return Response({'error': 'No vision backend available (install google-generativeai and set GOOGLE_API_KEY).'}, status=503)
        gkey = os.environ.get('GOOGLE_API_KEY')
        if not gkey:
            return Response({'error': 'GOOGLE_API_KEY not set'}, status=503)
        genai.configure(api_key=gkey)
        gmodel_name = os.environ.get('GEMINI_MODEL_VISION', 'gemini-1.5-flash')
        if isinstance(gmodel_name, str) and gmodel_name.startswith('models/'):
            gmodel_name = gmodel_name.split('/', 1)[1]
        model = genai.GenerativeModel(gmodel_name)
        # Build parts
        parts = [
            "食事写真から料理名ごとの概算栄養をJSONで出力して。構造: {\"items\":[{\"name\":\"\",\"calories\":0,\"protein\":0,\"fat\":0,\"carbs\":0}]}。余計な説明文は出さない。",
        ]
        if image_bytes is None and image_url and image_url.startswith('data:'):
            # decode data url
            try:
                header, b64data = image_url.split(',', 1)
                if ';base64' in header:
                    image_mime = header.split(';')[0].split(':')[-1] or 'image/jpeg'
                    image_bytes = base64.b64decode(b64data)
            except Exception:
                image_bytes = None
        if image_bytes is None:
            return Response({'error': 'Image bytes not available for Gemini'}, status=400)
        parts.append({"mime_type": image_mime, "data": image_bytes})
        resp = model.generate_content(parts)
        text = (getattr(resp, 'text', None) or '').strip()
        out = parse_items_from_text(text)
        totals = {'calories': 0.0, 'protein': 0.0, 'fat': 0.0, 'carbs': 0.0}
        for it in out:
            totals['calories'] += it['calories']
            totals['protein'] += it['protein']
            totals['fat'] += it['fat']
            totals['carbs'] += it['carbs']
        for k in totals:
            totals[k] = round(totals[k], 1 if k != 'calories' else 0)
        return Response({'items': out, 'totals': totals, 'provider': 'gemini'}, status=200)
    except Exception as e:
        return Response({'error': f'vision_failed: {e}'}, status=500)


@api_view(['GET'])
def suggest_nutrition(request):
    """Return name suggestions based on alias map and CSV names.
    Query params: q (partial string), limit (default 8)
    """
    q = (request.query_params.get('q') or '').strip()
    limit = int(request.query_params.get('limit') or 8)
    if not q:
        return Response({'suggestions': []}, status=200)
    key = normalize_food_name(canonicalize_name(q))
    alias_map = load_alias_map() or {}
    csv_rows = load_csv_dataset() or []
    names = []
    # 1) Alias keys containing q
    for alias in alias_map.keys():
        a = normalize_food_name(alias)
        if key in a:
            names.append(alias)
            if len(names) >= limit:
                break
    # 2) CSV names containing q (canonical)
    if len(names) < limit:
        for r in csv_rows:
            nm = normalize_food_name(r['name'])
            if key in nm and r['name'] not in names:
                names.append(r['name'])
                if len(names) >= limit:
                    break
    # 3) Fuzzy from CSV index
    if len(names) < limit:
        candidates = difflib.get_close_matches(key, CSV_MATCH_INDEX or [], n=limit, cutoff=0.6)
        for c in candidates:
            if c not in names:
                names.append(c)
                if len(names) >= limit:
                    break
    return Response({'suggestions': names[:limit]}, status=200)


@api_view(['POST'])
def assistant_chat(request):
    """Nutrition assistant chat endpoint.
    Request JSON: { messages: [{role, content}], profile: {height_cm, weight_kg, age, gender, goal_calories} }
    Returns: { reply: str, profile_used: {...} }
    """
    data = request.data or {}
    messages = data.get('messages') or []
    profile = data.get('profile') or {}
    # Basic sanitization
    clean_msgs = []
    for m in messages[:20]:  # limit to 20 for cost control
        role = m.get('role') if m.get('role') in ['user', 'assistant'] else 'user'
        content = (m.get('content') or '').strip()
        if content:
            clean_msgs.append({'role': role, 'content': content})
    reply = ai_profile_chat(clean_msgs, profile)
    return Response({'reply': reply, 'profile_used': profile}, status=200)


@api_view(['GET'])
def assistant_status(request):
    """Lightweight health check for Gemini integration only."""
    # Ensure .env is loaded (non-destructive)
    try:
        load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / '.env')
    except Exception:
        pass
    # Gemini availability
    gemini_import = True
    try:
        import google.generativeai as _genai  # type: ignore
        _ = _genai
    except Exception:
        gemini_import = False
    from pathlib import Path as _P
    env_path = str(_P(__file__).resolve().parents[1] / '.env')
    env_exists = _P(env_path).exists()
    gemini_ready = bool(os.environ.get('GOOGLE_API_KEY')) and gemini_import
    # Inspect .env content minimally (without exposing secrets)
    file_has_google_key = False
    file_model_vision = None
    file_model_text = None
    file_keys = []
    try:
        if env_exists:
            for line in _P(env_path).read_text(encoding='utf-8', errors='ignore').splitlines():
                s = line.strip()
                if not s or s.startswith('#'):
                    continue
                if '=' in s:
                    k = s.split('=',1)[0].strip()
                    file_keys.append(k)
                if s.startswith('GOOGLE_API_KEY='):
                    file_has_google_key = True
                if s.startswith('GEMINI_MODEL_VISION='):
                    file_model_vision = s.split('=',1)[1].strip()
                if s.startswith('GEMINI_MODEL_TEXT='):
                    file_model_text = s.split('=',1)[1].strip()
    except Exception:
        pass

    info = {
        'gemini_ready': gemini_ready,
        'gemini_model_vision': os.environ.get('GEMINI_MODEL_VISION', 'gemini-1.5-flash'),
        'gemini_model_text': os.environ.get('GEMINI_MODEL_TEXT', 'gemini-1.5-flash'),
        'has_google_key': bool(os.environ.get('GOOGLE_API_KEY')),
        'env_path': env_path,
        'env_exists': env_exists,
        'file_has_google_key': file_has_google_key,
        'file_model_vision': file_model_vision,
        'file_model_text': file_model_text,
        'file_keys': file_keys,
    }
    return Response(info, status=200)


@api_view(['GET'])
def search_foods(request):
    """
    Search foods from CSV dataset with nutrition details.
    Query param: q (search term), limit (default 20)
    Returns: list of {name, calories, protein, fat, carbs, per}
    """
    q = (request.query_params.get('q') or '').strip()
    limit = int(request.query_params.get('limit') or 20)
    if not q or len(q) < 1:
        return Response([])
    
    dataset = load_csv_dataset()
    if not dataset:
        return Response([])
    
    # Normalize search term
    q_norm = normalize_food_name(q)
    
    results = []
    for idx, entry in enumerate(dataset):
        name = entry.get('name', '')
        name_norm = normalize_food_name(name)
        
        # Substring match
        if q_norm in name_norm:
            base = entry.get('base', {})
            match_pos = name_norm.index(q_norm)
            if name_norm == q_norm:
                priority = 0  # 完全一致を最優先
            elif match_pos == 0:
                priority = 1  # 接頭一致
            else:
                priority = 2  # 中間一致
            results.append({
                'priority': priority,
                'pos': match_pos,
                'length': len(name_norm),
                'idx': idx,
                'payload': {
                    'name': name,
                    'calories': base.get('calories', 0),
                    'protein': base.get('protein', 0),
                    'fat': base.get('fat', 0),
                    'carbs': base.get('carbs', 0),
                    'per': base.get('per', '100g'),
                }
            })

    # Rank by priority -> match position -> shorter name -> original order
    results.sort(key=lambda r: (r['priority'], r['pos'], r['length'], r['idx']))

    return Response([r['payload'] for r in results[:limit]])

