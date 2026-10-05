#!/usr/bin/env bash
# Deploys Tri-Cloud Lab to your Firebase project. Run from the site/ folder.
set -euo pipefail
cd "$(dirname "$0")"

command -v firebase >/dev/null 2>&1 || { echo "Install the Firebase CLI first:  npm install -g firebase-tools"; exit 1; }
firebase login --reuse

if [ ! -f .firebaserc ]; then
  read -rp "Firebase project ID (from the Firebase console): " PROJECT
  firebase use --add "$PROJECT"
fi

if [ ! -f functions/.env ]; then
  read -rp "The Google account email allowed to sign in (yours): " EMAIL
  printf 'ALLOWED_EMAIL=%s\n' "$EMAIL" > functions/.env
fi
EMAIL="$(sed -n 's/^ALLOWED_EMAIL=//p' functions/.env)"
sed "s/__ALLOWED_EMAIL__/${EMAIL}/" firestore.rules.template > firestore.rules

if ! firebase functions:secrets:access ANTHROPIC_API_KEY >/dev/null 2>&1; then
  echo "Paste your Anthropic API key when prompted (it is stored in Google Secret Manager, not in this repo)."
  firebase functions:secrets:set ANTHROPIC_API_KEY
fi

(cd functions && npm install --omit=dev)
firebase deploy --only firestore,functions,hosting
echo
echo "Done. Open the Hosting URL above, then connect your domain in Firebase console → Hosting → Add custom domain."
