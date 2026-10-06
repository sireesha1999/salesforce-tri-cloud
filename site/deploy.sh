#!/usr/bin/env bash
# Deploys Tri-Cloud Lab to your Firebase project. Run from the site/ folder.
set -euo pipefail
cd "$(dirname "$0")"

command -v firebase >/dev/null 2>&1 || { echo "Install the Firebase CLI first:  npm install -g firebase-tools"; exit 1; }
# Sign in only if not already signed in
firebase projects:list >/dev/null 2>&1 || firebase login

if [ ! -f .firebaserc ]; then
  read -rp "Firebase project ID (from the Firebase console): " PROJECT
  firebase use --add "$PROJECT"
fi

if [ ! -f functions/.env ]; then
  read -rp "The Google account email allowed to sign in (yours): " EMAIL
  printf 'ALLOWED_EMAIL=%s\n' "$EMAIL" > functions/.env
fi
if ! grep -q 'ADZUNA_APP_ID' functions/.env; then
  echo "Optional Job Radar: free Adzuna API keys from https://developer.adzuna.com (press Enter to skip)."
  read -rp "Adzuna Application ID: " AZ_ID
  if [ -n "$AZ_ID" ]; then
    read -rp "Adzuna Application Key: " AZ_KEY
    printf 'ADZUNA_APP_ID=%s\nADZUNA_APP_KEY=%s\n' "$AZ_ID" "$AZ_KEY" >> functions/.env
  else
    echo "# ADZUNA_APP_ID not set — delete this line and re-run deploy.sh to add Job Radar keys" >> functions/.env
  fi
fi
EMAIL="$(sed -n 's/^ALLOWED_EMAIL=//p' functions/.env)"
sed "s/__ALLOWED_EMAIL__/${EMAIL}/" firestore.rules.template > firestore.rules

if ! firebase functions:secrets:access GEMINI_API_KEY >/dev/null 2>&1; then
  echo "Paste your Gemini API key from Google AI Studio when prompted (it is stored in Google Secret Manager, not in this repo)."
  firebase functions:secrets:set GEMINI_API_KEY
fi

(cd functions && npm install --omit=dev)
PROJECT_ID="$(sed -n 's/.*"default": *"\([^"]*\)".*/\1/p' .firebaserc)"
# --force lets the deploy remove functions that moved region without stopping to ask
if ! firebase deploy --only firestore,functions,hosting --force; then
  cat <<MSG

Deploy failed. Common first-time fixes:
 - "missing permission on the build service account": open
   https://console.cloud.google.com/iam-admin/iam?project=${PROJECT_ID}
   edit the "...-compute@developer.gserviceaccount.com" principal, add the role
   "Cloud Build Service Account", save, wait 2 minutes, then run: bash deploy.sh
 - "Permission denied" / "API not enabled" right after enabling services: wait 2 minutes and run bash deploy.sh again.
 - Anything else: copy the red error text (never your API key) and ask for help.
MSG
  exit 1
fi
echo
echo "Deployed functions:"
firebase functions:list || true
echo
echo "Done. Open the Hosting URL above, then connect your domain in Firebase console → Hosting → Add custom domain."
