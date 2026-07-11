# GrowEasy AI CSV Importer

Upload any CSV lead export, no matter the column names or source, and get it mapped into GrowEasy's CRM schema using AI-powered field extraction.

## How it works

1. **Upload** — user drops in a CSV (Facebook export, Google Ads export, manual spreadsheet, anything).
2. **Preview** — parsed client-side, shown in a table. No AI call yet.
3. **Confirm** — triggers the backend, which re-parses server-side and sends rows to Groq in batches for field mapping.
4. **Result** — mapped CRM records, skipped rows with reasons, and import totals.

## Tech stack

- **Frontend**: Next.js, TypeScript, Tailwind, TanStack Table + Virtual, Papaparse
- **Backend**: Node.js, Express, TypeScript
- **AI**: Groq (`openai/gpt-oss-120b`)

## Project structure
groweasy-csv-importer/
api/     → Express backend
web/     → Next.js frontend

## Backend setup

```bash
cd api
npm install
cp .env.example .env   # then add your GROQ_API_KEY
npm run dev
```

Runs on `http://localhost:4000`.

## Frontend setup

```bash
cd web
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
npm run dev
```

## API

### `POST /api/import/upload`
Multipart form, field `file`. Returns once fully processed.
```json
{
  "records": [ /* CRM records */ ],
  "skipped": [ { "index": 4, "reason": "Missing email and mobile number" } ],
  "totalImported": 42,
  "totalSkipped": 3
}
```

### `POST /api/import/upload-stream`
Same input. Streams NDJSON, one line per batch, so the frontend can show live progress on large files.
```json
{"type":"progress","batchIndex":2,"totalBatches":5,"processedRows":40,"totalRows":100}
{"type":"complete","records":[...],"skipped":[...],"totalImported":97,"totalSkipped":3}
```

## CRM fields

`created_at, name, email, country_code, mobile_without_country_code, company, city, state, country, lead_owner, crm_status, crm_note, data_source, possession_time, description`

`crm_status` is restricted to `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, `SALE_DONE`. `data_source` is restricted to a fixed list of 5 known sources, left blank if nothing matches confidently.

## Design decisions

- **Groq's `openai/gpt-oss-120b`**, not `llama-3.3-70b-versatile` (deprecated by Groq).
- **JSON Object Mode instead of strict `json_schema` structured outputs.** There's an open regression report of strict mode being silently ignored on this model. JSON mode is more broadly reliable, backed by Zod validation and retry-with-backoff on our side as the actual guarantee.
- **Batching (20 rows/batch)** keeps prompts small and lets one bad batch fail without losing the whole import; failed batches are marked skipped rather than crashing the request.
- **Zod `.catch("")` on enum fields** so an unexpected model output degrades to a blank field (which the spec allows) instead of rejecting the whole record.
- **Stateless by design** — no database, nothing persisted between requests, matching the assignment's optional-DB note.

## Docker

```bash
cd api
docker compose up --build
```