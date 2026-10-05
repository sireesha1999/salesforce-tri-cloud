# Tri-Cloud Lab — study portal

`tri-cloud-lab.html` is the source of the private study portal described in [`../docs/building-the-portal.md`](../docs/building-the-portal.md). It runs as a private claude.ai page, where it uses the platform's per-user storage, an in-page AI tutor and an automatically updated news feed.

Opened as a plain local file it still works for reading lessons, tracking progress (saved in the browser) and practising interview scenarios; the tutor and sync are unavailable there.

Features:

- **Today** hub: daily plan, interview drill of the day, weak spots, countdowns, badges, "today I learned" cards, focus (Pomodoro) mode
- **Learning**: 84 daily lessons with readings and interview answers, flashcards with spaced repetition (lessons, interview Q&A, glossary, own cards), glossary with downloadable cheat sheets, course tracker, curriculum, project guides
- **Practice**: interview prep (13 topics, 18 live-coding/design scenarios with AI review), timed mock interviews with AI scorecards and trend, code playground with AI code review, test generation and security checks
- **Career**: STAR story bank with AI polishing, job application board, job-description fit analysis, certification tracker with readiness scores
- **Staying current**: Salesforce updates written automatically each morning; weekly progress report every Sunday
- AI tutor on every page, global search, synced progress, colour-coded responsive UI
