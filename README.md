# Overlap

A daily game about how Americans see each other across party lines. Players guess what share of Democrats and Republicans agree with real poll statements, take a political typology quiz, and answer polls that build Overlap's own dataset.

## What's in it

| Page | What it does |
|---|---|
| `/` | Today's game. A new puzzle is generated automatically every day at midnight Eastern from the item pool. No account needed. |
| `/login` | Email and password sign up (18+ only), sign in, password reset |
| `/profile` | Optional demographics (party, age, gender, race/ethnicity, economic status, education) and research consent |
| `/typology` | 16-question quiz that places people in one of 9 original political types |
| `/polls` | Questionnaire (5-point agree/disagree). After answering, players see the national benchmark with its source. |
| `/account` | Stats, streak, typology result, sign out, delete account |
| `/privacy` | Privacy policy (review before launch) |

**Data:** `data/poll_data.json` holds 43 statements from Pew, Gallup, AP-NORC, KFF, Marquette, the Chicago Council and Economist/YouGov, 2023–2026. Every item has its source URL, field dates and notes. Every reveal in the game links to its source.

**The data flywheel:** once a poll question has at least 100 consenting respondents on each party side, it enters the daily game as an "Overlap community poll" round, clearly labeled as a non-representative sample. Change the threshold in `lib/pool.ts`.

## Put it online (about 20 minutes, free)

You need a GitHub account, a Supabase account and a Vercel account. All have free tiers.

### 1. Create the database (Supabase)
1. Go to supabase.com → **New project**. Pick a name and a strong database password, and choose the US East region.
2. When it's ready, open **SQL Editor** → **New query**. Paste all of `supabase/schema.sql` and click **Run**.
3. New query again: paste all of `supabase/seed.sql` and click **Run**. This loads the 43 sourced items and the poll questions.
4. Open **Project Settings → API** and copy the **Project URL** and the **anon public** key.

### 2. Put the code on GitHub
1. Create a new **private** repository on github.com (for example `overlap`).
2. Upload the contents of this folder (drag and drop works), but leave out `node_modules` and `.next` if they exist.

### 3. Deploy (Vercel)
1. On vercel.com → **Add New → Project** → import your `overlap` repo.
2. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
   - `NEXT_PUBLIC_LAUNCH_DATE` = the date of Puzzle No. 1, e.g. `2026-11-03`
3. Click **Deploy**. You get a link like `overlap-xyz.vercel.app` that anyone can open.

### 4. Connect logins to your site
In Supabase → **Authentication → URL Configuration**:
- **Site URL:** your Vercel link (e.g. `https://overlap-xyz.vercel.app`)
- **Redirect URLs:** add `https://overlap-xyz.vercel.app/auth/callback`

Supabase's built-in email sender is limited to a few emails per hour, which is fine for testing. Before a real launch, connect your own email provider (for example Resend) under **Authentication → Emails → SMTP Settings**.

## Run it on your computer
```
npm install
cp .env.example .env.local   # then fill in your Supabase values
npm run dev                  # open http://localhost:3000
```
Add `http://localhost:3000/auth/callback` to Supabase's Redirect URLs too.

## Adding or updating poll items
1. Edit `data/poll_data.json`. Each item needs `id`, `statement`, `d`, `r`, `pollster`, `fielded` and `url`. Add the id to a topic in `scripts/build-seed.mjs`.
2. Run `npm run seed`, then run the new `supabase/seed.sql` in the SQL Editor. Existing rows update in place.
3. To retire an item without deleting it, set `active = false` on its row in Supabase's Table Editor.

## Exporting your data
In Supabase's SQL Editor, this gives one row per answer with demographics, for consenting users only:
```sql
select pr.question_id, pr.answer, p.party, p.age_bracket, p.gender, p.race,
       p.economic_status, p.education, pr.answered_at
from poll_responses pr join profiles p on p.id = pr.user_id
where p.consent_at is not null;
```
Click **Download CSV** on the result. It contains no emails or user IDs.

## Before a public launch
- **Privacy:** fill in the contact email in `app/privacy/page.tsx`, and have the policy reviewed. You collect political views and race/ethnicity, which some state privacy laws treat as sensitive data.
- **Research use:** if you publish findings or work with a Tufts professor, ask about IRB review first.
- **Data notes:** a few items have approximate field dates or paraphrased question wording. See the `notes` field in `data/poll_data.json`.

## How it's built
Next.js 15 (App Router) + Supabase (Postgres, Auth, row-level security). Every table has row-level security, so people can only read and change their own rows. Community results come only from the `community_results` database function, which returns aggregates above a minimum sample size, never individual answers.
