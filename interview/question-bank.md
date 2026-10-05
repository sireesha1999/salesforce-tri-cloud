# Interview question bank

Model answers for core-platform, cloud and CPQ interviews. The same content, with readings, is in the study portal.

## Apex fundamentals & governor limits

**1. Why is SOQL inside a for loop a problem?**

Each iteration runs a query; with 200 records you hit the 100-query limit. Query once with IN :ids before the loop and use a Map.

**2. What's the difference between with sharing, without sharing and inherited sharing?**

They control record-level access only. with sharing applies the user's sharing, without sharing ignores it, inherited sharing uses the caller's mode (with sharing when it is the entry point). CRUD/FLS need USER_MODE or stripInaccessible.

**3. How do you enforce field-level security in Apex today?**

Run queries and DML in user mode — WITH USER_MODE in SOQL, AccessLevel.USER_MODE on Database methods — or strip fields with Security.stripInaccessible. WITH SECURITY_ENFORCED is older and only covers reads.

**4. List vs Set vs Map — when do you use each?**

List for ordered data and DML; Set for uniqueness and fast membership checks (collecting Ids); Map for lookups by key, especially Map<Id, SObject> from a query.

**5. How would you handle partial failures in a bulk update?**

Use Database.update(records, false), iterate the SaveResults, collect errors with record Ids and log or report them rather than failing the whole batch.

**6. What changed for Apex in Winter ’27?**

Higher heap limits (10/25 MB), Apex integration tests in developer preview, the Apex Symbol API in beta, selective recompilation and a SOQL FORMULA() function in beta.

**7. How do you check governor consumption at run time?**

The Limits class, for example Limits.getQueries() versus Limits.getLimitQueries(), plus debug logs and the Apex profiling in the developer console.

**8. What is a static variable used for in triggers?**

State that lives for the transaction — recursion guards, caches of queried data, or bypass flags.

## Triggers, frameworks & order of execution

**1. When would you use a before trigger versus an after trigger?**

Before to change or validate the triggering records without DML; after when you need Ids or must change other records.

**2. Why one trigger per object?**

Multiple triggers on the same event have no guaranteed order. One trigger delegating to a handler makes order explicit and testable.

**3. How do you stop a trigger running recursively?**

A static Set<Id> of processed records (better than a static Boolean, which breaks with chunks of 200), or compare old and new values so logic only fires on real changes.

**4. Where do record-triggered flows fit in the order of execution?**

Before-save flows run before Apex before triggers; after-save flows run after triggers and after legacy workflow/assignment rules.

**5. How would you roll up a count of child records without a master-detail relationship?**

An after insert/update/delete/undelete trigger on the child that collects parent Ids (old and new when re-parented) and recalculates with one aggregate query.

**6. Can you make a callout from a trigger?**

Not synchronously. Enqueue a Queueable with Database.AllowsCallouts (or @future(callout=true)), or publish a platform event and handle it asynchronously.

**7. How do you test a trigger properly?**

Single and bulk (200) records, positive and negative cases, every event path (insert, update, delete, undelete, re-parent), and assertions on outcomes rather than just coverage.

**8. What is Trigger.operationType?**

A System.TriggerOperation enum such as BEFORE_INSERT or AFTER_UPDATE, convenient for switch statements in handlers.

## Asynchronous Apex

**1. Future vs Queueable — which and why?**

Queueable: accepts objects, returns a job Id for monitoring, supports chaining and AsyncOptions. Future only takes primitives and can't be chained.

**2. How does Database.Stateful work?**

It keeps instance variables across execute() calls of a batch — for running totals or error lists. Without it, state resets each chunk.

**3. How many records can a batch process and how is it chunked?**

A QueryLocator can return up to 50 million rows; execute receives scope-sized chunks (default 200, max 2,000), each with fresh limits.

**4. How do you make a callout from a batch?**

Implement Database.AllowsCallouts on the batch class and respect the per-execute callout limit (100) by sizing scope.

**5. How do you chain Queueables safely?**

Enqueue the next job at the end of execute with remaining work, guard against infinite chains, and in tests avoid chaining (Test.isRunningTest or AsyncOptions).

**6. What is the mixed DML error and how do you fix it?**

Setup objects (User, Group, PermissionSetAssignment) and non-setup objects can't be modified in the same transaction; move one operation to async or use System.runAs in tests.

**7. How would you schedule a nightly batch?**

A Schedulable class whose execute calls Database.executeBatch, registered with System.schedule and a cron expression such as '0 0 2 * * ?'.

**8. How do you test async Apex?**

Wrap the call in Test.startTest/Test.stopTest so the job completes before assertions; mock callouts with HttpCalloutMock.

## SOQL, SOSL & data access

**1. How do you query parent and child records in one query?**

Parent fields with dot notation; children with a subquery on the child relationship name, such as (SELECT Id FROM Contacts) or __r for custom relationships.

**2. What makes a SOQL query selective?**

Filters on indexed fields that return a small enough share of rows (thresholds depend on object size); check with the Query Plan tool.

**3. How do you prevent SOQL injection?**

Bind variables (static binds or Database.queryWithBinds), whitelisting for field names and sort, and escapeSingleQuotes as a last resort.

**4. SOQL vs SOSL?**

SOQL queries one object (and relationships) with precise filters; SOSL searches text across many objects using the search index.

**5. How do you page through 1 million records?**

Batch Apex with a QueryLocator, or keyset pagination (Id > :lastId ORDER BY Id LIMIT n); OFFSET stops at 2,000.

**6. What does FOR UPDATE do?**

Locks the selected rows until the transaction ends so concurrent transactions can't change them — used for counters and allocation logic.

**7. WITH USER_MODE vs WITH SECURITY_ENFORCED?**

USER_MODE enforces sharing plus CRUD/FLS and reports all inaccessible fields; SECURITY_ENFORCED only checks read access and throws on the first issue.

**8. How do you count records per account in SOQL?**

SELECT AccountId, COUNT(Id) FROM Contact GROUP BY AccountId — returned as AggregateResult rows.

## Testing Apex

**1. What does Test.startTest() do?**

Resets governor limits for the code under test and, with stopTest, forces queued async work and published events to run before assertions.

**2. How do you test a callout?**

Implement HttpCalloutMock returning a fake HttpResponse, register it with Test.setMock, then call the code.

**3. Why avoid SeeAllData=true?**

Tests become dependent on org data, fail across environments and can be slow; create your own data instead.

**4. How do you test code as a specific user?**

Create or query a user and wrap the code in System.runAs(user).

**5. What should a good trigger test cover?**

Single and bulk records, every event, positive and negative cases, and assertions on results.

**6. How do you test platform event subscribers?**

Publish inside Test.startTest/stopTest or call Test.getEventBus().deliver(), then assert the subscriber's effects.

## Lightning Web Components

**1. Wire vs imperative Apex?**

Wire is reactive and cached (requires cacheable=true) and re-runs when $parameters change; imperative is called on demand and is required for DML or non-cacheable methods.

**2. How do child and parent components communicate?**

Parent to child through @api properties/methods; child to parent with CustomEvent; unrelated components through Lightning Message Service.

**3. When is @track still needed?**

Only to make the component react to changes inside an object's properties or an array's items; reassigning a field is already reactive.

**4. How do you refresh data after saving?**

refreshApex(wiredResult) for wired Apex, or notifyRecordUpdateAvailable / LDS adapters which update automatically.

**5. Why prefer Lightning Data Service?**

No Apex needed for single-record CRUD, built-in caching shared across components, and automatic FLS and sharing enforcement.

**6. What do you put in disconnectedCallback?**

Clearing timers, unsubscribing from message channels or empApi, removing listeners — to avoid memory leaks.

**7. How do you debounce a search input?**

Clear and reset a setTimeout on each keystroke and update the reactive wire parameter only when the user pauses (about 300 ms).

**8. How do you test an LWC?**

Jest with sfdx-lwc-jest: createElement, append to document, emit data through mocked wire adapters, await a microtask, and assert on the shadow DOM.

## Integration

**1. How do you store credentials for a callout?**

Named Credential plus External Credential, with access granted via permission set; the code references callout:Name and never holds secrets.

**2. Which OAuth flow for a server-to-server integration?**

JWT bearer or client credentials; avoid the retiring username-password flow.

**3. How do you keep an integration idempotent?**

Use external ID fields and upsert, include unique message IDs, and check before creating.

**4. When would you use Bulk API 2.0?**

Loading or extracting large volumes (tens of thousands to millions of records) asynchronously.

**5. How would an ERP be notified when an order is activated?**

Publish a platform event or use Change Data Capture; the ERP or middleware subscribes via Pub/Sub API.

**6. Why can't you call out after DML in the same transaction?**

Uncommitted work pending prevents callouts; do the callout first or move it to async.

**7. Custom Apex REST vs standard REST API?**

Standard API for generic CRUD; Apex REST when the external system needs a business operation, validation or a stable contract that hides the data model.

**8. What is Salesforce Connect?**

External objects that read external data on demand (OData or custom adapters) without copying it into Salesforce.

## Flows & automation

**1. Before-save vs after-save record-triggered flow?**

Before-save updates fields on the triggering record cheaply without DML; after-save works with related records, actions and async paths.

**2. How do you bulkify a flow?**

Avoid elements that query or update inside loops; gather records in collections and update once; record-triggered flows are batched by the platform.

**3. How do you handle errors in Flow?**

Fault connectors on elements that can fail, logging (for example to a custom object or platform event) and user-friendly messages in screen flows.

**4. When would you choose Apex over Flow?**

Complex logic or algorithms, very high volume, sophisticated callout handling, reuse across many contexts, or when strict unit testing is required.

**5. How do you call Apex from Flow?**

An @InvocableMethod with @InvocableVariable inputs and outputs; it appears as an Apex action.

**6. How do you control order between multiple record-triggered flows?**

Trigger order values in Flow Trigger Explorer, or consolidate into fewer flows.

## Platform events & Change Data Capture

**1. Publish After Commit vs Publish Immediately?**

After Commit only delivers if the transaction commits — normal business events. Immediately delivers even on rollback — useful for error logging.

**2. How do subscribers recover missed events?**

Using the ReplayId within the retention window (72 hours for high-volume events).

**3. Platform events vs CDC?**

CDC publishes record changes automatically; platform events carry custom business events you define and publish.

**4. Who does a platform event trigger run as?**

The Automated Process user, unless a PlatformEventSubscriberConfig specifies a running user.

**5. How do you test platform event triggers?**

Publish inside startTest/stopTest or call Test.getEventBus().deliver(), then assert results.

**6. What is setResumeCheckpoint?**

It marks the last successfully processed event so that if the trigger fails and retries, it resumes after that event.

## Security & sharing

**1. What's the most restrictive level and how do you open access?**

Org-wide defaults set the baseline; the role hierarchy, sharing rules, teams, territories and manual or Apex sharing open it up.

**2. Profiles vs permission sets?**

Profiles give a baseline (one per user); permission sets and groups add access and are the recommended way to grant permissions.

**3. How does Apex managed sharing work?**

Insert records into the object's Share table (for example Account__Share for custom objects) with a custom RowCause so they survive ownership changes.

**4. How do you enforce FLS in an Apex controller?**

USER_MODE queries and DML, or Security.stripInaccessible on results before returning them.

**5. What is a criteria-based sharing rule?**

A rule sharing records that meet field criteria with a group or role, regardless of owner.

## Sales Cloud

**1. What happens on lead conversion?**

An Account and Contact are created or matched, an Opportunity optionally created, mapped custom fields copied, and the Lead marked converted.

**2. How do forecast categories relate to stages?**

Each opportunity stage maps to a forecast category (Pipeline, Best Case, Commit, Closed, Omitted) that drives forecast roll-ups.

**3. How do you route leads to the right reps?**

Lead assignment rules (criteria to users or queues), possibly round-robin via Flow or Omni-Channel, plus territory logic.

**4. What is a sales process?**

The set of opportunity stages available for a record type, letting different businesses use different stage paths.

**5. Standard quotes vs CPQ/Revenue Cloud?**

Standard quotes suit simple price-book pricing; complex bundles, rules, discounting and subscriptions need CPQ or Revenue Cloud.

## Service Cloud

**1. How do entitlements and milestones work?**

An entitlement links a customer to an entitlement process whose milestones track SLA steps with warning and violation actions.

**2. Queue-based vs skills-based routing?**

Queue-based sends work to agents in a queue; skills-based matches case attributes to agent skills and levels.

**3. How does Email-to-Case work?**

Emails to a routing address create cases (On-Demand Email-to-Case processes them in Salesforce), with threading to keep replies on the same case.

**4. How would you automate escalations?**

Escalation rules by age and criteria, or milestone violation actions in entitlement processes, plus Flow for notifications.

**5. Where does Agentforce fit in Service Cloud?**

Service agents deflect routine requests on digital channels and escalate to Omni-Channel queues with context; employee agents assist human agents.

## Salesforce CPQ (legacy SBQQ)

**1. What's the difference between product rules and price rules?**

Product rules govern configuration (validate, select, alert, filter options); price rules change field values during calculation using conditions and actions.

**2. Range vs slab discount schedules?**

Range applies the discount of the tier reached to all units; slab applies each tier's discount to the units within that tier.

**3. When would you use a Quote Calculator Plugin?**

When price rules can't express the logic — complex calculations, cross-line logic or external lookups during calculation.

**4. How are amendments and renewals created in CPQ?**

From Contracts: amend creates an amendment quote co-termed to the contract; renew creates a renewal opportunity and quote from subscriptions.

**5. How does CPQ compare with Revenue Cloud?**

CPQ is a managed package with price rules and QCP; Revenue Cloud is native, API-first, with pricing procedures, context definitions and constraint-based configuration.

**6. What are the price rule evaluation events?**

On Initialization, Before Calculate, On Calculate and After Calculate (plus configurator events for option pricing).
