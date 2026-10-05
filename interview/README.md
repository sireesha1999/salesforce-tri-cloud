# Interview live-coding & design scenarios

Each scenario is a timed exercise of the kind used in Salesforce developer interviews. Try it yourself first, then compare with the solution. Apex and LWC solutions live in [`force-app/`](../force-app/main/default) with unit tests; design answers are in [`design/`](design).

| ID | Scenario | Topic | Level | Time | Solution |
|---|---|---|---|---|---|
| A1 | Roll up open cases to Account | Triggers, frameworks & order of execution | Medium | 30 min | [`CaseTrigger.trigger`](../force-app/main/default/triggers/CaseTrigger.trigger), [`CaseTriggerHandler.cls`](../force-app/main/default/classes/CaseTriggerHandler.cls), [`AccountCaseRollupService.cls`](../force-app/main/default/classes/AccountCaseRollupService.cls), [`AccountCaseRollupServiceTest.cls`](../force-app/main/default/classes/AccountCaseRollupServiceTest.cls) |
| A2 | Prevent duplicate contact emails | Triggers, frameworks & order of execution | Easy | 20 min | [`ContactTrigger.trigger`](../force-app/main/default/triggers/ContactTrigger.trigger), [`ContactTriggerHandler.cls`](../force-app/main/default/classes/ContactTriggerHandler.cls), [`ContactDuplicateService.cls`](../force-app/main/default/classes/ContactDuplicateService.cls), [`ContactDuplicateServiceTest.cls`](../force-app/main/default/classes/ContactDuplicateServiceTest.cls) |
| A3 | Trigger framework + Closed Won kick-off task | Triggers, frameworks & order of execution | Medium | 30 min | [`TriggerHandler.cls`](../force-app/main/default/classes/TriggerHandler.cls), [`OpportunityTriggerHandler.cls`](../force-app/main/default/classes/OpportunityTriggerHandler.cls), [`OpportunityTrigger.trigger`](../force-app/main/default/triggers/OpportunityTrigger.trigger), [`OpportunityTriggerHandlerTest.cls`](../force-app/main/default/classes/OpportunityTriggerHandlerTest.cls) |
| A4 | Async account enrichment with callouts | Asynchronous Apex | Medium | 40 min | [`AccountEnrichmentQueueable.cls`](../force-app/main/default/classes/AccountEnrichmentQueueable.cls), [`AccountEnrichmentQueueableTest.cls`](../force-app/main/default/classes/AccountEnrichmentQueueableTest.cls) |
| A5 | Nightly batch to close stale leads | Asynchronous Apex | Medium | 30 min | [`StaleLeadBatch.cls`](../force-app/main/default/classes/StaleLeadBatch.cls), [`StaleLeadBatchTest.cls`](../force-app/main/default/classes/StaleLeadBatchTest.cls) |
| A6 | Custom REST API for cases | Integration | Medium | 40 min | [`CaseApi.cls`](../force-app/main/default/classes/CaseApi.cls), [`CaseApiTest.cls`](../force-app/main/default/classes/CaseApiTest.cls) |
| A7 | Platform event: order shipped | Platform events & Change Data Capture | Medium | 30 min | [`OrderEventPublisher.cls`](../force-app/main/default/classes/OrderEventPublisher.cls), [`OrderShippedSubscriber.cls`](../force-app/main/default/classes/OrderShippedSubscriber.cls), [`OrderShippedTrigger.trigger`](../force-app/main/default/triggers/OrderShippedTrigger.trigger), [`OrderEventPublisherTest.cls`](../force-app/main/default/classes/OrderEventPublisherTest.cls) |
| A8 | Invocable Apex for Flow: business days | Flows & automation | Easy | 20 min | [`BusinessDaysCalculator.cls`](../force-app/main/default/classes/BusinessDaysCalculator.cls), [`BusinessDaysCalculatorTest.cls`](../force-app/main/default/classes/BusinessDaysCalculatorTest.cls) |
| A9 | Collections kata (whiteboard round) | Apex fundamentals & governor limits | Easy | 30 min | [`CollectionKata.cls`](../force-app/main/default/classes/CollectionKata.cls), [`CollectionKataTest.cls`](../force-app/main/default/classes/CollectionKataTest.cls) |
| A10 | Safe dynamic SOQL search | SOQL, SOSL & data access | Medium | 30 min | [`AccountSearchService.cls`](../force-app/main/default/classes/AccountSearchService.cls), [`AccountSearchServiceTest.cls`](../force-app/main/default/classes/AccountSearchServiceTest.cls) |
| L1 | LWC: debounced contact search | Lightning Web Components | Medium | 40 min | [`contactSearch.js`](../force-app/main/default/lwc/contactSearch/contactSearch.js), [`contactSearch.html`](../force-app/main/default/lwc/contactSearch/contactSearch.html), [`ContactSearchController.cls`](../force-app/main/default/classes/ContactSearchController.cls), [`contactSearch.test.js`](../force-app/main/default/lwc/contactSearch/__tests__/contactSearch.test.js) |
| L2 | LWC: inline-edit opportunities | Lightning Web Components | Medium | 40 min | [`opportunityInlineEditor.js`](../force-app/main/default/lwc/opportunityInlineEditor/opportunityInlineEditor.js), [`opportunityInlineEditor.html`](../force-app/main/default/lwc/opportunityInlineEditor/opportunityInlineEditor.html) |
| F1 | Flow design: high-priority case escalation | Flows & automation | Medium | 25 min | [design answer](design/F1-flow-design-high-priority-case-escalation.md) |
| F2 | Flow design: guided returns screen flow | Flows & automation | Easy | 20 min | [design answer](design/F2-flow-design-guided-returns-screen-flow.md) |
| I1 | Design: order sync with an ERP | Integration | Hard | 45 min | [design answer](design/I1-design-order-sync-with-an-erp.md) |
| C1 | CPQ: partner discount + floor price | Salesforce CPQ (legacy SBQQ) | Medium | 30 min | [`quote-calculator-plugin.js`](../interview/cpq/quote-calculator-plugin.js) |
| S1 | Sales Cloud design: lead routing and conversion | Sales Cloud | Medium | 25 min | [design answer](design/S1-sales-cloud-design-lead-routing-and-conversion.md) |
| SV1 | Service Cloud design: SLAs and routing | Service Cloud | Medium | 25 min | [design answer](design/SV1-service-cloud-design-slas-and-routing.md) |

## Briefs

### A1 · Roll up open cases to Account

Maintain Account.Open_Case_Count__c (Number) as the number of open Cases on each Account. It must stay correct when cases are created, closed or reopened, moved to another account, deleted or undeleted, and must work for 200 records at once.

<details><summary>Hints</summary>

- Collect account Ids from both old and new values on update (re-parenting).
- One aggregate query: COUNT(Id) GROUP BY AccountId with IsClosed = false.
- Default every affected account to 0 so accounts that lost their last case are reset.

</details>

**How to talk it through:** I use one trigger per object delegating to a handler. On update I only recalculate when AccountId or IsClosed changed, and include the old account for re-parenting. The service recalculates with one aggregate query and one DML, so it's bulk-safe regardless of batch size.

**Likely follow-ups:**

- How would you avoid lock contention on hot accounts? (sort Ids, async recalculation, or a scheduled recalculation)
- Could a roll-up summary field or Flow do this? (only on master-detail; Flow possible but heavier)

### A2 · Prevent duplicate contact emails

Block inserting or updating a Contact when another Contact already has the same email (case-insensitive), including duplicates inside the same batch. Updates that don't change the email must not be blocked.

<details><summary>Hints</summary>

- Normalise with trim().toLowerCase() into a Map<String, Contact>.
- Check within-batch duplicates while building the map.
- One query with Email IN :keys; skip the record itself on update.

</details>

**How to talk it through:** Before trigger so I can use addError without DML. Normalised email map catches in-batch duplicates; one query catches existing records. In real projects I'd prefer standard Duplicate Rules — this shows bulk patterns.

**Likely follow-ups:**

- How would you handle 'merge instead of block'?
- What about Leads with the same email?

### A3 · Trigger framework + Closed Won kick-off task

Create a reusable trigger handler base class with bypass support. When an Opportunity becomes Closed Won, create exactly one kick-off Task for its owner, even if the record is updated again in the same transaction.

<details><summary>Hints</summary>

- Base class with virtual methods per event and a switch on Trigger.operationType.
- Compare IsWon old vs new.
- Static Set<Id> recursion guard.

</details>

**How to talk it through:** The base class gives one consistent entry point and bypass for data loads. Recursion is guarded per record Id, not with a static Boolean, which would break across 200-record chunks.

**Likely follow-ups:**

- How would you make bypass configurable without deployment? (custom metadata or custom permission)

### A4 · Async account enrichment with callouts

When accounts are created with a Website, call an external company-info API (GET /companies?domain=) and store employee count and industry. Handle failures without losing other records and respect callout limits.

<details><summary>Hints</summary>

- Queueable + Database.AllowsCallouts; enqueue from an after-insert trigger.
- Named Credential for endpoint and auth.
- Chunk and chain to stay under 100 callouts per transaction; HttpCalloutMock in tests.

</details>

**How to talk it through:** Callouts can't run synchronously in triggers, so I enqueue a Queueable that uses a Named Credential. It processes 50 accounts per job and chains the rest. Failures return null and the record is skipped; in production I'd log them.

**Likely follow-ups:**

- How would you retry failed records?
- How would you avoid enqueuing duplicates? (AsyncOptions duplicate signature)

### A5 · Nightly batch to close stale leads

Every night, set Status = 'Closed - Not Converted' on unconverted leads not modified for 90 days, and report how many succeeded and failed.

<details><summary>Hints</summary>

- Batchable with QueryLocator; Database.Stateful for counters.
- Partial-success update.
- Schedulable execute() starts the batch.

</details>

**How to talk it through:** QueryLocator handles volume; Stateful keeps totals across chunks; partial success avoids one bad lead failing 200. The same class is Schedulable for a cron entry.

**Likely follow-ups:**

- How do you test date logic when LastModifiedDate can't be set? (parameterise the cutoff)

### A6 · Custom REST API for cases

Expose GET /v1/cases/{id} returning a case summary and POST /v1/cases creating a case from JSON. Return 201, 400 (validation/invalid JSON/invalid id) or 404, and respect the calling user's permissions.

<details><summary>Hints</summary>

- @RestResource with @HttpGet/@HttpPost.
- DTO classes and JSON.deserialize.
- WITH USER_MODE and Database.insert(record, AccessLevel.USER_MODE).

</details>

**How to talk it through:** A DTO keeps the external contract stable; user mode enforces the integration user's access; explicit status codes make the API predictable for consumers.

**Likely follow-ups:**

- How would you version the API?
- How would you make POST idempotent? (external ID + upsert)

### A7 · Platform event: order shipped

Publish an Order_Shipped__e event when orders ship and, in a subscriber, create a follow-up task on the account. Make the subscriber resilient to retries.

<details><summary>Hints</summary>

- EventBus.publish returns SaveResults.
- Event trigger: after insert only.
- setResumeCheckpoint with ReplayId.

</details>

**How to talk it through:** Publish After Commit means subscribers only see shipped orders that really committed. The subscriber runs as the Automated Process user and checkpoints progress so retries don't duplicate work.

**Likely follow-ups:**

- How would an external system subscribe? (Pub/Sub API)
- When would you use CDC instead?

### A8 · Invocable Apex for Flow: business days

Provide a Flow action that returns the number of business days (Mon–Fri) between two dates. It must be bulk-safe and locale-independent.

<details><summary>Hints</summary>

- @InvocableMethod with List<Request> → List<Result>.
- Derive weekday from a known Monday instead of toStartOfWeek().

</details>

**How to talk it through:** Invocable methods are always bulk — one result per request. Descriptions on the variables make the action usable by Flow builders and Agentforce.

**Likely follow-ups:**

- How would you exclude public holidays? (Holiday object or custom metadata)

### A9 · Collections kata (whiteboard round)

Implement: top opportunity by amount per account; second-highest distinct number; anagram check; group contacts by email domain; chunk a list; first non-repeating character.

<details><summary>Hints</summary>

- Maps for grouping; a single pass for second-highest.
- Handle null and empty inputs.

</details>

**How to talk it through:** I explain complexity (O(n) where possible), edge cases first, and write tests for each.

**Likely follow-ups:**

- What is the complexity of your anagram check? (O(n log n) because of sorting; a count map gives O(n))

### A10 · Safe dynamic SOQL search

Build an account search with optional filters (name contains, industry, minimum revenue), a user-chosen sort and a row limit — without SOQL injection and respecting user permissions.

<details><summary>Hints</summary>

- Database.queryWithBinds with a bind map.
- Whitelist sort fields.
- Escape LIKE wildcards.

</details>

**How to talk it through:** Every user value is a bind; sort fields come from a whitelist; USER_MODE enforces CRUD/FLS/sharing; the limit is clamped.

**Likely follow-ups:**

- How would you expose this to an LWC? (@AuraEnabled controller)

### L1 · LWC: debounced contact search

Build an LWC that searches contacts by name or email as the user types (minimum 2 characters), shows results in a datatable with the account name, and handles loading, empty and error states.

<details><summary>Hints</summary>

- @wire with a $searchTerm parameter and cacheable Apex.
- Debounce with setTimeout (~300 ms).
- Flatten Account.Name for the datatable.

</details>

**How to talk it through:** The wire re-runs when the reactive parameter changes, and the debounce limits server calls. The Apex is cacheable and user mode.

**Likely follow-ups:**

- Why cacheable=true?
- How would you add pagination?

### L2 · LWC: inline-edit opportunities

On an Account record page, list open opportunities and let users edit stage, amount and close date inline, saving all changes with clear success and partial-failure messages.

<details><summary>Hints</summary>

- datatable draft-values and onsave.
- updateRecord from lightning/uiRecordApi (no Apex DML).
- Promise.allSettled + refreshApex.

</details>

**How to talk it through:** LDS enforces validation and FLS; allSettled lets successful rows save even if one fails; refreshApex reloads the wired data.

**Likely follow-ups:**

- How would you save in one server round trip? (Apex with Database.update(list,false))

### F1 · Flow design: high-priority case escalation

When a Case is created with Priority = High for a customer with a Premium entitlement, set a target response time, assign to the Premium queue and notify the account owner. If it is still New after 1 hour, escalate to the duty manager.

**How to talk it through:** Before-save for same-record fields, after-save for related actions, scheduled path for time-based escalation, and entitlements if SLAs must be reported.

**Likely follow-ups:**

- How would you test this flow? (Flow Test Mode / tests in Flow Builder)

### F2 · Flow design: guided returns screen flow

Build a screen flow for agents to process a device return: choose the device, capture the reason, calculate the refund (business rules in Apex), create a Return__c record and a credit task.

**How to talk it through:** Screens for UX, Apex for rules, fault paths for resilience.

**Likely follow-ups:**

- How would you let an Agentforce agent do the same? (reuse the autolaunched parts as an agent action)

### I1 · Design: order sync with an ERP

Activated orders must reach the ERP within minutes; the ERP sends back invoice numbers and shipping status. The ERP is sometimes down for maintenance. Design the integration.

**How to talk it through:** Event-driven out, upsert-based in, middleware for retries and transformation, and external IDs for idempotency.

**Likely follow-ups:**

- What if volume is 1 million orders a day? (Bulk API 2.0 for inbound, high-volume events)

### C1 · CPQ: partner discount + floor price

Partners get an extra 5% on subscription lines after price rules; net price must never go below a floor price; show total MRR on the quote. Decide between price rules and a QCP and implement.

<details><summary>Hints</summary>

- A price rule could set the additional discount; the floor check and MRR roll-up across lines suit the QCP.
- QCP fields must be listed on the custom script record.

</details>

**How to talk it through:** I'd try declarative price rules first (with a summary variable for MRR). The QCP is justified when logic spans lines or needs calculations price rules can't express — and I flag below-floor lines for approval rather than silently changing price.

**Likely follow-ups:**

- How would you do the same in Revenue Cloud? (decision table + pricing procedure element + approval)

### S1 · Sales Cloud design: lead routing and conversion

Leads arrive from the website and events. Route UK logistics leads to a regional team round-robin, others to an inside-sales queue; on conversion, copy fleet size and source to the opportunity and create a discovery task.

**How to talk it through:** Standard features first (assignment rules, field mapping), automation only for gaps.

**Likely follow-ups:**

- How do you report conversion rates by source?

### SV1 · Service Cloud design: SLAs and routing

Premium customers get 1-hour first response and 8-hour resolution; standard customers 8 hours and 3 days. Cases come by email, web chat and phone; route to agents by language and product skill.

**How to talk it through:** Entitlements make SLAs measurable; skills-based routing matches work to the right agent; agents deflect routine requests.

**Likely follow-ups:**

- How do you pause milestones while waiting on the customer? (stopped status)
