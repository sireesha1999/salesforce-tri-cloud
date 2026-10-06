PRACTICE.push(
  {
    id: "AP056",
    track: "apex",
    level: "Easy",
    topic: "Async Apex",
    title: "Queueable to rate high-revenue accounts",
    task: "Thames Logistics re-rates accounts after a nightly revenue import. Write a Queueable class `AccountRatingJob`.\n- Constructor: `public AccountRatingJob(Set<Id> accountIds)`\n- In `execute(QueueableContext context)` query the accounts and set `Rating = 'Hot'` when `AnnualRevenue > 1000000`\n- Only update accounts whose Rating actually changes\n- Do nothing for a null or empty set\n- Query and DML in user mode, one DML statement",
    starter: "public with sharing class AccountRatingJob implements Queueable {\n    private Set<Id> accountIds;\n\n    public AccountRatingJob(Set<Id> accountIds) {\n        this.accountIds = accountIds;\n    }\n\n    public void execute(QueueableContext context) {\n        // TODO\n    }\n}\n",
    solution: "public with sharing class AccountRatingJob implements Queueable {\n    private Set<Id> accountIds;\n\n    public AccountRatingJob(Set<Id> accountIds) {\n        this.accountIds = accountIds;\n    }\n\n    public void execute(QueueableContext context) {\n        if (accountIds == null || accountIds.isEmpty()) {\n            return;\n        }\n        List<Account> toUpdate = new List<Account>();\n        for (Account acc : [\n            SELECT Id, Rating, AnnualRevenue\n            FROM Account\n            WHERE Id IN :accountIds\n            WITH USER_MODE\n        ]) {\n            if (acc.AnnualRevenue != null && acc.AnnualRevenue > 1000000 && acc.Rating != 'Hot') {\n                acc.Rating = 'Hot';\n                toUpdate.add(acc);\n            }\n        }\n        if (!toUpdate.isEmpty()) {\n            update as user toUpdate;\n        }\n    }\n}\n",
    checks: [
      {
        re: /implements\s+Queueable/i,
        msg: "Implements Queueable"
      },
      {
        re: /void\s+execute\s*\(\s*QueueableContext\s+\w+\s*\)/i,
        msg: "Has execute(QueueableContext)"
      },
      {
        re: /'Hot'/i,
        msg: "Sets Rating to 'Hot'"
      },
      {
        re: /1000000/,
        msg: "Uses the £1,000,000 revenue threshold"
      },
      {
        re: /WITH\s+USER_MODE|AccessLevel\.USER_MODE|\bas\s+user\b/i,
        msg: "Runs the query / DML in user mode"
      }
    ],
    forbid: [
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i,
        msg: "No SOQL inside a loop"
      },
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+(as\s+(user|system)\s+)?\w+\s*;/i,
        msg: "No DML inside a loop"
      }
    ],
    hints: [
      "Guard the empty set first, then use a SOQL for-loop to collect changed records.",
      "Compare the current Rating before adding a record to the update list."
    ],
    ai: "Verify accounts with null AnnualRevenue are skipped, only changed records are updated in a single DML, and the job is a no-op for null/empty input."
  },
  {
    id: "AP057",
    track: "apex",
    level: "Easy",
    topic: "Async Apex",
    title: "Schedule a nightly cleanup batch",
    task: "Nimbus Fleet Ltd wants stale leads cleaned every night at 02:00. A batch class `StaleLeadBatch` already exists. Write `NightlyLeadCleanupScheduler`:\n- Implements Schedulable; `execute(SchedulableContext context)` runs `StaleLeadBatch` with a scope size of 200\n- `public static String scheduleNightly()` schedules this class with the cron expression `0 0 2 * * ?` under the job name 'Nightly Stale Lead Cleanup' and returns the job Id\n- Keep the cron expression in a constant",
    starter: "public with sharing class NightlyLeadCleanupScheduler implements Schedulable {\n\n    public void execute(SchedulableContext context) {\n        // TODO\n    }\n\n    public static String scheduleNightly() {\n        // TODO\n        return null;\n    }\n}\n",
    solution: "public with sharing class NightlyLeadCleanupScheduler implements Schedulable {\n    public static final String JOB_NAME = 'Nightly Stale Lead Cleanup';\n    public static final String CRON_EXPRESSION = '0 0 2 * * ?';\n\n    public void execute(SchedulableContext context) {\n        Database.executeBatch(new StaleLeadBatch(), 200);\n    }\n\n    public static String scheduleNightly() {\n        return System.schedule(JOB_NAME, CRON_EXPRESSION, new NightlyLeadCleanupScheduler());\n    }\n}\n",
    checks: [
      {
        re: /implements\s+Schedulable/i,
        msg: "Implements Schedulable"
      },
      {
        re: /Database\.executeBatch\(\s*new\s+StaleLeadBatch\(\s*\)\s*,\s*200\s*\)/i,
        msg: "Runs StaleLeadBatch with scope size 200"
      },
      {
        re: /System\.schedule\s*\(/i,
        msg: "Schedules the job with System.schedule"
      },
      {
        re: /'0 0 2 \* \* \?'/,
        msg: "Uses the cron expression '0 0 2 * * ?'"
      },
      {
        re: /static\s+final\s+String\s+\w+\s*=\s*'0 0 2/i,
        msg: "Keeps the cron expression in a constant"
      }
    ],
    forbid: [],
    hints: [
      "Database.executeBatch takes the batch instance and an optional scope size.",
      "System.schedule(jobName, cronExpression, schedulableInstance) returns the CronTrigger Id as a String."
    ],
    ai: "Check execute only launches the batch (no heavy logic in the scheduler), the cron expression fires daily at 02:00, and scheduleNightly returns the value from System.schedule."
  },
  {
    id: "AP058",
    track: "apex",
    level: "Easy",
    topic: "Async Apex",
    title: "@future callout to notify the warehouse",
    task: "When orders are activated, Thames Logistics must notify its warehouse system. Write `WarehouseNotifier.notifyWarehouse(Set<Id> orderIds)` as a future method that can make callouts.\n- Query the Orders (Id, OrderNumber, Status) in user mode\n- POST a JSON array of {orderId, orderNumber, status} to the Named Credential `callout:Warehouse_API/orders/notify`\n- Set Content-Type to application/json\n- Return immediately for null/empty input; log (System.debug ERROR) any non-2xx response",
    starter: "public with sharing class WarehouseNotifier {\n\n    public static void notifyWarehouse(Set<Id> orderIds) {\n        // TODO\n    }\n}\n",
    solution: "public with sharing class WarehouseNotifier {\n\n    @future(callout=true)\n    public static void notifyWarehouse(Set<Id> orderIds) {\n        if (orderIds == null || orderIds.isEmpty()) {\n            return;\n        }\n        List<Map<String, Object>> payload = new List<Map<String, Object>>();\n        for (Order o : [SELECT Id, OrderNumber, Status FROM Order WHERE Id IN :orderIds WITH USER_MODE]) {\n            payload.add(new Map<String, Object>{\n                'orderId' => o.Id,\n                'orderNumber' => o.OrderNumber,\n                'status' => o.Status\n            });\n        }\n        if (payload.isEmpty()) {\n            return;\n        }\n        HttpRequest req = new HttpRequest();\n        req.setEndpoint('callout:Warehouse_API/orders/notify');\n        req.setMethod('POST');\n        req.setHeader('Content-Type', 'application/json');\n        req.setBody(JSON.serialize(payload));\n        HttpResponse res = new Http().send(req);\n        if (res.getStatusCode() < 200 || res.getStatusCode() >= 300) {\n            System.debug(LoggingLevel.ERROR, 'Warehouse notify failed: ' + res.getStatusCode() + ' ' + res.getBody());\n        }\n    }\n}\n",
    checks: [
      {
        re: /@future\s*\(\s*callout\s*=\s*true\s*\)/i,
        msg: "Annotated @future(callout=true)"
      },
      {
        re: /static\s+void\s+notifyWarehouse\s*\(\s*Set<\s*Id\s*>\s+\w+\s*\)/i,
        msg: "Keeps the static void signature with Set<Id>"
      },
      {
        re: /callout:Warehouse_API/i,
        msg: "Uses the Warehouse_API Named Credential"
      },
      {
        re: /setMethod\(\s*'POST'\s*\)/i,
        msg: "Sends a POST request"
      },
      {
        re: /JSON\.serialize(Pretty)?\s*\(/i,
        msg: "Serialises the payload with JSON.serialize"
      }
    ],
    forbid: [
      {
        re: /setEndpoint\(\s*'https?:/i,
        msg: "Use a Named Credential (callout:...) instead of a hard-coded URL"
      },
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i,
        msg: "No SOQL inside a loop"
      }
    ],
    hints: [
      "Future methods must be static void and take primitives or collections of primitives (Set<Id> is fine).",
      "Build a List<Map<String, Object>> and serialise it once."
    ],
    ai: "Verify a single callout is made for all orders, the method is static void with @future(callout=true), and non-2xx responses are logged rather than silently ignored."
  },
  {
    id: "AP059",
    track: "apex",
    level: "Medium",
    topic: "Async Apex",
    title: "Stateful batch to total won revenue",
    task: "Brightwell Energy's finance team wants a summary of last quarter's won business. Write `OpportunityRollupBatch` implementing `Database.Batchable<SObject>` and `Database.Stateful`.\n- `start`: QueryLocator for Opportunities with IsWon = true and CloseDate = LAST_QUARTER\n- `execute`: add each Amount (treat null as 0) to a running total and count records\n- `finish`: insert one `Batch_Run_Log__c` with Job_Id__c (the job Id), Total_Amount__c and Records_Processed__c\n- The totals must survive across execute chunks",
    starter: "public with sharing class OpportunityRollupBatch implements Database.Batchable<SObject> {\n\n    public Database.QueryLocator start(Database.BatchableContext bc) {\n        // TODO\n        return null;\n    }\n\n    public void execute(Database.BatchableContext bc, List<Opportunity> scope) {\n        // TODO\n    }\n\n    public void finish(Database.BatchableContext bc) {\n        // TODO\n    }\n}\n",
    solution: "public with sharing class OpportunityRollupBatch implements Database.Batchable<SObject>, Database.Stateful {\n    private Decimal totalAmount = 0;\n    private Integer recordsProcessed = 0;\n\n    public Database.QueryLocator start(Database.BatchableContext bc) {\n        return Database.getQueryLocator([\n            SELECT Id, Amount\n            FROM Opportunity\n            WHERE IsWon = true AND CloseDate = LAST_QUARTER\n        ]);\n    }\n\n    public void execute(Database.BatchableContext bc, List<Opportunity> scope) {\n        for (Opportunity opp : scope) {\n            totalAmount += opp.Amount == null ? 0 : opp.Amount;\n            recordsProcessed++;\n        }\n    }\n\n    public void finish(Database.BatchableContext bc) {\n        insert new Batch_Run_Log__c(\n            Job_Id__c = bc.getJobId(),\n            Total_Amount__c = totalAmount,\n            Records_Processed__c = recordsProcessed\n        );\n    }\n}\n",
    checks: [
      {
        re: /implements\s+Database\.Batchable<\s*SObject\s*>\s*,\s*Database\.Stateful|implements\s+Database\.Stateful\s*,\s*Database\.Batchable/i,
        msg: "Implements Database.Batchable<SObject> and Database.Stateful"
      },
      {
        re: /Database\.QueryLocator\s+start\s*\(\s*Database\.BatchableContext\s+\w+\s*\)/i,
        msg: "start returns a Database.QueryLocator"
      },
      {
        re: /Database\.getQueryLocator\s*\(/i,
        msg: "Uses Database.getQueryLocator"
      },
      {
        re: /LAST_QUARTER/i,
        msg: "Filters on CloseDate = LAST_QUARTER"
      },
      {
        re: /Batch_Run_Log__c/i,
        msg: "Writes a Batch_Run_Log__c in finish"
      }
    ],
    forbid: [
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i,
        msg: "No SOQL inside a loop"
      }
    ],
    hints: [
      "Without Database.Stateful, instance variables reset for every execute chunk.",
      "Write the log once in finish(), using bc.getJobId()."
    ],
    ai: "Check totals are instance variables preserved via Database.Stateful, null Amounts are treated as zero, and exactly one log record is inserted in finish (not per chunk)."
  },
  {
    id: "AP060",
    track: "apex",
    level: "Medium",
    topic: "Async Apex",
    title: "Chain Queueables to sync invoices in chunks",
    task: "Nimbus Fleet Ltd syncs thousands of invoices. Write `InvoiceSyncJob implements Queueable` with constructor `InvoiceSyncJob(List<Id> invoiceIds)`.\n- Each run processes only the first 50 Ids: set `Invoice__c.Status__c = 'Synced'` and `Synced_On__c = System.now()` (no query needed — build records by Id)\n- If Ids remain, chain a new `InvoiceSyncJob` with the remaining Ids, but only when the Limits class shows a Queueable can still be enqueued\n- One DML per run, user mode; handle a null list",
    starter: "public with sharing class InvoiceSyncJob implements Queueable {\n    private List<Id> invoiceIds;\n\n    public InvoiceSyncJob(List<Id> invoiceIds) {\n        this.invoiceIds = invoiceIds;\n    }\n\n    public void execute(QueueableContext context) {\n        // TODO\n    }\n}\n",
    solution: "public with sharing class InvoiceSyncJob implements Queueable {\n    public static final Integer CHUNK_SIZE = 50;\n    private List<Id> invoiceIds;\n\n    public InvoiceSyncJob(List<Id> invoiceIds) {\n        this.invoiceIds = invoiceIds == null ? new List<Id>() : invoiceIds;\n    }\n\n    public void execute(QueueableContext context) {\n        List<Invoice__c> current = new List<Invoice__c>();\n        List<Id> remaining = new List<Id>();\n        for (Integer i = 0; i < invoiceIds.size(); i++) {\n            if (i < CHUNK_SIZE) {\n                current.add(new Invoice__c(Id = invoiceIds[i], Status__c = 'Synced', Synced_On__c = System.now()));\n            } else {\n                remaining.add(invoiceIds[i]);\n            }\n        }\n        if (!current.isEmpty()) {\n            update as user current;\n        }\n        if (!remaining.isEmpty() && Limits.getQueueableJobs() < Limits.getLimitQueueableJobs()) {\n            System.enqueueJob(new InvoiceSyncJob(remaining));\n        }\n    }\n}\n",
    checks: [
      {
        re: /implements\s+Queueable/i,
        msg: "Implements Queueable"
      },
      {
        re: /\b50\b/,
        msg: "Processes 50 Ids per run"
      },
      {
        re: /System\.enqueueJob\(\s*new\s+InvoiceSyncJob\s*\(/i,
        msg: "Chains a new InvoiceSyncJob"
      },
      {
        re: /Limits\.get(Limit)?QueueableJobs\s*\(\s*\)/i,
        msg: "Checks the Queueable limit before chaining"
      },
      {
        re: /'Synced'/i,
        msg: "Sets Status__c to 'Synced'"
      }
    ],
    forbid: [
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+(as\s+(user|system)\s+)?\w+\s*;/i,
        msg: "No DML inside a loop"
      },
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i,
        msg: "No SOQL inside a loop"
      }
    ],
    hints: [
      "Split the list into \"this chunk\" and \"remaining\" in one loop.",
      "Compare Limits.getQueueableJobs() with Limits.getLimitQueueableJobs() before System.enqueueJob."
    ],
    ai: "Verify only 50 records are updated per run with one DML, the remaining Ids (and only those) are passed to the chained job, and chaining is skipped when the list is exhausted or the limit is reached."
  },
  {
    id: "AP061",
    track: "apex",
    level: "Hard",
    topic: "Async Apex",
    title: "Queueable with a retrying Finalizer",
    task: "Brightwell Energy posts customer payments asynchronously. Write `PaymentPostingJob implements Queueable` with constructor `(Set<Id> paymentIds, Integer attempt)`.\n- execute: attach a Finalizer first, then set Payment__c.Status__c from 'Pending' to 'Posted'\n- Finalizer class `PaymentPostingFinalizer` (inner or top-level) implements `Finalizer`\n- In the finalizer, if the parent job ended with an unhandled exception: insert an `Error_Log__c` (Source__c, Job_Id__c, Message__c max 255 chars, Attempt__c) and re-enqueue `PaymentPostingJob` with attempt + 1, up to a maximum of 3 attempts\n- Do nothing on success",
    starter: "public with sharing class PaymentPostingJob implements Queueable {\n    private Set<Id> paymentIds;\n    private Integer attempt;\n\n    public PaymentPostingJob(Set<Id> paymentIds, Integer attempt) {\n        this.paymentIds = paymentIds;\n        this.attempt = attempt;\n    }\n\n    public void execute(QueueableContext context) {\n        // TODO\n    }\n\n    // TODO: PaymentPostingFinalizer\n}\n",
    solution: "public with sharing class PaymentPostingJob implements Queueable {\n    public static final Integer MAX_ATTEMPTS = 3;\n    private Set<Id> paymentIds;\n    private Integer attempt;\n\n    public PaymentPostingJob(Set<Id> paymentIds, Integer attempt) {\n        this.paymentIds = paymentIds;\n        this.attempt = attempt == null ? 1 : attempt;\n    }\n\n    public void execute(QueueableContext context) {\n        System.attachFinalizer(new PaymentPostingFinalizer(paymentIds, attempt));\n        List<Payment__c> payments = [\n            SELECT Id, Status__c\n            FROM Payment__c\n            WHERE Id IN :paymentIds AND Status__c = 'Pending'\n            WITH USER_MODE\n        ];\n        for (Payment__c p : payments) {\n            p.Status__c = 'Posted';\n        }\n        update as user payments;\n    }\n\n    public class PaymentPostingFinalizer implements Finalizer {\n        private Set<Id> paymentIds;\n        private Integer attempt;\n\n        public PaymentPostingFinalizer(Set<Id> paymentIds, Integer attempt) {\n            this.paymentIds = paymentIds;\n            this.attempt = attempt;\n        }\n\n        public void execute(FinalizerContext ctx) {\n            if (ctx.getResult() != ParentJobResult.UNHANDLED_EXCEPTION) {\n                return;\n            }\n            Exception ex = ctx.getException();\n            String message = ex == null ? 'Unknown error' : ex.getMessage();\n            insert new Error_Log__c(\n                Source__c = 'PaymentPostingJob',\n                Job_Id__c = ctx.getAsyncApexJobId(),\n                Message__c = message.left(255),\n                Attempt__c = attempt\n            );\n            if (attempt < PaymentPostingJob.MAX_ATTEMPTS) {\n                System.enqueueJob(new PaymentPostingJob(paymentIds, attempt + 1));\n            }\n        }\n    }\n}\n",
    checks: [
      {
        re: /System\.attachFinalizer\s*\(/i,
        msg: "Attaches the finalizer with System.attachFinalizer"
      },
      {
        re: /implements\s+(System\.)?Finalizer/i,
        msg: "Finalizer class implements Finalizer"
      },
      {
        re: /void\s+execute\s*\(\s*(System\.)?FinalizerContext\s+\w+\s*\)/i,
        msg: "Finalizer has execute(FinalizerContext)"
      },
      {
        re: /ParentJobResult\.(UNHANDLED_EXCEPTION|SUCCESS)/i,
        msg: "Checks the ParentJobResult"
      },
      {
        re: /System\.enqueueJob\(\s*new\s+PaymentPostingJob\s*\(/i,
        msg: "Re-enqueues PaymentPostingJob on failure"
      },
      {
        re: /Error_Log__c/i,
        msg: "Logs failures to Error_Log__c"
      }
    ],
    forbid: [
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+(as\s+(user|system)\s+)?\w+\s*;/i,
        msg: "No DML inside a loop"
      }
    ],
    hints: [
      "Call System.attachFinalizer at the very start of execute so it is registered even if the work fails.",
      "ctx.getResult(), ctx.getException() and ctx.getAsyncApexJobId() give you everything for the log.",
      "Pass attempt + 1 into the new job and stop once it reaches 3."
    ],
    ai: "Verify the finalizer is attached before the work, retries stop at 3 attempts, the log message is truncated to 255 chars, and nothing is logged or re-enqueued on success."
  },
  {
    id: "AP062",
    track: "apex",
    level: "Hard",
    topic: "Async Apex",
    title: "Batch with partial success and summary email",
    task: "Thames Logistics flags contracts due for renewal. Write `ContractRenewalBatch` (Batchable<SObject> + Stateful).\n- start: Contracts with Status = 'Activated', EndDate = NEXT_N_DAYS:60 and Renewal_Status__c = null\n- execute: set Renewal_Status__c = 'Renewal Due' and update with partial success (one bad record must not fail the chunk)\n- Keep a success count and a map of failed record Id → first error message across chunks\n- finish: email the user who started the job (AsyncApexJob.CreatedBy.Email) a summary: subject with success/failure counts, plain-text body listing each failure",
    starter: "public with sharing class ContractRenewalBatch implements Database.Batchable<SObject>, Database.Stateful {\n\n    public Database.QueryLocator start(Database.BatchableContext bc) {\n        // TODO\n        return null;\n    }\n\n    public void execute(Database.BatchableContext bc, List<Contract> scope) {\n        // TODO\n    }\n\n    public void finish(Database.BatchableContext bc) {\n        // TODO\n    }\n}\n",
    solution: "public with sharing class ContractRenewalBatch implements Database.Batchable<SObject>, Database.Stateful {\n    private Integer successCount = 0;\n    private Map<Id, String> failures = new Map<Id, String>();\n\n    public Database.QueryLocator start(Database.BatchableContext bc) {\n        return Database.getQueryLocator([\n            SELECT Id, EndDate, Status, Renewal_Status__c\n            FROM Contract\n            WHERE Status = 'Activated'\n            AND EndDate = NEXT_N_DAYS:60\n            AND Renewal_Status__c = null\n        ]);\n    }\n\n    public void execute(Database.BatchableContext bc, List<Contract> scope) {\n        for (Contract c : scope) {\n            c.Renewal_Status__c = 'Renewal Due';\n        }\n        List<Database.SaveResult> results = Database.update(scope, false);\n        for (Integer i = 0; i < results.size(); i++) {\n            if (results[i].isSuccess()) {\n                successCount++;\n            } else {\n                failures.put(scope[i].Id, results[i].getErrors()[0].getMessage());\n            }\n        }\n    }\n\n    public void finish(Database.BatchableContext bc) {\n        AsyncApexJob job = [SELECT Id, CreatedBy.Email FROM AsyncApexJob WHERE Id = :bc.getJobId()];\n        String body = 'Contracts flagged for renewal: ' + successCount + '\\n';\n        for (Id contractId : failures.keySet()) {\n            body += contractId + ': ' + failures.get(contractId) + '\\n';\n        }\n        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();\n        mail.setToAddresses(new List<String>{ job.CreatedBy.Email });\n        mail.setSubject('Contract renewal batch: ' + successCount + ' updated, ' + failures.size() + ' failed');\n        mail.setPlainTextBody(body);\n        Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{ mail });\n    }\n}\n",
    checks: [
      {
        re: /Database\.Stateful/i,
        msg: "Implements Database.Stateful"
      },
      {
        re: /Database\.update\s*\(\s*\w+\s*,\s*false/i,
        msg: "Updates with allOrNone = false"
      },
      {
        re: /isSuccess\s*\(\s*\)/i,
        msg: "Inspects each SaveResult"
      },
      {
        re: /getErrors\s*\(\s*\)/i,
        msg: "Captures the error message"
      },
      {
        re: /Messaging\.sendEmail\s*\(/i,
        msg: "Sends the summary email"
      },
      {
        re: /AsyncApexJob/i,
        msg: "Looks up the job submitter via AsyncApexJob"
      }
    ],
    forbid: [
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i,
        msg: "No SOQL inside a loop"
      },
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+(as\s+(user|system)\s+)?\w+\s*;/i,
        msg: "No DML inside a loop"
      }
    ],
    hints: [
      "SaveResults come back in the same order as the input list — use the index to find the record.",
      "Instance variables on a Stateful batch keep their values between execute calls.",
      "Query AsyncApexJob by bc.getJobId() in finish to get CreatedBy.Email."
    ],
    ai: "Verify partial-success DML, correct index mapping between scope and SaveResults, state that accumulates across chunks, and a single email sent in finish containing counts and failure details."
  },
  {
    id: "AP063",
    track: "apex",
    level: "Easy",
    topic: "Integration",
    title: "GET a company from Companies House",
    task: "Nimbus Fleet Ltd verifies new customers against Companies House. Write `CompaniesHouseClient.getCompany(String companyNumber)` returning the raw JSON body.\n- Throw `CompaniesHouseException` (inner custom exception) if companyNumber is blank\n- GET `callout:Companies_House/company/{number}` — URL-encode the trimmed number\n- Timeout 10 seconds\n- 200 → return the body; 404 → return null; any other status → throw CompaniesHouseException with the status code in the message",
    starter: "public with sharing class CompaniesHouseClient {\n    public class CompaniesHouseException extends Exception {}\n\n    public static String getCompany(String companyNumber) {\n        // TODO\n        return null;\n    }\n}\n",
    solution: "public with sharing class CompaniesHouseClient {\n    public class CompaniesHouseException extends Exception {}\n\n    public static String getCompany(String companyNumber) {\n        if (String.isBlank(companyNumber)) {\n            throw new CompaniesHouseException('Company number is required');\n        }\n        HttpRequest req = new HttpRequest();\n        req.setEndpoint('callout:Companies_House/company/' + EncodingUtil.urlEncode(companyNumber.trim(), 'UTF-8'));\n        req.setMethod('GET');\n        req.setTimeout(10000);\n        HttpResponse res = new Http().send(req);\n        Integer status = res.getStatusCode();\n        if (status == 200) {\n            return res.getBody();\n        }\n        if (status == 404) {\n            return null;\n        }\n        throw new CompaniesHouseException('Companies House returned HTTP ' + status);\n    }\n}\n",
    checks: [
      {
        re: /callout:Companies_House/i,
        msg: "Uses the Companies_House Named Credential"
      },
      {
        re: /setMethod\(\s*'GET'\s*\)/i,
        msg: "Sends a GET request"
      },
      {
        re: /EncodingUtil\.urlEncode\s*\(/i,
        msg: "URL-encodes the company number"
      },
      {
        re: /setTimeout\(\s*10000\s*\)/i,
        msg: "Sets a 10 second timeout"
      },
      {
        re: /404/,
        msg: "Handles 404 separately"
      }
    ],
    forbid: [
      {
        re: /setEndpoint\(\s*'https?:/i,
        msg: "Use a Named Credential (callout:...) instead of a hard-coded URL"
      }
    ],
    hints: [
      "Named Credential endpoints start with callout:<Name>.",
      "Read the status code once and branch on 200, 404 and everything else."
    ],
    ai: "Check blank input throws before any callout, 404 returns null, other non-200 statuses throw with the code, and the endpoint uses the Named Credential."
  },
  {
    id: "AP064",
    track: "apex",
    level: "Easy",
    topic: "Integration",
    title: "Parse exchange rates from JSON",
    task: "Brightwell Energy pulls FX rates from a provider that returns:\n`{\"base\":\"GBP\",\"date\":\"2026-10-01\",\"rates\":{\"EUR\":1.17,\"usd\":1.27,\"JPY\":null}}`\nWrite `ExchangeRateParser.parseRates(String body)` returning `Map<String, Decimal>`.\n- Keys are upper-case currency codes\n- Skip null rates\n- Return an empty map for a blank body or when \"rates\" is missing\n- No callouts — parsing only",
    starter: "public with sharing class ExchangeRateParser {\n\n    public static Map<String, Decimal> parseRates(String body) {\n        // TODO\n        return null;\n    }\n}\n",
    solution: "public with sharing class ExchangeRateParser {\n\n    public static Map<String, Decimal> parseRates(String body) {\n        Map<String, Decimal> rates = new Map<String, Decimal>();\n        if (String.isBlank(body)) {\n            return rates;\n        }\n        Map<String, Object> root = (Map<String, Object>) JSON.deserializeUntyped(body);\n        Object rawRates = root.get('rates');\n        if (!(rawRates instanceof Map<String, Object>)) {\n            return rates;\n        }\n        Map<String, Object> rateMap = (Map<String, Object>) rawRates;\n        for (String code : rateMap.keySet()) {\n            Object value = rateMap.get(code);\n            if (value != null) {\n                rates.put(code.toUpperCase(), Decimal.valueOf(String.valueOf(value)));\n            }\n        }\n        return rates;\n    }\n}\n",
    checks: [
      {
        re: /Map<\s*String\s*,\s*Decimal\s*>\s+parseRates\s*\(\s*String\s+\w+\s*\)/i,
        msg: "Keeps the parseRates signature"
      },
      {
        re: /JSON\.deserialize(Untyped|Strict)?\s*\(/i,
        msg: "Parses the body with the JSON class"
      },
      {
        re: /toUpperCase\s*\(\s*\)/i,
        msg: "Upper-cases currency codes"
      },
      {
        re: /isBlank|==\s*null/i,
        msg: "Guards a blank body"
      }
    ],
    forbid: [
      {
        re: /new\s+Http\s*\(/i,
        msg: "No callout — parsing only"
      }
    ],
    hints: [
      "JSON.deserializeUntyped returns nested Map<String, Object> structures.",
      "Convert numeric values with Decimal.valueOf(String.valueOf(value)) to cope with Integer or Decimal."
    ],
    ai: "Verify blank/missing rates return an empty map, null rates are skipped, keys are upper-cased, and numbers are converted to Decimal safely."
  },
  {
    id: "AP065",
    track: "apex",
    level: "Medium",
    topic: "Integration",
    title: "HttpCalloutMock for a postcode service",
    task: "Thames Logistics has `PostcodeService.lookupRegion(String postcode)`: it GETs a postcode API, returns `result.region` from `{\"result\":{\"region\":\"London\"}}` on 200 and null on 404.\nWrite:\n- `PostcodeMock implements HttpCalloutMock` with constructor `(Integer statusCode, String body)` returning a JSON response\n- `PostcodeServiceTest` with two test methods: success returns 'London'; 404 returns null\nUse Test.setMock, Test.startTest/stopTest and the Assert class.",
    starter: "@IsTest\npublic class PostcodeMock {\n    // TODO\n}\n\n@IsTest\nprivate class PostcodeServiceTest {\n    // TODO\n}\n",
    solution: "@IsTest\npublic class PostcodeMock implements HttpCalloutMock {\n    private Integer statusCode;\n    private String body;\n\n    public PostcodeMock(Integer statusCode, String body) {\n        this.statusCode = statusCode;\n        this.body = body;\n    }\n\n    public HttpResponse respond(HttpRequest req) {\n        HttpResponse res = new HttpResponse();\n        res.setStatusCode(statusCode);\n        res.setHeader('Content-Type', 'application/json');\n        res.setBody(body);\n        return res;\n    }\n}\n\n@IsTest\nprivate class PostcodeServiceTest {\n\n    @IsTest\n    static void returnsRegionOnSuccess() {\n        Test.setMock(HttpCalloutMock.class, new PostcodeMock(200, '{\"result\":{\"region\":\"London\"}}'));\n        Test.startTest();\n        String region = PostcodeService.lookupRegion('SW1A 1AA');\n        Test.stopTest();\n        Assert.areEqual('London', region, 'Region should be read from result.region');\n    }\n\n    @IsTest\n    static void returnsNullWhenNotFound() {\n        Test.setMock(HttpCalloutMock.class, new PostcodeMock(404, '{\"error\":\"Postcode not found\"}'));\n        Test.startTest();\n        String region = PostcodeService.lookupRegion('ZZ1 1ZZ');\n        Test.stopTest();\n        Assert.isNull(region, 'Unknown postcodes should return null');\n    }\n}\n",
    checks: [
      {
        re: /implements\s+HttpCalloutMock/i,
        msg: "Mock implements HttpCalloutMock"
      },
      {
        re: /HttpResponse\s+respond\s*\(\s*HttpRequest\s+\w+\s*\)/i,
        msg: "Implements respond(HttpRequest)"
      },
      {
        re: /Test\.setMock\(\s*HttpCalloutMock\.class/i,
        msg: "Registers the mock with Test.setMock"
      },
      {
        re: /Assert\.(areEqual|isNull)\s*\(/i,
        msg: "Asserts with the Assert class"
      },
      {
        re: /404/,
        msg: "Covers the 404 path"
      }
    ],
    forbid: [
      {
        re: /System\.assert(Equals|NotEquals)?\s*\(/i,
        msg: "Use the Assert class (Assert.areEqual, Assert.isTrue, ...) instead of System.assert"
      }
    ],
    hints: [
      "A configurable mock lets one class serve both the success and the 404 test.",
      "Call Test.setMock before the code under test makes its callout."
    ],
    ai: "Verify both success and not-found paths are tested with meaningful assertions, the mock is reusable via its constructor, and Test.setMock is used correctly."
  },
  {
    id: "AP066",
    track: "apex",
    level: "Medium",
    topic: "Integration",
    title: "POST meter readings as JSON",
    task: "Brightwell Energy sends smart-meter readings to its billing platform. Write `MeterReadingPublisher.send(List<Meter_Reading__c> readings)` returning Boolean.\n- Map each record to a wrapper `{meterId (Meter_Id__c), kwh (Kwh__c), readAt (Read_At__c)}`\n- POST `{\"readings\":[...]}` to `callout:Brightwell_Meter/readings` with Content-Type application/json and a 20 second timeout\n- Return true for 200 or 201, false for other statuses\n- Catch CalloutException (log it, return false); return false for null/empty input",
    starter: "public with sharing class MeterReadingPublisher {\n\n    public static Boolean send(List<Meter_Reading__c> readings) {\n        // TODO\n        return false;\n    }\n}\n",
    solution: "public with sharing class MeterReadingPublisher {\n\n    public class Reading {\n        public String meterId;\n        public Decimal kwh;\n        public Datetime readAt;\n\n        public Reading(Meter_Reading__c r) {\n            meterId = r.Meter_Id__c;\n            kwh = r.Kwh__c;\n            readAt = r.Read_At__c;\n        }\n    }\n\n    public static Boolean send(List<Meter_Reading__c> readings) {\n        if (readings == null || readings.isEmpty()) {\n            return false;\n        }\n        List<Reading> payload = new List<Reading>();\n        for (Meter_Reading__c r : readings) {\n            payload.add(new Reading(r));\n        }\n        HttpRequest req = new HttpRequest();\n        req.setEndpoint('callout:Brightwell_Meter/readings');\n        req.setMethod('POST');\n        req.setHeader('Content-Type', 'application/json');\n        req.setTimeout(20000);\n        req.setBody(JSON.serialize(new Map<String, Object>{ 'readings' => payload }));\n        try {\n            HttpResponse res = new Http().send(req);\n            return res.getStatusCode() == 200 || res.getStatusCode() == 201;\n        } catch (CalloutException e) {\n            System.debug(LoggingLevel.ERROR, 'Meter reading callout failed: ' + e.getMessage());\n            return false;\n        }\n    }\n}\n",
    checks: [
      {
        re: /callout:Brightwell_Meter/i,
        msg: "Uses the Brightwell_Meter Named Credential"
      },
      {
        re: /setMethod\(\s*'POST'\s*\)/i,
        msg: "Sends a POST"
      },
      {
        re: /Content-Type'\s*,\s*'application\/json/i,
        msg: "Sets the JSON Content-Type header"
      },
      {
        re: /setTimeout\(\s*20000\s*\)/i,
        msg: "Sets a 20 second timeout"
      },
      {
        re: /JSON\.serialize\s*\(/i,
        msg: "Serialises the payload"
      },
      {
        re: /catch\s*\(\s*(System\.)?CalloutException/i,
        msg: "Catches CalloutException"
      }
    ],
    forbid: [
      {
        re: /setEndpoint\(\s*'https?:/i,
        msg: "Use a Named Credential (callout:...) instead of a hard-coded URL"
      }
    ],
    hints: [
      "An inner wrapper class gives you clean JSON property names.",
      "Wrap the \"readings\" list in a Map so the root is an object, not an array."
    ],
    ai: "Verify the JSON shape is {\"readings\":[...]} with the required property names, only 200/201 count as success, and callout exceptions are handled without being swallowed silently."
  },
  {
    id: "AP067",
    track: "apex",
    level: "Hard",
    topic: "Integration",
    title: "Retry transient callout failures",
    task: "Nimbus Fleet's telematics API is flaky. Write `ResilientHttpClient.send(HttpRequest req, Integer maxAttempts)` returning HttpResponse.\n- Retry when the status is 5xx or 429, or a CalloutException is thrown\n- Return immediately on any other status (including 4xx)\n- maxAttempts null or < 1 → 1 attempt; cap at 5\n- Stop early if the transaction's callout limit is reached (Limits class)\n- After exhausting attempts throw `RetryExhaustedException` (inner) with the attempt count and last error\n(Apex can't sleep — retries are immediate.)",
    starter: "public with sharing class ResilientHttpClient {\n    public class RetryExhaustedException extends Exception {}\n\n    public static HttpResponse send(HttpRequest req, Integer maxAttempts) {\n        // TODO\n        return null;\n    }\n}\n",
    solution: "public with sharing class ResilientHttpClient {\n    public class RetryExhaustedException extends Exception {}\n    private static final Integer MAX_CAP = 5;\n\n    public static HttpResponse send(HttpRequest req, Integer maxAttempts) {\n        Integer attempts = (maxAttempts == null || maxAttempts < 1) ? 1 : Math.min(maxAttempts, MAX_CAP);\n        String lastError = 'no attempt made';\n        Integer made = 0;\n        for (Integer attempt = 1; attempt <= attempts; attempt++) {\n            if (Limits.getCallouts() >= Limits.getLimitCallouts()) {\n                lastError = 'callout limit reached';\n                break;\n            }\n            made++;\n            try {\n                HttpResponse res = new Http().send(req);\n                Integer status = res.getStatusCode();\n                if (status < 500 && status != 429) {\n                    return res;\n                }\n                lastError = 'HTTP ' + status;\n            } catch (CalloutException e) {\n                lastError = e.getMessage();\n            }\n        }\n        throw new RetryExhaustedException('Request failed after ' + made + ' attempt(s): ' + lastError);\n    }\n}\n",
    checks: [
      {
        re: /\b(for|while|do)\b/i,
        msg: "Loops over attempts"
      },
      {
        re: /catch\s*\(\s*(System\.)?CalloutException/i,
        msg: "Retries on CalloutException"
      },
      {
        re: /500/,
        msg: "Treats 5xx as retryable"
      },
      {
        re: /429/,
        msg: "Treats 429 as retryable"
      },
      {
        re: /Limits\.get(Limit)?Callouts\s*\(\s*\)/i,
        msg: "Checks the callout limit"
      },
      {
        re: /throw\s+new\s+RetryExhaustedException/i,
        msg: "Throws RetryExhaustedException when attempts run out"
      }
    ],
    forbid: [],
    hints: [
      "Clamp maxAttempts first: Math.min(Math.max(...), 5).",
      "Return as soon as you get a non-retryable status; remember the last error for the exception message."
    ],
    ai: "Verify 4xx (except 429) returns without retry, 5xx/429/CalloutException retry up to the clamped maximum, the callout governor limit is respected, and the final exception includes useful context."
  },
  {
    id: "AP068",
    track: "apex",
    level: "Hard",
    topic: "Integration",
    title: "Follow paginated API responses",
    task: "Nimbus Fleet Ltd fetches vehicle telemetry from `callout:Nimbus_Telematics`. The first page is `/vehicles`; each response looks like `{\"records\":[{...}],\"nextPage\":\"/vehicles?page=2\"}` and nextPage is null on the last page.\nWrite `VehicleTelemetryClient.fetchAll()` returning `List<Map<String, Object>>` with every record.\n- Append nextPage to the Named Credential to get the next URL\n- Stop after at most 10 pages (constant)\n- Any non-200 → throw `TelemetryException` (inner) naming the page number and status\n- Treat a missing \"records\" key as an empty page",
    starter: "public with sharing class VehicleTelemetryClient {\n    public class TelemetryException extends Exception {}\n\n    public static List<Map<String, Object>> fetchAll() {\n        // TODO\n        return null;\n    }\n}\n",
    solution: "public with sharing class VehicleTelemetryClient {\n    public class TelemetryException extends Exception {}\n    public static final Integer MAX_PAGES = 10;\n\n    public static List<Map<String, Object>> fetchAll() {\n        List<Map<String, Object>> results = new List<Map<String, Object>>();\n        String path = '/vehicles';\n        Integer pages = 0;\n        while (String.isNotBlank(path) && pages < MAX_PAGES) {\n            HttpRequest req = new HttpRequest();\n            req.setEndpoint('callout:Nimbus_Telematics' + path);\n            req.setMethod('GET');\n            req.setTimeout(30000);\n            HttpResponse res = new Http().send(req);\n            pages++;\n            if (res.getStatusCode() != 200) {\n                throw new TelemetryException('Page ' + pages + ' failed with HTTP ' + res.getStatusCode());\n            }\n            Map<String, Object> body = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());\n            List<Object> records = (List<Object>) body.get('records');\n            if (records != null) {\n                for (Object rec : records) {\n                    results.add((Map<String, Object>) rec);\n                }\n            }\n            Object next = body.get('nextPage');\n            path = next == null ? null : String.valueOf(next);\n        }\n        return results;\n    }\n}\n",
    checks: [
      {
        re: /\b(while|do|for)\b/i,
        msg: "Loops over pages"
      },
      {
        re: /nextPage/i,
        msg: "Follows the nextPage link"
      },
      {
        re: /\b10\b/,
        msg: "Caps the number of pages at 10"
      },
      {
        re: /callout:Nimbus_Telematics/i,
        msg: "Uses the Nimbus_Telematics Named Credential"
      },
      {
        re: /JSON\.deserialize(Untyped)?\s*\(/i,
        msg: "Parses each page as JSON"
      },
      {
        re: /throw\s+new\s+TelemetryException/i,
        msg: "Throws TelemetryException on a failed page"
      }
    ],
    forbid: [
      {
        re: /setEndpoint\(\s*'https?:/i,
        msg: "Use a Named Credential (callout:...) instead of a hard-coded URL"
      }
    ],
    hints: [
      "Keep a \"current path\" variable; loop while it is not blank and you are under the page cap.",
      "Each callout counts towards the 100-callout limit — the page cap protects you."
    ],
    ai: "Verify the loop terminates on a null nextPage or after 10 pages, all records from all pages are aggregated, and failures identify the page that failed."
  },
  {
    id: "AP069",
    track: "apex",
    level: "Easy",
    topic: "REST & Invocable",
    title: "REST GET account by fleet number",
    task: "Nimbus Fleet's driver app looks up customers by fleet number. Create `FleetAccountResource` exposed at `/fleet/accounts/*`.\n- `@HttpGet global static AccountDTO getAccount()` reads the fleet number from the last URI segment\n- Query Account where Fleet_Number__c matches (user mode)\n- Return an inner `AccountDTO` {id, name, fleetNumber, annualRevenue}\n- Blank number → status 400, not found → status 404 (return null in both cases)",
    starter: "@RestResource(urlMapping='/fleet/accounts/*')\nglobal with sharing class FleetAccountResource {\n\n    global class AccountDTO {\n        global String id;\n        global String name;\n        global String fleetNumber;\n        global Decimal annualRevenue;\n    }\n\n    // TODO: getAccount\n}\n",
    solution: "@RestResource(urlMapping='/fleet/accounts/*')\nglobal with sharing class FleetAccountResource {\n\n    global class AccountDTO {\n        global String id;\n        global String name;\n        global String fleetNumber;\n        global Decimal annualRevenue;\n    }\n\n    @HttpGet\n    global static AccountDTO getAccount() {\n        RestRequest req = RestContext.request;\n        RestResponse res = RestContext.response;\n        String fleetNumber = req.requestURI.substringAfterLast('/');\n        if (String.isBlank(fleetNumber)) {\n            res.statusCode = 400;\n            return null;\n        }\n        List<Account> accounts = [\n            SELECT Id, Name, Fleet_Number__c, AnnualRevenue\n            FROM Account\n            WHERE Fleet_Number__c = :fleetNumber\n            WITH USER_MODE\n            LIMIT 1\n        ];\n        if (accounts.isEmpty()) {\n            res.statusCode = 404;\n            return null;\n        }\n        AccountDTO dto = new AccountDTO();\n        dto.id = accounts[0].Id;\n        dto.name = accounts[0].Name;\n        dto.fleetNumber = accounts[0].Fleet_Number__c;\n        dto.annualRevenue = accounts[0].AnnualRevenue;\n        return dto;\n    }\n}\n",
    checks: [
      {
        re: /@HttpGet/i,
        msg: "Annotated @HttpGet"
      },
      {
        re: /global\s+static\s+AccountDTO\s+getAccount\s*\(\s*\)/i,
        msg: "Signature: global static AccountDTO getAccount()"
      },
      {
        re: /RestContext\.request/i,
        msg: "Reads the request from RestContext"
      },
      {
        re: /statusCode\s*=\s*404/i,
        msg: "Returns 404 when not found"
      },
      {
        re: /statusCode\s*=\s*400/i,
        msg: "Returns 400 for a blank fleet number"
      }
    ],
    forbid: [],
    hints: [
      "RestContext.request.requestURI.substringAfterLast('/') gives the last path segment.",
      "Query into a List and check isEmpty() instead of risking a QueryException."
    ],
    ai: "Verify the lookup uses a bind variable, user-mode SOQL, a List with isEmpty() (no QueryException on miss), and that 400/404 are set correctly."
  },
  {
    id: "AP070",
    track: "apex",
    level: "Easy",
    topic: "REST & Invocable",
    title: "Invocable: open case count per account",
    task: "Thames Logistics' service Flow shows how many open cases a customer has. Write `OpenCaseCountAction.getOpenCaseCounts(List<Id> accountIds)` as an invocable method returning `List<Integer>`.\n- Give it a label and description\n- One output per input, in the same order (0 when an account has no open cases)\n- Use a single aggregate query (COUNT + GROUP BY), user mode\n- Works for many Flow interviews in one transaction",
    starter: "public with sharing class OpenCaseCountAction {\n\n    public static List<Integer> getOpenCaseCounts(List<Id> accountIds) {\n        // TODO\n        return null;\n    }\n}\n",
    solution: "public with sharing class OpenCaseCountAction {\n\n    @InvocableMethod(label='Get Open Case Count' description='Returns the number of open cases for each account' category='Service')\n    public static List<Integer> getOpenCaseCounts(List<Id> accountIds) {\n        Map<Id, Integer> counts = new Map<Id, Integer>();\n        for (AggregateResult ar : [\n            SELECT AccountId accId, COUNT(Id) total\n            FROM Case\n            WHERE AccountId IN :accountIds AND IsClosed = false\n            WITH USER_MODE\n            GROUP BY AccountId\n        ]) {\n            counts.put((Id) ar.get('accId'), (Integer) ar.get('total'));\n        }\n        List<Integer> results = new List<Integer>();\n        for (Id accId : accountIds) {\n            results.add(counts.containsKey(accId) ? counts.get(accId) : 0);\n        }\n        return results;\n    }\n}\n",
    checks: [
      {
        re: /@InvocableMethod\s*\([^)]*label\s*=/i,
        msg: "@InvocableMethod with a label"
      },
      {
        re: /List<\s*Integer\s*>\s+getOpenCaseCounts\s*\(\s*List<\s*Id\s*>\s+\w+\s*\)/i,
        msg: "Keeps the required signature"
      },
      {
        re: /COUNT\s*\(/i,
        msg: "Uses an aggregate COUNT"
      },
      {
        re: /GROUP\s+BY\s+AccountId/i,
        msg: "Groups by AccountId"
      },
      {
        re: /IsClosed\s*=\s*false/i,
        msg: "Counts only open cases"
      }
    ],
    forbid: [
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i,
        msg: "No SOQL inside a loop"
      }
    ],
    hints: [
      "Invocable methods receive a list — one element per Flow interview.",
      "Build a Map<Id, Integer> from AggregateResult, then loop the inputs to keep the order."
    ],
    ai: "Verify output order matches input order, accounts with no cases return 0, and only one SOQL query is used regardless of input size."
  },
  {
    id: "AP071",
    track: "apex",
    level: "Medium",
    topic: "REST & Invocable",
    title: "REST POST to capture web leads",
    task: "Brightwell Energy's website posts quote requests to Salesforce. Create `LeadIntakeResource` at `/leads/intake` with `@HttpPost global static LeadResponse createLead()`.\n- Body JSON: {firstName, lastName, company, email, source}\n- Invalid JSON or missing lastName/company/email → status 400 with an error message\n- Insert the Lead in user mode; LeadSource = source or 'Web' if blank\n- Success → status 201 and `LeadResponse` {id, error=null}",
    starter: "@RestResource(urlMapping='/leads/intake')\nglobal with sharing class LeadIntakeResource {\n\n    global class LeadRequest {\n        global String firstName;\n        global String lastName;\n        global String company;\n        global String email;\n        global String source;\n    }\n\n    global class LeadResponse {\n        global String id;\n        global String error;\n    }\n\n    // TODO: createLead\n}\n",
    solution: "@RestResource(urlMapping='/leads/intake')\nglobal with sharing class LeadIntakeResource {\n\n    global class LeadRequest {\n        global String firstName;\n        global String lastName;\n        global String company;\n        global String email;\n        global String source;\n    }\n\n    global class LeadResponse {\n        global String id;\n        global String error;\n    }\n\n    @HttpPost\n    global static LeadResponse createLead() {\n        RestResponse res = RestContext.response;\n        LeadRequest body;\n        try {\n            body = (LeadRequest) JSON.deserialize(RestContext.request.requestBody.toString(), LeadRequest.class);\n        } catch (JSONException e) {\n            return fail(res, 'Invalid JSON body');\n        }\n        if (body == null || String.isBlank(body.lastName) || String.isBlank(body.company) || String.isBlank(body.email)) {\n            return fail(res, 'lastName, company and email are required');\n        }\n        Lead newLead = new Lead(\n            FirstName = body.firstName,\n            LastName = body.lastName,\n            Company = body.company,\n            Email = body.email,\n            LeadSource = String.isBlank(body.source) ? 'Web' : body.source\n        );\n        insert as user newLead;\n        res.statusCode = 201;\n        LeadResponse out = new LeadResponse();\n        out.id = newLead.Id;\n        return out;\n    }\n\n    private static LeadResponse fail(RestResponse res, String message) {\n        res.statusCode = 400;\n        LeadResponse out = new LeadResponse();\n        out.error = message;\n        return out;\n    }\n}\n",
    checks: [
      {
        re: /@HttpPost/i,
        msg: "Annotated @HttpPost"
      },
      {
        re: /JSON\.deserialize|requestBody/i,
        msg: "Reads the JSON request body"
      },
      {
        re: /statusCode\s*=\s*201/i,
        msg: "Returns 201 on success"
      },
      {
        re: /statusCode\s*=\s*400/i,
        msg: "Returns 400 on bad input"
      },
      {
        re: /'Web'/i,
        msg: "Defaults LeadSource to 'Web'"
      },
      {
        re: /\binsert\b|Database\.insert/i,
        msg: "Inserts the Lead"
      }
    ],
    forbid: [],
    hints: [
      "Deserialize RestContext.request.requestBody.toString() into LeadRequest.class inside a try/catch.",
      "Set RestContext.response.statusCode before returning."
    ],
    ai: "Verify malformed JSON and each missing required field produce 400 with a clear error, the insert respects user permissions, and a successful call returns 201 with the new Id."
  },
  {
    id: "AP072",
    track: "apex",
    level: "Medium",
    topic: "REST & Invocable",
    title: "Agentforce action: get order status",
    task: "Thames Logistics' Agentforce service agent needs an action to check orders. Write `GetOrderStatusAction`:\n- Inner `Request` with `@InvocableVariable` orderNumber (required, with label + description)\n- Inner `Response` with found (Boolean), status (String), expectedDelivery (Date — Order.Expected_Delivery__c), each with label + description\n- `@InvocableMethod` with a clear label and description (the agent uses it to pick the action) returning `List<Response>` for `List<Request>`\n- One query for all requests (user mode); one response per request in order; unknown/blank numbers → found = false",
    starter: "public with sharing class GetOrderStatusAction {\n\n    public class Request {\n        public String orderNumber;\n    }\n\n    public class Response {\n        public Boolean found;\n        public String status;\n        public Date expectedDelivery;\n    }\n\n    public static List<Response> getStatus(List<Request> requests) {\n        // TODO\n        return null;\n    }\n}\n",
    solution: "public with sharing class GetOrderStatusAction {\n\n    public class Request {\n        @InvocableVariable(label='Order Number' description='The customer order number, for example 00000123' required=true)\n        public String orderNumber;\n    }\n\n    public class Response {\n        @InvocableVariable(label='Found' description='True when an order with this number exists')\n        public Boolean found;\n        @InvocableVariable(label='Status' description='Current status of the order')\n        public String status;\n        @InvocableVariable(label='Expected Delivery' description='Date the order is expected to be delivered')\n        public Date expectedDelivery;\n    }\n\n    @InvocableMethod(label='Get Order Status' description='Looks up the current status and expected delivery date of a customer order by its order number' category='Orders')\n    public static List<Response> getStatus(List<Request> requests) {\n        Set<String> numbers = new Set<String>();\n        for (Request r : requests) {\n            if (r != null && String.isNotBlank(r.orderNumber)) {\n                numbers.add(r.orderNumber.trim());\n            }\n        }\n        Map<String, Order> byNumber = new Map<String, Order>();\n        for (Order o : [\n            SELECT OrderNumber, Status, Expected_Delivery__c\n            FROM Order\n            WHERE OrderNumber IN :numbers\n            WITH USER_MODE\n        ]) {\n            byNumber.put(o.OrderNumber, o);\n        }\n        List<Response> responses = new List<Response>();\n        for (Request r : requests) {\n            Response resp = new Response();\n            Order o = (r == null || String.isBlank(r.orderNumber)) ? null : byNumber.get(r.orderNumber.trim());\n            resp.found = o != null;\n            if (o != null) {\n                resp.status = o.Status;\n                resp.expectedDelivery = o.Expected_Delivery__c;\n            }\n            responses.add(resp);\n        }\n        return responses;\n    }\n}\n",
    checks: [
      {
        re: /@InvocableMethod\s*\([^)]*description\s*=/i,
        msg: "@InvocableMethod with a description"
      },
      {
        re: /@InvocableVariable\s*\([^)]*required\s*=\s*true/i,
        msg: "orderNumber is a required @InvocableVariable"
      },
      {
        re: /@InvocableVariable[\s\S]*@InvocableVariable[\s\S]*@InvocableVariable[\s\S]*@InvocableVariable/i,
        msg: "All request and response fields are @InvocableVariable"
      },
      {
        re: /List<\s*Response\s*>\s+\w+\s*\(\s*List<\s*Request\s*>\s+\w+\s*\)/i,
        msg: "Signature List<Response> method(List<Request>)"
      },
      {
        re: /OrderNumber\s+IN\s*:/i,
        msg: "Queries all order numbers at once"
      }
    ],
    forbid: [
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i,
        msg: "No SOQL inside a loop"
      }
    ],
    hints: [
      "Agentforce uses the label and description to decide when to call an action — make them descriptive.",
      "Collect order numbers into a Set, query once, then map results back."
    ],
    ai: "Verify the action is bulk-safe (single query), returns exactly one response per request in order, handles blank/unknown numbers with found=false, and that labels/descriptions are meaningful for an agent."
  },
  {
    id: "AP073",
    track: "apex",
    level: "Hard",
    topic: "REST & Invocable",
    title: "REST PATCH with a field allowlist",
    task: "Nimbus Fleet's customer portal updates contact details. Create `ContactPatchResource` at `/contacts/*` with `@HttpPatch global static void patchContact()`.\n- Contact Id is the last URI segment; invalid Id or not a Contact Id → 400\n- Body is a JSON object; only keys phone, email, mailingCity (case-insensitive) may be updated; any other key → 400 listing the rejected keys\n- Contact not visible to the user → 404\n- Update in user mode; respond 200 with JSON {\"id\": ..., \"updated\": [keys]}\n- Always write a JSON responseBody",
    starter: "@RestResource(urlMapping='/contacts/*')\nglobal with sharing class ContactPatchResource {\n\n    @HttpPatch\n    global static void patchContact() {\n        // TODO\n    }\n}\n",
    solution: "@RestResource(urlMapping='/contacts/*')\nglobal with sharing class ContactPatchResource {\n\n    private static final Map<String, Schema.SObjectField> ALLOWED = new Map<String, Schema.SObjectField>{\n        'phone' => Contact.Phone,\n        'email' => Contact.Email,\n        'mailingcity' => Contact.MailingCity\n    };\n\n    @HttpPatch\n    global static void patchContact() {\n        Id contactId;\n        try {\n            contactId = Id.valueOf(RestContext.request.requestURI.substringAfterLast('/'));\n        } catch (Exception e) {\n            respond(400, new Map<String, Object>{ 'error' => 'Invalid contact Id' });\n            return;\n        }\n        if (contactId.getSObjectType() != Contact.SObjectType) {\n            respond(400, new Map<String, Object>{ 'error' => 'Id is not a Contact Id' });\n            return;\n        }\n        Map<String, Object> body;\n        try {\n            body = (Map<String, Object>) JSON.deserializeUntyped(RestContext.request.requestBody.toString());\n        } catch (Exception e) {\n            respond(400, new Map<String, Object>{ 'error' => 'Body must be a JSON object' });\n            return;\n        }\n        if (body == null || body.isEmpty()) {\n            respond(400, new Map<String, Object>{ 'error' => 'Nothing to update' });\n            return;\n        }\n        List<String> rejected = new List<String>();\n        Contact c = new Contact(Id = contactId);\n        for (String key : body.keySet()) {\n            Schema.SObjectField field = ALLOWED.get(key.toLowerCase());\n            if (field == null) {\n                rejected.add(key);\n            } else {\n                c.put(field, body.get(key));\n            }\n        }\n        if (!rejected.isEmpty()) {\n            respond(400, new Map<String, Object>{ 'error' => 'Fields not allowed', 'fields' => rejected });\n            return;\n        }\n        List<Contact> existing = [SELECT Id FROM Contact WHERE Id = :contactId WITH USER_MODE LIMIT 1];\n        if (existing.isEmpty()) {\n            respond(404, new Map<String, Object>{ 'error' => 'Contact not found' });\n            return;\n        }\n        Database.update(c, true, AccessLevel.USER_MODE);\n        respond(200, new Map<String, Object>{ 'id' => contactId, 'updated' => new List<String>(body.keySet()) });\n    }\n\n    private static void respond(Integer statusCode, Map<String, Object> payload) {\n        RestResponse res = RestContext.response;\n        res.statusCode = statusCode;\n        res.addHeader('Content-Type', 'application/json');\n        res.responseBody = Blob.valueOf(JSON.serialize(payload));\n    }\n}\n",
    checks: [
      {
        re: /@HttpPatch/i,
        msg: "Annotated @HttpPatch"
      },
      {
        re: /JSON\.deserializeUntyped\s*\(/i,
        msg: "Parses the body as an untyped JSON object"
      },
      {
        re: /MailingCity/i,
        msg: "Allowlists MailingCity (plus phone and email)"
      },
      {
        re: /404/,
        msg: "Returns 404 for an unknown contact"
      },
      {
        re: /AccessLevel\.USER_MODE|update\s+as\s+user/i,
        msg: "Updates in user mode"
      },
      {
        re: /responseBody\s*=/i,
        msg: "Writes a JSON responseBody"
      }
    ],
    forbid: [
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i,
        msg: "No SOQL inside a loop"
      }
    ],
    hints: [
      "Map lower-cased JSON keys to Schema.SObjectField tokens, then use sObject.put(field, value).",
      "Id.valueOf throws on bad input — catch it; compare getSObjectType() with Contact.SObjectType.",
      "A small respond(status, payload) helper keeps every exit path consistent."
    ],
    ai: "Verify unknown keys are rejected (not silently ignored), the allowlist is case-insensitive, the Id is validated as a Contact Id, 404 is returned for inaccessible records, and the update respects FLS via user mode."
  },
  {
    id: "AP074",
    track: "apex",
    level: "Hard",
    topic: "REST & Invocable",
    title: "Agentforce action with per-request errors",
    task: "Brightwell Energy's agent books engineer visits. Write `CreateAppointmentRequestAction` with an `@InvocableMethod` that creates `Appointment_Request__c` (Account__c, Preferred_Date__c, Notes__c).\n- Request: accountId (required), preferredDate (required), notes\n- Response: success, recordId, errorMessage — one per request, same order\n- Validate before DML: missing account or a date before today → error, no insert for that request\n- Insert valid rows in ONE partial-success DML in user mode and map each SaveResult back to its request\n- All variables need labels/descriptions for the agent",
    starter: "public with sharing class CreateAppointmentRequestAction {\n\n    public class Request {\n        public Id accountId;\n        public Date preferredDate;\n        public String notes;\n    }\n\n    public class Response {\n        public Boolean success;\n        public Id recordId;\n        public String errorMessage;\n    }\n\n    public static List<Response> create(List<Request> requests) {\n        // TODO\n        return null;\n    }\n}\n",
    solution: "public with sharing class CreateAppointmentRequestAction {\n\n    public class Request {\n        @InvocableVariable(label='Account Id' description='Customer account the visit is for' required=true)\n        public Id accountId;\n        @InvocableVariable(label='Preferred Date' description='Date the customer would like the engineer to visit; today or later' required=true)\n        public Date preferredDate;\n        @InvocableVariable(label='Notes' description='Any access instructions or details about the fault')\n        public String notes;\n    }\n\n    public class Response {\n        @InvocableVariable(label='Success' description='True when the request was created')\n        public Boolean success;\n        @InvocableVariable(label='Record Id' description='Id of the created appointment request')\n        public Id recordId;\n        @InvocableVariable(label='Error Message' description='Why the request could not be created')\n        public String errorMessage;\n    }\n\n    @InvocableMethod(label='Create Appointment Request' description='Creates an engineer appointment request for a customer and returns the outcome for each request' category='Service')\n    public static List<Response> create(List<Request> requests) {\n        List<Response> responses = new List<Response>();\n        List<Appointment_Request__c> toInsert = new List<Appointment_Request__c>();\n        List<Integer> positions = new List<Integer>();\n        Date today = Date.today();\n\n        for (Integer i = 0; i < requests.size(); i++) {\n            Request req = requests[i];\n            Response resp = new Response();\n            resp.success = false;\n            responses.add(resp);\n            if (req == null || req.accountId == null) {\n                resp.errorMessage = 'An account is required.';\n                continue;\n            }\n            if (req.preferredDate == null || req.preferredDate < today) {\n                resp.errorMessage = 'The preferred date must be today or later.';\n                continue;\n            }\n            toInsert.add(new Appointment_Request__c(\n                Account__c = req.accountId,\n                Preferred_Date__c = req.preferredDate,\n                Notes__c = req.notes\n            ));\n            positions.add(i);\n        }\n\n        if (!toInsert.isEmpty()) {\n            List<Database.SaveResult> results = Database.insert(toInsert, false, AccessLevel.USER_MODE);\n            for (Integer j = 0; j < results.size(); j++) {\n                Response resp = responses[positions[j]];\n                if (results[j].isSuccess()) {\n                    resp.success = true;\n                    resp.recordId = results[j].getId();\n                } else {\n                    resp.errorMessage = results[j].getErrors()[0].getMessage();\n                }\n            }\n        }\n        return responses;\n    }\n}\n",
    checks: [
      {
        re: /@InvocableMethod\s*\([^)]*description\s*=/i,
        msg: "@InvocableMethod with a description"
      },
      {
        re: /@InvocableVariable\s*\([^)]*description\s*=/i,
        msg: "@InvocableVariable fields have descriptions"
      },
      {
        re: /Database\.insert\s*\([^;]*false/i,
        msg: "Inserts with allOrNone = false"
      },
      {
        re: /isSuccess\s*\(\s*\)/i,
        msg: "Maps each SaveResult back"
      },
      {
        re: /Date\.today\s*\(\s*\)/i,
        msg: "Rejects dates before today"
      }
    ],
    forbid: [
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+(as\s+(user|system)\s+)?\w+\s*;/i,
        msg: "No DML inside a loop"
      },
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i,
        msg: "No SOQL inside a loop"
      }
    ],
    hints: [
      "Create every Response up front so the output order always matches the input.",
      "Keep a parallel list of input positions for the rows you actually insert.",
      "Database.insert(records, false, AccessLevel.USER_MODE) gives partial success in user mode."
    ],
    ai: "Verify each request gets exactly one response in order, invalid requests never reach DML, SaveResults are mapped to the correct request index, and only one DML statement is used."
  },
  {
    id: "AP075",
    track: "apex",
    level: "Easy",
    topic: "Testing",
    title: "Test class with @TestSetup",
    task: "Thames Logistics has `AccountTierService.assignTier(List<Account> accounts)`: it sets `Tier__c = 'Gold'` when AnnualRevenue >= 5,000,000, otherwise 'Standard' (including null revenue). It does no DML.\nWrite `AccountTierServiceTest`:\n- `@TestSetup` inserting three accounts: one above, one below the threshold, one with no revenue\n- A test that queries them, calls the service between Test.startTest/stopTest and asserts each tier with the Assert class\n- A boundary test for exactly 5,000,000",
    starter: "@IsTest\nprivate class AccountTierServiceTest {\n    // TODO\n}\n",
    solution: "@IsTest\nprivate class AccountTierServiceTest {\n\n    @TestSetup\n    static void setup() {\n        insert new List<Account>{\n            new Account(Name = 'Thames Logistics', AnnualRevenue = 7500000),\n            new Account(Name = 'Corner Bakery Ltd', AnnualRevenue = 120000),\n            new Account(Name = 'Unknown Revenue Ltd')\n        };\n    }\n\n    @IsTest\n    static void assignsGoldAndStandardTiers() {\n        List<Account> accounts = [SELECT Id, Name, AnnualRevenue, Tier__c FROM Account];\n\n        Test.startTest();\n        AccountTierService.assignTier(accounts);\n        Test.stopTest();\n\n        Map<String, String> tierByName = new Map<String, String>();\n        for (Account a : accounts) {\n            tierByName.put(a.Name, a.Tier__c);\n        }\n        Assert.areEqual('Gold', tierByName.get('Thames Logistics'), 'Revenue above 5m should be Gold');\n        Assert.areEqual('Standard', tierByName.get('Corner Bakery Ltd'), 'Revenue below 5m should be Standard');\n        Assert.areEqual('Standard', tierByName.get('Unknown Revenue Ltd'), 'Null revenue should be Standard');\n    }\n\n    @IsTest\n    static void exactlyFiveMillionIsGold() {\n        Account edge = new Account(Name = 'Edge Case Ltd', AnnualRevenue = 5000000);\n\n        Test.startTest();\n        AccountTierService.assignTier(new List<Account>{ edge });\n        Test.stopTest();\n\n        Assert.areEqual('Gold', edge.Tier__c, 'The threshold is inclusive');\n    }\n}\n",
    checks: [
      {
        re: /@TestSetup/i,
        msg: "Uses @TestSetup for shared data"
      },
      {
        re: /AccountTierService\.assignTier\s*\(/i,
        msg: "Calls the service under test"
      },
      {
        re: /Test\.startTest\s*\(\s*\)[\s\S]*Test\.stopTest\s*\(\s*\)/i,
        msg: "Wraps the call in Test.startTest/stopTest"
      },
      {
        re: /Assert\.areEqual\s*\(/i,
        msg: "Asserts with Assert.areEqual"
      },
      {
        re: /5000000/,
        msg: "Tests the 5,000,000 boundary"
      }
    ],
    forbid: [
      {
        re: /System\.assert(Equals|NotEquals)?\s*\(/i,
        msg: "Use the Assert class (Assert.areEqual, Assert.isTrue, ...) instead of System.assert"
      },
      {
        re: /SeeAllData\s*=\s*true/i,
        msg: "Do not use SeeAllData=true — create your own test data"
      }
    ],
    hints: [
      "Records inserted in @TestSetup are re-queried in each test method.",
      "Put a message on every assertion so failures are self-explanatory."
    ],
    ai: "Verify all three scenarios plus the inclusive boundary are asserted, assertions have messages, and the test does not depend on org data."
  },
  {
    id: "AP076",
    track: "apex",
    level: "Easy",
    topic: "Testing",
    title: "Test an expected exception",
    task: "Brightwell Energy's `VatCalculator.calculateGross(Decimal net)` returns net × 1.2 rounded to 2 dp, and throws `IllegalArgumentException('Net amount cannot be negative')` for a negative amount.\nWrite `VatCalculatorTest` with three test methods:\n- 100.00 → 120.00\n- 0 → 0\n- -1 → throws IllegalArgumentException whose message mentions \"negative\"; the test must fail if no exception is thrown\nUse only the Assert class.",
    starter: "@IsTest\nprivate class VatCalculatorTest {\n    // TODO\n}\n",
    solution: "@IsTest\nprivate class VatCalculatorTest {\n\n    @IsTest\n    static void addsStandardRateVat() {\n        Assert.areEqual(120.00, VatCalculator.calculateGross(100.00), 'Gross should include 20% VAT');\n    }\n\n    @IsTest\n    static void zeroNetReturnsZero() {\n        Assert.areEqual(0, VatCalculator.calculateGross(0), 'Zero net should give zero gross');\n    }\n\n    @IsTest\n    static void negativeNetThrows() {\n        try {\n            VatCalculator.calculateGross(-1);\n            Assert.fail('Expected an IllegalArgumentException for a negative amount');\n        } catch (IllegalArgumentException e) {\n            Assert.isTrue(e.getMessage().containsIgnoreCase('negative'), 'Unexpected message: ' + e.getMessage());\n        }\n    }\n}\n",
    checks: [
      {
        re: /Assert\.fail\s*\(/i,
        msg: "Fails the test when no exception is thrown (Assert.fail)"
      },
      {
        re: /catch\s*\(\s*IllegalArgumentException\s+\w+\s*\)/i,
        msg: "Catches IllegalArgumentException specifically"
      },
      {
        re: /Assert\.areEqual\s*\(/i,
        msg: "Asserts the calculated values"
      },
      {
        re: /@IsTest[\s\S]*@IsTest[\s\S]*@IsTest[\s\S]*@IsTest/i,
        msg: "Has three test methods"
      },
      {
        re: /negative/i,
        msg: "Checks the exception message"
      }
    ],
    forbid: [
      {
        re: /System\.assert(Equals|NotEquals)?\s*\(/i,
        msg: "Use the Assert class (Assert.areEqual, Assert.isTrue, ...) instead of System.assert"
      },
      {
        re: /catch\s*\(\s*Exception\s+\w+\s*\)/i,
        msg: "Catch the specific exception type, not Exception"
      }
    ],
    hints: [
      "Put Assert.fail(...) on the line right after the call that should throw.",
      "Catch the specific exception type so other failures still fail the test."
    ],
    ai: "Verify the negative test cannot pass silently, catches only IllegalArgumentException, checks the message, and the value tests use exact expected results."
  },
  {
    id: "AP077",
    track: "apex",
    level: "Medium",
    topic: "Testing",
    title: "Test a Queueable job",
    task: "Test the `AccountRatingJob` Queueable for Nimbus Fleet Ltd (constructor takes `Set<Id>`; it sets Rating = 'Hot' when AnnualRevenue > 1,000,000).\nWrite `AccountRatingJobTest`:\n- @TestSetup: one account with revenue 2,500,000 and Rating 'Warm', one with 50,000 and Rating 'Cold'\n- Enqueue the job inside Test.startTest/stopTest so it runs synchronously, then re-query and assert both ratings\n- A second test: enqueueing with an empty set changes nothing",
    starter: "@IsTest\nprivate class AccountRatingJobTest {\n    // TODO\n}\n",
    solution: "@IsTest\nprivate class AccountRatingJobTest {\n\n    @TestSetup\n    static void setup() {\n        insert new List<Account>{\n            new Account(Name = 'Brightwell Energy', AnnualRevenue = 2500000, Rating = 'Warm'),\n            new Account(Name = 'Small Haulage Co', AnnualRevenue = 50000, Rating = 'Cold')\n        };\n    }\n\n    @IsTest\n    static void marksHighRevenueAccountsHot() {\n        Map<Id, Account> accounts = new Map<Id, Account>([SELECT Id FROM Account]);\n\n        Test.startTest();\n        Id jobId = System.enqueueJob(new AccountRatingJob(accounts.keySet()));\n        Test.stopTest();\n\n        Assert.isNotNull(jobId, 'Job should be enqueued');\n        Map<String, String> ratingByName = new Map<String, String>();\n        for (Account a : [SELECT Name, Rating FROM Account]) {\n            ratingByName.put(a.Name, a.Rating);\n        }\n        Assert.areEqual('Hot', ratingByName.get('Brightwell Energy'), 'High revenue account should be Hot');\n        Assert.areEqual('Cold', ratingByName.get('Small Haulage Co'), 'Low revenue account should be unchanged');\n    }\n\n    @IsTest\n    static void emptySetChangesNothing() {\n        Test.startTest();\n        System.enqueueJob(new AccountRatingJob(new Set<Id>()));\n        Test.stopTest();\n\n        Assert.areEqual(0, [SELECT COUNT() FROM Account WHERE Rating = 'Hot'], 'No account should become Hot');\n    }\n}\n",
    checks: [
      {
        re: /System\.enqueueJob\(\s*new\s+AccountRatingJob\s*\(/i,
        msg: "Enqueues AccountRatingJob"
      },
      {
        re: /Test\.startTest\s*\(\s*\)[\s\S]*enqueueJob[\s\S]*Test\.stopTest\s*\(\s*\)/i,
        msg: "Enqueues between startTest and stopTest"
      },
      {
        re: /Test\.stopTest\s*\(\s*\)[\s\S]*Assert\./i,
        msg: "Asserts after Test.stopTest()"
      },
      {
        re: /'Hot'/i,
        msg: "Asserts the 'Hot' rating"
      },
      {
        re: /@TestSetup/i,
        msg: "Uses @TestSetup"
      }
    ],
    forbid: [
      {
        re: /System\.assert(Equals|NotEquals)?\s*\(/i,
        msg: "Use the Assert class (Assert.areEqual, Assert.isTrue, ...) instead of System.assert"
      },
      {
        re: /SeeAllData\s*=\s*true/i,
        msg: "Do not use SeeAllData=true — create your own test data"
      }
    ],
    hints: [
      "Async work queued inside startTest/stopTest completes when stopTest is called.",
      "Re-query after stopTest — in-memory records are not refreshed."
    ],
    ai: "Verify assertions happen after stopTest on freshly queried data, both the positive and unchanged cases are checked, and the empty-set test proves nothing changed."
  },
  {
    id: "AP078",
    track: "apex",
    level: "Medium",
    topic: "Testing",
    title: "System.runAs with a custom permission",
    task: "Thames Logistics' `DiscountApprovalService.requiresApproval(Decimal discountPct)` returns true when the discount is above 15% and the running user lacks the custom permission `Approve_Large_Discount` (granted by permission set `Discount_Approver`).\nWrite `DiscountApprovalServiceTest`:\n- A helper that creates a 'Standard User' with a unique username\n- Test 1: runAs a plain user → 20% requires approval, 10% does not\n- Test 2: assign the Discount_Approver permission set, runAs that user → 25% does not require approval",
    starter: "@IsTest\nprivate class DiscountApprovalServiceTest {\n    // TODO\n}\n",
    solution: "@IsTest\nprivate class DiscountApprovalServiceTest {\n\n    private static User createUser(String alias) {\n        Profile p = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];\n        User u = new User(\n            Alias = alias,\n            Email = alias + '@thameslogistics.test',\n            EmailEncodingKey = 'UTF-8',\n            LastName = 'Tester',\n            LanguageLocaleKey = 'en_US',\n            LocaleSidKey = 'en_GB',\n            ProfileId = p.Id,\n            TimeZoneSidKey = 'Europe/London',\n            Username = alias + '.' + System.currentTimeMillis() + '@thameslogistics.test'\n        );\n        insert u;\n        return u;\n    }\n\n    @IsTest\n    static void plainUserNeedsApprovalAboveThreshold() {\n        User rep = createUser('srep');\n        System.runAs(rep) {\n            Assert.isTrue(DiscountApprovalService.requiresApproval(20), '20% should need approval');\n            Assert.isFalse(DiscountApprovalService.requiresApproval(10), '10% should not need approval');\n        }\n    }\n\n    @IsTest\n    static void approverDoesNotNeedApproval() {\n        User approver = createUser('appr');\n        PermissionSet ps = [SELECT Id FROM PermissionSet WHERE Name = 'Discount_Approver' LIMIT 1];\n        insert new PermissionSetAssignment(AssigneeId = approver.Id, PermissionSetId = ps.Id);\n        System.runAs(approver) {\n            Assert.isFalse(DiscountApprovalService.requiresApproval(25), 'Approvers can give large discounts');\n        }\n    }\n}\n",
    checks: [
      {
        re: /System\.runAs\s*\(/i,
        msg: "Uses System.runAs"
      },
      {
        re: /PermissionSetAssignment/i,
        msg: "Assigns the permission set"
      },
      {
        re: /Discount_Approver/i,
        msg: "Uses the Discount_Approver permission set"
      },
      {
        re: /FROM\s+Profile/i,
        msg: "Creates the user with a real profile"
      },
      {
        re: /Assert\.(isTrue|isFalse|areEqual)\s*\(/i,
        msg: "Asserts with the Assert class"
      }
    ],
    forbid: [
      {
        re: /System\.assert(Equals|NotEquals)?\s*\(/i,
        msg: "Use the Assert class (Assert.areEqual, Assert.isTrue, ...) instead of System.assert"
      },
      {
        re: /SeeAllData\s*=\s*true/i,
        msg: "Do not use SeeAllData=true — create your own test data"
      }
    ],
    hints: [
      "A unique username can use System.currentTimeMillis() or a random number.",
      "Insert the PermissionSetAssignment before entering System.runAs."
    ],
    ai: "Verify users are created with all required fields and unique usernames, both with and without the permission are tested inside runAs, and assertions cover both sides of the 15% threshold."
  },
  {
    id: "AP079",
    track: "apex",
    level: "Medium",
    topic: "Testing",
    title: "Test a stateful batch job",
    task: "Test `OpportunityRollupBatch` (Brightwell Energy): it totals Amount of Opportunities with IsWon = true and CloseDate = LAST_QUARTER and inserts one `Batch_Run_Log__c` (Total_Amount__c, Records_Processed__c) in finish.\nWrite `OpportunityRollupBatchTest`:\n- Create an account and compute a CloseDate that falls in the previous calendar quarter\n- Insert two Closed Won opps (1,000 and 2,500) and one Closed Lost opp (9,999)\n- Run the batch inside startTest/stopTest and assert the log shows 3,500 and 2 records",
    starter: "@IsTest\nprivate class OpportunityRollupBatchTest {\n    // TODO\n}\n",
    solution: "@IsTest\nprivate class OpportunityRollupBatchTest {\n\n    private static Date lastQuarterDate() {\n        Date today = Date.today();\n        Integer quarterStartMonth = ((today.month() - 1) / 3) * 3 + 1;\n        return Date.newInstance(today.year(), quarterStartMonth, 1).addDays(-1);\n    }\n\n    @IsTest\n    static void totalsWonOpportunitiesFromLastQuarter() {\n        Account acc = new Account(Name = 'Brightwell Energy');\n        insert acc;\n        Date closeDate = lastQuarterDate();\n        insert new List<Opportunity>{\n            new Opportunity(Name = 'Solar install', AccountId = acc.Id, StageName = 'Closed Won', CloseDate = closeDate, Amount = 1000),\n            new Opportunity(Name = 'Heat pump', AccountId = acc.Id, StageName = 'Closed Won', CloseDate = closeDate, Amount = 2500),\n            new Opportunity(Name = 'Battery', AccountId = acc.Id, StageName = 'Closed Lost', CloseDate = closeDate, Amount = 9999)\n        };\n\n        Test.startTest();\n        Database.executeBatch(new OpportunityRollupBatch());\n        Test.stopTest();\n\n        List<Batch_Run_Log__c> logs = [SELECT Total_Amount__c, Records_Processed__c FROM Batch_Run_Log__c];\n        Assert.areEqual(1, logs.size(), 'Exactly one log should be written');\n        Assert.areEqual(3500, logs[0].Total_Amount__c, 'Only won amounts should be totalled');\n        Assert.areEqual(2, logs[0].Records_Processed__c, 'Two won opportunities should be processed');\n    }\n}\n",
    checks: [
      {
        re: /Database\.executeBatch\(\s*new\s+OpportunityRollupBatch\s*\(/i,
        msg: "Runs the batch with Database.executeBatch"
      },
      {
        re: /Test\.stopTest\s*\(\s*\)[\s\S]*Batch_Run_Log__c/i,
        msg: "Checks the log after Test.stopTest()"
      },
      {
        re: /'Closed Lost'/i,
        msg: "Includes a Closed Lost opportunity that must be excluded"
      },
      {
        re: /3500/,
        msg: "Asserts the 3,500 total"
      },
      {
        re: /Assert\.areEqual\s*\(/i,
        msg: "Asserts with Assert.areEqual"
      }
    ],
    forbid: [
      {
        re: /System\.assert(Equals|NotEquals)?\s*\(/i,
        msg: "Use the Assert class (Assert.areEqual, Assert.isTrue, ...) instead of System.assert"
      },
      {
        re: /SeeAllData\s*=\s*true/i,
        msg: "Do not use SeeAllData=true — create your own test data"
      }
    ],
    hints: [
      "The last day of the previous quarter is the first day of this quarter minus one day.",
      "Only one execute chunk runs in a test, so keep the record count under 200."
    ],
    ai: "Verify the CloseDate calculation always lands in the previous calendar quarter, the lost opportunity is excluded, and the test asserts both the total and the record count on exactly one log."
  },
  {
    id: "AP080",
    track: "apex",
    level: "Hard",
    topic: "Testing",
    title: "Mock a selector with the Stub API",
    task: "Nimbus Fleet's `AccountHealthService` takes an `AccountsSelector` in its constructor. `countAtRisk(Set<Id> ids)` returns 0 for an empty set without calling the selector, otherwise calls `selector.selectByIds(ids)` once and counts accounts with Health_Score__c < 50 (nulls ignored).\nWrite `AccountHealthServiceTest` WITHOUT any DML:\n- An inner `System.StubProvider` that returns a canned account list for selectByIds and counts calls\n- Create the mock with `Test.createStub`\n- Test: scores 30, 49, 50, null → 2 at risk, selector called once\n- Test: empty set → 0, selector never called",
    starter: "@IsTest\nprivate class AccountHealthServiceTest {\n    // TODO\n}\n",
    solution: "@IsTest\nprivate class AccountHealthServiceTest {\n\n    private class SelectorStub implements System.StubProvider {\n        private List<Account> accounts;\n        public Integer calls = 0;\n\n        SelectorStub(List<Account> accounts) {\n            this.accounts = accounts;\n        }\n\n        public Object handleMethodCall(Object stubbedObject, String stubbedMethodName, Type returnType,\n                List<Type> listOfParamTypes, List<String> listOfParamNames, List<Object> listOfArgs) {\n            if (stubbedMethodName == 'selectByIds') {\n                calls++;\n                return accounts;\n            }\n            return null;\n        }\n    }\n\n    private static Id fakeAccountId(Integer n) {\n        String suffix = String.valueOf(n).leftPad(12, '0');\n        return Id.valueOf(Account.SObjectType.getDescribe().getKeyPrefix() + suffix);\n    }\n\n    @IsTest\n    static void countsAccountsBelowFifty() {\n        SelectorStub stub = new SelectorStub(new List<Account>{\n            new Account(Name = 'A', Health_Score__c = 30),\n            new Account(Name = 'B', Health_Score__c = 49),\n            new Account(Name = 'C', Health_Score__c = 50),\n            new Account(Name = 'D')\n        });\n        AccountsSelector mockSelector = (AccountsSelector) Test.createStub(AccountsSelector.class, stub);\n        AccountHealthService service = new AccountHealthService(mockSelector);\n\n        Test.startTest();\n        Integer atRisk = service.countAtRisk(new Set<Id>{ fakeAccountId(1) });\n        Test.stopTest();\n\n        Assert.areEqual(2, atRisk, 'Scores 30 and 49 are at risk');\n        Assert.areEqual(1, stub.calls, 'Selector should be called exactly once');\n    }\n\n    @IsTest\n    static void emptySetSkipsSelector() {\n        SelectorStub stub = new SelectorStub(new List<Account>());\n        AccountHealthService service = new AccountHealthService(\n            (AccountsSelector) Test.createStub(AccountsSelector.class, stub)\n        );\n\n        Assert.areEqual(0, service.countAtRisk(new Set<Id>()), 'Empty input should return 0');\n        Assert.areEqual(0, stub.calls, 'Selector must not be called for empty input');\n    }\n}\n",
    checks: [
      {
        re: /implements\s+(System\.)?StubProvider/i,
        msg: "Implements System.StubProvider"
      },
      {
        re: /Object\s+handleMethodCall\s*\(/i,
        msg: "Implements handleMethodCall"
      },
      {
        re: /Test\.createStub\(\s*AccountsSelector\.class/i,
        msg: "Creates the mock with Test.createStub"
      },
      {
        re: /new\s+AccountHealthService\s*\(/i,
        msg: "Injects the mock into AccountHealthService"
      },
      {
        re: /Assert\.areEqual\s*\(/i,
        msg: "Asserts with Assert.areEqual"
      }
    ],
    forbid: [
      {
        re: /System\.assert(Equals|NotEquals)?\s*\(/i,
        msg: "Use the Assert class (Assert.areEqual, Assert.isTrue, ...) instead of System.assert"
      },
      {
        re: /\b(insert|update|upsert)\s+(new\s+)?\w+/i,
        msg: "No DML — the stub replaces the database"
      }
    ],
    hints: [
      "handleMethodCall receives the method name — switch on it to return canned data.",
      "Keep a call counter on the stub so you can assert interactions.",
      "Fake Ids: key prefix + 12 zero-padded digits."
    ],
    ai: "Verify no DML or SOQL is used, the stub returns data only for selectByIds, both the count and the number of selector calls are asserted, and the empty-input case proves the selector is not called."
  },
  {
    id: "AP081",
    track: "apex",
    level: "Hard",
    topic: "Testing",
    title: "Test a platform event subscriber",
    task: "Thames Logistics has a trigger on `Shipment_Delayed__e` (fields Shipment_Ref__c, Account_Id__c, Delay_Hours__c). For each event it creates a Case with Subject 'Shipment delayed: ' + Shipment_Ref__c on that account, Priority 'High' when Delay_Hours__c > 24 else 'Medium'.\nWrite `ShipmentDelayedTriggerTest`:\n- Publish two events (6 h and 30 h) with EventBus.publish and assert every SaveResult succeeded\n- Force delivery with `Test.getEventBus().deliver()` inside startTest/stopTest\n- Assert two cases exist with the right subjects and priorities",
    starter: "@IsTest\nprivate class ShipmentDelayedTriggerTest {\n    // TODO\n}\n",
    solution: "@IsTest\nprivate class ShipmentDelayedTriggerTest {\n\n    @IsTest\n    static void createsCasePerDelayedShipment() {\n        Account acc = new Account(Name = 'Thames Logistics');\n        insert acc;\n        List<Shipment_Delayed__e> events = new List<Shipment_Delayed__e>{\n            new Shipment_Delayed__e(Shipment_Ref__c = 'SHP-1001', Account_Id__c = acc.Id, Delay_Hours__c = 6),\n            new Shipment_Delayed__e(Shipment_Ref__c = 'SHP-1002', Account_Id__c = acc.Id, Delay_Hours__c = 30)\n        };\n\n        Test.startTest();\n        List<Database.SaveResult> results = EventBus.publish(events);\n        Test.getEventBus().deliver();\n        Test.stopTest();\n\n        for (Database.SaveResult sr : results) {\n            Assert.isTrue(sr.isSuccess(), 'Event should publish: ' + sr.getErrors());\n        }\n        List<Case> cases = [SELECT Subject, Priority FROM Case WHERE AccountId = :acc.Id ORDER BY Subject];\n        Assert.areEqual(2, cases.size(), 'One case per event');\n        Assert.areEqual('Shipment delayed: SHP-1001', cases[0].Subject, 'Subject should include the reference');\n        Assert.areEqual('Medium', cases[0].Priority, 'Short delays are Medium');\n        Assert.areEqual('Shipment delayed: SHP-1002', cases[1].Subject, 'Subject should include the reference');\n        Assert.areEqual('High', cases[1].Priority, 'Delays over 24 hours are High');\n    }\n}\n",
    checks: [
      {
        re: /EventBus\.publish\s*\(/i,
        msg: "Publishes with EventBus.publish"
      },
      {
        re: /Test\.getEventBus\(\s*\)\.deliver\(\s*\)/i,
        msg: "Delivers events with Test.getEventBus().deliver()"
      },
      {
        re: /isSuccess\s*\(\s*\)/i,
        msg: "Asserts the publish SaveResults"
      },
      {
        re: /'High'/i,
        msg: "Asserts the High priority case"
      },
      {
        re: /Assert\.areEqual\s*\(/i,
        msg: "Asserts with Assert.areEqual"
      }
    ],
    forbid: [
      {
        re: /System\.assert(Equals|NotEquals)?\s*\(/i,
        msg: "Use the Assert class (Assert.areEqual, Assert.isTrue, ...) instead of System.assert"
      },
      {
        re: /SeeAllData\s*=\s*true/i,
        msg: "Do not use SeeAllData=true — create your own test data"
      },
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i,
        msg: "No SOQL inside a loop"
      }
    ],
    hints: [
      "EventBus.publish returns one Database.SaveResult per event.",
      "Order the case query by Subject so you can assert positions deterministically."
    ],
    ai: "Verify publish results are asserted, events are delivered before assertions, and the test checks count, subjects and both priority branches."
  },
  {
    id: "AP082",
    track: "apex",
    level: "Easy",
    topic: "Security",
    title: "Enforce sharing and FLS in a selector",
    task: "A security review at Brightwell Energy flagged `InvoiceSelector`: it runs `without sharing` and ignores field-level security. Fix it:\n- Declare the class `with sharing`\n- `public static List<Invoice__c> getUnpaid(Id accountId)` returns Id, Name, Amount__c, Due_Date__c, Status__c for the account where Status__c != 'Paid'\n- Enforce CRUD/FLS in the query with user mode\n- Order by Due_Date__c ascending; return an empty list for a null accountId",
    starter: "public without sharing class InvoiceSelector {\n\n    public static List<Invoice__c> getUnpaid(Id accountId) {\n        // TODO: secure this query\n        return [SELECT Id, Name, Amount__c, Due_Date__c, Status__c FROM Invoice__c WHERE Account__c = :accountId];\n    }\n}\n",
    solution: "public with sharing class InvoiceSelector {\n\n    public static List<Invoice__c> getUnpaid(Id accountId) {\n        if (accountId == null) {\n            return new List<Invoice__c>();\n        }\n        return [\n            SELECT Id, Name, Amount__c, Due_Date__c, Status__c\n            FROM Invoice__c\n            WHERE Account__c = :accountId AND Status__c != 'Paid'\n            WITH USER_MODE\n            ORDER BY Due_Date__c ASC\n        ];\n    }\n}\n",
    checks: [
      {
        re: /public\s+with\s+sharing\s+class\s+InvoiceSelector/i,
        msg: "Class is declared with sharing"
      },
      {
        re: /WITH\s+USER_MODE/i,
        msg: "Query uses WITH USER_MODE"
      },
      {
        re: /Status__c\s*!=\s*'Paid'/i,
        msg: "Excludes paid invoices"
      },
      {
        re: /ORDER\s+BY\s+Due_Date__c/i,
        msg: "Orders by Due_Date__c"
      },
      {
        re: /accountId\s*==\s*null/i,
        msg: "Handles a null accountId"
      }
    ],
    forbid: [
      {
        re: /without\s+sharing/i,
        msg: "Remove without sharing"
      }
    ],
    hints: [
      "WITH USER_MODE enforces object and field permissions and sharing for that query.",
      "Place WITH USER_MODE after WHERE and before ORDER BY."
    ],
    ai: "Verify the class is with sharing, the query enforces user mode, uses a bind variable, and the null guard returns an empty list rather than null."
  },
  {
    id: "AP083",
    track: "apex",
    level: "Easy",
    topic: "Security",
    title: "Injection-safe product search",
    task: "Nimbus Fleet's parts catalogue LWC searches products. Write `ProductSearchController.search(String term)` as a cacheable `@AuraEnabled` method returning `List<Product2>`.\n- Return an empty list when term is blank or shorter than 2 characters after trimming\n- Match active products whose Name OR ProductCode contains the term\n- Use bind variables only — no string-built SOQL\n- User mode, order by Name, max 50 rows",
    starter: "public with sharing class ProductSearchController {\n\n    @AuraEnabled(cacheable=true)\n    public static List<Product2> search(String term) {\n        // TODO\n        return Database.query('SELECT Id, Name FROM Product2 WHERE Name LIKE \\'%' + term + '%\\'');\n    }\n}\n",
    solution: "public with sharing class ProductSearchController {\n\n    @AuraEnabled(cacheable=true)\n    public static List<Product2> search(String term) {\n        if (String.isBlank(term) || term.trim().length() < 2) {\n            return new List<Product2>();\n        }\n        String pattern = '%' + term.trim() + '%';\n        return [\n            SELECT Id, Name, ProductCode, Family\n            FROM Product2\n            WHERE IsActive = true AND (Name LIKE :pattern OR ProductCode LIKE :pattern)\n            WITH USER_MODE\n            ORDER BY Name\n            LIMIT 50\n        ];\n    }\n}\n",
    checks: [
      {
        re: /@AuraEnabled\s*\(\s*cacheable\s*=\s*true\s*\)/i,
        msg: "Cacheable @AuraEnabled method"
      },
      {
        re: /LIKE\s*:\s*\w+/i,
        msg: "Uses a bind variable in LIKE"
      },
      {
        re: /WITH\s+USER_MODE|AccessLevel\.USER_MODE/i,
        msg: "Runs in user mode"
      },
      {
        re: /LIMIT\s+(50|:\s*\w+)/i,
        msg: "Limits results to 50"
      },
      {
        re: /ProductCode/i,
        msg: "Also searches ProductCode"
      }
    ],
    forbid: [
      {
        re: /Database\.query\s*\(\s*'[^;]*\+/i,
        msg: "Do not concatenate user input into SOQL"
      }
    ],
    hints: [
      "Build the % wildcards in Apex, then bind the variable with :pattern.",
      "Static SOQL with binds is immune to SOQL injection."
    ],
    ai: "Verify no user input is concatenated into a query string, short/blank terms short-circuit, and the query is user-mode, ordered and limited."
  },
  {
    id: "AP084",
    track: "apex",
    level: "Medium",
    topic: "Security",
    title: "Strip inaccessible fields for an LWC",
    task: "Thames Logistics' contact export LWC must never show fields the user can't read (e.g. Birthdate, Salary_Band__c). Write `ContactExportController.getContacts(Id accountId)` (cacheable @AuraEnabled) returning an inner `ExportResult` {contacts, removedFields}.\n- Query Id, FirstName, LastName, Email, Phone, Birthdate, Salary_Band__c for the account (sharing enforced, order by LastName)\n- Use `Security.stripInaccessible` with READABLE and return the sanitised records\n- removedFields: sorted list of the Contact fields that were stripped\n- Null accountId → empty result (lists, not null)",
    starter: "public with sharing class ContactExportController {\n\n    public class ExportResult {\n        @AuraEnabled public List<Contact> contacts = new List<Contact>();\n        @AuraEnabled public List<String> removedFields = new List<String>();\n    }\n\n    @AuraEnabled(cacheable=true)\n    public static ExportResult getContacts(Id accountId) {\n        // TODO\n        return null;\n    }\n}\n",
    solution: "public with sharing class ContactExportController {\n\n    public class ExportResult {\n        @AuraEnabled public List<Contact> contacts = new List<Contact>();\n        @AuraEnabled public List<String> removedFields = new List<String>();\n    }\n\n    @AuraEnabled(cacheable=true)\n    public static ExportResult getContacts(Id accountId) {\n        ExportResult result = new ExportResult();\n        if (accountId == null) {\n            return result;\n        }\n        List<Contact> contacts = [\n            SELECT Id, FirstName, LastName, Email, Phone, Birthdate, Salary_Band__c\n            FROM Contact\n            WHERE AccountId = :accountId\n            ORDER BY LastName\n        ];\n        SObjectAccessDecision decision = Security.stripInaccessible(AccessType.READABLE, contacts);\n        result.contacts = (List<Contact>) decision.getRecords();\n        Map<String, Set<String>> removed = decision.getRemovedFields();\n        if (removed.containsKey('Contact')) {\n            result.removedFields.addAll(removed.get('Contact'));\n            result.removedFields.sort();\n        }\n        return result;\n    }\n}\n",
    checks: [
      {
        re: /Security\.stripInaccessible\s*\(\s*AccessType\.READABLE/i,
        msg: "Calls Security.stripInaccessible with AccessType.READABLE"
      },
      {
        re: /\.getRecords\s*\(\s*\)/i,
        msg: "Returns the sanitised records from getRecords()"
      },
      {
        re: /\.getRemovedFields\s*\(\s*\)/i,
        msg: "Reports removed fields via getRemovedFields()"
      },
      {
        re: /\.sort\s*\(\s*\)/i,
        msg: "Sorts the removed field names"
      },
      {
        re: /with\s+sharing/i,
        msg: "Class enforces sharing"
      }
    ],
    forbid: [
      {
        re: /return\s+contacts\s*;/i,
        msg: "Return the stripped records, not the original query result"
      }
    ],
    hints: [
      "stripInaccessible returns an SObjectAccessDecision; the original list is not modified.",
      "getRemovedFields() is keyed by object name, e.g. \"Contact\"."
    ],
    ai: "Verify the returned records come from decision.getRecords(), removed fields are reported for Contact and sorted, and the null case returns initialised lists."
  },
  {
    id: "AP085",
    track: "apex",
    level: "Medium",
    topic: "Security",
    title: "Dynamic SOQL with queryWithBinds",
    task: "Brightwell Energy's case list LWC lets users sort and filter. Write `CaseListController.getCases(String status, String sortField, String sortDirection, Integer limitSize)` (cacheable @AuraEnabled) returning `List<Case>`.\n- Select Id, CaseNumber, Subject, Priority, Status, CreatedDate\n- Filter by Status only when status is not blank — via a bind variable\n- sortField must be one of CaseNumber, Subject, Priority, Status, CreatedDate (case-insensitive); otherwise CreatedDate\n- Direction 'ASC' (case-insensitive) or default 'DESC'\n- limitSize null/<1 → 50; cap at 200\n- Use `Database.queryWithBinds` in user mode",
    starter: "public with sharing class CaseListController {\n\n    @AuraEnabled(cacheable=true)\n    public static List<Case> getCases(String status, String sortField, String sortDirection, Integer limitSize) {\n        // TODO\n        return null;\n    }\n}\n",
    solution: "public with sharing class CaseListController {\n    private static final List<String> SORTABLE = new List<String>{ 'CaseNumber', 'Subject', 'Priority', 'Status', 'CreatedDate' };\n\n    @AuraEnabled(cacheable=true)\n    public static List<Case> getCases(String status, String sortField, String sortDirection, Integer limitSize) {\n        String field = 'CreatedDate';\n        for (String allowed : SORTABLE) {\n            if (allowed.equalsIgnoreCase(sortField)) {\n                field = allowed;\n            }\n        }\n        String direction = 'ASC'.equalsIgnoreCase(sortDirection) ? 'ASC' : 'DESC';\n        Integer rowLimit = (limitSize == null || limitSize < 1) ? 50 : Math.min(limitSize, 200);\n\n        Map<String, Object> binds = new Map<String, Object>{ 'status' => status, 'rowLimit' => rowLimit };\n        String query = 'SELECT Id, CaseNumber, Subject, Priority, Status, CreatedDate FROM Case';\n        if (String.isNotBlank(status)) {\n            query += ' WHERE Status = :status';\n        }\n        query += ' ORDER BY ' + field + ' ' + direction + ' LIMIT :rowLimit';\n        return Database.queryWithBinds(query, binds, AccessLevel.USER_MODE);\n    }\n}\n",
    checks: [
      {
        re: /Database\.queryWithBinds\s*\([^;]*AccessLevel\.USER_MODE/i,
        msg: "Uses Database.queryWithBinds in USER_MODE"
      },
      {
        re: /Status\s*=\s*:\s*\w+/i,
        msg: "Filters status with a bind variable"
      },
      {
        re: /equalsIgnoreCase|toLowerCase|toUpperCase/i,
        msg: "Validates sort field/direction case-insensitively"
      },
      {
        re: /200/,
        msg: "Caps the limit at 200"
      },
      {
        re: /Map<\s*String\s*,\s*Object\s*>/i,
        msg: "Passes binds as Map<String, Object>"
      }
    ],
    forbid: [
      {
        re: /'\s*\+\s*status\b/i,
        msg: "Never concatenate the status value into the query"
      },
      {
        re: /\+\s*sortField\b/i,
        msg: "Never concatenate the raw sortField — use the validated value"
      }
    ],
    hints: [
      "Only identifiers (field, direction) can’t be bound — validate them against an allowlist.",
      "Everything else, including LIMIT, can be a bind in the map."
    ],
    ai: "Verify user-supplied values are only ever bound or allowlisted, defaults apply for invalid inputs, the limit is clamped, and the query runs in user mode."
  },
  {
    id: "AP086",
    track: "apex",
    level: "Hard",
    topic: "Security",
    title: "Secure lead import with stripInaccessible",
    task: "Nimbus Fleet imports leads from a CSV tool that may set fields the user can't edit. Write `LeadImportService.importLeads(List<Lead> leads)` returning an inner `ImportResult` {inserted (Integer), removedFields (Set<String>), errors (List<String>)}.\n- Throw `LeadImportException` if the user can't create Leads at all\n- Remove non-creatable fields with `Security.stripInaccessible(AccessType.CREATABLE, ...)` and record which Lead fields were removed\n- Insert the sanitised records with partial success in user mode\n- Count successes; for failures add 'Row N: message' (1-based); copy new Ids back onto the input records\n- Null/empty input → empty result",
    starter: "public with sharing class LeadImportService {\n    public class LeadImportException extends Exception {}\n\n    public class ImportResult {\n        public Integer inserted = 0;\n        public Set<String> removedFields = new Set<String>();\n        public List<String> errors = new List<String>();\n    }\n\n    public static ImportResult importLeads(List<Lead> leads) {\n        // TODO\n        return null;\n    }\n}\n",
    solution: "public with sharing class LeadImportService {\n    public class LeadImportException extends Exception {}\n\n    public class ImportResult {\n        public Integer inserted = 0;\n        public Set<String> removedFields = new Set<String>();\n        public List<String> errors = new List<String>();\n    }\n\n    public static ImportResult importLeads(List<Lead> leads) {\n        ImportResult result = new ImportResult();\n        if (leads == null || leads.isEmpty()) {\n            return result;\n        }\n        if (!Schema.SObjectType.Lead.isCreateable()) {\n            throw new LeadImportException('You do not have permission to create leads');\n        }\n        SObjectAccessDecision decision = Security.stripInaccessible(AccessType.CREATABLE, leads);\n        Map<String, Set<String>> removed = decision.getRemovedFields();\n        if (removed.containsKey('Lead')) {\n            result.removedFields.addAll(removed.get('Lead'));\n        }\n        List<Lead> sanitised = (List<Lead>) decision.getRecords();\n        List<Database.SaveResult> saveResults = Database.insert(sanitised, false, AccessLevel.USER_MODE);\n        for (Integer i = 0; i < saveResults.size(); i++) {\n            Database.SaveResult sr = saveResults[i];\n            if (sr.isSuccess()) {\n                result.inserted++;\n                leads[i].Id = sr.getId();\n            } else {\n                result.errors.add('Row ' + (i + 1) + ': ' + sr.getErrors()[0].getMessage());\n            }\n        }\n        return result;\n    }\n}\n",
    checks: [
      {
        re: /isCreateable\s*\(\s*\)/i,
        msg: "Checks object-level create access"
      },
      {
        re: /Security\.stripInaccessible\s*\(\s*AccessType\.CREATABLE/i,
        msg: "Strips fields with AccessType.CREATABLE"
      },
      {
        re: /getRemovedFields\s*\(\s*\)/i,
        msg: "Records removed fields"
      },
      {
        re: /getRecords\s*\(\s*\)/i,
        msg: "Inserts the sanitised records"
      },
      {
        re: /Database\.insert\s*\([^;]*false/i,
        msg: "Inserts with partial success"
      },
      {
        re: /i\s*\+\s*1/i,
        msg: "Reports 1-based row numbers"
      }
    ],
    forbid: [
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+(as\s+(user|system)\s+)?\w+\s*;/i,
        msg: "No DML inside a loop"
      },
      {
        re: /insert\s+leads\s*;/i,
        msg: "Insert the sanitised records, not the raw input"
      }
    ],
    hints: [
      "Schema.SObjectType.Lead.isCreateable() is the object-level check.",
      "getRecords() returns new copies in the same order — SaveResult index i maps to input row i.",
      "Database.insert(records, false, AccessLevel.USER_MODE)."
    ],
    ai: "Verify the raw input is never inserted, removed fields are reported, partial failures are captured with 1-based row numbers, Ids are copied back by index, and object-level access is checked first."
  },
  {
    id: "AP087",
    track: "apex",
    level: "Hard",
    topic: "Security",
    title: "Apex managed sharing for project teams",
    task: "Thames Logistics shares private `Project__c` records with team members via Apex managed sharing (row cause `Team_Member__c`). Write `ProjectSharingService.shareWithTeam(Map<Id, Set<Id>> projectToUsers)` returning the number of real failures.\n- The class must be able to insert share rows regardless of the caller's sharing — justify the keyword in a comment\n- Only share projects the running user owns (query them first; ignore others)\n- Create `Project__Share` rows with AccessLevel 'Edit' and the Team_Member__c row cause\n- Insert with partial success; ignore the \"user already has access\" error (FIELD_FILTER_VALIDATION_EXCEPTION mentioning AccessLevel)",
    starter: "public class ProjectSharingService {\n\n    public static Integer shareWithTeam(Map<Id, Set<Id>> projectToUsers) {\n        // TODO\n        return 0;\n    }\n}\n",
    solution: "// without sharing: inserting __Share rows needs full access to the parent record;\n// we compensate by only sharing projects the running user owns.\npublic without sharing class ProjectSharingService {\n\n    public static Integer shareWithTeam(Map<Id, Set<Id>> projectToUsers) {\n        if (projectToUsers == null || projectToUsers.isEmpty()) {\n            return 0;\n        }\n        Id currentUserId = UserInfo.getUserId();\n        Set<Id> ownedProjectIds = new Map<Id, Project__c>([\n            SELECT Id FROM Project__c\n            WHERE Id IN :projectToUsers.keySet() AND OwnerId = :currentUserId\n        ]).keySet();\n\n        List<Project__Share> shares = new List<Project__Share>();\n        for (Id projectId : ownedProjectIds) {\n            Set<Id> userIds = projectToUsers.get(projectId);\n            if (userIds == null) {\n                continue;\n            }\n            for (Id userId : userIds) {\n                shares.add(new Project__Share(\n                    ParentId = projectId,\n                    UserOrGroupId = userId,\n                    AccessLevel = 'Edit',\n                    RowCause = Schema.Project__Share.RowCause.Team_Member__c\n                ));\n            }\n        }\n        if (shares.isEmpty()) {\n            return 0;\n        }\n        Integer failures = 0;\n        for (Database.SaveResult sr : Database.insert(shares, false)) {\n            if (sr.isSuccess()) {\n                continue;\n            }\n            Database.Error err = sr.getErrors()[0];\n            Boolean alreadyHasAccess = err.getStatusCode() == StatusCode.FIELD_FILTER_VALIDATION_EXCEPTION\n                && err.getMessage().contains('AccessLevel');\n            if (!alreadyHasAccess) {\n                failures++;\n            }\n        }\n        return failures;\n    }\n}\n",
    checks: [
      {
        re: /Project__Share/i,
        msg: "Creates Project__Share records"
      },
      {
        re: /RowCause\s*=\s*Schema\.Project__Share\.RowCause\.Team_Member__c/i,
        msg: "Uses the Team_Member__c Apex sharing reason"
      },
      {
        re: /AccessLevel\s*=\s*'Edit'/i,
        msg: "Grants 'Edit' access"
      },
      {
        re: /Database\.insert\s*\(\s*\w+\s*,\s*false/i,
        msg: "Inserts shares with partial success"
      },
      {
        re: /UserInfo\.getUserId\s*\(\s*\)/i,
        msg: "Restricts to projects owned by the running user"
      },
      {
        re: /FIELD_FILTER_VALIDATION_EXCEPTION/i,
        msg: "Ignores the trivial-access error"
      }
    ],
    forbid: [
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i,
        msg: "No SOQL inside a loop"
      },
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+(as\s+(user|system)\s+)?\w+\s*;/i,
        msg: "No DML inside a loop"
      }
    ],
    hints: [
      "Apex sharing reasons are referenced as Schema.Project__Share.RowCause.<ReasonName>__c.",
      "Use a nested loop to build the share list, then one Database.insert(shares, false).",
      "Owners already have full access — that error is expected and not a failure."
    ],
    ai: "Verify the sharing keyword is justified, only owned projects are shared, shares use the custom row cause (not Manual), one partial-success DML is used, and trivial-access errors are not counted."
  },
  {
    id: "AP088",
    track: "apex",
    level: "Easy",
    topic: "Platform Events",
    title: "Publish an Order Shipped event",
    task: "When Nimbus Fleet ships an order, downstream systems listen for `Order_Shipped__e` (Order_Id__c, Tracking_Number__c, Carrier__c). Write `OrderShippedPublisher.publishShipped(Id orderId, String trackingNumber, String carrier)` returning Boolean.\n- Return false without publishing if orderId is null or trackingNumber is blank\n- Carrier defaults to 'Royal Mail' when blank\n- Publish with EventBus, check the SaveResult and log every error (status code + message) at ERROR level\n- Return whether the publish succeeded",
    starter: "public with sharing class OrderShippedPublisher {\n\n    public static Boolean publishShipped(Id orderId, String trackingNumber, String carrier) {\n        // TODO\n        return false;\n    }\n}\n",
    solution: "public with sharing class OrderShippedPublisher {\n\n    public static Boolean publishShipped(Id orderId, String trackingNumber, String carrier) {\n        if (orderId == null || String.isBlank(trackingNumber)) {\n            return false;\n        }\n        Order_Shipped__e evt = new Order_Shipped__e(\n            Order_Id__c = orderId,\n            Tracking_Number__c = trackingNumber,\n            Carrier__c = String.isBlank(carrier) ? 'Royal Mail' : carrier\n        );\n        Database.SaveResult sr = EventBus.publish(evt);\n        if (!sr.isSuccess()) {\n            for (Database.Error err : sr.getErrors()) {\n                System.debug(LoggingLevel.ERROR, 'Order_Shipped__e publish failed: ' + err.getStatusCode() + ' - ' + err.getMessage());\n            }\n        }\n        return sr.isSuccess();\n    }\n}\n",
    checks: [
      {
        re: /new\s+Order_Shipped__e\s*\(/i,
        msg: "Creates an Order_Shipped__e event"
      },
      {
        re: /EventBus\.publish\s*\(/i,
        msg: "Publishes with EventBus.publish"
      },
      {
        re: /isSuccess\s*\(\s*\)/i,
        msg: "Checks the SaveResult"
      },
      {
        re: /getErrors\s*\(\s*\)/i,
        msg: "Logs the publish errors"
      },
      {
        re: /'Royal Mail'/i,
        msg: "Defaults the carrier to 'Royal Mail'"
      }
    ],
    forbid: [
      {
        re: /\binsert\s+\w+\s*;|Database\.insert\s*\(/i,
        msg: "Publish platform events with EventBus.publish, not insert"
      }
    ],
    hints: [
      "EventBus.publish(event) returns a Database.SaveResult.",
      "Loop sr.getErrors() to log each error."
    ],
    ai: "Verify invalid input never publishes, the SaveResult is checked and every error is logged, and the method returns the actual publish outcome."
  },
  {
    id: "AP089",
    track: "apex",
    level: "Easy",
    topic: "Platform Events",
    title: "Bulk-publish meter alerts",
    task: "Brightwell Energy raises `Meter_Alert__e` (Meter_Id__c, Kwh__c, Reading_Id__c) for unusually high readings. Write `MeterAlertPublisher.publishAlerts(List<Meter_Reading__c> readings, Decimal thresholdKwh)` returning the number of events published successfully.\n- One event per reading whose Kwh__c is above the threshold (skip null Kwh__c)\n- Publish all events in ONE EventBus.publish call\n- Null readings, null threshold or no qualifying readings → return 0 without publishing",
    starter: "public with sharing class MeterAlertPublisher {\n\n    public static Integer publishAlerts(List<Meter_Reading__c> readings, Decimal thresholdKwh) {\n        // TODO\n        return 0;\n    }\n}\n",
    solution: "public with sharing class MeterAlertPublisher {\n\n    public static Integer publishAlerts(List<Meter_Reading__c> readings, Decimal thresholdKwh) {\n        if (readings == null || thresholdKwh == null) {\n            return 0;\n        }\n        List<Meter_Alert__e> alerts = new List<Meter_Alert__e>();\n        for (Meter_Reading__c r : readings) {\n            if (r.Kwh__c != null && r.Kwh__c > thresholdKwh) {\n                alerts.add(new Meter_Alert__e(Meter_Id__c = r.Meter_Id__c, Kwh__c = r.Kwh__c, Reading_Id__c = r.Id));\n            }\n        }\n        if (alerts.isEmpty()) {\n            return 0;\n        }\n        Integer published = 0;\n        for (Database.SaveResult sr : EventBus.publish(alerts)) {\n            if (sr.isSuccess()) {\n                published++;\n            }\n        }\n        return published;\n    }\n}\n",
    checks: [
      {
        re: /List<\s*Meter_Alert__e\s*>/i,
        msg: "Collects events in a List<Meter_Alert__e>"
      },
      {
        re: /EventBus\.publish\s*\(\s*\w+\s*\)/i,
        msg: "Publishes the whole list in one call"
      },
      {
        re: /isSuccess\s*\(\s*\)/i,
        msg: "Counts successful SaveResults"
      },
      {
        re: /thresholdKwh/i,
        msg: "Compares against the threshold"
      }
    ],
    forbid: [
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*EventBus\.publish/i,
        msg: "Do not publish inside a loop"
      }
    ],
    hints: [
      "Build the list first, publish once.",
      "EventBus.publish(list) returns List<Database.SaveResult>."
    ],
    ai: "Verify a single publish call, correct filtering (strictly above threshold, nulls skipped), and that the return value counts only successful results."
  },
  {
    id: "AP090",
    track: "apex",
    level: "Medium",
    topic: "Platform Events",
    title: "Event subscriber with resume checkpoint",
    task: "Nimbus Fleet's `Fleet_Alert__e` trigger calls `FleetAlertHandler.handle(List<Fleet_Alert__e> events)`. Write the handler:\n- Create one Task per event: Subject 'Fleet alert: ' + Alert_Type__c, Description = Message__c, WhatId = Vehicle_Id__c (text Id), Priority 'High' when Severity__c = 'Critical' else 'Normal', ActivityDate today\n- Process at most 500 events per invocation; after each processed event set the resume checkpoint to its ReplayId so the rest are redelivered\n- Insert the tasks with one DML",
    starter: "public with sharing class FleetAlertHandler {\n\n    public static void handle(List<Fleet_Alert__e> events) {\n        // TODO\n    }\n}\n",
    solution: "public with sharing class FleetAlertHandler {\n    public static final Integer MAX_PER_RUN = 500;\n\n    public static void handle(List<Fleet_Alert__e> events) {\n        List<Task> tasks = new List<Task>();\n        Integer processed = 0;\n        for (Fleet_Alert__e evt : events) {\n            if (processed == MAX_PER_RUN) {\n                break;\n            }\n            tasks.add(new Task(\n                Subject = 'Fleet alert: ' + evt.Alert_Type__c,\n                Description = evt.Message__c,\n                WhatId = String.isBlank(evt.Vehicle_Id__c) ? null : Id.valueOf(evt.Vehicle_Id__c),\n                Priority = evt.Severity__c == 'Critical' ? 'High' : 'Normal',\n                ActivityDate = Date.today()\n            ));\n            processed++;\n            EventBus.TriggerContext.currentContext().setResumeCheckpoint(evt.ReplayId);\n        }\n        if (!tasks.isEmpty()) {\n            insert tasks;\n        }\n    }\n}\n",
    checks: [
      {
        re: /EventBus\.TriggerContext\.currentContext\(\s*\)\.setResumeCheckpoint\s*\(/i,
        msg: "Sets the resume checkpoint"
      },
      {
        re: /ReplayId/i,
        msg: "Uses the event ReplayId"
      },
      {
        re: /\b500\b/,
        msg: "Caps processing at 500 events"
      },
      {
        re: /'Critical'/i,
        msg: "Maps Critical severity to High priority"
      },
      {
        re: /\binsert\s+\w+\s*;|Database\.insert\s*\(/i,
        msg: "Inserts the tasks"
      }
    ],
    forbid: [
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+(as\s+(user|system)\s+)?\w+\s*;/i,
        msg: "No DML inside a loop"
      }
    ],
    hints: [
      "setResumeCheckpoint(replayId) tells the platform where to resume if you stop early.",
      "Break out of the loop once you have processed the maximum."
    ],
    ai: "Verify the checkpoint is set for every processed event, processing stops at 500, tasks are inserted with one DML after the loop, and blank vehicle Ids are handled."
  },
  {
    id: "AP091",
    track: "apex",
    level: "Medium",
    topic: "Platform Events",
    title: "Change Data Capture rating audit",
    task: "Thames Logistics audits Account rating changes via Change Data Capture. Write `AccountChangeHandler.handle(List<AccountChangeEvent> events)` (called from an AccountChangeEvent trigger):\n- Read each event's ChangeEventHeader\n- Only UPDATE events whose changed fields include 'Rating'\n- One `Account_Audit__c` per record Id in the header: Account__c, New_Rating__c (event Rating), Changed_By__c (commit user), Commit_Timestamp__c (from the epoch-ms commit timestamp)\n- One DML at the end",
    starter: "public with sharing class AccountChangeHandler {\n\n    public static void handle(List<AccountChangeEvent> events) {\n        // TODO\n    }\n}\n",
    solution: "public with sharing class AccountChangeHandler {\n\n    public static void handle(List<AccountChangeEvent> events) {\n        List<Account_Audit__c> audits = new List<Account_Audit__c>();\n        for (AccountChangeEvent evt : events) {\n            EventBus.ChangeEventHeader header = evt.ChangeEventHeader;\n            if (header.changeType != 'UPDATE' || !header.changedFields.contains('Rating')) {\n                continue;\n            }\n            for (String recordId : header.recordIds) {\n                audits.add(new Account_Audit__c(\n                    Account__c = (Id) recordId,\n                    New_Rating__c = evt.Rating,\n                    Changed_By__c = (Id) header.commitUser,\n                    Commit_Timestamp__c = Datetime.newInstance(header.commitTimestamp)\n                ));\n            }\n        }\n        if (!audits.isEmpty()) {\n            insert audits;\n        }\n    }\n}\n",
    checks: [
      {
        re: /ChangeEventHeader/i,
        msg: "Reads the ChangeEventHeader"
      },
      {
        re: /changeType|getChangeType\s*\(/i,
        msg: "Checks the change type"
      },
      {
        re: /'UPDATE'/i,
        msg: "Filters on 'UPDATE'"
      },
      {
        re: /changedFields|getChangedFields\s*\(/i,
        msg: "Checks the changed fields"
      },
      {
        re: /recordIds|getRecordIds\s*\(/i,
        msg: "Uses the header record Ids"
      },
      {
        re: /commitTimestamp|getCommitTimestamp\s*\(/i,
        msg: "Uses the commit timestamp"
      }
    ],
    forbid: [
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+(as\s+(user|system)\s+)?\w+\s*;/i,
        msg: "No DML inside a loop"
      },
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i,
        msg: "No SOQL inside a loop"
      }
    ],
    hints: [
      "A single change event can cover several records — iterate header.recordIds.",
      "commitTimestamp is epoch milliseconds: Datetime.newInstance(Long)."
    ],
    ai: "Verify only UPDATE events that changed Rating create audits, every record Id in the header is handled, and inserts happen once outside the loop."
  },
  {
    id: "AP092",
    track: "apex",
    level: "Hard",
    topic: "Platform Events",
    title: "Retryable platform event handler",
    task: "Brightwell Energy's `Invoice_Posted__e` (Invoice_Id__c text) subscriber marks invoices as posted, but invoices are often locked by billing jobs. Write `InvoicePostedHandler.process(List<Invoice_Posted__e> events)`:\n- Collect invoice Ids (skip blanks), lock the invoices with FOR UPDATE, set Status__c 'Posted' and Posted_On__c now, one update\n- On a lock problem (QueryException, or DmlException with UNABLE_TO_LOCK_ROW) throw `EventBus.RetryableException` while the trigger's retry count is below 4\n- After 4 retries, or on any other DmlException, insert an `Error_Log__c` (Source__c, Message__c ≤255) instead of retrying",
    starter: "public with sharing class InvoicePostedHandler {\n\n    public static void process(List<Invoice_Posted__e> events) {\n        // TODO\n    }\n}\n",
    solution: "public with sharing class InvoicePostedHandler {\n    public static final Integer MAX_RETRIES = 4;\n\n    public static void process(List<Invoice_Posted__e> events) {\n        Set<Id> invoiceIds = new Set<Id>();\n        for (Invoice_Posted__e evt : events) {\n            if (String.isNotBlank(evt.Invoice_Id__c)) {\n                invoiceIds.add(Id.valueOf(evt.Invoice_Id__c));\n            }\n        }\n        if (invoiceIds.isEmpty()) {\n            return;\n        }\n        try {\n            List<Invoice__c> invoices = [SELECT Id, Status__c FROM Invoice__c WHERE Id IN :invoiceIds FOR UPDATE];\n            for (Invoice__c inv : invoices) {\n                inv.Status__c = 'Posted';\n                inv.Posted_On__c = System.now();\n            }\n            update invoices;\n        } catch (QueryException e) {\n            retryOrLog(e);\n        } catch (DmlException e) {\n            if (e.getDmlType(0) == StatusCode.UNABLE_TO_LOCK_ROW) {\n                retryOrLog(e);\n            } else {\n                logError(e);\n            }\n        }\n    }\n\n    private static void retryOrLog(Exception e) {\n        if (EventBus.TriggerContext.currentContext().retries < MAX_RETRIES) {\n            throw new EventBus.RetryableException('Invoices locked, retrying: ' + e.getMessage());\n        }\n        logError(e);\n    }\n\n    private static void logError(Exception e) {\n        insert new Error_Log__c(Source__c = 'InvoicePostedHandler', Message__c = e.getMessage().left(255));\n    }\n}\n",
    checks: [
      {
        re: /throw\s+new\s+EventBus\.RetryableException/i,
        msg: "Throws EventBus.RetryableException to retry"
      },
      {
        re: /EventBus\.TriggerContext\.currentContext\(\s*\)\.retries/i,
        msg: "Checks the current retry count"
      },
      {
        re: /UNABLE_TO_LOCK_ROW/i,
        msg: "Detects UNABLE_TO_LOCK_ROW"
      },
      {
        re: /FOR\s+UPDATE/i,
        msg: "Locks the invoices with FOR UPDATE"
      },
      {
        re: /\b4\b/,
        msg: "Stops retrying after 4 attempts"
      },
      {
        re: /Error_Log__c/i,
        msg: "Logs to Error_Log__c when giving up"
      }
    ],
    forbid: [
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i,
        msg: "No SOQL inside a loop"
      },
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+(as\s+(user|system)\s+)?\w+\s*;/i,
        msg: "No DML inside a loop"
      }
    ],
    hints: [
      "RetryableException makes the platform redeliver the whole batch later.",
      "EventBus.TriggerContext.currentContext().retries tells you how many times this batch has been retried.",
      "DmlException.getDmlType(0) returns the StatusCode of the first error."
    ],
    ai: "Verify retries happen only for lock errors and stop at 4, other DML errors are logged without retry, and the happy path uses one query and one update."
  },
  {
    id: "AP093",
    track: "apex",
    level: "Easy",
    topic: "Configuration",
    title: "Shipping rate from Custom Metadata",
    task: "Thames Logistics stores delivery rates in Custom Metadata `Shipping_Rate__mdt` (Region__c, Rate__c, Is_Active__c). Write `ShippingRateService.getRate(String region)` returning Decimal.\n- Match the region case-insensitively (trim the input) among active records\n- Return the default rate 9.99 (a constant) for a blank region or no match\n- Use the Custom Metadata accessor methods — no SOQL",
    starter: "public with sharing class ShippingRateService {\n\n    public static Decimal getRate(String region) {\n        // TODO\n        return null;\n    }\n}\n",
    solution: "public with sharing class ShippingRateService {\n    public static final Decimal DEFAULT_RATE = 9.99;\n\n    public static Decimal getRate(String region) {\n        if (String.isBlank(region)) {\n            return DEFAULT_RATE;\n        }\n        String wanted = region.trim();\n        for (Shipping_Rate__mdt rate : Shipping_Rate__mdt.getAll().values()) {\n            if (rate.Is_Active__c && rate.Region__c != null && rate.Region__c.equalsIgnoreCase(wanted)) {\n                return rate.Rate__c;\n            }\n        }\n        return DEFAULT_RATE;\n    }\n}\n",
    checks: [
      {
        re: /Shipping_Rate__mdt\.(getAll|getInstance)\s*\(/i,
        msg: "Reads Shipping_Rate__mdt with getAll()/getInstance()"
      },
      {
        re: /9\.99/,
        msg: "Falls back to 9.99"
      },
      {
        re: /equalsIgnoreCase|toLowerCase|toUpperCase/i,
        msg: "Matches the region case-insensitively"
      },
      {
        re: /Is_Active__c/i,
        msg: "Ignores inactive rates"
      },
      {
        re: /static\s+final\s+Decimal/i,
        msg: "Keeps the default rate in a constant"
      }
    ],
    forbid: [
      {
        re: /\[\s*SELECT/i,
        msg: "Use the Custom Metadata accessors instead of SOQL"
      }
    ],
    hints: [
      "Shipping_Rate__mdt.getAll() returns a Map<String, Shipping_Rate__mdt> keyed by DeveloperName.",
      "Custom Metadata accessors do not count towards SOQL limits."
    ],
    ai: "Verify blank input and no-match both return the default, inactive records are ignored, and matching is case-insensitive without SOQL."
  },
  {
    id: "AP094",
    track: "apex",
    level: "Easy",
    topic: "Configuration",
    title: "Read a hierarchy Custom Setting safely",
    task: "Nimbus Fleet controls its ERP sync with hierarchy Custom Setting `Integration_Settings__c` (Sync_Enabled__c checkbox, Batch_Size__c number). Write class `IntegrationSettings`:\n- `public static Boolean isSyncEnabled()` — true only when the setting for the running user (hierarchy resolved) has Sync_Enabled__c = true\n- `public static Integer getBatchSize()` — Batch_Size__c, default 200 when null, clamped to 1..2000\n- Handle missing settings without exceptions and without SOQL",
    starter: "public with sharing class IntegrationSettings {\n\n    public static Boolean isSyncEnabled() {\n        // TODO\n        return null;\n    }\n\n    public static Integer getBatchSize() {\n        // TODO\n        return null;\n    }\n}\n",
    solution: "public with sharing class IntegrationSettings {\n    public static final Integer DEFAULT_BATCH_SIZE = 200;\n    public static final Integer MAX_BATCH_SIZE = 2000;\n\n    public static Boolean isSyncEnabled() {\n        Integration_Settings__c settings = Integration_Settings__c.getInstance();\n        return settings != null && settings.Sync_Enabled__c == true;\n    }\n\n    public static Integer getBatchSize() {\n        Integration_Settings__c settings = Integration_Settings__c.getInstance();\n        Integer size = (settings == null || settings.Batch_Size__c == null)\n            ? DEFAULT_BATCH_SIZE\n            : settings.Batch_Size__c.intValue();\n        return Math.max(1, Math.min(size, MAX_BATCH_SIZE));\n    }\n}\n",
    checks: [
      {
        re: /Integration_Settings__c\.getInstance\s*\(/i,
        msg: "Uses Integration_Settings__c.getInstance()"
      },
      {
        re: /Sync_Enabled__c/i,
        msg: "Reads Sync_Enabled__c"
      },
      {
        re: /\b200\b/,
        msg: "Defaults the batch size to 200"
      },
      {
        re: /\b2000\b/,
        msg: "Caps the batch size at 2000"
      },
      {
        re: /==\s*null|!=\s*null/i,
        msg: "Null-checks the setting values"
      }
    ],
    forbid: [
      {
        re: /FROM\s+Integration_Settings__c/i,
        msg: "Use getInstance() instead of SOQL"
      }
    ],
    hints: [
      "getInstance() with no arguments resolves the hierarchy for the running user.",
      "Decimal number fields need .intValue() to become an Integer."
    ],
    ai: "Verify null settings and null fields are handled, the batch size is clamped to 1..2000, and isSyncEnabled never returns null."
  },
  {
    id: "AP095",
    track: "apex",
    level: "Medium",
    topic: "Configuration",
    title: "Governor-limit guard with the Limits class",
    task: "Brightwell Energy's integration framework needs a reusable governor-limit guard. Write `LimitGuard`:\n- `public static Boolean hasHeadroom(Integer queriesNeeded, Integer dmlRowsNeeded)` — true only if both fit within the remaining SOQL query and DML row limits AND CPU time used is below 80% of the CPU limit (treat null needs as 0)\n- `public static Map<String, String> snapshot()` — readable \"used / limit\" strings for keys 'SOQL', 'DML statements', 'DML rows', 'CPU ms', 'Heap bytes'\nUse the Limits class only.",
    starter: "public with sharing class LimitGuard {\n\n    public static Boolean hasHeadroom(Integer queriesNeeded, Integer dmlRowsNeeded) {\n        // TODO\n        return true;\n    }\n\n    public static Map<String, String> snapshot() {\n        // TODO\n        return null;\n    }\n}\n",
    solution: "public with sharing class LimitGuard {\n    public static final Decimal CPU_THRESHOLD = 0.8;\n\n    public static Boolean hasHeadroom(Integer queriesNeeded, Integer dmlRowsNeeded) {\n        Integer queries = queriesNeeded == null ? 0 : queriesNeeded;\n        Integer rows = dmlRowsNeeded == null ? 0 : dmlRowsNeeded;\n        Boolean queriesOk = Limits.getQueries() + queries <= Limits.getLimitQueries();\n        Boolean rowsOk = Limits.getDmlRows() + rows <= Limits.getLimitDmlRows();\n        Boolean cpuOk = Limits.getCpuTime() < Limits.getLimitCpuTime() * CPU_THRESHOLD;\n        return queriesOk && rowsOk && cpuOk;\n    }\n\n    public static Map<String, String> snapshot() {\n        return new Map<String, String>{\n            'SOQL' => usage(Limits.getQueries(), Limits.getLimitQueries()),\n            'DML statements' => usage(Limits.getDmlStatements(), Limits.getLimitDmlStatements()),\n            'DML rows' => usage(Limits.getDmlRows(), Limits.getLimitDmlRows()),\n            'CPU ms' => usage(Limits.getCpuTime(), Limits.getLimitCpuTime()),\n            'Heap bytes' => usage(Limits.getHeapSize(), Limits.getLimitHeapSize())\n        };\n    }\n\n    private static String usage(Integer used, Integer max) {\n        return String.valueOf(used) + ' / ' + String.valueOf(max);\n    }\n}\n",
    checks: [
      {
        re: /Limits\.getQueries\s*\(\s*\)/i,
        msg: "Reads Limits.getQueries()"
      },
      {
        re: /Limits\.getLimitQueries\s*\(\s*\)/i,
        msg: "Compares with Limits.getLimitQueries()"
      },
      {
        re: /Limits\.get(Limit)?DmlRows\s*\(\s*\)/i,
        msg: "Checks DML rows"
      },
      {
        re: /Limits\.getCpuTime\s*\(\s*\)/i,
        msg: "Checks CPU time"
      },
      {
        re: /0\.8|80/,
        msg: "Uses the 80% CPU threshold"
      },
      {
        re: /Limits\.getHeapSize\s*\(\s*\)/i,
        msg: "Includes heap usage in the snapshot"
      }
    ],
    forbid: [],
    hints: [
      "Every Limits.getX() has a matching Limits.getLimitX().",
      "Add the planned usage to the current usage before comparing with the limit."
    ],
    ai: "Verify the headroom check adds planned usage to current usage, uses <= / < correctly, handles null inputs, and the snapshot contains all five keys."
  },
  {
    id: "AP096",
    track: "apex",
    level: "Medium",
    topic: "Configuration",
    title: "Feature flags with CMDT and permissions",
    task: "Thames Logistics releases features behind Custom Metadata `Feature_Flag__mdt` (DeveloperName = flag name, Enabled__c, Allowed_Permission__c = optional custom permission API name). Write `FeatureFlags.isEnabled(String flagName)`:\n- Blank name, unknown flag or Enabled__c = false → false\n- If Allowed_Permission__c is set, the running user must have that custom permission\n- Look flags up by name without SOQL\n- Provide a `@TestVisible` static Map<String, Feature_Flag__mdt> of overrides that tests can fill and that wins over real metadata",
    starter: "public with sharing class FeatureFlags {\n\n    public static Boolean isEnabled(String flagName) {\n        // TODO\n        return false;\n    }\n}\n",
    solution: "public with sharing class FeatureFlags {\n    @TestVisible\n    private static Map<String, Feature_Flag__mdt> overrides = new Map<String, Feature_Flag__mdt>();\n\n    public static Boolean isEnabled(String flagName) {\n        if (String.isBlank(flagName)) {\n            return false;\n        }\n        Feature_Flag__mdt flag = overrides.containsKey(flagName)\n            ? overrides.get(flagName)\n            : Feature_Flag__mdt.getInstance(flagName);\n        if (flag == null || !flag.Enabled__c) {\n            return false;\n        }\n        if (String.isBlank(flag.Allowed_Permission__c)) {\n            return true;\n        }\n        return FeatureManagement.checkPermission(flag.Allowed_Permission__c);\n    }\n}\n",
    checks: [
      {
        re: /Feature_Flag__mdt\.(getInstance|getAll)\s*\(/i,
        msg: "Reads the flag via getInstance()/getAll()"
      },
      {
        re: /FeatureManagement\.checkPermission\s*\(/i,
        msg: "Checks the custom permission with FeatureManagement.checkPermission"
      },
      {
        re: /@TestVisible/i,
        msg: "Exposes test overrides with @TestVisible"
      },
      {
        re: /Map<\s*String\s*,\s*Feature_Flag__mdt\s*>/i,
        msg: "Override map is Map<String, Feature_Flag__mdt>"
      },
      {
        re: /Enabled__c/i,
        msg: "Respects Enabled__c"
      }
    ],
    forbid: [
      {
        re: /FROM\s+Feature_Flag__mdt/i,
        msg: "Use getInstance() rather than SOQL"
      }
    ],
    hints: [
      "Feature_Flag__mdt.getInstance(developerName) returns null for unknown names.",
      "FeatureManagement.checkPermission(apiName) checks custom permissions for the running user."
    ],
    ai: "Verify unknown and disabled flags return false, the permission check only applies when configured, overrides take precedence, and no SOQL is used."
  },
  {
    id: "AP097",
    track: "apex",
    level: "Hard",
    topic: "Configuration",
    title: "Metadata-driven payload to SObject mapper",
    task: "Nimbus Fleet maps inbound JSON to records using `Field_Mapping__mdt` (Object_Name__c, Source_Key__c, Target_Field__c, Active__c). Write `PayloadMapper.toSObject(String objectApiName, Map<String, Object> payload)` returning a new SObject.\n- Resolve the object dynamically; unknown object → `MappingException` (inner)\n- Apply active mappings for that object; skip keys absent from the payload\n- Unknown target field → MappingException; skip fields that aren't creatable\n- Convert values by field type: DATE, DATETIME (ISO 8601), CURRENCY/DOUBLE/PERCENT, INTEGER, BOOLEAN; otherwise String\n- `@TestVisible` static List<Field_Mapping__mdt> to override metadata in tests",
    starter: "public with sharing class PayloadMapper {\n    public class MappingException extends Exception {}\n\n    public static SObject toSObject(String objectApiName, Map<String, Object> payload) {\n        // TODO\n        return null;\n    }\n}\n",
    solution: "public with sharing class PayloadMapper {\n    public class MappingException extends Exception {}\n\n    @TestVisible\n    private static List<Field_Mapping__mdt> mappingsOverride;\n\n    public static SObject toSObject(String objectApiName, Map<String, Object> payload) {\n        Type objectType = String.isBlank(objectApiName) ? null : Type.forName(objectApiName);\n        if (objectType == null) {\n            throw new MappingException('Unknown object: ' + objectApiName);\n        }\n        SObject record = (SObject) objectType.newInstance();\n        Map<String, Schema.SObjectField> fields = record.getSObjectType().getDescribe().fields.getMap();\n        if (payload == null) {\n            return record;\n        }\n        for (Field_Mapping__mdt mapping : getMappings(objectApiName)) {\n            if (!payload.containsKey(mapping.Source_Key__c)) {\n                continue;\n            }\n            Schema.SObjectField field = fields.get(mapping.Target_Field__c);\n            if (field == null) {\n                throw new MappingException('Unknown field ' + mapping.Target_Field__c + ' on ' + objectApiName);\n            }\n            Schema.DescribeFieldResult describe = field.getDescribe();\n            if (!describe.isCreateable()) {\n                continue;\n            }\n            record.put(field, coerce(payload.get(mapping.Source_Key__c), describe.getType()));\n        }\n        return record;\n    }\n\n    private static List<Field_Mapping__mdt> getMappings(String objectApiName) {\n        List<Field_Mapping__mdt> source = mappingsOverride != null ? mappingsOverride : Field_Mapping__mdt.getAll().values();\n        List<Field_Mapping__mdt> result = new List<Field_Mapping__mdt>();\n        for (Field_Mapping__mdt mapping : source) {\n            if (mapping.Active__c && mapping.Object_Name__c == objectApiName) {\n                result.add(mapping);\n            }\n        }\n        return result;\n    }\n\n    @TestVisible\n    private static Object coerce(Object value, Schema.DisplayType fieldType) {\n        if (value == null) {\n            return null;\n        }\n        String text = String.valueOf(value);\n        if (fieldType == Schema.DisplayType.DATE) {\n            return Date.valueOf(text);\n        }\n        if (fieldType == Schema.DisplayType.DATETIME) {\n            return (Datetime) JSON.deserialize('\"' + text + '\"', Datetime.class);\n        }\n        if (fieldType == Schema.DisplayType.CURRENCY || fieldType == Schema.DisplayType.DOUBLE || fieldType == Schema.DisplayType.PERCENT) {\n            return Decimal.valueOf(text);\n        }\n        if (fieldType == Schema.DisplayType.INTEGER) {\n            return Integer.valueOf(text);\n        }\n        if (fieldType == Schema.DisplayType.BOOLEAN) {\n            return Boolean.valueOf(text);\n        }\n        return text;\n    }\n}\n",
    checks: [
      {
        re: /Field_Mapping__mdt/i,
        msg: "Reads Field_Mapping__mdt"
      },
      {
        re: /Type\.forName\s*\(|getGlobalDescribe\s*\(|describeSObjects\s*\(/i,
        msg: "Resolves the object dynamically"
      },
      {
        re: /fields\.getMap\s*\(\s*\)|getDescribe\s*\(\s*\)/i,
        msg: "Uses describe information for fields"
      },
      {
        re: /\.put\s*\(/i,
        msg: "Sets values dynamically with put()"
      },
      {
        re: /DisplayType/i,
        msg: "Converts values based on Schema.DisplayType"
      },
      {
        re: /isCreateable\s*\(\s*\)/i,
        msg: "Skips non-creatable fields"
      }
    ],
    forbid: [
      {
        re: /\[\s*SELECT[^\]]*Field_Mapping__mdt/i,
        msg: "Use Field_Mapping__mdt.getAll() rather than SOQL"
      }
    ],
    hints: [
      "Type.forName('Account').newInstance() gives you a new Account as an SObject.",
      "Describe field maps are case-insensitive, so Target_Field__c casing does not matter.",
      "Wrap an ISO string in quotes and JSON.deserialize it to get a Datetime."
    ],
    ai: "Verify unknown objects/fields throw, inactive or other-object mappings are ignored, non-creatable fields are skipped, and each field type is coerced correctly with nulls preserved."
  },
  {
    id: "AP098",
    track: "apex",
    level: "Easy",
    topic: "Design Patterns",
    title: "Opportunity selector class",
    task: "Brightwell Energy is moving all SOQL into selector classes. Write `OpportunitiesSelector` (instance methods, sharing inherited from the caller):\n- `List<Opportunity> selectByIds(Set<Id> ids)`\n- `List<Opportunity> selectOpenByAccountIds(Set<Id> accountIds)` — IsClosed = false, ordered by CloseDate ascending\n- Both return Id, Name, StageName, Amount, CloseDate, AccountId, OwnerId, run in user mode, and return an empty list (no query) for null/empty input",
    starter: "public class OpportunitiesSelector {\n    // TODO\n}\n",
    solution: "public inherited sharing class OpportunitiesSelector {\n\n    public List<Opportunity> selectByIds(Set<Id> ids) {\n        if (ids == null || ids.isEmpty()) {\n            return new List<Opportunity>();\n        }\n        return [\n            SELECT Id, Name, StageName, Amount, CloseDate, AccountId, OwnerId\n            FROM Opportunity\n            WHERE Id IN :ids\n            WITH USER_MODE\n        ];\n    }\n\n    public List<Opportunity> selectOpenByAccountIds(Set<Id> accountIds) {\n        if (accountIds == null || accountIds.isEmpty()) {\n            return new List<Opportunity>();\n        }\n        return [\n            SELECT Id, Name, StageName, Amount, CloseDate, AccountId, OwnerId\n            FROM Opportunity\n            WHERE AccountId IN :accountIds AND IsClosed = false\n            WITH USER_MODE\n            ORDER BY CloseDate ASC\n        ];\n    }\n}\n",
    checks: [
      {
        re: /inherited\s+sharing/i,
        msg: "Declared inherited sharing"
      },
      {
        re: /List<\s*Opportunity\s*>\s+selectByIds\s*\(\s*Set<\s*Id\s*>\s+\w+\s*\)/i,
        msg: "Has selectByIds(Set<Id>)"
      },
      {
        re: /List<\s*Opportunity\s*>\s+selectOpenByAccountIds\s*\(\s*Set<\s*Id\s*>\s+\w+\s*\)/i,
        msg: "Has selectOpenByAccountIds(Set<Id>)"
      },
      {
        re: /IsClosed\s*=\s*false/i,
        msg: "Filters open opportunities"
      },
      {
        re: /WITH\s+USER_MODE/i,
        msg: "Queries in user mode"
      },
      {
        re: /isEmpty\s*\(\s*\)/i,
        msg: "Skips the query for empty input"
      }
    ],
    forbid: [
      {
        re: /static\s+List<\s*Opportunity/i,
        msg: "Use instance methods so the selector can be mocked"
      }
    ],
    hints: [
      "inherited sharing runs with the caller’s sharing mode — ideal for reusable selectors.",
      "Instance methods (not static) let tests swap in a stub."
    ],
    ai: "Verify both methods guard empty input, use bind variables and user mode, are instance methods, and return the same field list."
  },
  {
    id: "AP099",
    track: "apex",
    level: "Easy",
    topic: "Design Patterns",
    title: "Strategy pattern for carrier costs",
    task: "Thames Logistics prices parcels differently per carrier. In class `ShippingCostService` create:\n- An inner interface `CostCalculator` with `Decimal calculate(Decimal weightKg)`\n- `RoyalMailCalculator`: 3.50 + 1.20 per kg\n- `DpdCalculator`: 6.99 up to 2 kg, then + 0.80 per kg above 2\n- `public static CostCalculator getCalculator(String carrier)` — 'ROYAL_MAIL' / 'DPD' (case-insensitive); unknown → IllegalArgumentException\n- `public static Decimal quote(String carrier, Decimal weightKg)` — weight must be > 0 (else IllegalArgumentException); result rounded to 2 dp",
    starter: "public with sharing class ShippingCostService {\n\n    // TODO: CostCalculator interface and implementations\n\n    public static Decimal quote(String carrier, Decimal weightKg) {\n        // TODO\n        return null;\n    }\n}\n",
    solution: "public with sharing class ShippingCostService {\n\n    public interface CostCalculator {\n        Decimal calculate(Decimal weightKg);\n    }\n\n    public class RoyalMailCalculator implements CostCalculator {\n        public Decimal calculate(Decimal weightKg) {\n            return 3.50 + 1.20 * weightKg;\n        }\n    }\n\n    public class DpdCalculator implements CostCalculator {\n        public Decimal calculate(Decimal weightKg) {\n            return weightKg <= 2 ? 6.99 : 6.99 + 0.80 * (weightKg - 2);\n        }\n    }\n\n    public static CostCalculator getCalculator(String carrier) {\n        String key = carrier == null ? '' : carrier.trim().toUpperCase();\n        switch on key {\n            when 'ROYAL_MAIL' {\n                return new RoyalMailCalculator();\n            }\n            when 'DPD' {\n                return new DpdCalculator();\n            }\n            when else {\n                throw new IllegalArgumentException('Unsupported carrier: ' + carrier);\n            }\n        }\n    }\n\n    public static Decimal quote(String carrier, Decimal weightKg) {\n        if (weightKg == null || weightKg <= 0) {\n            throw new IllegalArgumentException('Weight must be greater than zero');\n        }\n        return getCalculator(carrier).calculate(weightKg).setScale(2, RoundingMode.HALF_UP);\n    }\n}\n",
    checks: [
      {
        re: /interface\s+CostCalculator/i,
        msg: "Declares the CostCalculator interface"
      },
      {
        re: /implements\s+CostCalculator[\s\S]*implements\s+CostCalculator/i,
        msg: "Two classes implement CostCalculator"
      },
      {
        re: /CostCalculator\s+getCalculator\s*\(\s*String\s+\w+\s*\)/i,
        msg: "Has getCalculator(String) returning CostCalculator"
      },
      {
        re: /IllegalArgumentException/i,
        msg: "Rejects unknown carriers / invalid weight"
      },
      {
        re: /setScale\s*\(\s*2/i,
        msg: "Rounds to 2 decimal places"
      }
    ],
    forbid: [],
    hints: [
      "The interface method has no access modifier; implementations declare it public.",
      "switch on a String works nicely for picking the implementation."
    ],
    ai: "Verify both pricing formulas (including the DPD 2 kg boundary), case-insensitive carrier lookup, validation of weight, and that quote() delegates to the strategy."
  },
  {
    id: "AP100",
    track: "apex",
    level: "Medium",
    topic: "Design Patterns",
    title: "Pluggable strategy via Type.forName",
    task: "Brightwell Energy configures pricing per sales channel in `Pricing_Strategy__mdt` (Channel__c, Apex_Class__c). An interface `PricingStrategy` (`Decimal price(Decimal listPrice, Integer quantity)`) already exists. Write `PricingStrategyFactory.forChannel(String channel)` returning `PricingStrategy`:\n- Find the metadata row for the channel (case-insensitive)\n- Instantiate the class dynamically with Type.forName\n- Throw `StrategyException` (inner) for a blank channel, no config, class not found, or a class that doesn't implement PricingStrategy\n- Cache instances per channel in a static map",
    starter: "public with sharing class PricingStrategyFactory {\n    public class StrategyException extends Exception {}\n\n    public static PricingStrategy forChannel(String channel) {\n        // TODO\n        return null;\n    }\n}\n",
    solution: "public with sharing class PricingStrategyFactory {\n    public class StrategyException extends Exception {}\n\n    private static Map<String, PricingStrategy> cache = new Map<String, PricingStrategy>();\n\n    public static PricingStrategy forChannel(String channel) {\n        if (String.isBlank(channel)) {\n            throw new StrategyException('Channel is required');\n        }\n        String key = channel.trim().toUpperCase();\n        if (cache.containsKey(key)) {\n            return cache.get(key);\n        }\n        String className;\n        for (Pricing_Strategy__mdt config : Pricing_Strategy__mdt.getAll().values()) {\n            if (config.Channel__c != null && config.Channel__c.trim().toUpperCase() == key) {\n                className = config.Apex_Class__c;\n                break;\n            }\n        }\n        if (String.isBlank(className)) {\n            throw new StrategyException('No pricing strategy configured for channel ' + channel);\n        }\n        Type strategyType = Type.forName(className);\n        if (strategyType == null) {\n            throw new StrategyException('Apex class not found: ' + className);\n        }\n        Object instance = strategyType.newInstance();\n        if (!(instance instanceof PricingStrategy)) {\n            throw new StrategyException(className + ' does not implement PricingStrategy');\n        }\n        cache.put(key, (PricingStrategy) instance);\n        return (PricingStrategy) instance;\n    }\n}\n",
    checks: [
      {
        re: /Type\.forName\s*\(/i,
        msg: "Resolves the class with Type.forName"
      },
      {
        re: /\.newInstance\s*\(\s*\)/i,
        msg: "Instantiates it with newInstance()"
      },
      {
        re: /instanceof\s+PricingStrategy/i,
        msg: "Checks the instance implements PricingStrategy"
      },
      {
        re: /Pricing_Strategy__mdt/i,
        msg: "Reads Pricing_Strategy__mdt"
      },
      {
        re: /static\s+Map<\s*String\s*,\s*PricingStrategy\s*>/i,
        msg: "Caches instances in a static map"
      }
    ],
    forbid: [],
    hints: [
      "Type.forName returns null when the class does not exist.",
      "newInstance() returns Object — check instanceof before casting."
    ],
    ai: "Verify every failure mode throws StrategyException with a helpful message, lookup is case-insensitive, and cached instances are reused."
  },
  {
    id: "AP101",
    track: "apex",
    level: "Medium",
    topic: "Design Patterns",
    title: "Service layer: close opportunities as won",
    task: "Nimbus Fleet wants business logic in services, not controllers. Write `OpportunityService.closeWon(Set<Id> opportunityIds)`:\n- Query the opportunities in user mode; if any Id isn't found → `ServiceException` (inner)\n- Validate all first: already closed, or Amount null/≤ 0 → ServiceException naming the opportunity\n- Set StageName 'Closed Won' and CloseDate today\n- Create a follow-up Task per opportunity (WhatId, OwnerId = opp owner, Subject 'Kick-off call: ' + Name, due in 7 days, Priority High)\n- Both DMLs succeed or neither: use a savepoint and roll back on failure, rethrowing as ServiceException",
    starter: "public with sharing class OpportunityService {\n    public class ServiceException extends Exception {}\n\n    public static void closeWon(Set<Id> opportunityIds) {\n        // TODO\n    }\n}\n",
    solution: "public with sharing class OpportunityService {\n    public class ServiceException extends Exception {}\n\n    public static void closeWon(Set<Id> opportunityIds) {\n        if (opportunityIds == null || opportunityIds.isEmpty()) {\n            return;\n        }\n        List<Opportunity> opps = [\n            SELECT Id, Name, Amount, OwnerId, IsClosed\n            FROM Opportunity\n            WHERE Id IN :opportunityIds\n            WITH USER_MODE\n        ];\n        if (opps.size() != opportunityIds.size()) {\n            throw new ServiceException('One or more opportunities were not found or are not accessible');\n        }\n        List<Task> followUps = new List<Task>();\n        for (Opportunity opp : opps) {\n            if (opp.IsClosed) {\n                throw new ServiceException(opp.Name + ' is already closed');\n            }\n            if (opp.Amount == null || opp.Amount <= 0) {\n                throw new ServiceException(opp.Name + ' needs a positive Amount before it can be won');\n            }\n            opp.StageName = 'Closed Won';\n            opp.CloseDate = Date.today();\n            followUps.add(new Task(\n                WhatId = opp.Id,\n                OwnerId = opp.OwnerId,\n                Subject = 'Kick-off call: ' + opp.Name,\n                ActivityDate = Date.today().addDays(7),\n                Priority = 'High'\n            ));\n        }\n        Savepoint sp = Database.setSavepoint();\n        try {\n            update as user opps;\n            insert as user followUps;\n        } catch (DmlException e) {\n            Database.rollback(sp);\n            throw new ServiceException('Could not close opportunities: ' + e.getMessage());\n        }\n    }\n}\n",
    checks: [
      {
        re: /Database\.setSavepoint\s*\(\s*\)/i,
        msg: "Creates a savepoint"
      },
      {
        re: /Database\.rollback\s*\(/i,
        msg: "Rolls back on failure"
      },
      {
        re: /'Closed Won'/i,
        msg: "Sets StageName to 'Closed Won'"
      },
      {
        re: /new\s+Task\s*\(/i,
        msg: "Creates follow-up Tasks"
      },
      {
        re: /addDays\s*\(\s*7\s*\)/i,
        msg: "Tasks are due in 7 days"
      },
      {
        re: /throw\s+new\s+ServiceException/i,
        msg: "Throws ServiceException on validation failure"
      }
    ],
    forbid: [
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i,
        msg: "No SOQL inside a loop"
      },
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+(as\s+(user|system)\s+)?\w+\s*;/i,
        msg: "No DML inside a loop"
      }
    ],
    hints: [
      "Validate everything before any DML so you fail fast without partial work.",
      "Savepoint sp = Database.setSavepoint(); ... Database.rollback(sp);"
    ],
    ai: "Verify validation happens before DML, missing records are detected, both DMLs are atomic via savepoint/rollback, and the service is bulk-safe."
  },
  {
    id: "AP102",
    track: "apex",
    level: "Medium",
    topic: "Design Patterns",
    title: "Cache-aside exchange rates in Platform Cache",
    task: "Thames Logistics converts invoices into GBP constantly. Write `ExchangeRateCache.getRate(String currencyCode)` returning Decimal using the org cache partition `local.FX`:\n- Normalise the code (trim, upper-case); blank → null; 'GBP' → 1 without touching cache\n- Key: 'rate' + code (cache keys must be alphanumeric)\n- Cache hit → return it; miss → query the latest `Exchange_Rate__c` (Currency_Code__c, Rate__c, Effective_Date__c) by Effective_Date__c desc, store it for 3600 seconds, return it\n- No row → return null and don't cache",
    starter: "public with sharing class ExchangeRateCache {\n\n    public static Decimal getRate(String currencyCode) {\n        // TODO\n        return null;\n    }\n}\n",
    solution: "public with sharing class ExchangeRateCache {\n    private static final String PARTITION_NAME = 'local.FX';\n    private static final Integer TTL_SECONDS = 3600;\n\n    public static Decimal getRate(String currencyCode) {\n        if (String.isBlank(currencyCode)) {\n            return null;\n        }\n        String code = currencyCode.trim().toUpperCase();\n        if (code == 'GBP') {\n            return 1;\n        }\n        String key = 'rate' + code;\n        Cache.OrgPartition partition = Cache.Org.getPartition(PARTITION_NAME);\n        Decimal cached = (Decimal) partition.get(key);\n        if (cached != null) {\n            return cached;\n        }\n        List<Exchange_Rate__c> rows = [\n            SELECT Rate__c\n            FROM Exchange_Rate__c\n            WHERE Currency_Code__c = :code\n            ORDER BY Effective_Date__c DESC\n            LIMIT 1\n        ];\n        if (rows.isEmpty() || rows[0].Rate__c == null) {\n            return null;\n        }\n        partition.put(key, rows[0].Rate__c, TTL_SECONDS);\n        return rows[0].Rate__c;\n    }\n}\n",
    checks: [
      {
        re: /Cache\.Org\.getPartition\s*\(\s*('local\.FX'|\w+)\s*\)|Cache\.Org\.get\s*\(\s*'local\.FX/i,
        msg: "Uses the local.FX org cache partition"
      },
      {
        re: /local\.FX/i,
        msg: "Names the local.FX partition"
      },
      {
        re: /\.get\s*\(\s*\w+\s*\)/i,
        msg: "Reads from the cache first"
      },
      {
        re: /\.put\s*\([^;]*(3600|TTL)/i,
        msg: "Stores the value with a 3600 second TTL"
      },
      {
        re: /ORDER\s+BY\s+Effective_Date__c\s+DESC/i,
        msg: "Picks the latest rate"
      },
      {
        re: /'GBP'/i,
        msg: "Short-circuits GBP"
      }
    ],
    forbid: [],
    hints: [
      "Cache.Org.getPartition('local.FX') returns a Cache.OrgPartition with get/put.",
      "Cast the cached Object back to Decimal; a null means a miss."
    ],
    ai: "Verify the cache is checked before SOQL, misses populate the cache with the TTL, keys are alphanumeric, and null results are not cached."
  },
  {
    id: "AP103",
    track: "apex",
    level: "Hard",
    topic: "Design Patterns",
    title: "Minimal Unit of Work",
    task: "Brightwell Energy wants a lightweight Unit of Work. Write `SimpleUnitOfWork`:\n- Constructor takes `List<Schema.SObjectType>` — the insert/update order (parents first)\n- `registerNew(SObject record)`, and `registerNew(SObject record, Schema.SObjectField relatedToField, SObject parent)` to set a lookup to a parent that has no Id yet\n- `registerDirty(SObject record)` (must have an Id; same record registered twice is updated once)\n- `commitWork()`: per type in order — resolve relationships, insert new records; then update dirty records; user mode; one savepoint, roll back and rethrow on any failure\n- Unregistered types or invalid records → `UnitOfWorkException` (inner)",
    starter: "public with sharing class SimpleUnitOfWork {\n    public class UnitOfWorkException extends Exception {}\n\n    public SimpleUnitOfWork(List<Schema.SObjectType> orderedTypes) {\n        // TODO\n    }\n\n    public void registerNew(SObject record) {\n        // TODO\n    }\n\n    public void registerDirty(SObject record) {\n        // TODO\n    }\n\n    public void commitWork() {\n        // TODO\n    }\n}\n",
    solution: "public with sharing class SimpleUnitOfWork {\n    public class UnitOfWorkException extends Exception {}\n\n    private class Relationship {\n        public SObject child;\n        public Schema.SObjectField field;\n        public SObject parent;\n\n        public Relationship(SObject child, Schema.SObjectField field, SObject parent) {\n            this.child = child;\n            this.field = field;\n            this.parent = parent;\n        }\n\n        public void resolve() {\n            child.put(field, parent.Id);\n        }\n    }\n\n    private List<Schema.SObjectType> orderedTypes;\n    private Map<Schema.SObjectType, List<SObject>> newRecords = new Map<Schema.SObjectType, List<SObject>>();\n    private Map<Schema.SObjectType, Map<Id, SObject>> dirtyRecords = new Map<Schema.SObjectType, Map<Id, SObject>>();\n    private List<Relationship> relationships = new List<Relationship>();\n\n    public SimpleUnitOfWork(List<Schema.SObjectType> orderedTypes) {\n        this.orderedTypes = orderedTypes;\n        for (Schema.SObjectType t : orderedTypes) {\n            newRecords.put(t, new List<SObject>());\n            dirtyRecords.put(t, new Map<Id, SObject>());\n        }\n    }\n\n    public void registerNew(SObject record) {\n        if (record == null || record.Id != null) {\n            throw new UnitOfWorkException('New records must be non-null and have no Id');\n        }\n        newRecords.get(typeOf(record)).add(record);\n    }\n\n    public void registerNew(SObject record, Schema.SObjectField relatedToField, SObject parent) {\n        registerNew(record);\n        if (parent != null && relatedToField != null) {\n            relationships.add(new Relationship(record, relatedToField, parent));\n        }\n    }\n\n    public void registerDirty(SObject record) {\n        if (record == null || record.Id == null) {\n            throw new UnitOfWorkException('Dirty records must have an Id');\n        }\n        dirtyRecords.get(typeOf(record)).put(record.Id, record);\n    }\n\n    public void commitWork() {\n        Savepoint sp = Database.setSavepoint();\n        try {\n            for (Schema.SObjectType t : orderedTypes) {\n                for (Relationship rel : relationships) {\n                    if (rel.child.getSObjectType() == t) {\n                        rel.resolve();\n                    }\n                }\n                List<SObject> inserts = newRecords.get(t);\n                if (!inserts.isEmpty()) {\n                    Database.insert(inserts, true, AccessLevel.USER_MODE);\n                }\n            }\n            for (Schema.SObjectType t : orderedTypes) {\n                List<SObject> updates = dirtyRecords.get(t).values();\n                if (!updates.isEmpty()) {\n                    Database.update(updates, true, AccessLevel.USER_MODE);\n                }\n            }\n        } catch (Exception e) {\n            Database.rollback(sp);\n            throw e;\n        }\n    }\n\n    private Schema.SObjectType typeOf(SObject record) {\n        Schema.SObjectType t = record.getSObjectType();\n        if (!newRecords.containsKey(t)) {\n            throw new UnitOfWorkException('SObject type not registered with this unit of work: ' + t);\n        }\n        return t;\n    }\n}\n",
    checks: [
      {
        re: /void\s+registerNew\s*\(\s*SObject\s+\w+\s*,\s*Schema\.SObjectField\s+\w+\s*,\s*SObject\s+\w+\s*\)/i,
        msg: "Has registerNew(record, relatedToField, parent)"
      },
      {
        re: /void\s+registerDirty\s*\(\s*SObject\s+\w+\s*\)/i,
        msg: "Has registerDirty(SObject)"
      },
      {
        re: /Database\.setSavepoint\s*\(\s*\)/i,
        msg: "Uses a savepoint in commitWork"
      },
      {
        re: /Database\.rollback\s*\(/i,
        msg: "Rolls back on failure"
      },
      {
        re: /Map<\s*(Schema\.)?SObjectType\s*,/i,
        msg: "Tracks records per SObjectType"
      },
      {
        re: /\.put\s*\(\s*\w+\s*,\s*\w+\.Id\s*\)|\.put\s*\([^;]*parent\w*\.Id/i,
        msg: "Resolves parent Ids onto child lookups"
      }
    ],
    forbid: [],
    hints: [
      "Store records by SObjectType in maps initialised from the constructor list.",
      "Resolve relationships for a type right before inserting it — parents earlier in the order already have Ids.",
      "Using Map<Id, SObject> for dirty records de-duplicates repeat registrations."
    ],
    ai: "Verify inserts follow the configured order with relationships resolved before each type is inserted, dirty records are de-duplicated, DML is per type (not per record), and any failure rolls back everything."
  },
  {
    id: "AP104",
    track: "apex",
    level: "Hard",
    topic: "Design Patterns",
    title: "Platform Cache with CacheBuilder",
    task: "Nimbus Fleet's quoting screen reads product prices thousands of times a day. Write `ProductPriceCache implements Cache.CacheBuilder` using org partition `local.Pricing`:\n- `doLoad(String productId)` returns a `Map<String, Decimal>` of active price book name → UnitPrice for active PricebookEntries of that product (empty map if none)\n- `public static Map<String, Decimal> getPrices(Id productId)` — null Id → empty map; otherwise fetch through the CacheBuilder (cache miss loads automatically)\n- `public static void invalidate(Id productId)` removes the entry\n- Use the 18-char Id as the key",
    starter: "public with sharing class ProductPriceCache {\n\n    public static Map<String, Decimal> getPrices(Id productId) {\n        // TODO\n        return null;\n    }\n\n    public static void invalidate(Id productId) {\n        // TODO\n    }\n}\n",
    solution: "public with sharing class ProductPriceCache implements Cache.CacheBuilder {\n    private static final String PARTITION_NAME = 'local.Pricing';\n\n    public Object doLoad(String productId) {\n        Map<String, Decimal> prices = new Map<String, Decimal>();\n        for (PricebookEntry pbe : [\n            SELECT Pricebook2.Name, UnitPrice\n            FROM PricebookEntry\n            WHERE Product2Id = :productId\n            AND IsActive = true\n            AND Pricebook2.IsActive = true\n        ]) {\n            prices.put(pbe.Pricebook2.Name, pbe.UnitPrice);\n        }\n        return prices;\n    }\n\n    public static Map<String, Decimal> getPrices(Id productId) {\n        if (productId == null) {\n            return new Map<String, Decimal>();\n        }\n        return (Map<String, Decimal>) partition().get(ProductPriceCache.class, String.valueOf(productId));\n    }\n\n    public static void invalidate(Id productId) {\n        if (productId != null) {\n            partition().remove(ProductPriceCache.class, String.valueOf(productId));\n        }\n    }\n\n    private static Cache.OrgPartition partition() {\n        return Cache.Org.getPartition(PARTITION_NAME);\n    }\n}\n",
    checks: [
      {
        re: /implements\s+Cache\.CacheBuilder/i,
        msg: "Implements Cache.CacheBuilder"
      },
      {
        re: /Object\s+doLoad\s*\(\s*String\s+\w+\s*\)/i,
        msg: "Implements Object doLoad(String)"
      },
      {
        re: /\.get\s*\(\s*ProductPriceCache\.class\s*,/i,
        msg: "Reads through the CacheBuilder with get(ProductPriceCache.class, key)"
      },
      {
        re: /\.remove\s*\(\s*ProductPriceCache\.class\s*,/i,
        msg: "Invalidates with remove(ProductPriceCache.class, key)"
      },
      {
        re: /local\.Pricing/i,
        msg: "Uses the local.Pricing partition"
      }
    ],
    forbid: [
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i,
        msg: "No SOQL inside a loop"
      }
    ],
    hints: [
      "With a CacheBuilder you never call put — get(Builder.class, key) loads on a miss.",
      "doLoad must be a public instance method and the class needs a no-arg constructor."
    ],
    ai: "Verify the cache is read through the CacheBuilder (no manual put), keys are valid alphanumeric Ids, null input is handled, and doLoad returns an empty map rather than null."
  },
  {
    id: "AP105",
    track: "apex",
    level: "Easy",
    topic: "Industry Clouds",
    title: "Sales Cloud weighted pipeline by owner",
    task: "Brightwell Energy's sales managers want weighted pipeline per rep. Write `PipelineService.weightedPipelineByOwner(Set<Id> ownerIds)` returning `Map<Id, Decimal>`.\n- Consider open Opportunities (IsClosed = false) closing THIS_FISCAL_QUARTER owned by the given users\n- Weighted amount = Amount × Probability / 100; skip records where either is null\n- Every requested owner appears in the map (0 if nothing)\n- Values rounded to 2 dp; one query in user mode; empty map for null/empty input",
    starter: "public with sharing class PipelineService {\n\n    public static Map<Id, Decimal> weightedPipelineByOwner(Set<Id> ownerIds) {\n        // TODO\n        return null;\n    }\n}\n",
    solution: "public with sharing class PipelineService {\n\n    public static Map<Id, Decimal> weightedPipelineByOwner(Set<Id> ownerIds) {\n        Map<Id, Decimal> totals = new Map<Id, Decimal>();\n        if (ownerIds == null || ownerIds.isEmpty()) {\n            return totals;\n        }\n        for (Id ownerId : ownerIds) {\n            totals.put(ownerId, 0);\n        }\n        for (Opportunity opp : [\n            SELECT OwnerId, Amount, Probability\n            FROM Opportunity\n            WHERE OwnerId IN :ownerIds\n            AND IsClosed = false\n            AND CloseDate = THIS_FISCAL_QUARTER\n            WITH USER_MODE\n        ]) {\n            if (opp.Amount == null || opp.Probability == null) {\n                continue;\n            }\n            totals.put(opp.OwnerId, totals.get(opp.OwnerId) + opp.Amount * opp.Probability / 100);\n        }\n        Map<Id, Decimal> rounded = new Map<Id, Decimal>();\n        for (Id ownerId : totals.keySet()) {\n            rounded.put(ownerId, totals.get(ownerId).setScale(2, RoundingMode.HALF_UP));\n        }\n        return rounded;\n    }\n}\n",
    checks: [
      {
        re: /Map<\s*Id\s*,\s*Decimal\s*>\s+weightedPipelineByOwner\s*\(\s*Set<\s*Id\s*>\s+\w+\s*\)/i,
        msg: "Keeps the required signature"
      },
      {
        re: /Probability\s*\/\s*100|\/\s*100/i,
        msg: "Weights by Probability / 100"
      },
      {
        re: /IsClosed\s*=\s*false/i,
        msg: "Only open opportunities"
      },
      {
        re: /THIS_FISCAL_QUARTER/i,
        msg: "Filters on THIS_FISCAL_QUARTER"
      },
      {
        re: /setScale\s*\(\s*2/i,
        msg: "Rounds to 2 dp"
      }
    ],
    forbid: [
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i,
        msg: "No SOQL inside a loop"
      }
    ],
    hints: [
      "Seed the map with 0 for every owner before the query.",
      "Probability is a percent field (0–100)."
    ],
    ai: "Verify every requested owner appears, null Amount/Probability are skipped, rounding happens once on the totals, and there is a single user-mode query."
  },
  {
    id: "AP106",
    track: "apex",
    level: "Easy",
    topic: "Industry Clouds",
    title: "Service Cloud case routing to queues",
    task: "Thames Logistics routes new Cases by Type before insert. Write `CaseRoutingService.route(List<Case> cases)` (no DML — called from a before-insert trigger):\n- Type → queue DeveloperName: Billing → Billing_Support, Technical → Tech_Support, Outage → Priority_Response; anything else (or blank) → General_Support\n- Look up all queue Ids in ONE query on Group (Type = 'Queue')\n- Set OwnerId to the queue Id; leave OwnerId unchanged if the queue doesn't exist\n- Outage cases also get Priority 'High'\n- No hard-coded Ids",
    starter: "public with sharing class CaseRoutingService {\n\n    public static void route(List<Case> cases) {\n        // TODO\n    }\n}\n",
    solution: "public with sharing class CaseRoutingService {\n    public static final String DEFAULT_QUEUE = 'General_Support';\n    private static final Map<String, String> QUEUE_BY_TYPE = new Map<String, String>{\n        'Billing' => 'Billing_Support',\n        'Technical' => 'Tech_Support',\n        'Outage' => 'Priority_Response'\n    };\n\n    public static void route(List<Case> cases) {\n        if (cases == null || cases.isEmpty()) {\n            return;\n        }\n        Set<String> queueNames = new Set<String>(QUEUE_BY_TYPE.values());\n        queueNames.add(DEFAULT_QUEUE);\n        Map<String, Id> queueIds = new Map<String, Id>();\n        for (Group q : [SELECT Id, DeveloperName FROM Group WHERE Type = 'Queue' AND DeveloperName IN :queueNames]) {\n            queueIds.put(q.DeveloperName, q.Id);\n        }\n        for (Case c : cases) {\n            String queueName = (c.Type != null && QUEUE_BY_TYPE.containsKey(c.Type)) ? QUEUE_BY_TYPE.get(c.Type) : DEFAULT_QUEUE;\n            Id queueId = queueIds.get(queueName);\n            if (queueId != null) {\n                c.OwnerId = queueId;\n            }\n            if (c.Type == 'Outage') {\n                c.Priority = 'High';\n            }\n        }\n    }\n}\n",
    checks: [
      {
        re: /FROM\s+Group/i,
        msg: "Queries queues from Group"
      },
      {
        re: /Type\s*=\s*'Queue'/i,
        msg: "Filters Group Type = 'Queue'"
      },
      {
        re: /DeveloperName\s+IN\s*:/i,
        msg: "Looks up all queues in one query"
      },
      {
        re: /OwnerId\s*=/i,
        msg: "Assigns OwnerId"
      },
      {
        re: /General_Support/i,
        msg: "Falls back to General_Support"
      }
    ],
    forbid: [
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i,
        msg: "No SOQL inside a loop"
      },
      {
        re: /'00G[A-Za-z0-9]{12,15}'/,
        msg: "No hard-coded queue Ids"
      },
      {
        re: /\b(insert|update)\s+\w+\s*;/i,
        msg: "No DML — this runs before insert"
      }
    ],
    hints: [
      "Collect all needed DeveloperNames first, then query Group once.",
      "A Map<String, String> from Type to queue name keeps the routing table readable."
    ],
    ai: "Verify one Group query, correct fallback for unknown/blank types, OwnerId unchanged when a queue is missing, and no DML or hard-coded Ids."
  },
  {
    id: "AP107",
    track: "apex",
    level: "Medium",
    topic: "Industry Clouds",
    title: "Service Cloud: assign entitlements",
    task: "Nimbus Fleet sells support contracts tracked as Entitlements. Write `EntitlementAssigner.assign(List<Case> cases)` (before insert, no DML):\n- Only cases with an AccountId and no EntitlementId\n- Find Entitlements for those accounts with Status = 'Active' in ONE query\n- If an account has several, prefer the one that never ends (EndDate null), otherwise the latest EndDate\n- Set Case.EntitlementId; leave the case unchanged when none is found",
    starter: "public with sharing class EntitlementAssigner {\n\n    public static void assign(List<Case> cases) {\n        // TODO\n    }\n}\n",
    solution: "public with sharing class EntitlementAssigner {\n\n    public static void assign(List<Case> cases) {\n        Set<Id> accountIds = new Set<Id>();\n        for (Case c : cases) {\n            if (c.AccountId != null && c.EntitlementId == null) {\n                accountIds.add(c.AccountId);\n            }\n        }\n        if (accountIds.isEmpty()) {\n            return;\n        }\n        Map<Id, Id> entitlementByAccount = new Map<Id, Id>();\n        for (Entitlement ent : [\n            SELECT Id, AccountId, EndDate\n            FROM Entitlement\n            WHERE AccountId IN :accountIds AND Status = 'Active'\n            ORDER BY EndDate DESC NULLS FIRST\n        ]) {\n            if (!entitlementByAccount.containsKey(ent.AccountId)) {\n                entitlementByAccount.put(ent.AccountId, ent.Id);\n            }\n        }\n        for (Case c : cases) {\n            if (c.EntitlementId == null && entitlementByAccount.containsKey(c.AccountId)) {\n                c.EntitlementId = entitlementByAccount.get(c.AccountId);\n            }\n        }\n    }\n}\n",
    checks: [
      {
        re: /FROM\s+Entitlement/i,
        msg: "Queries Entitlement"
      },
      {
        re: /AccountId\s+IN\s*:/i,
        msg: "Queries all accounts at once"
      },
      {
        re: /Status\s*=\s*'Active'/i,
        msg: "Only Status = 'Active' entitlements"
      },
      {
        re: /EndDate/i,
        msg: "Prefers by EndDate"
      },
      {
        re: /EntitlementId\s*=\s*[^=]/i,
        msg: "Sets Case.EntitlementId"
      }
    ],
    forbid: [
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i,
        msg: "No SOQL inside a loop"
      },
      {
        re: /\b(insert|update)\s+\w+\s*;/i,
        msg: "No DML — this runs before insert"
      }
    ],
    hints: [
      "ORDER BY EndDate DESC NULLS FIRST puts the best candidate first per account.",
      "Keep only the first Entitlement you see for each AccountId."
    ],
    ai: "Verify cases that already have an entitlement or no account are untouched, the preference order (null EndDate, then latest) is correct, and there is a single query."
  },
  {
    id: "AP108",
    track: "apex",
    level: "Medium",
    topic: "Industry Clouds",
    title: "CPQ: find over-discounted quote lines",
    task: "Brightwell Energy uses Salesforce CPQ. Deal desk wants lines discounted beyond policy. Write `QuoteDiscountAnalyzer.findOverDiscounted(Set<Id> quoteIds, Decimal thresholdPct)` returning `Map<Id, List<SBQQ__QuoteLine__c>>` keyed by quote Id.\n- Query SBQQ__QuoteLine__c for the quotes (skip quotes with SBQQ__Status__c 'Approved'), user mode\n- Effective discount % = (1 − SBQQ__NetPrice__c / SBQQ__ListPrice__c) × 100, rounded to 2 dp; if list price is null/0 or net price null, use SBQQ__Discount__c\n- Include lines whose effective discount is strictly above the threshold\n- Null/empty inputs → empty map",
    starter: "public with sharing class QuoteDiscountAnalyzer {\n\n    public static Map<Id, List<SBQQ__QuoteLine__c>> findOverDiscounted(Set<Id> quoteIds, Decimal thresholdPct) {\n        // TODO\n        return null;\n    }\n}\n",
    solution: "public with sharing class QuoteDiscountAnalyzer {\n\n    public static Map<Id, List<SBQQ__QuoteLine__c>> findOverDiscounted(Set<Id> quoteIds, Decimal thresholdPct) {\n        Map<Id, List<SBQQ__QuoteLine__c>> result = new Map<Id, List<SBQQ__QuoteLine__c>>();\n        if (quoteIds == null || quoteIds.isEmpty() || thresholdPct == null) {\n            return result;\n        }\n        for (SBQQ__QuoteLine__c line : [\n            SELECT Id, SBQQ__Quote__c, SBQQ__Product__r.Name, SBQQ__Quantity__c,\n                   SBQQ__ListPrice__c, SBQQ__NetPrice__c, SBQQ__Discount__c\n            FROM SBQQ__QuoteLine__c\n            WHERE SBQQ__Quote__c IN :quoteIds\n            AND SBQQ__Quote__r.SBQQ__Status__c != 'Approved'\n            WITH USER_MODE\n        ]) {\n            Decimal effective = effectiveDiscount(line);\n            if (effective == null || effective <= thresholdPct) {\n                continue;\n            }\n            if (!result.containsKey(line.SBQQ__Quote__c)) {\n                result.put(line.SBQQ__Quote__c, new List<SBQQ__QuoteLine__c>());\n            }\n            result.get(line.SBQQ__Quote__c).add(line);\n        }\n        return result;\n    }\n\n    @TestVisible\n    private static Decimal effectiveDiscount(SBQQ__QuoteLine__c line) {\n        if (line.SBQQ__ListPrice__c == null || line.SBQQ__ListPrice__c == 0 || line.SBQQ__NetPrice__c == null) {\n            return line.SBQQ__Discount__c;\n        }\n        return ((1 - line.SBQQ__NetPrice__c / line.SBQQ__ListPrice__c) * 100).setScale(2, RoundingMode.HALF_UP);\n    }\n}\n",
    checks: [
      {
        re: /FROM\s+SBQQ__QuoteLine__c/i,
        msg: "Queries SBQQ__QuoteLine__c"
      },
      {
        re: /SBQQ__Quote__c\s+IN\s*:/i,
        msg: "Filters by quote Ids in one query"
      },
      {
        re: /SBQQ__NetPrice__c\s*\/\s*\w+\.SBQQ__ListPrice__c/i,
        msg: "Computes net / list price"
      },
      {
        re: /SBQQ__Discount__c/i,
        msg: "Falls back to SBQQ__Discount__c"
      },
      {
        re: /SBQQ__Status__c\s*!=\s*'Approved'/i,
        msg: "Skips approved quotes"
      },
      {
        re: /Map<\s*Id\s*,\s*List<\s*SBQQ__QuoteLine__c\s*>\s*>/i,
        msg: "Returns Map<Id, List<SBQQ__QuoteLine__c>>"
      }
    ],
    forbid: [
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i,
        msg: "No SOQL inside a loop"
      },
      {
        re: /\b(insert|update|upsert)\s+\w+\s*;/i,
        msg: "Read-only analysis — no DML on CPQ records"
      }
    ],
    hints: [
      "Filter on the parent with SBQQ__Quote__r.SBQQ__Status__c.",
      "Guard against division by zero before dividing by the list price."
    ],
    ai: "Verify the effective discount formula, divide-by-zero/null fallback, strict \"above threshold\" comparison, approved-quote exclusion and correct grouping by quote."
  },
  {
    id: "AP109",
    track: "apex",
    level: "Hard",
    topic: "Industry Clouds",
    title: "Revenue Cloud style tiered pricing",
    task: "Thames Logistics prices warehouse slots with tiers, e.g. 1–10 @ £20, 11–50 @ £15, 51+ @ £12. Write `TieredPricingEngine` with inner `PriceTier(Integer lowerBound, Integer upperBound, Decimal unitPrice)` (upperBound null = unbounded):\n- `graduatedTotal(Integer qty, List<PriceTier> tiers)` — each unit priced in its own tier (60 → 920.00)\n- `volumeTotal(Integer qty, List<PriceTier> tiers)` — all units at the tier containing qty (60 → 720.00)\n- qty null/≤0 → 0; results rounded to 2 dp HALF_UP\n- Validate (sort a copy by lowerBound): first tier starts at 1, contiguous, no gaps/overlaps, no negative prices, qty beyond last bounded tier → `PricingException`",
    starter: "public with sharing class TieredPricingEngine {\n    public class PricingException extends Exception {}\n\n    public class PriceTier {\n        public Integer lowerBound;\n        public Integer upperBound;\n        public Decimal unitPrice;\n\n        public PriceTier(Integer lowerBound, Integer upperBound, Decimal unitPrice) {\n            this.lowerBound = lowerBound;\n            this.upperBound = upperBound;\n            this.unitPrice = unitPrice;\n        }\n    }\n\n    public static Decimal graduatedTotal(Integer quantity, List<PriceTier> tiers) {\n        // TODO\n        return null;\n    }\n\n    public static Decimal volumeTotal(Integer quantity, List<PriceTier> tiers) {\n        // TODO\n        return null;\n    }\n}\n",
    solution: "public with sharing class TieredPricingEngine {\n    public class PricingException extends Exception {}\n\n    public class PriceTier {\n        public Integer lowerBound;\n        public Integer upperBound;\n        public Decimal unitPrice;\n\n        public PriceTier(Integer lowerBound, Integer upperBound, Decimal unitPrice) {\n            this.lowerBound = lowerBound;\n            this.upperBound = upperBound;\n            this.unitPrice = unitPrice;\n        }\n    }\n\n    private class LowerBoundComparator implements Comparator<PriceTier> {\n        public Integer compare(PriceTier a, PriceTier b) {\n            return a.lowerBound - b.lowerBound;\n        }\n    }\n\n    public static Decimal graduatedTotal(Integer quantity, List<PriceTier> tiers) {\n        if (quantity == null || quantity <= 0) {\n            return 0;\n        }\n        List<PriceTier> sorted = validate(tiers, quantity);\n        Decimal total = 0;\n        for (PriceTier tier : sorted) {\n            if (quantity < tier.lowerBound) {\n                break;\n            }\n            Integer upper = tier.upperBound == null ? quantity : Math.min(quantity, tier.upperBound);\n            total += (upper - tier.lowerBound + 1) * tier.unitPrice;\n        }\n        return total.setScale(2, RoundingMode.HALF_UP);\n    }\n\n    public static Decimal volumeTotal(Integer quantity, List<PriceTier> tiers) {\n        if (quantity == null || quantity <= 0) {\n            return 0;\n        }\n        for (PriceTier tier : validate(tiers, quantity)) {\n            if (quantity >= tier.lowerBound && (tier.upperBound == null || quantity <= tier.upperBound)) {\n                return (quantity * tier.unitPrice).setScale(2, RoundingMode.HALF_UP);\n            }\n        }\n        throw new PricingException('No tier covers quantity ' + quantity);\n    }\n\n    private static List<PriceTier> validate(List<PriceTier> tiers, Integer quantity) {\n        if (tiers == null || tiers.isEmpty()) {\n            throw new PricingException('At least one price tier is required');\n        }\n        List<PriceTier> sorted = new List<PriceTier>(tiers);\n        sorted.sort(new LowerBoundComparator());\n        if (sorted[0].lowerBound != 1) {\n            throw new PricingException('The first tier must start at 1');\n        }\n        for (Integer i = 0; i < sorted.size(); i++) {\n            PriceTier tier = sorted[i];\n            if (tier.unitPrice == null || tier.unitPrice < 0) {\n                throw new PricingException('Tier unit prices must be zero or more');\n            }\n            if (i > 0) {\n                PriceTier prev = sorted[i - 1];\n                if (prev.upperBound == null || tier.lowerBound != prev.upperBound + 1) {\n                    throw new PricingException('Tiers must be contiguous with no gaps or overlaps');\n                }\n            }\n        }\n        PriceTier last = sorted[sorted.size() - 1];\n        if (last.upperBound != null && quantity > last.upperBound) {\n            throw new PricingException('Quantity ' + quantity + ' exceeds the highest tier');\n        }\n        return sorted;\n    }\n}\n",
    checks: [
      {
        re: /Decimal\s+graduatedTotal\s*\(\s*Integer\s+\w+\s*,\s*List<\s*PriceTier\s*>\s+\w+\s*\)/i,
        msg: "Has graduatedTotal(Integer, List<PriceTier>)"
      },
      {
        re: /Decimal\s+volumeTotal\s*\(\s*Integer\s+\w+\s*,\s*List<\s*PriceTier\s*>\s+\w+\s*\)/i,
        msg: "Has volumeTotal(Integer, List<PriceTier>)"
      },
      {
        re: /\.sort\s*\(/i,
        msg: "Sorts the tiers by lower bound"
      },
      {
        re: /throw\s+new\s+PricingException/i,
        msg: "Throws PricingException for invalid tiers"
      },
      {
        re: /setScale\s*\(\s*2\s*,\s*RoundingMode\.HALF_UP\s*\)/i,
        msg: "Rounds to 2 dp HALF_UP"
      },
      {
        re: /upperBound\s*==\s*null|null\s*==\s*\w+\.upperBound/i,
        msg: "Handles an unbounded top tier"
      }
    ],
    forbid: [
      {
        re: /\[\s*SELECT/i,
        msg: "Pure calculation — no SOQL"
      }
    ],
    hints: [
      "Graduated: for each tier, units = min(qty, upper) − lower + 1.",
      "Volume: find the single tier containing qty and multiply.",
      "Sort a copy with a Comparator<PriceTier> (or a Comparable wrapper) so you never mutate the caller's list."
    ],
    ai: "Verify both algorithms (60 units → 920.00 graduated, 720.00 volume), validation of gaps/overlaps/start/negative prices, the unbounded tier, and that the input list is not mutated."
  },
  {
    id: "AP110",
    track: "apex",
    level: "Hard",
    topic: "Industry Clouds",
    title: "Data 360 Ingestion API payload builder",
    task: "Brightwell Energy streams contact changes into Data 360 via the Ingestion API. Write `Data360IngestionPayloadBuilder`:\n- `public static List<String> buildContactPayloads(List<Contact> contacts)` → JSON strings shaped `{\"data\":[{...}]}` with at most 200 records each\n- Record keys: contact_id, email (trimmed, lower-case), first_name, last_name, postcode (MailingPostalCode), updated_at (LastModifiedDate, ISO 8601)\n- Skip contacts without Email; for duplicate normalised emails keep the newest\n- `public static HttpRequest buildRequest(String payload)` → POST to `callout:Data360_Ingest/api/v1/ingest/sources/Brightwell_CRM/contact_events`, JSON content type\n- Null/empty input → empty list",
    starter: "public with sharing class Data360IngestionPayloadBuilder {\n\n    public static List<String> buildContactPayloads(List<Contact> contacts) {\n        // TODO\n        return null;\n    }\n\n    public static HttpRequest buildRequest(String payload) {\n        // TODO\n        return null;\n    }\n}\n",
    solution: "public with sharing class Data360IngestionPayloadBuilder {\n    public static final Integer MAX_RECORDS_PER_PAYLOAD = 200;\n    private static final String ENDPOINT = 'callout:Data360_Ingest/api/v1/ingest/sources/Brightwell_CRM/contact_events';\n\n    public static List<String> buildContactPayloads(List<Contact> contacts) {\n        List<String> payloads = new List<String>();\n        if (contacts == null || contacts.isEmpty()) {\n            return payloads;\n        }\n        Map<String, Contact> latestByEmail = new Map<String, Contact>();\n        for (Contact c : contacts) {\n            if (String.isBlank(c.Email)) {\n                continue;\n            }\n            String email = c.Email.trim().toLowerCase();\n            Contact existing = latestByEmail.get(email);\n            if (existing == null || isNewer(c, existing)) {\n                latestByEmail.put(email, c);\n            }\n        }\n        List<Map<String, Object>> chunk = new List<Map<String, Object>>();\n        for (String email : latestByEmail.keySet()) {\n            Contact c = latestByEmail.get(email);\n            chunk.add(new Map<String, Object>{\n                'contact_id' => c.Id,\n                'email' => email,\n                'first_name' => c.FirstName,\n                'last_name' => c.LastName,\n                'postcode' => c.MailingPostalCode,\n                'updated_at' => c.LastModifiedDate\n            });\n            if (chunk.size() == MAX_RECORDS_PER_PAYLOAD) {\n                payloads.add(JSON.serialize(new Map<String, Object>{ 'data' => chunk }));\n                chunk = new List<Map<String, Object>>();\n            }\n        }\n        if (!chunk.isEmpty()) {\n            payloads.add(JSON.serialize(new Map<String, Object>{ 'data' => chunk }));\n        }\n        return payloads;\n    }\n\n    public static HttpRequest buildRequest(String payload) {\n        HttpRequest req = new HttpRequest();\n        req.setEndpoint(ENDPOINT);\n        req.setMethod('POST');\n        req.setHeader('Content-Type', 'application/json');\n        req.setBody(payload);\n        return req;\n    }\n\n    private static Boolean isNewer(Contact candidate, Contact existing) {\n        if (candidate.LastModifiedDate == null) {\n            return false;\n        }\n        return existing.LastModifiedDate == null || candidate.LastModifiedDate > existing.LastModifiedDate;\n    }\n}\n",
    checks: [
      {
        re: /List<\s*String\s*>\s+buildContactPayloads\s*\(\s*List<\s*Contact\s*>\s+\w+\s*\)/i,
        msg: "Keeps the buildContactPayloads signature"
      },
      {
        re: /'data'/i,
        msg: "Wraps records in a \"data\" array"
      },
      {
        re: /\b200\b/,
        msg: "Chunks at 200 records per payload"
      },
      {
        re: /toLowerCase\s*\(\s*\)/i,
        msg: "Normalises email to lower case"
      },
      {
        re: /JSON\.serialize\s*\(/i,
        msg: "Serialises with JSON.serialize"
      },
      {
        re: /callout:Data360_Ingest/i,
        msg: "Uses the Data360_Ingest Named Credential"
      }
    ],
    forbid: [
      {
        re: /setEndpoint\(\s*'https?:/i,
        msg: "Use a Named Credential (callout:...) instead of a hard-coded URL"
      },
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i,
        msg: "No SOQL inside a loop"
      }
    ],
    hints: [
      "De-duplicate first with a Map keyed by normalised email, then chunk.",
      "JSON.serialize writes Datetime values as ISO 8601 UTC strings.",
      "Flush a chunk when it reaches 200 and once more after the loop."
    ],
    ai: "Verify chunking never exceeds 200 records and flushes the final partial chunk, duplicates keep the newest record, blank emails are skipped, and the request targets the Named Credential with a JSON POST."
  }
);
