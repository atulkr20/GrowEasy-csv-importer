# GrowEasy AI CSV Importer

Upload any CSV lead export — Facebook Ads, Google Ads, manual spreadsheets, other CRMs — and AI maps the columns into GrowEasy's CRM schema automatically.

**Live:** https://grow-easy-csv-importer-kohl.vercel.app

---

## Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **AI:** Groq (`openai/gpt-oss-120b`)

---

## Local Setup

### Backend
```bash
cd api
npm install
# create .env with your GROQ_API_KEY
npm run dev
# runs on http://localhost:3000
```

### Frontend
```bash
cd web
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local
npm run dev
# runs on http://localhost:3001
```

### Docker (backend only)
```bash
cd api
docker compose up --build
```

---

## API

| Endpoint | Description |
|---|---|
| `POST /api/import/upload` | Upload CSV, returns full result when done |
| `POST /api/import/upload-stream` | Upload CSV, streams NDJSON progress lines |

Both accept `multipart/form-data` with field name `file`.

---

## Design Decisions

- **Groq `openai/gpt-oss-120b`** — chosen over `llama-3.3-70b-versatile` (deprecated by Groq).
- **JSON Object Mode + Zod validation** instead of strict structured outputs — there's a known regression where strict mode is silently ignored on this model. JSON mode + Zod `.parse()` with retry-on-failure is more reliable in practice.
- **Batching at 20 rows/batch** — keeps prompts small and isolates failures. A bad batch marks its rows as skipped rather than crashing the whole import.
- **Retry with backoff (3 attempts)** — each batch retries up to 2 times with 500ms / 1000ms delays before being marked skipped.
- **NDJSON streaming** — the `/upload-stream` endpoint writes one JSON line per batch as it completes, so the frontend can show live progress on large files without waiting for the full response.
- **Stateless by design** — no database. Nothing persisted between requests, matching the assignment's optional-DB note.
- **Zod `.catch("")` on enum fields** — unexpected model output degrades to a blank field instead of rejecting the whole record.