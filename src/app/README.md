# 👍 Thumbs Survey App — Setup Guide

A one-page satisfaction survey with 4 ratings:
| Value | Icon  | Label           |
|-------|-------|-----------------|
| 4     | 👍👍  | Two Thumbs Up   |
| 3     | 👍    | Thumbs Up       |
| 2     | 👎    | Thumbs Down     |
| 1     | 👎👎  | Two Thumbs Down |

---

## 📁 Project Structure

```
survey-app/
├── angular/                      ← Angular 17+ frontend
│   └── src/
│       ├── app/
│       │   ├── survey/
│       │   │   ├── survey.component.ts
│       │   │   ├── survey.component.html
│       │   │   ├── survey.component.scss
│       │   │   ├── survey.module.ts
│       │   │   └── survey.service.ts
│       │   ├── app.module.ts
│       │   ├── app.component.ts
│       │   └── app-routing.module.ts
│       └── environments/
│           ├── environment.ts
│           └── environment.prod.ts
└── supabase/
    ├── functions/
    │   └── submitSurvey/
    │       └── index.ts          ← Edge Function (Deno)
    └── migration.sql             ← Run once in Supabase SQL Editor
```

---

## 🗄️ Step 1 — Supabase Setup

### 1a. Create project
1. Go to https://supabase.com and create a new project.
2. Note your **Project URL** and **anon key** (Settings → API).

### 1b. Run the SQL migration
1. Open **SQL Editor** in the Supabase dashboard.
2. Paste the contents of `supabase/migration.sql` and click **Run**.
   This creates the `survey_tokens` table with RLS enabled.

### 1c. Insert test tokens
```sql
INSERT INTO survey_tokens (token, expires_at)
VALUES
  ('my-test-token-001', NOW() + INTERVAL '30 days'),
  ('my-test-token-002', NOW() + INTERVAL '30 days');
```

---

## ⚡ Step 2 — Deploy Edge Function

### 2a. Install Supabase CLI
```bash
npm install -g supabase
supabase login
```

### 2b. Link to your project
```bash
# In the survey-app root
supabase init
supabase link --project-ref YOUR_PROJECT_REF
```
Get `YOUR_PROJECT_REF` from your Supabase project URL:
`https://YOUR_PROJECT_REF.supabase.co`

### 2c. Set secrets
```bash
supabase secrets set APPSHEET_KEY=your_appsheet_api_key
supabase secrets set APPSHEET_APP_ID=your_appsheet_app_id
supabase secrets set APPSHEET_TABLE_NAME=SurveyResponses
supabase secrets set SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```
> ⚠️ **Never** put these in your Angular code or `.env` committed to git.

### 2d. Deploy
```bash
supabase functions deploy submitSurvey
```

Your Edge Function URL will be:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/submitSurvey
```

---

## 🔑 Step 3 — AppSheet Setup

1. Open your AppSheet app → **Manage → Integrations → IN: API**
2. Enable the API and copy the **Application Access Key** → use as `APPSHEET_KEY`.
3. Your `APPSHEET_APP_ID` is in the URL when editing the app:
   `https://www.appsheet.com/template/AppDef?appName=YOUR_APP_ID`
4. Make sure the table (`SurveyResponses`) has these columns:
   | Column          | Type      |
   |-----------------|-----------|
   | Rating          | Number    |
   | RatingLabel     | Text      |
   | RespondentName  | Text      |
   | Comment         | LongText  |
   | SubmittedAt     | DateTime  |

---

## 🅰️ Step 4 — Angular App Setup

### 4a. Create Angular project (if new)
```bash
ng new survey-frontend --routing --style=scss
cd survey-frontend
```

### 4b. Copy files
Copy all files from `angular/src/` into your Angular project's `src/` folder.

### 4c. Update environment
In `src/environments/environment.ts`, replace:
```ts
supabaseEdgeFnUrl: 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/submitSurvey',
```

### 4d. Run
```bash
ng serve
```

Open: `http://localhost:4200/survey?token=my-test-token-001`

---

## 🌐 How Tokens Work

Each survey link looks like:
```
https://yourapp.com/survey?token=UNIQUE_TOKEN
```

1. You insert a token row into `survey_tokens` before distributing the link.
2. The token is single-use and has an expiry date.
3. After submission, the Edge Function marks `used = true`.
4. Trying the same link again returns `"Token already used"`.

To generate tokens in bulk (e.g., for QR code printouts):
```sql
INSERT INTO survey_tokens (token, expires_at)
SELECT
  'tok-' || gen_random_uuid()::text,
  NOW() + INTERVAL '30 days'
FROM generate_series(1, 100);
```

---

## 🔒 Security Summary

| Layer           | Protection                                      |
|-----------------|-------------------------------------------------|
| Angular (browser) | Only talks to Edge Function URL, no secrets   |
| Edge Function   | Validates token, calls AppSheet with hidden key |
| AppSheet key    | Stored as Supabase secret, never in frontend    |
| `survey_tokens` | RLS enabled — no public access via JS client    |
| CORS            | Set to your domain in production                |

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---------|-----|
| `Invalid token` | Check the token exists in `survey_tokens` table |
| `Token expired` | Update `expires_at` or insert a new token |
| AppSheet 403    | Verify `APPSHEET_KEY` and `APPSHEET_APP_ID` secrets |
| CORS error      | Update `Access-Control-Allow-Origin` in the Edge Function |
| Angular 404     | Ensure server redirects all paths to `index.html` |
