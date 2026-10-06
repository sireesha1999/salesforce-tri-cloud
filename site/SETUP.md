# Put Tri-Cloud Lab on your own domain

This folder is the standalone version of the portal. It runs entirely on **your** Google Cloud / Firebase project and a **free** Google Gemini API key — no dependency on claude.ai.

| Piece | Service |
|---|---|
| Website + your domain + HTTPS | Firebase Hosting |
| Sign-in (only your Google account) | Firebase Authentication |
| Progress, notes, jobs, stories, updates, reports | Cloud Firestore |
| AI tutor, mock scoring, job match, code review | Cloud Function `ai` → Gemini API (free tier) |
| Daily Salesforce updates (07:46 UK) | Scheduled function `dailyUpdates` (Salesforce blog RSS feeds, summarised by Gemini) |
| Sunday report (17:55 UK) | Scheduled function `weeklyReport` |
| Job Radar (07:20 UK, optional) | Scheduled function `jobRadar` — UK Salesforce jobs from the free Adzuna API, scored for you by Gemini |

Time needed: about 45 minutes, most of it waiting for DNS.

## 1. Buy a domain

Any registrar works — for example Cloudflare Registrar, Namecheap or Squarespace Domains. Pick something like `yourname.dev` or `trilab.yourname.co.uk`. You'll add DNS records in step 6, so keep the registrar's DNS page handy.

## 2. Create the Firebase project

1. Go to the Firebase console and **Add project** (you can reuse an existing Google Cloud project).
2. Upgrade to the **Blaze (pay-as-you-go)** plan — required for Cloud Functions, Cloud Scheduler and Secret Manager. Set a **budget alert** (for example £5/month) — expected cost is £0, as Hosting, Firestore, Functions, Scheduler and Secret Manager all stay inside their free allowances for one user in Google Cloud Billing.
3. **Build → Firestore Database → Create database** → production mode → location `europe-west2 (London)`.
4. **Build → Authentication → Get started → Sign-in method → Google → Enable**.
5. **Project settings → General → Your apps → Add app → Web** (no need to copy the config — Hosting serves it automatically).

## 3. Get a free Gemini API key

1. Go to **aistudio.google.com** and sign in with your Google account.
2. Click **Get API key → Create API key** and choose your `salesforce-tri-cloud` project (or let it create one).
3. Leave the key on the **free tier** — don't add billing in AI Studio. On the free tier Google may use prompts to improve its products, so don't put confidential employer data into the tutor.
4. Keep the key private: never commit it, paste it in chat, or put it in the web page. The deploy script stores it in Google Secret Manager.

Models used: `gemini-3.8-flash` for answers, `gemini-3.5-flash-lite` for quick tasks. Change them with `GEMINI_MODEL` / `GEMINI_MODEL_QUICK` in `functions/.env`. The backend also caps AI calls at 300 per day (`DAILY_AI_LIMIT` in `functions/index.js`); if you hit Google's free-tier rate limit the tutor says so — wait a minute and retry.

Google Search grounding isn't free, so daily updates come from public feeds (Salesforce Developers blog, Salesforce Admins blog, Salesforce Ben, Apex Hours, Salesforce Newsroom) plus a "dev topic of the day". Edit `FEEDS` in `functions/index.js` to change them.

### Optional: Job Radar keys (free)

The Career → Job Radar tab already shows researched UK jobs, pay bands and company notes. To get **fresh jobs every morning**:

1. Go to **developer.adzuna.com**, click **Register**, and create an account (free).
2. On your dashboard, copy the **Application ID** and **Application Key**.
3. When `deploy.sh` asks for them, paste them in. Press Enter to skip if you don't want the radar yet.

LinkedIn has no public jobs API and doesn't allow automated sign-ins, so the site never logs in to LinkedIn. Each job and search has a **Find on LinkedIn** button that opens the search in your own browser instead.

## 4. Install tools (once)

```bash
# Node.js 22+ from nodejs.org, then:
npm install -g firebase-tools
```

## 5. Deploy

```bash
cd site
./deploy.sh
```

It asks for your Firebase project ID, the Google email allowed to sign in, and your Gemini API key (first time only), then deploys the security rules, functions and website. When it finishes it prints a URL like `https://<project>.web.app` — open it and sign in with your Google account.

Re-deploy after any change with `./deploy.sh` (it won't ask again).

## 6. Connect your domain

1. Firebase console → **Hosting → Add custom domain** → enter your domain.
2. Add the **TXT** and **A** records Firebase shows at your registrar's DNS settings.
3. Wait for verification and the SSL certificate (minutes to a few hours).
4. Firebase console → **Authentication → Settings → Authorized domains** → add your domain so Google sign-in works there.

## 7. Move your progress across

1. In the current claude.ai portal: **Settings & Backup → Export backup**.
2. On your new site: **Settings & Backup → Import backup**.

Your lessons, flashcards, mocks, jobs, stories and notes come with it.

## 8. Switch off the Claude-hosted jobs

Once the new site works, turn off the two Claude scheduled tasks ("Salesforce daily update pack" and "Weekly study report") so you don't get duplicate updates — or ask Claude to do it.

## If the AI tutor isn't working

Open **Settings & Backup → Test AI connection**. It shows the exact problem:

- **HTTP 404** — the AI function didn't deploy. Run `bash deploy.sh` again and read the last red error.
- **HTTP 403** — the email in `functions/.env` (`ALLOWED_EMAIL`) doesn't match the Google account you signed in with.
- **Gemini 400 "User location is not supported"** or **API key not valid** — create a new key in Google AI Studio, then run `firebase functions:secrets:set GEMINI_API_KEY` and `bash deploy.sh`.
- **Gemini 429** — you've hit the free-tier rate limit; wait a minute.

The AI functions run in `us-central1`, where Gemini's free tier is reliably available. Your data stays in Firestore in London.

## Notes

- **Privacy:** Firestore rules only allow your verified email; the AI function checks the same email. The site is marked `noindex`.
- **Weekly report:** appears on the Today page. Phone push notifications aren't included in this version; email delivery can be added with a mail extension later.
- **Updating content:** the whole app is one self-contained file, `public/index.html`. Edit it (or ask Claude for an updated build) and run `./deploy.sh`.
- **Install as an app:** on your phone open the site and choose *Add to Home Screen*.
