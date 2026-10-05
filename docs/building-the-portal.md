# Building the Tri-Cloud Lab study portal

This project documents how I designed and built a personal learning platform with an AI assistant (Claude), iterating on requirements the way a real product evolves. The portal itself is in [`../portal`](../portal).

## Problem

I needed to master three fast-changing Salesforce products (Data 360, Revenue Cloud and Agentforce) alongside core platform skills, while working full time. The material is scattered across Trailhead, documentation, blogs, Udemy and YouTube, and it goes out of date quickly. I wanted **one place** to learn, practise, track progress and stay current — without juggling resources during interview preparation.

## How the requirements evolved

| Iteration | Requirement | Design response |
|---|---|---|
| 1 | Private, single-user tracker that works offline | Single HTML file with `localStorage`: study timer (2.5 h weekdays / 4.5 h weekends), streaks, module progress, curriculum checklists, notes and snippets, resume vault |
| 2 | Hands-on portfolio projects | Step-by-step guides for Data 360 and Revenue Cloud with tick-off steps and exact verification tests (e.g. pricing checked to the penny) |
| 3 | Daily lessons with courses | 84 daily lessons; course tracker with completion estimates from video hours × pace ÷ daily budget |
| 4 | Read everything in the portal itself; stay current | Written lessons summarised from docs, Trailhead and blogs, with interview answers and sources; Salesforce Updates feed; global search |
| 5 | AI tutor while reading/watching; zero manual steps; interview prep; GitHub | Moved to a private claude.ai page: in-page AI tutor, cloud-synced progress, updates written automatically by a scheduled research job, interview track with live-coding scenarios, this repository |
| 6 | More colourful, interactive, responsive | Section colour theming, progress rings, celebration feedback, tablet icon rail, phone tab bar |
| 8 | Own domain, no dependency on Claude's hosting | Firebase Hosting + Google sign-in locked to one email, Firestore sync, Cloud Function proxy to the Claude API (streaming, rate-limited), scheduled functions for daily updates (web search) and weekly reports |
| 7 | A true one-stop shop for learning and interviews | Today hub, spaced-repetition flashcards, weak-spot scoring, AI-scored mock interviews, STAR bank, job board with JD fit analysis, certification readiness, glossary and cheat sheets, code playground, badges, focus mode, weekly reports |

## Architecture (final)

```
 Private claude.ai page (single HTML/CSS/JS app)
 ├─ Views: Dashboard · Daily Lessons · Updates · Interview Prep · Search · Courses · Curriculum · Notes · Guides · Vault · Settings
 ├─ State: per-user private documents (progress, content) + localStorage cache
 ├─ AI tutor: page context (current lesson/scenario) + latest updates → Claude, streamed into a side panel
 └─ Updates: shared collection, read live by the page
          ▲
 Scheduled job (daily 07:46 UK) → researches last 48 h of Salesforce news → writes items + "dev topic of the day"
```

## Key decisions and trade-offs

1. **Local file vs hosted page.** A local file is maximally private but cannot call an AI or receive updates without a key and a server. Moving to a private claude.ai page traded "no sign-in" for an AI tutor on my existing plan, automatic updates and sync across devices. The page remains private unless shared.
2. **State model.** Progress and content are stored as two documents per user to stay well under per-document limits, with a debounced, one-write-at-a-time sync. The running study timer saves locally and syncs on pause or when the page is hidden, to avoid clock-driven writes.
3. **Content accuracy.** Lessons and updates are researched against official sources and dated; items that might change are flagged; the tutor is instructed to prefer the dated updates over its own knowledge for anything recent.
4. **Copyright.** All lesson text is summarised in original words with links to sources; no copied passages.
5. **Interview realism.** Each scenario has a timer, hidden hints, a scratch area, AI review and a reference solution with unit tests in this repository.

## What I would do next

- Add Projects 3 and 4 (Agentforce agent; tri-cloud capstone) with the same verification discipline.
- CI: run Apex tests against a scratch org and LWC Jest tests on every push.
