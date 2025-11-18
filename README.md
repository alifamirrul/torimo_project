Torimo project

This is a simple Django project (fitness & diet demo).

See `frontend/README.md` for the React frontend scaffold and instructions.

## Nutrition analysis API

The Meal Management screen calls a backend endpoint to analyze food text using real nutrition data.

- Endpoint: `POST /api/nutrition/analyze/`
- Request body:

```json
{
	"text": "ご飯150g、鶏胸肉100g、サラダ",
	"items": [
		{ "name": "卵", "quantity": 2, "unit": "個" },
		{ "name": "rice", "quantity": 1, "unit": "bowl" }
	]
}
```

Either `text` (free-form) or `items` (structured) can be provided.

### Data sources

1) USDA FoodData Central (preferred)

Set an environment variable before starting Django:

Windows PowerShell example:

```powershell
$env:FOODDATA_API_KEY = "YOUR_FDC_API_KEY"
```

When present, the server queries FDC for each food (per 100g basis) and scales by the specified serving.

2) Offline fallback

If no API key is set, a curated offline database is used for common foods (rice, chicken breast, egg, banana, milk, etc.). This ensures the feature works offline, but coverage is limited.

3) CSV dataset (yours)

You can provide your own dataset as a CSV file. The server will prioritize it over USDA/Offline.

- Put your CSV at `data/foods.csv` or set an explicit path:

```powershell
$env:FOOD_CSV_PATH = "C:\\full\\path\\to\\your_foods.csv"
```

- Supported columns (header names are flexible; the loader tries common variants):
	- `name` (or `food`, `食品名`) – food name
	- `per` – basis like `100g` or `100ml` (optional if using per-unit)
	- `per_unit_grams` – grams per piece/unit (e.g., egg=50). If present, it takes precedence over `per`.
	- `calories` (or `kcal`)
	- `protein`
	- `fat`
	- `carbs` (or `carbohydrates`)

- Matching behavior:
	1) Case-insensitive exact match
	2) Substring inclusion (e.g., query contains the dataset name)
	3) Fuzzy match (difflib) with a conservative cutoff

A template is available at `data/foods.sample.csv`. Duplicate it as `data/foods.csv` and edit.

### Units and parsing

- Grams: `g`, `kg`, `グラム`
- Volume: `ml`, `l` (approximate water-equivalent density)
- Generic: `cup/カップ` (~240g equiv), `bowl/茶碗/杯` (~150g)
- Pieces: `個`, `piece`, `枚`, `slice` — uses per-item weights when known (e.g., egg ≈ 50g)

Examples: `鶏胸肉150g`, `1 cup rice`, `卵2個`, `banana 1`

### Run servers

Frontend (Vite):

```powershell
cd frontend
npm run dev
```

Backend (Django):

```powershell
cd torimo_project
C:/Users/m_alif/AppData/Local/Programs/Python/Python312/python.exe manage.py runserver 8000
```

Ensure CORS is enabled for local dev (already configured for development).
