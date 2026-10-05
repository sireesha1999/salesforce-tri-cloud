# Put Tri-Cloud Lab on your own domain

This folder is the standalone version of the portal. It runs entirely on **your** Google Cloud / Firebase project and **your** Anthropic API key — no dependency on claude.ai.

| Piece | Service |
|---|---|
| Website + your domain + HTTPS | Firebase Hosting |
| Sign-in (only your Google account) | Firebase Authentication |
| Progress, notes, jobs, stories, updates, reports | Cloud Firestore |
| AI tutor, mock scoring, job match, code review | Cloud Function `ai` → Claude API |
| Daily Salesforce updates (07:46 UK) | Scheduled function `dailyUpdates` (Claude + web search) |
| Sunday report (17:55 UK) | Scheduled function `weeklyReport` |

Time needed: about 45 minutes, most of it waiting for DNS.

## 1. Buy a domain

Any registrar works — for example Cloudflare Registrar, Namecheap or Squarespace Domains. Pick something like `yourname.dev` or `trilab.yourname.co.uk`. You'll add DNS records in step 6, so keep the registrar's DNS page handy.

## 2. Create the Firebase project

1. Go to the Firebase console and **Add project** (you can reuse an existing Google Cloud project).
2. Upgrade to the **Blaze (pay-as-you-go)** plan — required for Cloud Functions, Cloud Scheduler and Secret Manager. Set a **budget alert** (for example £10/month) in Google Cloud Billing.
3. **Build → Firestore Database → Create database** → production mode → location `europe-west2 (London)`.
4. **Build → Authentication → Get started → Sign-in method → Google → Enable**.
5. **Project settings → General → Your apps → Add app → Web** (no need to copy the config — Hosting serves it automatically).

## 3. Get a Claude API key

1. Sign in to the Anthropic Console, add billing and create an API key.
2. Set a **monthly spend limit** in the console.
3. Keep the key private: never commit it, paste it in chat, or put it in the web page. The deploy script stores it in Google Secret Manager.

The backend also caps AI calls at 300 per day (`DAILY_AI_LIMIT` in `functions/index.js`).

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

It asks for your Firebase project ID, the Google email allowed to sign in, and your Anthropic API key (first time only), then deploys the security rules, functions and website. When it finishes it prints a URL like `https://<project>.web.app` — open it and sign in with your Google account.

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

## Notes

- **Privacy:** Firestore rules only allow your verified email; the AI function checks the same email. The site is marked `noindex`.
- **Weekly report:** appears on the Today page. Phone push notifications aren't included in this version; email delivery can be added with a mail extension later.
- **Updating content:** the whole app is one self-contained file, `public/index.html`. Edit it (or ask Claude for an updated build) and run `./deploy.sh`.
- **Install as an app:** on your phone open the site and choose *Add to Home Screen*.
