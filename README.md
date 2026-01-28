- ### Data architecture (important)

	- Django no longer manages any `Meal`, `Exercise`, `DailyLog`, `Note`, or `Profile` tables. The former ORM models and SQLite-backed migrations were retired so there is zero risk of data divergence.
	- Every REST endpoint under `/api/` now forwards requests to Supabase using either the caller's Supabase JWT (so Row Level Security stays enforced) or the service role key when bootstrapping a new profile.
	- If you need to inspect or seed data, use the Supabase Table Editor, SQL Editor, or the Supabase CLI—not `python manage.py shell`.

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

The `dev` script now forces `--host 0.0.0.0 --port 5173 --strictPort`, so you always know where it is listening. If you prefer a different port, set `FRONTEND_DEV_SERVER_URL` (for Django’s redirect) and pass `--port` manually when running Vite.

Backend (Django):

```powershell
python manage.py runserver
```

Set `FRONTEND_DEV_SERVER_URL` (e.g. `http://localhost:5173/`) in `.env` if you need Django to redirect the root path to a non-default dev server URL.

## Supabase setup

1. Create a Supabase project and grab the Project URL, anon key, service role key, and Postgres connection string (Settings → API / Database).
2. Populate the root `.env` with:
	 - `SUPABASE_URL`
	 - `SUPABASE_SERVICE_ROLE_KEY` (server-only; never expose this to the browser)
	 - `SUPABASE_ANON_KEY` (used when proxying Supabase REST on behalf of the signed-in user)
	 - `SUPABASE_JWT_SECRET` (from Supabase → Settings → API → JWT secret). Optional but recommended—if supplied, the Django middleware validates user tokens locally via PyJWT before falling back to Supabase’s `/auth/v1/user` endpoint, which keeps authentication working even if the external call fails.
	 - (Optional) `SUPABASE_JWT_AUDIENCE` (defaults to `authenticated`) and `SUPABASE_JWT_VERIFY_AUD` (`1`/`0`) if your project uses a non-standard audience claim.
3. Frontend env (`frontend/.env.local`): set either `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` or the CRA-style `REACT_APP_SUPABASE_URL` / `REACT_APP_SUPABASE_ANON_KEY`. The shared `src/supabaseClient.js` reads both; if none are supplied the app now falls back to a disabled mock client so the rest of the UI still works (notes/auth screens will simply report that cloud sync is unavailable).
4. Keep CORS in sync: in Supabase → Authentication → URL Configuration, add `http://localhost:5173` (and any deployed origin) to “Additional Redirect URLs” + “Allowed Origins (CORS)”. Django already allows the common local dev ports via `django-cors-headers`.
5. Install backend deps (`pip install -r requirements.txt`) so `psycopg2-binary` and `dj-database-url` are available; run `python manage.py migrate` to sync schemas.

### Verifying the connection

- Backend sanity check (Supabase REST proxied via Django):

```powershell
$headers = @{ Authorization = "Bearer <SUPABASE_ACCESS_TOKEN>" }
Invoke-RestMethod -Method Get -Uri "http://localhost:8000/api/notes/" -Headers $headers
```

Replace `<SUPABASE_ACCESS_TOKEN>` with a short-lived user token (copy it from your browser dev tools after signing in). A `200 OK` response with your personal notes confirms Django can reach Supabase without touching SQLite/ORM tables.

- Frontend check: run `npm run dev` (or `npm run build`) with Supabase env vars populated; the build fails fast if they are missing.

### Secure Supabase auth flow

- `frontend/src/supabaseClient.js` instantiates the JS SDK using either Vite or CRA-style env variables.
- `frontend/src/hooks/useAuth.js` wraps Supabase Auth in a React context and exposes helpers (`signInWithPassword`, `signInWithOAuth`, `signOut`, `getAccessToken`).
- `frontend/src/pages/SignIn.jsx` offers email/password sign-in and an OAuth button (configure the provider—GitHub by default—in Supabase before using).
- `frontend/src/pages/Notes.jsx` shows a protected CRUD UI. Every fetch to Django includes the Supabase access token in `Authorization: Bearer <token>`.
- The bottom navigation now includes “ノート”; tapping it redirects unauthenticated users to the Supabase sign-in flow.

### Django-side protections

- `torimo/middleware/supabase_auth.py` extracts bearer tokens, validates them locally using the Supabase JWT secret (PyJWT) when available, falls back to Supabase’s `/auth/v1/user` endpoint if needed, caches responses for ~55 seconds, and attaches `request.supabase_user_id`.
- Use `@require_supabase_auth` on any DRF view/function to enforce authentication. The middleware is also registered globally so `request.supabase_user` is available when the header is present.
- `torimoApp/api_views.py` now exposes `/api/notes/` (GET ↔ list, POST ↔ create) and `/api/notes/<note_id>/` (DELETE) which proxy Supabase REST using the caller's Supabase JWT so RLS policies remain active end-to-end.

Example request/response (frontend calls these via `fetch`):

```
POST /api/notes/
Authorization: Bearer <Supabase access token>
Content-Type: application/json

{
	"title": "今日のメモ",
	"body": "プロテインを補充すること"
}

201 Created
{
	"note": {
		"id": "8f5f...",
		"title": "今日のメモ",
		"body": "プロテインを補充すること",
		"created_at": "2026-01-08T07:00:00+00:00",
		"user_id": "<Supabase user id>"
	}
}

GET /api/notes/
Authorization: Bearer <Supabase access token>

200 OK
{
	"notes": [
		{"id": "8f5f...", "title": "今日のメモ", "body": "...", "created_at": "..."}
	]
}

DELETE /api/notes/8f5f-...
Authorization: Bearer <Supabase access token>

204 No Content
```

### Notes table + RLS SQL

Run the following SQL in Supabase (SQL Editor). It enables Row Level Security so only the owner (via `auth.uid()`) can access rows. The Django server still enforces the same check before calling Supabase REST, giving you a double layer of protection.

```sql
create table if not exists public.notes (
	id uuid primary key default gen_random_uuid(),
	user_id uuid references auth.users (id) on delete cascade,
	title text not null,
	body text,
	created_at timestamptz not null default now()
);

alter table public.notes enable row level security;

create policy "Users can manage their own notes" on public.notes
	for all
	using (auth.uid() = user_id)
	with check (auth.uid() = user_id);
```

To verify RLS:
1. Call `GET https://<project>.supabase.co/rest/v1/notes` with an end-user access token (`Authorization: Bearer <access_token>`). You should only see that user’s rows.
2. Repeat with no/invalid token—you should receive `401 Unauthorized`.
3. Call through Django via `/api/notes/`; if you temper the `Authorization` header, the middleware will respond with `401` before contacting Supabase.

### Running locally

```powershell
# Backend (loads .env, including Supabase keys)
python manage.py runserver 8000

# Frontend
npm --prefix frontend run dev
```

Workflow:
1. Visit `http://localhost:5173` → open “ノート” in the bottom nav.
2. Sign in via Supabase credentials. The JWT is stored client-side by the Supabase SDK; the auth context keeps it in sync.
3. Create/delete notes; confirm they appear inside Supabase Table Editor (table `notes`).
4. Optional: observe network calls—each request to `/api/notes/` contains `Authorization: Bearer <Supabase token>`.

### Production reminders

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend bundles; keep it in `.env` on the server only.
- Serve Django over HTTPS in production so bearer tokens stay private.
- Configure Supabase “Allowed Origins (CORS)” for the deployed frontend origin(s) or requests will fail.
