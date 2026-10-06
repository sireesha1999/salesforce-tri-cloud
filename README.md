# Salesforce Tri-Cloud Portfolio

Hands-on portfolio covering **Salesforce Data 360 (formerly Data Cloud)**, **Revenue Cloud (Revenue Lifecycle Management)**, **Agentforce**, and the core platform skills behind them: Apex, triggers, asynchronous Apex, SOQL, Lightning Web Components, integration, Flow, platform events, Sales Cloud, Service Cloud and Salesforce CPQ.

The projects are built around one fictional company, **Nimbus Fleet Ltd**, a UK fleet-telematics SaaS business, so they connect into a single end-to-end story.

## Contents

| Area | What it shows | Where |
|---|---|---|
| Project 1 · Data 360 | Identity resolution across CRM, app and billing data; Ingestion API streaming; calculated and streaming insights; data action → platform event → Flow → Apex | [`projects/01-data360-identity-insights`](projects/01-data360-identity-insights) |
| Project 2 · Revenue Cloud | Product catalog, selling models, pricing procedure with volume tiers and partner discounts, quote → order → assets, amendments, approvals | [`projects/02-revenue-cloud-quote-to-cash`](projects/02-revenue-cloud-quote-to-cash) |
| Project 3 · Agentforce | Autonomous support agent with Agent Script, Flow/Apex actions and Data 360 grounding | in progress |
| Project 4 · Tri-Cloud capstone | Usage-based upsell: Data 360 signal → Revenue Cloud quote → Agentforce outreach | in progress |
| Interview live coding | 18 timed scenarios (Apex, triggers, async, REST, platform events, LWC, Flow, integration, Sales/Service Cloud, CPQ) with solutions and tests | [`interview/`](interview) |
| Coding practice | 330 scenarios (110 Apex, 110 triggers, 110 LWC), each with a starter, a reference solution, structural checks and an AI review rubric | [`interview/practice/`](interview/practice) |
| Question bank | Model answers across 13 topics | [`interview/question-bank.md`](interview/question-bank.md) |
| Study portal | The AI-assisted learning portal used to build all of this | [`portal/`](portal) and [`docs/building-the-portal.md`](docs/building-the-portal.md) |
| Standalone website | The portal on Firebase (Hosting, Auth, Firestore, Cloud Functions) with a free Google Gemini backend, deployable to your own domain | [`site/`](site) — see [`site/SETUP.md`](site/SETUP.md) |

## Apex and LWC code

Everything under [`force-app/`](force-app/main/default) is a standard Salesforce DX project:

- **Trigger framework** — `TriggerHandler` with per-event virtual methods, bypass and recursion guards.
- **Triggers** — case roll-up to Account (`CaseTriggerHandler`, `AccountCaseRollupService`), duplicate-email guard (`ContactDuplicateService`), Closed Won follow-up (`OpportunityTriggerHandler`).
- **Async** — Queueable with callouts and chaining (`AccountEnrichmentQueueable`), Batch + Schedulable (`StaleLeadBatch`).
- **Integration** — custom REST API (`CaseApi`), platform event publisher/subscriber (`OrderEventPublisher`, `OrderShippedSubscriber`, `Order_Shipped__e`).
- **Flow / Agentforce actions** — invocable `BusinessDaysCalculator`; Data 360 data-action handler `NimbusUsageAlertHandler`.
- **Data access** — safe dynamic SOQL with `Database.queryWithBinds` and `USER_MODE` (`AccountSearchService`).
- **LWC** — debounced `contactSearch` (with Jest test) and `opportunityInlineEditor` (LDS `updateRecord`, partial failures, `refreshApex`).
- **Whiteboard kata** — `CollectionKata`.

Every class has a test class covering bulk (200-record) and negative paths.

### Deploy and test

```bash
sf org login web --alias dev                   # a Developer Edition or scratch org
sf project deploy start --source-dir force-app --target-org dev
sf apex run test --target-org dev --code-coverage --result-format human --wait 10
npm install && npm run test:unit               # LWC Jest tests
```

Before deploying `AccountEnrichmentQueueable`, create a Named Credential called `Company_Info` (any HTTPS URL works for the tests, which use a callout mock). `NimbusUsageAlertHandler` needs a Data 360-enabled org.

## Notes

- All data is synthetic. No credentials or personal data are stored in this repository.
- Product names follow Salesforce's 2025–2026 naming: Data Cloud is now Data 360, and the newest Revenue Cloud docs call it Revenue Management.
