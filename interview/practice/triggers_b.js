PRACTICE.push(
  {
    id: "TR056", track: 'triggers', level: "Easy", topic: "Delete & undelete",
    title: "Block deleting accounts with open opportunities",
    task: "Thamesbridge Logistics keeps losing pipeline when users delete customer accounts.\nWrite trigger `AccountTrigger` (before delete) that calls `AccountDeleteGuard.preventDeleteWithOpenOpps(List<Account> oldAccounts)`.\n- Block deleting any Account that has at least one open Opportunity (`IsClosed = false`)\n- Error message: \"Cannot delete an account with open opportunities.\"\n- Other accounts in the same delete must still be deleted\n- One SOQL query in total, bulk safe for 200 records",
    starter: "trigger AccountTrigger on Account (before delete) {\n    // TODO: call the handler\n}\n\npublic without sharing class AccountDeleteGuard {\n    public static void preventDeleteWithOpenOpps(List<Account> oldAccounts) {\n        // TODO\n    }\n}\n",
    solution: "trigger AccountTrigger on Account (before delete) {\n    if (Trigger.isBefore && Trigger.isDelete) {\n        AccountDeleteGuard.preventDeleteWithOpenOpps(Trigger.old);\n    }\n}\n\n// without sharing: the guard must see every opportunity, not only those the user can see\npublic without sharing class AccountDeleteGuard {\n    public static void preventDeleteWithOpenOpps(List<Account> oldAccounts) {\n        Map<Id, Account> byId = new Map<Id, Account>(oldAccounts);\n        Set<Id> withOpen = new Set<Id>();\n        for (AggregateResult ar : [\n            SELECT AccountId accId\n            FROM Opportunity\n            WHERE AccountId IN :byId.keySet() AND IsClosed = false\n            GROUP BY AccountId\n        ]) {\n            withOpen.add((Id) ar.get('accId'));\n        }\n        for (Account acc : oldAccounts) {\n            if (withOpen.contains(acc.Id)) {\n                acc.addError('Cannot delete an account with open opportunities.');\n            }\n        }\n    }\n}\n",
    checks: [
      { re: /trigger\s+AccountTrigger\s+on\s+Account\s*\([^)]*before\s+delete/i, msg: "AccountTrigger runs before delete" },
      { re: /Trigger\.old(Map)?\b/i, msg: "Passes Trigger.old / Trigger.oldMap (Trigger.new is null on delete)" },
      { re: /IsClosed\s*=\s*false/i, msg: "Looks only for open opportunities" },
      { re: /\.addError\s*\(/i, msg: "Blocks the delete with addError" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" },
      { re: /Trigger\.new(Map)?\b/i, msg: "Trigger.new / newMap are null in delete triggers" }
    ],
    hints: ["In a delete trigger the records live in Trigger.old.","Query Opportunities WHERE AccountId IN :ids AND IsClosed = false once, collect the AccountIds, then addError on matching accounts."],
    ai: "Verify only accounts with open opportunities get addError, others still delete, there is exactly one query outside loops, and the handler uses Trigger.old rather than Trigger.new."
  },
  {
    id: "TR057", track: 'triggers', level: "Easy", topic: "Delete & undelete",
    title: "Only finance can delete won opportunities",
    task: "Kestrel Energy wants Closed Won opportunities protected from deletion.\nWrite trigger `OpportunityTrigger` (before delete) and `OpportunityDeleteGuard.blockWonDeletes(List<Opportunity> oldOpps)`.\n- If the running user has the custom permission `Delete_Won_Opportunities`, allow everything\n- Otherwise add an error to every won opportunity: \"Only finance administrators can delete Closed Won opportunities.\"\n- Open or lost opportunities can always be deleted\n- No SOQL; do not check profile names",
    starter: "trigger OpportunityTrigger on Opportunity (before delete) {\n    // TODO\n}\n\npublic with sharing class OpportunityDeleteGuard {\n    public static void blockWonDeletes(List<Opportunity> oldOpps) {\n        // TODO\n    }\n}\n",
    solution: "trigger OpportunityTrigger on Opportunity (before delete) {\n    OpportunityDeleteGuard.blockWonDeletes(Trigger.old);\n}\n\npublic with sharing class OpportunityDeleteGuard {\n    public static void blockWonDeletes(List<Opportunity> oldOpps) {\n        if (FeatureManagement.checkPermission('Delete_Won_Opportunities')) {\n            return;\n        }\n        for (Opportunity opp : oldOpps) {\n            if (opp.IsWon) {\n                opp.addError('Only finance administrators can delete Closed Won opportunities.');\n            }\n        }\n    }\n}\n",
    checks: [
      { re: /on\s+Opportunity\s*\([^)]*before\s+delete/i, msg: "Trigger runs before delete" },
      { re: /FeatureManagement\.checkPermission\s*\(\s*'Delete_Won_Opportunities'\s*\)/i, msg: "Checks the custom permission with FeatureManagement.checkPermission" },
      { re: /IsWon|StageName\s*==\s*'Closed Won'/i, msg: "Identifies won opportunities" },
      { re: /\.addError\s*\(/i, msg: "Blocks with addError" }
    ],
    forbid: [
      { re: /\[\s*SELECT/i, msg: "No SOQL needed" },
      { re: /Profile\.Name|ProfileId/i, msg: "Use a custom permission, not profile checks" }
    ],
    hints: ["Custom permissions are checked with FeatureManagement.checkPermission(apiName).","Return early when the user has the permission; otherwise loop Trigger.old and addError where IsWon is true."],
    ai: "Verify users with the custom permission can delete anything, others are blocked only for won opportunities, and the permission is checked once (not per record) without SOQL."
  },
  {
    id: "TR058", track: 'triggers', level: "Medium", topic: "Delete & undelete",
    title: "Cascade delete timesheets via a lookup",
    task: "Hollins Construction links Timesheet__c to Project__c with a lookup (`Project__c`), so timesheets are orphaned when a project is deleted.\nWrite trigger `ProjectTrigger` and `ProjectCascade.handleBeforeDelete(Map<Id, Project__c> oldMap)`:\n- Delete all timesheets of the deleted projects\n- If a project has any timesheet with `Invoiced__c = true`, block that project's delete with addError (\"This project has invoiced timesheets and cannot be deleted.\") and keep all its timesheets\n- Choose the right trigger event (hint: what happens to the lookup after delete?)\n- One query, one DML",
    starter: "trigger ProjectTrigger on Project__c (/* TODO: event */) {\n    // TODO\n}\n\npublic with sharing class ProjectCascade {\n    public static void handleBeforeDelete(Map<Id, Project__c> oldMap) {\n        // TODO\n    }\n}\n",
    solution: "trigger ProjectTrigger on Project__c (before delete) {\n    ProjectCascade.handleBeforeDelete(Trigger.oldMap);\n}\n\npublic with sharing class ProjectCascade {\n    public static void handleBeforeDelete(Map<Id, Project__c> oldMap) {\n        List<Timesheet__c> timesheets = [\n            SELECT Id, Project__c, Invoiced__c\n            FROM Timesheet__c\n            WHERE Project__c IN :oldMap.keySet()\n        ];\n        Set<Id> blocked = new Set<Id>();\n        for (Timesheet__c ts : timesheets) {\n            if (ts.Invoiced__c) {\n                blocked.add(ts.Project__c);\n            }\n        }\n        List<Timesheet__c> toDelete = new List<Timesheet__c>();\n        for (Timesheet__c ts : timesheets) {\n            if (!blocked.contains(ts.Project__c)) {\n                toDelete.add(ts);\n            }\n        }\n        for (Id projectId : blocked) {\n            oldMap.get(projectId).addError('This project has invoiced timesheets and cannot be deleted.');\n        }\n        if (!toDelete.isEmpty()) {\n            delete toDelete;\n        }\n    }\n}\n",
    checks: [
      { re: /on\s+Project__c\s*\([^)]*before\s+delete/i, msg: "Runs before delete, while the lookup is still populated" },
      { re: /Project__c\s+IN\s*:/i, msg: "Queries timesheets for all deleted projects at once" },
      { re: /Invoiced__c/i, msg: "Checks for invoiced timesheets" },
      { re: /\bdelete\s+\w+\s*;|Database\.delete\s*\(/i, msg: "Deletes the child timesheets" },
      { re: /\.addError\s*\(/i, msg: "Blocks projects with invoiced timesheets" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" }
    ],
    hints: ["After delete, Salesforce clears lookup fields on children, so you can no longer find them by Project__c.","Query once, build a Set of blocked project Ids, then delete only timesheets whose project is not blocked."],
    ai: "Verify the trigger uses before delete, projects with any invoiced timesheet get addError and keep all their timesheets, other projects lose their timesheets, and there is one query plus one delete outside loops."
  },
  {
    id: "TR059", track: 'triggers', level: "Easy", topic: "Delete & undelete",
    title: "Reset restored cases after undelete",
    task: "Brightwater Utilities sometimes restores cases from the Recycle Bin.\nWrite trigger `CaseTrigger` (after undelete) and `CaseRestoreHandler.onUndelete(List<Case> restored)`:\n- Set `Status` to 'New' on every restored case\n- Increment `Restore_Count__c` (treat null as 0)\n- Remember Trigger.new is read-only in after triggers\n- One DML statement for the whole batch",
    starter: "trigger CaseTrigger on Case (after undelete) {\n    // TODO\n}\n\npublic with sharing class CaseRestoreHandler {\n    public static void onUndelete(List<Case> restored) {\n        // TODO\n    }\n}\n",
    solution: "trigger CaseTrigger on Case (after undelete) {\n    CaseRestoreHandler.onUndelete(Trigger.new);\n}\n\npublic with sharing class CaseRestoreHandler {\n    public static void onUndelete(List<Case> restored) {\n        List<Case> updates = new List<Case>();\n        for (Case c : restored) {\n            Decimal count = c.Restore_Count__c == null ? 0 : c.Restore_Count__c;\n            updates.add(new Case(Id = c.Id, Status = 'New', Restore_Count__c = count + 1));\n        }\n        update updates;\n    }\n}\n",
    checks: [
      { re: /on\s+Case\s*\([^)]*after\s+undelete/i, msg: "Trigger fires after undelete" },
      { re: /Restore_Count__c/i, msg: "Increments Restore_Count__c" },
      { re: /Status\s*=\s*'New'/i, msg: "Sets Status to 'New'" },
      { re: /\bupdate\s+\w+\s*;|Database\.update\s*\(/i, msg: "Updates the cases with DML (after trigger)" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" },
      { re: /before\s+undelete/i, msg: "There is no before undelete event" }
    ],
    hints: ["Undelete only has an after event, and Trigger.new cannot be modified there.","Build new Case(Id = c.Id, ...) instances in a list and update them once."],
    ai: "Verify null Restore_Count__c is treated as 0, the records are updated via new sObject instances (not by editing Trigger.new), and there is a single DML outside the loop."
  },
  {
    id: "TR060", track: 'triggers', level: "Medium", topic: "Delete & undelete",
    title: "Installed asset count across all DML events",
    task: "Northgate Medical Supplies shows `Active_Asset_Count__c` on Account = number of its Assets with Status 'Installed'.\nWrite trigger `AssetTrigger` and `AssetRollup.recalculate(Set<Id> accountIds)` so the count is right after insert, update, delete and undelete.\n- On update, recalc only when AccountId or Status changed, and recalc BOTH the old and new account when an asset is moved\n- Accounts with no installed assets must get 0\n- Ignore null AccountIds\n- Use an aggregate query; one update",
    starter: "trigger AssetTrigger on Asset (/* TODO */) {\n    // TODO: collect account Ids\n}\n\npublic without sharing class AssetRollup {\n    public static void recalculate(Set<Id> accountIds) {\n        // TODO\n    }\n}\n",
    solution: "trigger AssetTrigger on Asset (after insert, after update, after delete, after undelete) {\n    Set<Id> accountIds = new Set<Id>();\n    switch on Trigger.operationType {\n        when AFTER_INSERT, AFTER_UNDELETE {\n            for (Asset a : (List<Asset>) Trigger.new) {\n                accountIds.add(a.AccountId);\n            }\n        }\n        when AFTER_UPDATE {\n            for (Asset a : (List<Asset>) Trigger.new) {\n                Asset prior = (Asset) Trigger.oldMap.get(a.Id);\n                if (a.AccountId != prior.AccountId || a.Status != prior.Status) {\n                    accountIds.add(a.AccountId);\n                    accountIds.add(prior.AccountId);\n                }\n            }\n        }\n        when AFTER_DELETE {\n            for (Asset a : (List<Asset>) Trigger.old) {\n                accountIds.add(a.AccountId);\n            }\n        }\n    }\n    accountIds.remove(null);\n    if (!accountIds.isEmpty()) {\n        AssetRollup.recalculate(accountIds);\n    }\n}\n\npublic without sharing class AssetRollup {\n    public static void recalculate(Set<Id> accountIds) {\n        Map<Id, Account> updates = new Map<Id, Account>();\n        for (Id accId : accountIds) {\n            updates.put(accId, new Account(Id = accId, Active_Asset_Count__c = 0));\n        }\n        for (AggregateResult ar : [\n            SELECT AccountId accId, COUNT(Id) total\n            FROM Asset\n            WHERE AccountId IN :accountIds AND Status = 'Installed'\n            GROUP BY AccountId\n        ]) {\n            updates.get((Id) ar.get('accId')).Active_Asset_Count__c = (Integer) ar.get('total');\n        }\n        update updates.values();\n    }\n}\n",
    checks: [
      { re: /after\s+delete/i, msg: "Handles after delete" },
      { re: /after\s+undelete/i, msg: "Handles after undelete" },
      { re: /AccountId\s*!=/i, msg: "Detects assets moved between accounts" },
      { re: /'Installed'/i, msg: "Counts only installed assets" },
      { re: /=\s*0\b/i, msg: "Resets accounts with no installed assets to 0" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" }
    ],
    hints: ["Collect account Ids from Trigger.new or Trigger.old depending on the event; on update include the old AccountId too.","Seed a Map<Id, Account> with 0 for every account, then overwrite from a GROUP BY AccountId aggregate."],
    ai: "Verify all four events are covered, reparented assets refresh both accounts, accounts with no matches are set to 0, nulls are removed, and the query and update run once outside loops."
  },
  {
    id: "TR061", track: 'triggers', level: "Hard", topic: "Delete & undelete",
    title: "Archive deleted invoices, unarchive on restore",
    task: "Pennine Water must keep an audit trail of deleted Invoice__c records.\nWrite trigger `InvoiceTrigger` and class `InvoiceArchiveHandler` with `archive(List<Invoice__c> deleted)` and `unarchive(List<Invoice__c> restored)`.\n- When invoices are deleted, create `Deleted_Invoice_Archive__c` rows: `Invoice_Id__c` (Text 18, unique external Id), `Invoice_Number__c` (= Name), `Amount__c`, `Deleted_By__c` (current user), `Deleted_On__c` (now)\n- Archive only once the delete has passed all validation (pick the right event)\n- When invoices are undeleted, delete their archive rows\n- Re-deleting a restored invoice must not fail on the unique key\n- Bulk safe: one query/DML per operation",
    starter: "trigger InvoiceTrigger on Invoice__c (/* TODO */) {\n    // TODO\n}\n\npublic without sharing class InvoiceArchiveHandler {\n    public static void archive(List<Invoice__c> deleted) {\n        // TODO\n    }\n\n    public static void unarchive(List<Invoice__c> restored) {\n        // TODO\n    }\n}\n",
    solution: "trigger InvoiceTrigger on Invoice__c (after delete, after undelete) {\n    switch on Trigger.operationType {\n        when AFTER_DELETE {\n            InvoiceArchiveHandler.archive(Trigger.old);\n        }\n        when AFTER_UNDELETE {\n            InvoiceArchiveHandler.unarchive(Trigger.new);\n        }\n    }\n}\n\npublic without sharing class InvoiceArchiveHandler {\n    public static void archive(List<Invoice__c> deleted) {\n        List<Deleted_Invoice_Archive__c> rows = new List<Deleted_Invoice_Archive__c>();\n        for (Invoice__c inv : deleted) {\n            rows.add(new Deleted_Invoice_Archive__c(\n                Invoice_Id__c = inv.Id,\n                Invoice_Number__c = inv.Name,\n                Amount__c = inv.Amount__c,\n                Deleted_By__c = UserInfo.getUserId(),\n                Deleted_On__c = System.now()\n            ));\n        }\n        upsert rows Invoice_Id__c;\n    }\n\n    public static void unarchive(List<Invoice__c> restored) {\n        Set<String> invoiceIds = new Set<String>();\n        for (Invoice__c inv : restored) {\n            invoiceIds.add(inv.Id);\n        }\n        delete [SELECT Id FROM Deleted_Invoice_Archive__c WHERE Invoice_Id__c IN :invoiceIds];\n    }\n}\n",
    checks: [
      { re: /after\s+delete/i, msg: "Archives in after delete" },
      { re: /after\s+undelete/i, msg: "Removes archive rows after undelete" },
      { re: /Trigger\.old\b/i, msg: "Reads deleted records from Trigger.old" },
      { re: /Invoice_Id__c\s+IN\s*:/i, msg: "Finds archive rows by invoice Id in bulk" },
      { re: /\bupsert\s+\w+[^;]*Invoice_Id__c|\binsert\s+\w+\s*;/i, msg: "Writes the archive rows (upsert on Invoice_Id__c is safest)" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" }
    ],
    hints: ["After delete runs only once every before-delete validation has passed.","Upsert on the Invoice_Id__c external Id so a restore-then-delete cycle reuses the row; on undelete delete rows WHERE Invoice_Id__c IN :ids."],
    ai: "Verify archiving happens in after delete using Trigger.old, undelete removes matching rows by Invoice_Id__c, repeat deletes cannot violate uniqueness (upsert or prior cleanup), and no query/DML runs in loops."
  },
  {
    id: "TR062", track: 'triggers', level: "Hard", topic: "Delete & undelete",
    title: "Move loyalty points to the merge winner",
    task: "Fairhaven Retail merges duplicate customer accounts. Losing accounts' `Loyalty_Points__c` must be added to the surviving (master) account.\nWrite trigger `AccountTrigger` and `AccountMergeHandler.transferLoyaltyPoints(List<Account> deleted)`.\n- Merge losers are deleted with `MasterRecordId` set; normal deletes have it null and must be ignored\n- Several losers can merge into the same master in one transaction: sum them\n- Treat null points as 0; add to the master's current value\n- One query and one update",
    starter: "trigger AccountTrigger on Account (/* TODO */) {\n    // TODO\n}\n\npublic without sharing class AccountMergeHandler {\n    public static void transferLoyaltyPoints(List<Account> deleted) {\n        // TODO\n    }\n}\n",
    solution: "trigger AccountTrigger on Account (after delete) {\n    if (Trigger.isAfter && Trigger.isDelete) {\n        AccountMergeHandler.transferLoyaltyPoints(Trigger.old);\n    }\n}\n\npublic without sharing class AccountMergeHandler {\n    public static void transferLoyaltyPoints(List<Account> deleted) {\n        Map<Id, Decimal> pointsByMaster = new Map<Id, Decimal>();\n        for (Account loser : deleted) {\n            if (loser.MasterRecordId == null || loser.Loyalty_Points__c == null) {\n                continue;\n            }\n            Decimal running = pointsByMaster.containsKey(loser.MasterRecordId)\n                ? pointsByMaster.get(loser.MasterRecordId) : 0;\n            pointsByMaster.put(loser.MasterRecordId, running + loser.Loyalty_Points__c);\n        }\n        if (pointsByMaster.isEmpty()) {\n            return;\n        }\n        List<Account> masters = [\n            SELECT Id, Loyalty_Points__c FROM Account WHERE Id IN :pointsByMaster.keySet()\n        ];\n        for (Account master : masters) {\n            Decimal existing = master.Loyalty_Points__c == null ? 0 : master.Loyalty_Points__c;\n            master.Loyalty_Points__c = existing + pointsByMaster.get(master.Id);\n        }\n        update masters;\n    }\n}\n",
    checks: [
      { re: /on\s+Account\s*\([^)]*after\s+delete/i, msg: "Runs after delete, when MasterRecordId is available" },
      { re: /MasterRecordId/i, msg: "Uses MasterRecordId to detect merge losers" },
      { re: /Map<\s*Id\s*,\s*(Decimal|Double|Integer)\s*>/i, msg: "Aggregates points per master Id" },
      { re: /\bupdate\s+\w+\s*;|Database\.update\s*\(/i, msg: "Updates the master accounts" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" }
    ],
    hints: ["In an after delete trigger, Trigger.old records deleted by a merge have MasterRecordId populated.","Sum points per MasterRecordId in a map, query those masters once, add, and update."],
    ai: "Verify plain deletes are ignored, multiple losers into one master are summed, nulls are treated as 0, the master's current value is re-queried and incremented, and there is one query and one update."
  },
  {
    id: "TR063", track: 'triggers', level: "Easy", topic: "Sales Cloud",
    title: "Follow-up task after lead conversion",
    task: "Ashdown Recruitment wants a welcome call booked whenever a lead is converted.\nWrite trigger `LeadTrigger` (after update) and `LeadConversionHandler.createFollowUps(List<Lead> leads, Map<Id, Lead> oldMap)`:\n- Only leads whose `IsConverted` changed from false to true\n- Task: Subject 'Welcome call', Priority 'High', `WhoId` = converted contact, `WhatId` = converted opportunity, or converted account if no opportunity was created, due in 2 days\n- Assign the task to the lead owner only if the owner is a User (not a queue)\n- One insert",
    starter: "trigger LeadTrigger on Lead (after update) {\n    // TODO\n}\n\npublic with sharing class LeadConversionHandler {\n    public static void createFollowUps(List<Lead> leads, Map<Id, Lead> oldMap) {\n        // TODO\n    }\n}\n",
    solution: "trigger LeadTrigger on Lead (after update) {\n    LeadConversionHandler.createFollowUps(Trigger.new, Trigger.oldMap);\n}\n\npublic with sharing class LeadConversionHandler {\n    public static void createFollowUps(List<Lead> leads, Map<Id, Lead> oldMap) {\n        List<Task> tasks = new List<Task>();\n        for (Lead ld : leads) {\n            if (!ld.IsConverted || oldMap.get(ld.Id).IsConverted) {\n                continue;\n            }\n            Task t = new Task(\n                Subject = 'Welcome call',\n                Priority = 'High',\n                WhoId = ld.ConvertedContactId,\n                WhatId = ld.ConvertedOpportunityId != null ? ld.ConvertedOpportunityId : ld.ConvertedAccountId,\n                ActivityDate = Date.today().addDays(2)\n            );\n            if (ld.OwnerId.getSObjectType() == User.SObjectType) {\n                t.OwnerId = ld.OwnerId;\n            }\n            tasks.add(t);\n        }\n        if (!tasks.isEmpty()) {\n            insert tasks;\n        }\n    }\n}\n",
    checks: [
      { re: /IsConverted/i, msg: "Checks IsConverted" },
      { re: /oldMap|Trigger\.old/i, msg: "Compares with the old value so only newly converted leads count" },
      { re: /ConvertedContactId/i, msg: "Uses ConvertedContactId" },
      { re: /ConvertedOpportunityId/i, msg: "Uses ConvertedOpportunityId (falls back to the account)" },
      { re: /\binsert\s+\w+\s*;|Database\.insert\s*\(/i, msg: "Inserts the tasks" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" }
    ],
    hints: ["A converted lead is updated, so after update with oldMap tells you which leads just converted.","OwnerId.getSObjectType() == User.SObjectType distinguishes users from queues."],
    ai: "Verify only false-to-true conversions create a task, WhatId falls back to the account when no opportunity was created, queue owners are not assigned, and tasks are inserted once."
  },
  {
    id: "TR064", track: 'triggers', level: "Easy", topic: "Sales Cloud",
    title: "Closed Won needs an amount",
    task: "Calderwood Software's forecast breaks when deals are won with no value.\nWrite trigger `OpportunityTrigger` (before insert, before update) and `OpportunityStageRules.apply(List<Opportunity> opps)`:\n- For opportunities in stage 'Closed Won': if Amount is null or <= 0, show an error on the Amount field: \"A Closed Won opportunity needs a positive Amount.\"\n- Also for Closed Won: if CloseDate is null or in the future, set it to today\n- Other stages are untouched\n- No SOQL, no DML",
    starter: "trigger OpportunityTrigger on Opportunity (before insert, before update) {\n    // TODO\n}\n\npublic with sharing class OpportunityStageRules {\n    public static void apply(List<Opportunity> opps) {\n        // TODO\n    }\n}\n",
    solution: "trigger OpportunityTrigger on Opportunity (before insert, before update) {\n    OpportunityStageRules.apply(Trigger.new);\n}\n\npublic with sharing class OpportunityStageRules {\n    public static void apply(List<Opportunity> opps) {\n        for (Opportunity opp : opps) {\n            if (opp.StageName != 'Closed Won') {\n                continue;\n            }\n            if (opp.Amount == null || opp.Amount <= 0) {\n                opp.addError(Opportunity.Amount, 'A Closed Won opportunity needs a positive Amount.');\n            }\n            if (opp.CloseDate == null || opp.CloseDate > Date.today()) {\n                opp.CloseDate = Date.today();\n            }\n        }\n    }\n}\n",
    checks: [
      { re: /before\s+insert/i, msg: "Runs before insert" },
      { re: /before\s+update/i, msg: "Runs before update" },
      { re: /'Closed Won'/i, msg: "Targets Closed Won" },
      { re: /Amount\s*==\s*null|Amount\s*<=\s*0/i, msg: "Validates the Amount" },
      { re: /addError\s*\(\s*Opportunity\.Amount|\.Amount\.addError\s*\(/i, msg: "Shows the error on the Amount field" },
      { re: /CloseDate\s*=\s*(Date|System)\.today\s*\(\s*\)/i, msg: "Sets CloseDate to today" }
    ],
    forbid: [
      { re: /\[\s*SELECT/i, msg: "No SOQL needed" },
      { re: /\b(insert|update|upsert|delete)\s+\w+\s*;/i, msg: "No DML needed: set fields on Trigger.new in a before trigger" }
    ],
    hints: ["Field-level errors: record.addError(Opportunity.Amount, msg) or record.Amount.addError(msg).","In a before trigger just assign CloseDate on the record, no DML."],
    ai: "Verify null and non-positive amounts are both caught with a field-level error, future/null close dates are reset only for Closed Won, and there is no SOQL or DML."
  },
  {
    id: "TR065", track: 'triggers', level: "Medium", topic: "Sales Cloud",
    title: "No stage regression after negotiation",
    task: "Ravensworth Engineering: once an opportunity has reached 'Negotiation/Review' or later, reps may not move it back to an earlier stage (except to 'Closed Lost').\nWrite trigger `OpportunityTrigger` (before update) and `OpportunityStageGuard.preventRegression(List<Opportunity> opps, Map<Id, Opportunity> oldMap)`.\n- Stage order comes from `OpportunityStage.SortOrder` (do not hard-code the order)\n- Query stages once per transaction (cache in a static)\n- Error on the StageName field: \"Opportunities cannot move back once they reach Negotiation/Review.\"\n- Unchanged stages are ignored",
    starter: "trigger OpportunityTrigger on Opportunity (before update) {\n    // TODO\n}\n\npublic with sharing class OpportunityStageGuard {\n    public static void preventRegression(List<Opportunity> opps, Map<Id, Opportunity> oldMap) {\n        // TODO\n    }\n}\n",
    solution: "trigger OpportunityTrigger on Opportunity (before update) {\n    OpportunityStageGuard.preventRegression(Trigger.new, Trigger.oldMap);\n}\n\npublic with sharing class OpportunityStageGuard {\n    private static Map<String, Integer> sortOrderByStage;\n\n    private static Map<String, Integer> stageOrder() {\n        if (sortOrderByStage == null) {\n            sortOrderByStage = new Map<String, Integer>();\n            for (OpportunityStage s : [SELECT ApiName, SortOrder FROM OpportunityStage WHERE IsActive = true]) {\n                sortOrderByStage.put(s.ApiName, s.SortOrder);\n            }\n        }\n        return sortOrderByStage;\n    }\n\n    public static void preventRegression(List<Opportunity> opps, Map<Id, Opportunity> oldMap) {\n        Map<String, Integer> order = stageOrder();\n        Integer lockFrom = order.get('Negotiation/Review');\n        if (lockFrom == null) {\n            return;\n        }\n        for (Opportunity opp : opps) {\n            Opportunity prior = oldMap.get(opp.Id);\n            if (opp.StageName == prior.StageName || opp.StageName == 'Closed Lost') {\n                continue;\n            }\n            Integer oldOrder = order.get(prior.StageName);\n            Integer newOrder = order.get(opp.StageName);\n            if (oldOrder != null && newOrder != null && oldOrder >= lockFrom && newOrder < oldOrder) {\n                opp.addError(Opportunity.StageName, 'Opportunities cannot move back once they reach Negotiation/Review.');\n            }\n        }\n    }\n}\n",
    checks: [
      { re: /FROM\s+OpportunityStage/i, msg: "Reads stage order from OpportunityStage" },
      { re: /SortOrder/i, msg: "Compares SortOrder values" },
      { re: /static\s+Map<\s*String\s*,\s*Integer\s*>/i, msg: "Caches the stage order in a static map" },
      { re: /'Closed Lost'/i, msg: "Allows moving to Closed Lost" },
      { re: /addError\s*\(/i, msg: "Blocks with addError" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" }
    ],
    hints: ["OpportunityStage has ApiName and SortOrder; StageName on Opportunity stores the ApiName.","Compare the old stage's SortOrder with the Negotiation/Review SortOrder, then the new SortOrder with the old one."],
    ai: "Verify the order comes from OpportunityStage (queried once and cached), only opportunities at or past Negotiation/Review are locked, Closed Lost is allowed, unchanged stages skip, and the error targets StageName."
  },
  {
    id: "TR066", track: 'triggers', level: "Medium", topic: "Sales Cloud",
    title: "Roll up subscription revenue from line items",
    task: "Silverline Telecom reports `Recurring_Revenue__c` on Opportunity = sum of `TotalPrice` of its OpportunityLineItems whose product family (`Product2.Family`) is 'Subscription'.\nWrite trigger `OpportunityLineItemTrigger` (after insert, update, delete) and `RecurringRevenueRollup.recalculate(Set<Id> oppIds)`.\n- Use Trigger.old for deletes\n- Opportunities with no subscription lines get 0\n- One aggregate query and one update, bulk safe",
    starter: "trigger OpportunityLineItemTrigger on OpportunityLineItem (after insert, after update, after delete) {\n    // TODO\n}\n\npublic without sharing class RecurringRevenueRollup {\n    public static void recalculate(Set<Id> oppIds) {\n        // TODO\n    }\n}\n",
    solution: "trigger OpportunityLineItemTrigger on OpportunityLineItem (after insert, after update, after delete) {\n    Set<Id> oppIds = new Set<Id>();\n    List<OpportunityLineItem> rows = Trigger.isDelete ? Trigger.old : Trigger.new;\n    for (OpportunityLineItem oli : rows) {\n        oppIds.add(oli.OpportunityId);\n    }\n    RecurringRevenueRollup.recalculate(oppIds);\n}\n\npublic without sharing class RecurringRevenueRollup {\n    public static void recalculate(Set<Id> oppIds) {\n        Map<Id, Opportunity> updates = new Map<Id, Opportunity>();\n        for (Id oppId : oppIds) {\n            updates.put(oppId, new Opportunity(Id = oppId, Recurring_Revenue__c = 0));\n        }\n        for (AggregateResult ar : [\n            SELECT OpportunityId oppId, SUM(TotalPrice) total\n            FROM OpportunityLineItem\n            WHERE OpportunityId IN :oppIds AND Product2.Family = 'Subscription'\n            GROUP BY OpportunityId\n        ]) {\n            updates.get((Id) ar.get('oppId')).Recurring_Revenue__c = (Decimal) ar.get('total');\n        }\n        update updates.values();\n    }\n}\n",
    checks: [
      { re: /on\s+OpportunityLineItem\s*\([^)]*after\s+delete/i, msg: "Trigger on OpportunityLineItem includes after delete" },
      { re: /Trigger\.old\b/i, msg: "Uses Trigger.old for deletes" },
      { re: /Product2\.Family/i, msg: "Filters by Product2.Family" },
      { re: /TotalPrice/i, msg: "Sums TotalPrice" },
      { re: /Recurring_Revenue__c\s*=\s*0/i, msg: "Defaults opportunities to 0" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" }
    ],
    hints: ["Pick Trigger.old or Trigger.new depending on Trigger.isDelete.","SUM(TotalPrice) GROUP BY OpportunityId with a Product2.Family filter, seeded with 0 per opportunity."],
    ai: "Verify deletes use Trigger.old, the sum filters on Product2.Family = Subscription, opportunities without subscription lines reset to 0, and query/DML happen once."
  },
  {
    id: "TR067", track: 'triggers', level: "Hard", topic: "Sales Cloud",
    title: "Monthly revenue schedules for annual products",
    task: "Oakmere Analytics sells annual contracts recognised monthly.\nWrite trigger `OpportunityLineItemTrigger` (after insert) and `RevenueScheduleBuilder.build(Set<Id> lineIds)`:\n- Only lines whose product has `Annual_Contract__c = true` and `CanUseRevenueSchedule = true`\n- Create 12 `OpportunityLineItemSchedule` rows, Type 'Revenue', starting on the line's `ServiceDate` (or the opportunity CloseDate if blank), one per month\n- Each instalment = TotalPrice / 12 rounded down to 2 decimals; the last absorbs the rounding difference so the total matches exactly\n- One query, one insert",
    starter: "trigger OpportunityLineItemTrigger on OpportunityLineItem (after insert) {\n    // TODO\n}\n\npublic with sharing class RevenueScheduleBuilder {\n    public static void build(Set<Id> lineIds) {\n        // TODO\n    }\n}\n",
    solution: "trigger OpportunityLineItemTrigger on OpportunityLineItem (after insert) {\n    RevenueScheduleBuilder.build(Trigger.newMap.keySet());\n}\n\npublic with sharing class RevenueScheduleBuilder {\n    public static void build(Set<Id> lineIds) {\n        List<OpportunityLineItemSchedule> schedules = new List<OpportunityLineItemSchedule>();\n        for (OpportunityLineItem oli : [\n            SELECT Id, TotalPrice, ServiceDate, Opportunity.CloseDate\n            FROM OpportunityLineItem\n            WHERE Id IN :lineIds\n              AND Product2.Annual_Contract__c = true\n              AND Product2.CanUseRevenueSchedule = true\n        ]) {\n            Date start = oli.ServiceDate != null ? oli.ServiceDate : oli.Opportunity.CloseDate;\n            Decimal monthly = (oli.TotalPrice / 12).setScale(2, RoundingMode.DOWN);\n            Decimal allocated = 0;\n            for (Integer i = 0; i < 12; i++) {\n                Decimal amount = i == 11 ? oli.TotalPrice - allocated : monthly;\n                allocated += amount;\n                schedules.add(new OpportunityLineItemSchedule(\n                    OpportunityLineItemId = oli.Id,\n                    Type = 'Revenue',\n                    Revenue = amount,\n                    ScheduleDate = start.addMonths(i)\n                ));\n            }\n        }\n        if (!schedules.isEmpty()) {\n            insert schedules;\n        }\n    }\n}\n",
    checks: [
      { re: /after\s+insert/i, msg: "Runs after insert (line Ids needed)" },
      { re: /OpportunityLineItemSchedule/i, msg: "Creates OpportunityLineItemSchedule records" },
      { re: /CanUseRevenueSchedule/i, msg: "Checks the product allows revenue schedules" },
      { re: /Type\s*=\s*'Revenue'/i, msg: "Uses schedule Type 'Revenue'" },
      { re: /addMonths\s*\(/i, msg: "Spaces instalments monthly" },
      { re: /setScale\s*\(|RoundingMode/i, msg: "Rounds instalments to 2 decimals" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" }
    ],
    hints: ["Query the lines with Product2 and Opportunity relationship fields in one SOQL.","Compute the rounded monthly amount, track what has been allocated, and give the remainder to instalment 12."],
    ai: "Verify only eligible products get schedules, 12 monthly rows start at ServiceDate or CloseDate, the instalments sum exactly to TotalPrice, and schedules are inserted once outside the loops."
  },
  {
    id: "TR068", track: 'triggers', level: "Medium", topic: "Sales Cloud",
    title: "Require an accepted synced quote to win",
    task: "Greystone Facilities only books revenue from accepted quotes.\nWrite trigger `OpportunityTrigger` (before update) and `QuoteSyncGuard.requireAcceptedQuote(List<Opportunity> opps, Map<Id, Opportunity> oldMap)`:\n- Only when StageName changes to 'Closed Won'\n- If `SyncedQuoteId` is blank: error \"Sync an accepted quote before closing this opportunity as won.\"\n- If the synced Quote's Status is not 'Accepted': error \"The synced quote must be Accepted before closing as won.\"\n- One query for all synced quotes, skip the query when nothing is closing",
    starter: "trigger OpportunityTrigger on Opportunity (before update) {\n    // TODO\n}\n\npublic with sharing class QuoteSyncGuard {\n    public static void requireAcceptedQuote(List<Opportunity> opps, Map<Id, Opportunity> oldMap) {\n        // TODO\n    }\n}\n",
    solution: "trigger OpportunityTrigger on Opportunity (before update) {\n    QuoteSyncGuard.requireAcceptedQuote(Trigger.new, Trigger.oldMap);\n}\n\npublic with sharing class QuoteSyncGuard {\n    public static void requireAcceptedQuote(List<Opportunity> opps, Map<Id, Opportunity> oldMap) {\n        List<Opportunity> closing = new List<Opportunity>();\n        Set<Id> quoteIds = new Set<Id>();\n        for (Opportunity opp : opps) {\n            if (opp.StageName == 'Closed Won' && oldMap.get(opp.Id).StageName != 'Closed Won') {\n                closing.add(opp);\n                if (opp.SyncedQuoteId != null) {\n                    quoteIds.add(opp.SyncedQuoteId);\n                }\n            }\n        }\n        if (closing.isEmpty()) {\n            return;\n        }\n        Map<Id, Quote> quotes = new Map<Id, Quote>(\n            [SELECT Id, Status FROM Quote WHERE Id IN :quoteIds]\n        );\n        for (Opportunity opp : closing) {\n            Quote q = quotes.get(opp.SyncedQuoteId);\n            if (q == null) {\n                opp.addError('Sync an accepted quote before closing this opportunity as won.');\n            } else if (q.Status != 'Accepted') {\n                opp.addError('The synced quote must be Accepted before closing as won.');\n            }\n        }\n    }\n}\n",
    checks: [
      { re: /SyncedQuoteId/i, msg: "Uses Opportunity.SyncedQuoteId" },
      { re: /FROM\s+Quote\b/i, msg: "Queries the synced quotes" },
      { re: /'Accepted'/i, msg: "Checks for Status 'Accepted'" },
      { re: /oldMap|Trigger\.old/i, msg: "Only acts when the stage changes" },
      { re: /\.addError\s*\(/i, msg: "Blocks with addError" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" }
    ],
    hints: ["Collect the closing opportunities and their SyncedQuoteIds first.","Map<Id, Quote> from one query, then check each closing opportunity."],
    ai: "Verify only transitions into Closed Won are checked, both the missing-quote and non-accepted cases produce the right message, and the query is skipped when no opportunity is closing."
  },
  {
    id: "TR069", track: 'triggers', level: "Medium", topic: "Sales Cloud",
    title: "Assign lead owners by UK postcode area",
    task: "Bramley & Finch route new leads by postcode area (the leading letters, e.g. 'LS' in \"LS1 4AP\", 'M' in \"M2 3WQ\").\nWrite trigger `LeadTrigger` (before insert) and `LeadTerritoryAssigner.assignOwners(List<Lead> leads)`:\n- Mapping lives in custom metadata `Postcode_Territory__mdt` (`Postcode_Area__c`, `Owner_Id__c` text)\n- Extract the area from `PostalCode` case-insensitively; blank or unmatched postcodes keep the default owner\n- Read metadata without SOQL, no DML, no hard-coded Ids",
    starter: "trigger LeadTrigger on Lead (before insert) {\n    // TODO\n}\n\npublic with sharing class LeadTerritoryAssigner {\n    public static void assignOwners(List<Lead> leads) {\n        // TODO\n    }\n}\n",
    solution: "trigger LeadTrigger on Lead (before insert) {\n    LeadTerritoryAssigner.assignOwners(Trigger.new);\n}\n\npublic with sharing class LeadTerritoryAssigner {\n    public static void assignOwners(List<Lead> leads) {\n        Map<String, Id> ownerByArea = new Map<String, Id>();\n        for (Postcode_Territory__mdt row : Postcode_Territory__mdt.getAll().values()) {\n            ownerByArea.put(row.Postcode_Area__c.toUpperCase(), (Id) row.Owner_Id__c);\n        }\n        for (Lead ld : leads) {\n            String area = postcodeArea(ld.PostalCode);\n            if (area != null && ownerByArea.containsKey(area)) {\n                ld.OwnerId = ownerByArea.get(area);\n            }\n        }\n    }\n\n    @TestVisible\n    private static String postcodeArea(String postcode) {\n        if (String.isBlank(postcode)) {\n            return null;\n        }\n        Matcher m = Pattern.compile('^([A-Z]{1,2})[0-9]').matcher(postcode.trim().toUpperCase());\n        return m.find() ? m.group(1) : null;\n    }\n}\n",
    checks: [
      { re: /Postcode_Territory__mdt\.(getAll|getInstance)\s*\(/i, msg: "Reads Postcode_Territory__mdt with getAll()/getInstance()" },
      { re: /before\s+insert/i, msg: "Assigns owners before insert" },
      { re: /PostalCode/i, msg: "Uses the lead PostalCode" },
      { re: /OwnerId\s*=/i, msg: "Sets OwnerId" },
      { re: /toUpperCase\s*\(\)|equalsIgnoreCase/i, msg: "Matches case-insensitively" }
    ],
    forbid: [
      { re: /\b(insert|update|upsert|delete)\s+\w+\s*;/i, msg: "No DML needed: set fields on Trigger.new in a before trigger" },
      { re: /'005[A-Za-z0-9]{12,15}'/, msg: "No hard-coded user Ids" }
    ],
    hints: ["Custom metadata types expose getAll() which does not count against SOQL limits.","A regex like ^([A-Z]{1,2})[0-9] on the upper-cased postcode gives the area."],
    ai: "Verify the area is the 1–2 leading letters (so M and MK differ), blank or unmatched postcodes keep the owner, metadata is read once outside the loop, and no DML is used."
  },
  {
    id: "TR070", track: 'triggers', level: "Easy", topic: "Service Cloud",
    title: "Escalate cases that become Critical",
    task: "Harrowgate Insurance escalates every critical claim case.\nWrite trigger `CaseTrigger` (before insert, before update) and `CaseEscalation.flagCritical(List<Case> cases, Map<Id, Case> oldMap)`:\n- When a case is created as Priority 'Critical', or its Priority changes to 'Critical', set `IsEscalated = true` and `Escalated_On__c` = now\n- Do not reset the timestamp if the case was already Critical\n- Moving away from Critical does not un-escalate\n- oldMap is null on insert; no SOQL/DML",
    starter: "trigger CaseTrigger on Case (before insert, before update) {\n    // TODO\n}\n\npublic with sharing class CaseEscalation {\n    public static void flagCritical(List<Case> cases, Map<Id, Case> oldMap) {\n        // TODO\n    }\n}\n",
    solution: "trigger CaseTrigger on Case (before insert, before update) {\n    CaseEscalation.flagCritical(Trigger.new, Trigger.oldMap);\n}\n\npublic with sharing class CaseEscalation {\n    public static void flagCritical(List<Case> cases, Map<Id, Case> oldMap) {\n        for (Case c : cases) {\n            Boolean becameCritical = c.Priority == 'Critical'\n                && (oldMap == null || oldMap.get(c.Id).Priority != 'Critical');\n            if (becameCritical) {\n                c.IsEscalated = true;\n                c.Escalated_On__c = System.now();\n            }\n        }\n    }\n}\n",
    checks: [
      { re: /IsEscalated\s*=\s*true/i, msg: "Sets IsEscalated" },
      { re: /'Critical'/i, msg: "Checks for Critical priority" },
      { re: /oldMap\s*==\s*null|oldMap\s*!=\s*null|isInsert/i, msg: "Handles insert, where oldMap is null" },
      { re: /Escalated_On__c\s*=\s*(System|Datetime)\.now\s*\(\s*\)/i, msg: "Stamps Escalated_On__c with now" }
    ],
    forbid: [
      { re: /\[\s*SELECT/i, msg: "No SOQL needed" },
      { re: /\b(insert|update|upsert|delete)\s+\w+\s*;/i, msg: "No DML needed: set fields on Trigger.new in a before trigger" }
    ],
    hints: ["Pass Trigger.oldMap; it is null for inserts.","Escalate when Priority is Critical and either oldMap is null or the old Priority was different."],
    ai: "Verify inserts and changes into Critical both escalate, already-critical cases keep their timestamp, nothing is un-escalated, and the code is null-safe on insert."
  },
  {
    id: "TR071", track: 'triggers', level: "Medium", topic: "Service Cloud",
    title: "SLA due date in business hours",
    task: "Lowther Housing Association measures repair SLAs in business hours.\nWrite trigger `CaseTrigger` (before insert, before update) and `CaseSlaCalculator.setDueDates(List<Case> cases, Map<Id, Case> oldMap)`:\n- `SLA_Due__c` = start + N business hours: Critical 4, High 8, anything else 24\n- Start = now on insert; on update recalc only when Priority changed, starting from CreatedDate\n- Use the case's `BusinessHoursId`, or the org default business hours (`IsDefault = true`) if blank\n- Use `BusinessHours.add`; query the default at most once per transaction",
    starter: "trigger CaseTrigger on Case (before insert, before update) {\n    // TODO\n}\n\npublic with sharing class CaseSlaCalculator {\n    public static void setDueDates(List<Case> cases, Map<Id, Case> oldMap) {\n        // TODO\n    }\n}\n",
    solution: "trigger CaseTrigger on Case (before insert, before update) {\n    CaseSlaCalculator.setDueDates(Trigger.new, Trigger.oldMap);\n}\n\npublic with sharing class CaseSlaCalculator {\n    private static final Map<String, Integer> HOURS_BY_PRIORITY = new Map<String, Integer>{\n        'Critical' => 4, 'High' => 8\n    };\n    private static final Integer DEFAULT_HOURS = 24;\n    private static Id defaultBusinessHoursId;\n\n    public static void setDueDates(List<Case> cases, Map<Id, Case> oldMap) {\n        for (Case c : cases) {\n            Boolean isNew = oldMap == null;\n            if (!isNew && c.Priority == oldMap.get(c.Id).Priority) {\n                continue;\n            }\n            Datetime start = isNew ? System.now() : c.CreatedDate;\n            Id bhId = c.BusinessHoursId != null ? c.BusinessHoursId : defaultHours();\n            Integer hours = HOURS_BY_PRIORITY.containsKey(c.Priority)\n                ? HOURS_BY_PRIORITY.get(c.Priority) : DEFAULT_HOURS;\n            c.SLA_Due__c = BusinessHours.add(bhId, start, hours * 60L * 60L * 1000L);\n        }\n    }\n\n    private static Id defaultHours() {\n        if (defaultBusinessHoursId == null) {\n            defaultBusinessHoursId = [SELECT Id FROM BusinessHours WHERE IsDefault = true LIMIT 1].Id;\n        }\n        return defaultBusinessHoursId;\n    }\n}\n",
    checks: [
      { re: /BusinessHours\.add\s*\(/i, msg: "Uses BusinessHours.add" },
      { re: /IsDefault\s*=\s*true/i, msg: "Falls back to the default business hours" },
      { re: /static\s+Id\s+\w+/i, msg: "Caches the default business hours Id in a static" },
      { re: /'Critical'/i, msg: "Maps Critical priority" },
      { re: /SLA_Due__c\s*=/i, msg: "Sets SLA_Due__c" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" },
      { re: /\b(insert|update|upsert|delete)\s+\w+\s*;/i, msg: "No DML needed: set fields on Trigger.new in a before trigger" }
    ],
    hints: ["BusinessHours.add(id, start, milliseconds) skips nights and weekends.","Wrap the default-hours query in a lazy static getter so it runs once even if called in the loop."],
    ai: "Verify milliseconds are computed as Long without overflow, the default business hours are queried at most once, updates recalc only on priority change from CreatedDate, and no DML is used."
  },
  {
    id: "TR072", track: 'triggers', level: "Medium", topic: "Service Cloud",
    title: "Complete milestones when a case closes",
    task: "Elmstead Telecom uses entitlements with milestones. When agents close a case, any open milestones must be completed so they don't show as violated.\nWrite trigger `CaseTrigger` (after update) and `MilestoneCompleter.completeOnClose(List<Case> cases, Map<Id, Case> oldMap)`:\n- Only cases whose `IsClosed` changed from false to true\n- Set `CompletionDate` = now on all their `CaseMilestone` records that are not yet completed\n- One query, one update; skip when nothing closed",
    starter: "trigger CaseTrigger on Case (after update) {\n    // TODO\n}\n\npublic with sharing class MilestoneCompleter {\n    public static void completeOnClose(List<Case> cases, Map<Id, Case> oldMap) {\n        // TODO\n    }\n}\n",
    solution: "trigger CaseTrigger on Case (after update) {\n    MilestoneCompleter.completeOnClose(Trigger.new, Trigger.oldMap);\n}\n\npublic with sharing class MilestoneCompleter {\n    public static void completeOnClose(List<Case> cases, Map<Id, Case> oldMap) {\n        Set<Id> closedIds = new Set<Id>();\n        for (Case c : cases) {\n            if (c.IsClosed && !oldMap.get(c.Id).IsClosed) {\n                closedIds.add(c.Id);\n            }\n        }\n        if (closedIds.isEmpty()) {\n            return;\n        }\n        List<CaseMilestone> pending = [\n            SELECT Id, CompletionDate\n            FROM CaseMilestone\n            WHERE CaseId IN :closedIds AND IsCompleted = false\n        ];\n        Datetime completedAt = System.now();\n        for (CaseMilestone cm : pending) {\n            cm.CompletionDate = completedAt;\n        }\n        update pending;\n    }\n}\n",
    checks: [
      { re: /FROM\s+CaseMilestone/i, msg: "Queries CaseMilestone" },
      { re: /IsCompleted\s*=\s*false|CompletionDate\s*=\s*null/i, msg: "Only open milestones" },
      { re: /CompletionDate\s*=\s*\w+/i, msg: "Sets CompletionDate" },
      { re: /IsClosed/i, msg: "Detects the case being closed" },
      { re: /\bupdate\s+\w+\s*;|Database\.update\s*\(/i, msg: "Updates the milestones" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" }
    ],
    hints: ["Compare IsClosed in Trigger.new vs Trigger.oldMap.","Query CaseMilestone WHERE CaseId IN :ids AND IsCompleted = false, set CompletionDate, update once."],
    ai: "Verify only newly closed cases are processed, only incomplete milestones are touched, and there is a single query and update with an early exit."
  },
  {
    id: "TR073", track: 'triggers', level: "Easy", topic: "Service Cloud",
    title: "Public comment sets case to awaiting customer",
    task: "Wexford Home Services: when an agent posts a public case comment, the case should wait for the customer.\nWrite trigger `CaseCommentTrigger` on `CaseComment` (after insert) and `CaseCommentHandler.onPublicComment(List<CaseComment> comments)`:\n- Only comments with `IsPublished = true`\n- Set the parent case `Status` = 'Awaiting Customer' and `Last_Public_Comment__c` = the comment's CreatedDate\n- Several comments on the same case must produce one case update\n- One DML",
    starter: "trigger CaseCommentTrigger on CaseComment (after insert) {\n    // TODO\n}\n\npublic with sharing class CaseCommentHandler {\n    public static void onPublicComment(List<CaseComment> comments) {\n        // TODO\n    }\n}\n",
    solution: "trigger CaseCommentTrigger on CaseComment (after insert) {\n    CaseCommentHandler.onPublicComment(Trigger.new);\n}\n\npublic with sharing class CaseCommentHandler {\n    public static void onPublicComment(List<CaseComment> comments) {\n        Map<Id, Case> updates = new Map<Id, Case>();\n        for (CaseComment cc : comments) {\n            if (cc.IsPublished) {\n                updates.put(cc.ParentId, new Case(\n                    Id = cc.ParentId,\n                    Status = 'Awaiting Customer',\n                    Last_Public_Comment__c = cc.CreatedDate\n                ));\n            }\n        }\n        if (!updates.isEmpty()) {\n            update updates.values();\n        }\n    }\n}\n",
    checks: [
      { re: /trigger\s+\w+\s+on\s+CaseComment\s*\(\s*after\s+insert/i, msg: "Trigger on CaseComment after insert" },
      { re: /IsPublished/i, msg: "Only public comments" },
      { re: /ParentId/i, msg: "Uses ParentId to reach the case" },
      { re: /Map<\s*Id\s*,\s*Case\s*>/i, msg: "De-duplicates cases with a Map<Id, Case>" },
      { re: /'Awaiting Customer'/i, msg: "Sets the status" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" }
    ],
    hints: ["CaseComment.ParentId is the case Id.","Put new Case(Id = ParentId, ...) into a map keyed by case Id so duplicates collapse, then update map.values()."],
    ai: "Verify private comments are ignored, multiple comments on one case cause a single update entry, and the DML is outside the loop and skipped when empty."
  },
  {
    id: "TR074", track: 'triggers', level: "Medium", topic: "Service Cloud",
    title: "Tidy email-to-case subjects and link contacts",
    task: "Kingsmead Electrical's email-to-case creates messy cases.\nWrite trigger `CaseTrigger` (before insert) and `EmailCaseCleaner.clean(List<Case> cases)` for cases with Origin 'Email':\n- Strip any leading reply/forward prefixes (RE:, FW:, FWD:, repeated, any case) from Subject and trim\n- If ContactId is blank and `SuppliedEmail` is set, look up Contacts by email (one query for all cases)\n- Exactly one match: set ContactId and AccountId; more than one: set `Needs_Triage__c = true`\n- No DML",
    starter: "trigger CaseTrigger on Case (before insert) {\n    // TODO\n}\n\npublic with sharing class EmailCaseCleaner {\n    public static void clean(List<Case> cases) {\n        // TODO\n    }\n}\n",
    solution: "trigger CaseTrigger on Case (before insert) {\n    EmailCaseCleaner.clean(Trigger.new);\n}\n\npublic with sharing class EmailCaseCleaner {\n    private static final Pattern PREFIX = Pattern.compile('(?i)^\\\\s*((re|fw|fwd)\\\\s*:\\\\s*)+');\n\n    public static void clean(List<Case> cases) {\n        Set<String> emails = new Set<String>();\n        List<Case> emailCases = new List<Case>();\n        for (Case c : cases) {\n            if (c.Origin != 'Email') {\n                continue;\n            }\n            emailCases.add(c);\n            if (c.Subject != null) {\n                c.Subject = PREFIX.matcher(c.Subject).replaceFirst('').trim();\n            }\n            if (c.ContactId == null && String.isNotBlank(c.SuppliedEmail)) {\n                emails.add(c.SuppliedEmail.toLowerCase());\n            }\n        }\n        if (emails.isEmpty()) {\n            return;\n        }\n        Map<String, List<Contact>> contactsByEmail = new Map<String, List<Contact>>();\n        for (Contact con : [SELECT Id, AccountId, Email FROM Contact WHERE Email IN :emails]) {\n            String key = con.Email.toLowerCase();\n            if (!contactsByEmail.containsKey(key)) {\n                contactsByEmail.put(key, new List<Contact>());\n            }\n            contactsByEmail.get(key).add(con);\n        }\n        for (Case c : emailCases) {\n            if (c.ContactId != null || String.isBlank(c.SuppliedEmail)) {\n                continue;\n            }\n            List<Contact> matches = contactsByEmail.get(c.SuppliedEmail.toLowerCase());\n            if (matches == null) {\n                continue;\n            }\n            if (matches.size() == 1) {\n                c.ContactId = matches[0].Id;\n                c.AccountId = matches[0].AccountId;\n            } else {\n                c.Needs_Triage__c = true;\n            }\n        }\n    }\n}\n",
    checks: [
      { re: /'Email'/i, msg: "Only processes Origin 'Email'" },
      { re: /SuppliedEmail/i, msg: "Uses SuppliedEmail" },
      { re: /\bfwd?\b/i, msg: "Handles FW/FWD prefixes" },
      { re: /FROM\s+Contact\s+WHERE\s+Email\s+IN\s*:/i, msg: "Looks up contacts by email in one query" },
      { re: /Needs_Triage__c\s*=\s*true/i, msg: "Flags ambiguous matches" },
      { re: /ContactId\s*=/i, msg: "Links the contact" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" },
      { re: /\b(insert|update|upsert|delete)\s+\w+\s*;/i, msg: "No DML needed: set fields on Trigger.new in a before trigger" }
    ],
    hints: ["A case-insensitive regex anchored at the start, e.g. (?i)^\\s*((re|fw|fwd)\\s*:\\s*)+, removes stacked prefixes.","Group contacts by lower-cased email into Map<String, List<Contact>> and check the list size."],
    ai: "Verify stacked prefixes like \"RE: FW: re:\" are all removed, only email-origin cases are touched, existing ContactIds are kept, one query serves all cases, and ambiguous emails set Needs_Triage__c instead of guessing."
  },
  {
    id: "TR075", track: 'triggers', level: "Hard", topic: "Service Cloud",
    title: "Reopen or follow up on inbound customer emails",
    task: "Ferncliff Software handles replies to closed cases.\nWrite trigger `EmailMessageTrigger` (after insert) and `InboundEmailCaseHandler.handle(List<EmailMessage> emails)`:\n- Only incoming emails (`Incoming = true`) whose `ParentId` is a Case\n- Closed case closed within the last 14 days: set Status 'Reopened'\n- Closed longer ago: create a new Case with ParentId = old case, Subject 'Follow-up: ' + old subject, same ContactId/AccountId, Origin 'Email', Status 'New'\n- Open cases: do nothing; several emails on one case act once\n- One query, at most one update and one insert",
    starter: "trigger EmailMessageTrigger on EmailMessage (after insert) {\n    // TODO\n}\n\npublic with sharing class InboundEmailCaseHandler {\n    public static void handle(List<EmailMessage> emails) {\n        // TODO\n    }\n}\n",
    solution: "trigger EmailMessageTrigger on EmailMessage (after insert) {\n    InboundEmailCaseHandler.handle(Trigger.new);\n}\n\npublic with sharing class InboundEmailCaseHandler {\n    @TestVisible private static final Integer REOPEN_WINDOW_DAYS = 14;\n\n    public static void handle(List<EmailMessage> emails) {\n        Set<Id> caseIds = new Set<Id>();\n        for (EmailMessage em : emails) {\n            if (em.Incoming && em.ParentId != null && em.ParentId.getSObjectType() == Case.SObjectType) {\n                caseIds.add(em.ParentId);\n            }\n        }\n        if (caseIds.isEmpty()) {\n            return;\n        }\n        Datetime cutoff = System.now().addDays(-REOPEN_WINDOW_DAYS);\n        List<Case> toReopen = new List<Case>();\n        List<Case> followUps = new List<Case>();\n        for (Case c : [\n            SELECT Id, Subject, ContactId, AccountId, ClosedDate\n            FROM Case\n            WHERE Id IN :caseIds AND IsClosed = true\n        ]) {\n            if (c.ClosedDate >= cutoff) {\n                toReopen.add(new Case(Id = c.Id, Status = 'Reopened'));\n            } else {\n                followUps.add(new Case(\n                    ParentId = c.Id,\n                    Subject = 'Follow-up: ' + (c.Subject == null ? '' : c.Subject),\n                    ContactId = c.ContactId,\n                    AccountId = c.AccountId,\n                    Origin = 'Email',\n                    Status = 'New'\n                ));\n            }\n        }\n        if (!toReopen.isEmpty()) {\n            update toReopen;\n        }\n        if (!followUps.isEmpty()) {\n            insert followUps;\n        }\n    }\n}\n",
    checks: [
      { re: /on\s+EmailMessage\s*\(\s*after\s+insert/i, msg: "Trigger on EmailMessage after insert" },
      { re: /\.Incoming\b/i, msg: "Only incoming emails" },
      { re: /ClosedDate/i, msg: "Uses ClosedDate for the 14-day window" },
      { re: /'Reopened'/i, msg: "Reopens recent cases with Status 'Reopened'" },
      { re: /ParentId\s*=\s*\w+\.Id/i, msg: "Links the follow-up case to the old case" },
      { re: /Set<\s*Id\s*>/i, msg: "De-duplicates case Ids" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" }
    ],
    hints: ["EmailMessage.ParentId holds the case Id; use getSObjectType() to be sure.","Query only closed cases, then split them by ClosedDate >= now - 14 days into an update list and an insert list."],
    ai: "Verify outgoing emails and open cases are ignored, the 14-day boundary uses ClosedDate, each case is handled once even with multiple emails, and DML happens once per list outside loops."
  },
  {
    id: "TR076", track: 'triggers', level: "Easy", topic: "Service Cloud",
    title: "How-To cases need a Knowledge article",
    task: "Abbotsford Appliances wants every How-To case to be closed with a Knowledge article attached.\nWrite trigger `CaseTrigger` (before update) and `CaseKnowledgeCheck.requireArticle(List<Case> cases, Map<Id, Case> oldMap)`:\n- Applies when Type = 'How-To' and Status changes to 'Closed'\n- If the case has no `CaseArticle` record, add the error \"Attach a Knowledge article before closing a How-To case.\"\n- One query, only when needed",
    starter: "trigger CaseTrigger on Case (before update) {\n    // TODO\n}\n\npublic with sharing class CaseKnowledgeCheck {\n    public static void requireArticle(List<Case> cases, Map<Id, Case> oldMap) {\n        // TODO\n    }\n}\n",
    solution: "trigger CaseTrigger on Case (before update) {\n    CaseKnowledgeCheck.requireArticle(Trigger.new, Trigger.oldMap);\n}\n\npublic with sharing class CaseKnowledgeCheck {\n    public static void requireArticle(List<Case> cases, Map<Id, Case> oldMap) {\n        Map<Id, Case> closing = new Map<Id, Case>();\n        for (Case c : cases) {\n            if (c.Type == 'How-To' && c.Status == 'Closed' && oldMap.get(c.Id).Status != 'Closed') {\n                closing.put(c.Id, c);\n            }\n        }\n        if (closing.isEmpty()) {\n            return;\n        }\n        Set<Id> withArticle = new Set<Id>();\n        for (CaseArticle ca : [SELECT CaseId FROM CaseArticle WHERE CaseId IN :closing.keySet()]) {\n            withArticle.add(ca.CaseId);\n        }\n        for (Case c : closing.values()) {\n            if (!withArticle.contains(c.Id)) {\n                c.addError('Attach a Knowledge article before closing a How-To case.');\n            }\n        }\n    }\n}\n",
    checks: [
      { re: /FROM\s+CaseArticle/i, msg: "Checks CaseArticle attachments" },
      { re: /'How-To'/i, msg: "Only How-To cases" },
      { re: /oldMap|Trigger\.old/i, msg: "Only when the status changes to Closed" },
      { re: /\.addError\s*\(/i, msg: "Blocks with addError" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" }
    ],
    hints: ["CaseArticle links a case (CaseId) to a Knowledge article.","Collect closing case Ids, query CaseArticle once, addError where no row was found."],
    ai: "Verify only How-To cases transitioning to Closed are checked, one CaseArticle query covers all of them, and the query is skipped when nothing qualifies."
  },
  {
    id: "TR077", track: 'triggers', level: "Easy", topic: "Salesforce CPQ",
    title: "Stamp CPQ quote approval details",
    task: "Marlow Cloud Services uses Salesforce CPQ.\nWrite trigger `QuoteTrigger` on `SBQQ__Quote__c` (before update) and `QuoteApprovalStamp.apply(List<SBQQ__Quote__c> quotes, Map<Id, SBQQ__Quote__c> oldMap)`:\n- When `SBQQ__Status__c` changes to 'Approved', set `Approved_On__c` = now and `Approved_By__c` = current user\n- When it changes from 'Approved' to anything else, clear both fields\n- Do not write any CPQ-calculated fields (totals, prices) and no DML",
    starter: "trigger QuoteTrigger on SBQQ__Quote__c (before update) {\n    // TODO\n}\n\npublic with sharing class QuoteApprovalStamp {\n    public static void apply(List<SBQQ__Quote__c> quotes, Map<Id, SBQQ__Quote__c> oldMap) {\n        // TODO\n    }\n}\n",
    solution: "trigger QuoteTrigger on SBQQ__Quote__c (before update) {\n    QuoteApprovalStamp.apply(Trigger.new, Trigger.oldMap);\n}\n\npublic with sharing class QuoteApprovalStamp {\n    public static void apply(List<SBQQ__Quote__c> quotes, Map<Id, SBQQ__Quote__c> oldMap) {\n        for (SBQQ__Quote__c q : quotes) {\n            String oldStatus = oldMap.get(q.Id).SBQQ__Status__c;\n            if (q.SBQQ__Status__c == oldStatus) {\n                continue;\n            }\n            if (q.SBQQ__Status__c == 'Approved') {\n                q.Approved_On__c = System.now();\n                q.Approved_By__c = UserInfo.getUserId();\n            } else if (oldStatus == 'Approved') {\n                q.Approved_On__c = null;\n                q.Approved_By__c = null;\n            }\n        }\n    }\n}\n",
    checks: [
      { re: /on\s+SBQQ__Quote__c\s*\(\s*before\s+update/i, msg: "Trigger on SBQQ__Quote__c before update" },
      { re: /SBQQ__Status__c/i, msg: "Watches SBQQ__Status__c" },
      { re: /UserInfo\.getUserId\s*\(\s*\)/i, msg: "Uses the current user" },
      { re: /=\s*null\s*;/i, msg: "Clears the fields when approval is withdrawn" }
    ],
    forbid: [
      { re: /\b(insert|update|upsert|delete)\s+\w+\s*;/i, msg: "No DML needed: set fields on Trigger.new in a before trigger" },
      { re: /SBQQ__(NetAmount|CustomerAmount|ListAmount|RegularAmount)__c\s*=(?!=)/i, msg: "Do not write calculator-managed totals" }
    ],
    hints: ["Compare the new status with oldMap.get(q.Id).SBQQ__Status__c.","Set fields directly on the record; this is a before trigger."],
    ai: "Verify the stamp only happens on transition into Approved, both fields clear on transition out of Approved, unchanged statuses are skipped, and no CPQ-managed pricing fields or DML are involved."
  },
  {
    id: "TR078", track: 'triggers', level: "Easy", topic: "Salesforce CPQ",
    title: "Discount guardrail on CPQ quote lines",
    task: "Ashby Medical Devices caps discounting on CPQ quote lines.\nWrite trigger `QuoteLineTrigger` on `SBQQ__QuoteLine__c` (before insert, before update) and `QuoteLineDiscountGuard.validate(List<SBQQ__QuoteLine__c> lines)`:\n- `SBQQ__Discount__c` (percent) above 50: error \"Discounts above 50% are not allowed.\"\n- Above 30 with blank `Discount_Reason__c`: error \"Enter a Discount Reason for discounts above 30%.\"\n- Show errors on the discount field; null discount is fine\n- Validate only: never change prices yourself, the CPQ calculator owns them",
    starter: "trigger QuoteLineTrigger on SBQQ__QuoteLine__c (before insert, before update) {\n    // TODO\n}\n\npublic with sharing class QuoteLineDiscountGuard {\n    public static void validate(List<SBQQ__QuoteLine__c> lines) {\n        // TODO\n    }\n}\n",
    solution: "trigger QuoteLineTrigger on SBQQ__QuoteLine__c (before insert, before update) {\n    QuoteLineDiscountGuard.validate(Trigger.new);\n}\n\npublic with sharing class QuoteLineDiscountGuard {\n    public static void validate(List<SBQQ__QuoteLine__c> lines) {\n        for (SBQQ__QuoteLine__c line : lines) {\n            Decimal discount = line.SBQQ__Discount__c;\n            if (discount == null) {\n                continue;\n            }\n            if (discount > 50) {\n                line.addError(SBQQ__QuoteLine__c.SBQQ__Discount__c, 'Discounts above 50% are not allowed.');\n            } else if (discount > 30 && String.isBlank(line.Discount_Reason__c)) {\n                line.addError(SBQQ__QuoteLine__c.SBQQ__Discount__c, 'Enter a Discount Reason for discounts above 30%.');\n            }\n        }\n    }\n}\n",
    checks: [
      { re: /on\s+SBQQ__QuoteLine__c/i, msg: "Trigger on SBQQ__QuoteLine__c" },
      { re: /SBQQ__Discount__c/i, msg: "Reads SBQQ__Discount__c" },
      { re: />\s*50\b/, msg: "Hard cap at 50%" },
      { re: />\s*30\b/, msg: "Reason required above 30%" },
      { re: /String\.isBlank\s*\(|Discount_Reason__c\s*==\s*null/i, msg: "Checks for a blank reason" },
      { re: /addError\s*\(\s*SBQQ__QuoteLine__c\.SBQQ__Discount__c|SBQQ__Discount__c\.addError\s*\(/i, msg: "Error shown on the discount field" }
    ],
    forbid: [
      { re: /SBQQ__(NetPrice|CustomerPrice|RegularPrice|ListPrice|SpecialPrice)__c\s*=(?!=)/i, msg: "Do not overwrite calculator-owned prices" },
      { re: /\b(insert|update|upsert|delete)\s+\w+\s*;/i, msg: "No DML needed: set fields on Trigger.new in a before trigger" }
    ],
    hints: ["Use addError(SBQQ__QuoteLine__c.SBQQ__Discount__c, msg) for a field-level error.","Check > 50 first so the 30% rule doesn't also fire."],
    ai: "Verify the 50% cap wins over the reason rule, null discounts are skipped, errors are field-level, and the code never modifies CPQ price fields or performs DML."
  },
  {
    id: "TR079", track: 'triggers', level: "Medium", topic: "Salesforce CPQ",
    title: "Primary CPQ quote rules",
    task: "Thornbury Robotics enforces primary quote rules on `SBQQ__Quote__c`.\nWrite trigger `QuoteTrigger` (before update) and `PrimaryQuoteRules.enforce(List<SBQQ__Quote__c> quotes, Map<Id, SBQQ__Quote__c> oldMap)`:\n- A quote being made primary (`SBQQ__Primary__c` false → true) with `SBQQ__ExpirationDate__c` before today: error \"An expired quote cannot be made primary.\"\n- A quote losing primary (true → false) whose opportunity (`SBQQ__Opportunity2__c`) is closed: error \"The primary quote of a closed opportunity cannot be changed.\"\n- Errors on SBQQ__Primary__c; query opportunities only when needed",
    starter: "trigger QuoteTrigger on SBQQ__Quote__c (before update) {\n    // TODO\n}\n\npublic with sharing class PrimaryQuoteRules {\n    public static void enforce(List<SBQQ__Quote__c> quotes, Map<Id, SBQQ__Quote__c> oldMap) {\n        // TODO\n    }\n}\n",
    solution: "trigger QuoteTrigger on SBQQ__Quote__c (before update) {\n    PrimaryQuoteRules.enforce(Trigger.new, Trigger.oldMap);\n}\n\npublic with sharing class PrimaryQuoteRules {\n    public static void enforce(List<SBQQ__Quote__c> quotes, Map<Id, SBQQ__Quote__c> oldMap) {\n        List<SBQQ__Quote__c> demoted = new List<SBQQ__Quote__c>();\n        Set<Id> oppIds = new Set<Id>();\n        for (SBQQ__Quote__c q : quotes) {\n            Boolean wasPrimary = oldMap.get(q.Id).SBQQ__Primary__c;\n            if (q.SBQQ__Primary__c && !wasPrimary) {\n                if (q.SBQQ__ExpirationDate__c != null && q.SBQQ__ExpirationDate__c < Date.today()) {\n                    q.addError(SBQQ__Quote__c.SBQQ__Primary__c, 'An expired quote cannot be made primary.');\n                }\n            } else if (!q.SBQQ__Primary__c && wasPrimary && q.SBQQ__Opportunity2__c != null) {\n                demoted.add(q);\n                oppIds.add(q.SBQQ__Opportunity2__c);\n            }\n        }\n        if (demoted.isEmpty()) {\n            return;\n        }\n        Map<Id, Opportunity> opps = new Map<Id, Opportunity>(\n            [SELECT Id, IsClosed FROM Opportunity WHERE Id IN :oppIds]\n        );\n        for (SBQQ__Quote__c q : demoted) {\n            Opportunity opp = opps.get(q.SBQQ__Opportunity2__c);\n            if (opp != null && opp.IsClosed) {\n                q.addError(SBQQ__Quote__c.SBQQ__Primary__c, 'The primary quote of a closed opportunity cannot be changed.');\n            }\n        }\n    }\n}\n",
    checks: [
      { re: /SBQQ__Primary__c/i, msg: "Watches SBQQ__Primary__c" },
      { re: /SBQQ__ExpirationDate__c/i, msg: "Checks the expiration date" },
      { re: /SBQQ__Opportunity2__c/i, msg: "Uses SBQQ__Opportunity2__c" },
      { re: /IsClosed/i, msg: "Checks whether the opportunity is closed" },
      { re: /oldMap|Trigger\.old/i, msg: "Compares with the previous primary flag" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" },
      { re: /\b(insert|update|upsert|delete)\s+\w+\s*;/i, msg: "No DML needed: set fields on Trigger.new in a before trigger" }
    ],
    hints: ["Split quotes into \"becoming primary\" and \"losing primary\" using oldMap.","Only the demoted ones need an Opportunity query: collect SBQQ__Opportunity2__c Ids first."],
    ai: "Verify both transitions are detected from oldMap, the expiry check is null-safe, the opportunity query runs once and only when needed, and errors are attached to the quote being changed."
  },
  {
    id: "TR080", track: 'triggers', level: "Medium", topic: "Salesforce CPQ",
    title: "Push max line discount to the opportunity",
    task: "Wrenfield Security wants `Max_Line_Discount__c` on Opportunity for deal reviews.\nWrite trigger `QuoteTrigger` on `SBQQ__Quote__c` (after update) and `QuoteDiscountRollup.onApproved(List<SBQQ__Quote__c> quotes, Map<Id, SBQQ__Quote__c> oldMap)`:\n- Only primary quotes (`SBQQ__Primary__c`) whose `SBQQ__Status__c` just changed to 'Approved'\n- Set the opportunity (`SBQQ__Opportunity2__c`) field to the highest `SBQQ__Discount__c` across the quote's lines (0 if none)\n- CPQ updates quotes many times while calculating: act only on the status transition\n- One query, one update",
    starter: "trigger QuoteTrigger on SBQQ__Quote__c (after update) {\n    // TODO\n}\n\npublic with sharing class QuoteDiscountRollup {\n    public static void onApproved(List<SBQQ__Quote__c> quotes, Map<Id, SBQQ__Quote__c> oldMap) {\n        // TODO\n    }\n}\n",
    solution: "trigger QuoteTrigger on SBQQ__Quote__c (after update) {\n    QuoteDiscountRollup.onApproved(Trigger.new, Trigger.oldMap);\n}\n\npublic with sharing class QuoteDiscountRollup {\n    public static void onApproved(List<SBQQ__Quote__c> quotes, Map<Id, SBQQ__Quote__c> oldMap) {\n        Map<Id, Id> oppByQuote = new Map<Id, Id>();\n        for (SBQQ__Quote__c q : quotes) {\n            Boolean becameApproved = q.SBQQ__Status__c == 'Approved'\n                && oldMap.get(q.Id).SBQQ__Status__c != 'Approved';\n            if (becameApproved && q.SBQQ__Primary__c && q.SBQQ__Opportunity2__c != null) {\n                oppByQuote.put(q.Id, q.SBQQ__Opportunity2__c);\n            }\n        }\n        if (oppByQuote.isEmpty()) {\n            return;\n        }\n        Map<Id, Opportunity> updates = new Map<Id, Opportunity>();\n        for (Id oppId : oppByQuote.values()) {\n            updates.put(oppId, new Opportunity(Id = oppId, Max_Line_Discount__c = 0));\n        }\n        for (AggregateResult ar : [\n            SELECT SBQQ__Quote__c quoteId, MAX(SBQQ__Discount__c) maxDiscount\n            FROM SBQQ__QuoteLine__c\n            WHERE SBQQ__Quote__c IN :oppByQuote.keySet()\n            GROUP BY SBQQ__Quote__c\n        ]) {\n            Decimal maxDiscount = (Decimal) ar.get('maxDiscount');\n            Id oppId = oppByQuote.get((Id) ar.get('quoteId'));\n            updates.get(oppId).Max_Line_Discount__c = maxDiscount == null ? 0 : maxDiscount;\n        }\n        update updates.values();\n    }\n}\n",
    checks: [
      { re: /on\s+SBQQ__Quote__c\s*\(\s*after\s+update/i, msg: "Trigger on SBQQ__Quote__c after update" },
      { re: /SBQQ__Primary__c/i, msg: "Only primary quotes" },
      { re: /'Approved'/i, msg: "Acts on the Approved transition" },
      { re: /oldMap|Trigger\.old/i, msg: "Compares with the old status" },
      { re: /SBQQ__Discount__c/i, msg: "Reads line discounts" },
      { re: /Max_Line_Discount__c/i, msg: "Writes Max_Line_Discount__c" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" }
    ],
    hints: ["MAX(SBQQ__Discount__c) GROUP BY SBQQ__Quote__c gives the highest discount per quote.","Map quote Id → opportunity Id so aggregate rows can be routed to the right opportunity."],
    ai: "Verify the logic fires only on the transition to Approved for primary quotes (not on every CPQ recalculation update), lines with null discounts produce 0, and query/DML run once."
  },
  {
    id: "TR081", track: 'triggers', level: "Hard", topic: "Salesforce CPQ",
    title: "Stamp quote lines without firing CPQ triggers",
    task: "Hambleton Software stores `Region_Code__c` on CPQ quote lines for reporting only (it never affects pricing).\nWhen `Account.Sales_Region__c` changes, write trigger `AccountTrigger` (after update) and `QuoteLineRegionStamp.onRegionChange(List<Account> accounts, Map<Id, Account> oldMap)`:\n- Update Region_Code__c on all lines of 'Draft' quotes (`SBQQ__Status__c`) whose `SBQQ__Account__c` is one of the changed accounts\n- Because the field doesn't affect price, skip CPQ's package triggers/recalculation for this update using the `SBQQ.TriggerControl` API, and ALWAYS re-enable them even if the update fails\n- One query, one update",
    starter: "trigger AccountTrigger on Account (after update) {\n    // TODO\n}\n\npublic with sharing class QuoteLineRegionStamp {\n    public static void onRegionChange(List<Account> accounts, Map<Id, Account> oldMap) {\n        // TODO\n    }\n}\n",
    solution: "trigger AccountTrigger on Account (after update) {\n    QuoteLineRegionStamp.onRegionChange(Trigger.new, Trigger.oldMap);\n}\n\npublic with sharing class QuoteLineRegionStamp {\n    public static void onRegionChange(List<Account> accounts, Map<Id, Account> oldMap) {\n        Map<Id, String> regionByAccount = new Map<Id, String>();\n        for (Account acc : accounts) {\n            if (acc.Sales_Region__c != oldMap.get(acc.Id).Sales_Region__c) {\n                regionByAccount.put(acc.Id, acc.Sales_Region__c);\n            }\n        }\n        if (regionByAccount.isEmpty()) {\n            return;\n        }\n        List<SBQQ__QuoteLine__c> lines = [\n            SELECT Id, SBQQ__Quote__r.SBQQ__Account__c\n            FROM SBQQ__QuoteLine__c\n            WHERE SBQQ__Quote__r.SBQQ__Account__c IN :regionByAccount.keySet()\n              AND SBQQ__Quote__r.SBQQ__Status__c = 'Draft'\n        ];\n        if (lines.isEmpty()) {\n            return;\n        }\n        for (SBQQ__QuoteLine__c line : lines) {\n            line.Region_Code__c = regionByAccount.get(line.SBQQ__Quote__r.SBQQ__Account__c);\n        }\n        SBQQ.TriggerControl.disable();\n        try {\n            update lines;\n        } finally {\n            SBQQ.TriggerControl.enable();\n        }\n    }\n}\n",
    checks: [
      { re: /SBQQ\.TriggerControl\.disable\s*\(\s*\)/i, msg: "Disables CPQ triggers with SBQQ.TriggerControl.disable()" },
      { re: /SBQQ\.TriggerControl\.enable\s*\(\s*\)/i, msg: "Re-enables CPQ triggers" },
      { re: /finally\s*\{[^}]*SBQQ\.TriggerControl\.enable/i, msg: "Re-enables in a finally block" },
      { re: /Sales_Region__c\s*!=|!=\s*[^;]*Sales_Region__c/i, msg: "Only acts when the region changed" },
      { re: /'Draft'/i, msg: "Limits to Draft quotes" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" }
    ],
    hints: ["SBQQ.TriggerControl.disable() / enable() switch CPQ's own triggers off for the current transaction.","Put the update in try { } finally { enable(); } so an exception can't leave CPQ disabled."],
    ai: "Verify CPQ triggers are disabled only around the reporting-only update and re-enabled in finally, only Draft quote lines of changed accounts are touched via one relationship query, and the candidate does not disable CPQ for price-affecting changes."
  },
  {
    id: "TR082", track: 'triggers', level: "Medium", topic: "Salesforce CPQ",
    title: "Next renewal date from CPQ subscriptions",
    task: "Burnham Data Systems shows renewal info on Account from CPQ subscriptions.\nWrite trigger `SubscriptionTrigger` on `SBQQ__Subscription__c` (after insert, update, delete) and `SubscriptionRenewalRollup.recalculate(Set<Id> accountIds)`:\n- `Next_Renewal_Date__c` = earliest `SBQQ__EndDate__c` that is today or later; `Active_Subscriptions__c` = number of such subscriptions\n- Accounts with none: null date and 0\n- On update include the old `SBQQ__Account__c` too\n- SBQQ__EndDate__c is a formula, so don't aggregate it in SOQL: compute in Apex\n- One query, one update",
    starter: "trigger SubscriptionTrigger on SBQQ__Subscription__c (after insert, after update, after delete) {\n    // TODO\n}\n\npublic without sharing class SubscriptionRenewalRollup {\n    public static void recalculate(Set<Id> accountIds) {\n        // TODO\n    }\n}\n",
    solution: "trigger SubscriptionTrigger on SBQQ__Subscription__c (after insert, after update, after delete) {\n    Set<Id> accountIds = new Set<Id>();\n    if (Trigger.isDelete) {\n        for (SBQQ__Subscription__c s : (List<SBQQ__Subscription__c>) Trigger.old) {\n            accountIds.add(s.SBQQ__Account__c);\n        }\n    } else {\n        for (SBQQ__Subscription__c s : (List<SBQQ__Subscription__c>) Trigger.new) {\n            accountIds.add(s.SBQQ__Account__c);\n            if (Trigger.isUpdate) {\n                accountIds.add(((SBQQ__Subscription__c) Trigger.oldMap.get(s.Id)).SBQQ__Account__c);\n            }\n        }\n    }\n    accountIds.remove(null);\n    if (!accountIds.isEmpty()) {\n        SubscriptionRenewalRollup.recalculate(accountIds);\n    }\n}\n\npublic without sharing class SubscriptionRenewalRollup {\n    public static void recalculate(Set<Id> accountIds) {\n        Map<Id, Account> updates = new Map<Id, Account>();\n        for (Id accId : accountIds) {\n            updates.put(accId, new Account(Id = accId, Next_Renewal_Date__c = null, Active_Subscriptions__c = 0));\n        }\n        for (SBQQ__Subscription__c sub : [\n            SELECT SBQQ__Account__c, SBQQ__EndDate__c\n            FROM SBQQ__Subscription__c\n            WHERE SBQQ__Account__c IN :accountIds AND SBQQ__EndDate__c >= TODAY\n        ]) {\n            Account acc = updates.get(sub.SBQQ__Account__c);\n            acc.Active_Subscriptions__c += 1;\n            if (acc.Next_Renewal_Date__c == null || sub.SBQQ__EndDate__c < acc.Next_Renewal_Date__c) {\n                acc.Next_Renewal_Date__c = sub.SBQQ__EndDate__c;\n            }\n        }\n        update updates.values();\n    }\n}\n",
    checks: [
      { re: /on\s+SBQQ__Subscription__c\s*\([^)]*after\s+delete/i, msg: "Trigger on SBQQ__Subscription__c including after delete" },
      { re: /Trigger\.old(Map)?\b/i, msg: "Uses old values for deletes and reparenting" },
      { re: /SBQQ__EndDate__c/i, msg: "Uses SBQQ__EndDate__c" },
      { re: /TODAY|Date\.today\s*\(\s*\)/i, msg: "Only future or current subscriptions" },
      { re: /Next_Renewal_Date__c/i, msg: "Writes Next_Renewal_Date__c" },
      { re: /Active_Subscriptions__c/i, msg: "Writes Active_Subscriptions__c" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" }
    ],
    hints: ["Seed every affected account with null/0 so accounts without subscriptions are reset.","Query rows with SBQQ__EndDate__c >= TODAY and track the minimum date and count per account in Apex."],
    ai: "Verify deletes and account changes refresh the right accounts, past subscriptions are excluded, accounts with none reset to null/0, and the query and update run once."
  },
  {
    id: "TR083", track: 'triggers', level: "Hard", topic: "Salesforce CPQ",
    title: "Block presenting quotes below floor price",
    task: "Penrose Industrial won't let reps present CPQ quotes that break pricing policy.\nWrite trigger `QuoteTrigger` (before update) and `QuotePresentationGuard.validate(List<SBQQ__Quote__c> quotes, Map<Id, SBQQ__Quote__c> oldMap)`:\n- Applies when `SBQQ__Status__c` changes to 'Presented'\n- A line is a problem if `SBQQ__NetPrice__c` < the product's `Floor_Price__c` (via `SBQQ__Product__c`), or `SBQQ__Discount__c` > 40 and `Approved_Exception__c` is false\n- Error on the quote listing the product names: \"Cannot present this quote. Check pricing on: A, B\"\n- One query for all quotes; read prices, never change them",
    starter: "trigger QuoteTrigger on SBQQ__Quote__c (before update) {\n    // TODO\n}\n\npublic with sharing class QuotePresentationGuard {\n    public static void validate(List<SBQQ__Quote__c> quotes, Map<Id, SBQQ__Quote__c> oldMap) {\n        // TODO\n    }\n}\n",
    solution: "trigger QuoteTrigger on SBQQ__Quote__c (before update) {\n    QuotePresentationGuard.validate(Trigger.new, Trigger.oldMap);\n}\n\npublic with sharing class QuotePresentationGuard {\n    public static void validate(List<SBQQ__Quote__c> quotes, Map<Id, SBQQ__Quote__c> oldMap) {\n        Map<Id, SBQQ__Quote__c> presenting = new Map<Id, SBQQ__Quote__c>();\n        for (SBQQ__Quote__c q : quotes) {\n            if (q.SBQQ__Status__c == 'Presented' && oldMap.get(q.Id).SBQQ__Status__c != 'Presented') {\n                presenting.put(q.Id, q);\n            }\n        }\n        if (presenting.isEmpty()) {\n            return;\n        }\n        Map<Id, List<String>> problemsByQuote = new Map<Id, List<String>>();\n        for (SBQQ__QuoteLine__c line : [\n            SELECT SBQQ__Quote__c, SBQQ__NetPrice__c, SBQQ__Discount__c, Approved_Exception__c,\n                   SBQQ__Product__r.Name, SBQQ__Product__r.Floor_Price__c\n            FROM SBQQ__QuoteLine__c\n            WHERE SBQQ__Quote__c IN :presenting.keySet()\n        ]) {\n            Decimal floorPrice = line.SBQQ__Product__r.Floor_Price__c;\n            Boolean belowFloor = floorPrice != null && line.SBQQ__NetPrice__c != null\n                && line.SBQQ__NetPrice__c < floorPrice;\n            Boolean overDiscount = line.SBQQ__Discount__c != null && line.SBQQ__Discount__c > 40\n                && !line.Approved_Exception__c;\n            if (belowFloor || overDiscount) {\n                if (!problemsByQuote.containsKey(line.SBQQ__Quote__c)) {\n                    problemsByQuote.put(line.SBQQ__Quote__c, new List<String>());\n                }\n                problemsByQuote.get(line.SBQQ__Quote__c).add(line.SBQQ__Product__r.Name);\n            }\n        }\n        for (Id quoteId : problemsByQuote.keySet()) {\n            presenting.get(quoteId).addError(\n                'Cannot present this quote. Check pricing on: ' + String.join(problemsByQuote.get(quoteId), ', ')\n            );\n        }\n    }\n}\n",
    checks: [
      { re: /'Presented'/i, msg: "Acts when status changes to 'Presented'" },
      { re: /FROM\s+SBQQ__QuoteLine__c/i, msg: "Queries the quote lines" },
      { re: /SBQQ__NetPrice__c/i, msg: "Compares SBQQ__NetPrice__c" },
      { re: /Floor_Price__c/i, msg: "Uses the product Floor_Price__c" },
      { re: />\s*40\b/, msg: "Applies the 40% discount rule" },
      { re: /\.addError\s*\(/i, msg: "Blocks the quote with addError" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" },
      { re: /SBQQ__NetPrice__c\s*=(?!=)/i, msg: "Never modify the net price" },
      { re: /\b(insert|update|upsert|delete)\s+\w+\s*;/i, msg: "No DML needed: set fields on Trigger.new in a before trigger" }
    ],
    hints: ["Read the product fields through SBQQ__Product__r in the same query as the lines.","Group offending product names per quote in Map<Id, List<String>> and String.join them in the error."],
    ai: "Verify only transitions to Presented are checked, both floor and discount rules work with null-safe comparisons, the error lists offending products per quote, there is one query, and no pricing fields are written."
  },
  {
    id: "TR084", track: 'triggers', level: "Easy", topic: "Platform events & CDC",
    title: "Log dispatched shipments from a platform event",
    task: "Dunmore Freight's warehouse system publishes `Shipment_Dispatched__e` (`Order_Number__c`, `Carrier__c`, `Tracking_Number__c`, `Dispatched_At__c`).\nWrite trigger `ShipmentDispatchedTrigger` that creates one `Shipment_Log__c` per event with the same four fields plus `Replay_Id__c` = the event's ReplayId.\n- Use the only event a platform event trigger supports\n- One insert for the whole batch (a batch can hold up to 2,000 events)",
    starter: "trigger ShipmentDispatchedTrigger on Shipment_Dispatched__e (/* TODO */) {\n    // TODO\n}\n",
    solution: "trigger ShipmentDispatchedTrigger on Shipment_Dispatched__e (after insert) {\n    List<Shipment_Log__c> logs = new List<Shipment_Log__c>();\n    for (Shipment_Dispatched__e evt : Trigger.new) {\n        logs.add(new Shipment_Log__c(\n            Order_Number__c = evt.Order_Number__c,\n            Carrier__c = evt.Carrier__c,\n            Tracking_Number__c = evt.Tracking_Number__c,\n            Dispatched_At__c = evt.Dispatched_At__c,\n            Replay_Id__c = evt.ReplayId\n        ));\n    }\n    insert logs;\n}\n",
    checks: [
      { re: /on\s+Shipment_Dispatched__e\s*\(\s*after\s+insert\s*\)/i, msg: "Platform event trigger uses after insert" },
      { re: /new\s+Shipment_Log__c\s*\(/i, msg: "Creates Shipment_Log__c records" },
      { re: /\.ReplayId\b/i, msg: "Stores the event ReplayId" },
      { re: /\binsert\s+\w+\s*;|Database\.insert\s*\(/i, msg: "Inserts the logs" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" },
      { re: /before\s+insert/i, msg: "Platform event triggers only support after insert" }
    ],
    hints: ["Platform event triggers support only after insert.","Build the list in the loop and insert it once afterwards."],
    ai: "Verify the trigger uses after insert only, maps all four fields plus ReplayId, and inserts once outside the loop."
  },
  {
    id: "TR085", track: 'triggers', level: "Medium", topic: "Platform events & CDC",
    title: "Apply order status events by external ref",
    task: "Crowthorne Retail's OMS publishes `Order_Status_Update__e` (`External_Order_Ref__c`, `Status__c`).\nWrite trigger `OrderStatusUpdateTrigger` and `OrderStatusEventHandler.handle(List<Order_Status_Update__e> events)`:\n- Set `Fulfilment_Status__c` on the Order whose `External_Ref__c` matches\n- If the same order appears several times in a batch, the last event wins (events arrive in order)\n- For refs with no matching Order, insert a `Log__c` (`Source__c`, `Message__c` \"Unknown order ref: X\")\n- One query, one update, one insert; remember the trigger runs as the Automated Process user",
    starter: "trigger OrderStatusUpdateTrigger on Order_Status_Update__e (after insert) {\n    // TODO\n}\n\npublic without sharing class OrderStatusEventHandler {\n    public static void handle(List<Order_Status_Update__e> events) {\n        // TODO\n    }\n}\n",
    solution: "trigger OrderStatusUpdateTrigger on Order_Status_Update__e (after insert) {\n    OrderStatusEventHandler.handle(Trigger.new);\n}\n\npublic without sharing class OrderStatusEventHandler {\n    public static void handle(List<Order_Status_Update__e> events) {\n        Map<String, String> statusByRef = new Map<String, String>();\n        for (Order_Status_Update__e evt : events) {\n            statusByRef.put(evt.External_Order_Ref__c, evt.Status__c);\n        }\n        List<Order> orders = [\n            SELECT Id, External_Ref__c FROM Order WHERE External_Ref__c IN :statusByRef.keySet()\n        ];\n        Set<String> found = new Set<String>();\n        for (Order o : orders) {\n            o.Fulfilment_Status__c = statusByRef.get(o.External_Ref__c);\n            found.add(o.External_Ref__c);\n        }\n        update orders;\n\n        List<Log__c> logs = new List<Log__c>();\n        for (String ref : statusByRef.keySet()) {\n            if (!found.contains(ref)) {\n                logs.add(new Log__c(Source__c = 'OrderStatusEventHandler', Message__c = 'Unknown order ref: ' + ref));\n            }\n        }\n        if (!logs.isEmpty()) {\n            insert logs;\n        }\n    }\n}\n",
    checks: [
      { re: /on\s+Order_Status_Update__e\s*\(\s*after\s+insert/i, msg: "Event trigger uses after insert" },
      { re: /Map<\s*String\s*,\s*String\s*>/i, msg: "Keeps the latest status per reference in a map" },
      { re: /External_Ref__c\s+IN\s*:/i, msg: "Queries orders by reference in bulk" },
      { re: /Fulfilment_Status__c\s*=/i, msg: "Sets Fulfilment_Status__c" },
      { re: /new\s+Log__c\s*\(/i, msg: "Logs unknown references" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" }
    ],
    hints: ["Putting each event into Map<ref, status> in order naturally keeps the last one.","Track which refs were found, and log the rest after the update."],
    ai: "Verify duplicate refs collapse to the last event, unknown refs are logged rather than throwing, the class runs without sharing (Automated Process user), and there is one query, one update, one insert."
  },
  {
    id: "TR086", track: 'triggers', level: "Hard", topic: "Platform events & CDC",
    title: "Process payment events with resume checkpoints",
    task: "Halesworth Payments receives bursts of `Payment_Received__e` (`Invoice_Ref__c`, `Amount__c`).\nWrite trigger `PaymentReceivedTrigger` and `PaymentEventProcessor.process(List<Payment_Received__e> events)`:\n- Create `Payment__c` (`Invoice_Ref__c`, `Amount__c`, `Event_Replay_Id__c`) per event\n- Process at most 100 events per trigger execution; the rest must be redelivered in a new batch\n- After saving, call `setResumeCheckpoint` with the ReplayId of the last processed event\n- Redelivery must never duplicate payments: make the save idempotent (Event_Replay_Id__c is a unique external Id)",
    starter: "trigger PaymentReceivedTrigger on Payment_Received__e (after insert) {\n    // TODO\n}\n\npublic without sharing class PaymentEventProcessor {\n    public static void process(List<Payment_Received__e> events) {\n        // TODO\n    }\n}\n",
    solution: "trigger PaymentReceivedTrigger on Payment_Received__e (after insert) {\n    PaymentEventProcessor.process(Trigger.new);\n}\n\npublic without sharing class PaymentEventProcessor {\n    @TestVisible private static final Integer MAX_PER_BATCH = 100;\n\n    public static void process(List<Payment_Received__e> events) {\n        List<Payment__c> payments = new List<Payment__c>();\n        String lastReplayId;\n        for (Payment_Received__e evt : events) {\n            if (payments.size() == MAX_PER_BATCH) {\n                break;\n            }\n            payments.add(new Payment__c(\n                Invoice_Ref__c = evt.Invoice_Ref__c,\n                Amount__c = evt.Amount__c,\n                Event_Replay_Id__c = evt.ReplayId\n            ));\n            lastReplayId = evt.ReplayId;\n        }\n        if (payments.isEmpty()) {\n            return;\n        }\n        upsert payments Event_Replay_Id__c;\n        // Events after this checkpoint are redelivered in a new trigger batch.\n        EventBus.TriggerContext.currentContext().setResumeCheckpoint(lastReplayId);\n    }\n}\n",
    checks: [
      { re: /EventBus\.TriggerContext\.currentContext\s*\(\s*\)\s*\.\s*setResumeCheckpoint\s*\(/i, msg: "Sets a resume checkpoint via EventBus.TriggerContext" },
      { re: /\.ReplayId\b/i, msg: "Uses the event ReplayId" },
      { re: /\b100\b/, msg: "Caps processing at 100 events" },
      { re: /\bupsert\s+\w+\s+(Payment__c\.)?Event_Replay_Id__c|Database\.upsert\s*\([^;]*Event_Replay_Id__c/i, msg: "Upserts on Event_Replay_Id__c for idempotency" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" }
    ],
    hints: ["EventBus.TriggerContext.currentContext().setResumeCheckpoint(replayId) tells the platform where to resume.","Stop after 100, save with upsert on the external Id, then set the checkpoint to the last saved event."],
    ai: "Verify the checkpoint is set only after a successful save and points at the last processed event, no more than 100 events are processed, the save is idempotent on Event_Replay_Id__c, and DML is outside the loop."
  },
  {
    id: "TR087", track: 'triggers', level: "Medium", topic: "Platform events & CDC",
    title: "Retry inventory events on lock errors",
    task: "Cheltenham Logistics publishes `Inventory_Adjust__e` (`Product_Code__c`, `Delta__c`). Updates often hit row locks.\nWrite trigger `InventoryAdjustTrigger` and `InventoryAdjustHandler.handle(List<Inventory_Adjust__e> events)`:\n- Sum deltas per product code, then add them to `Stock_Level__c.Quantity__c` (matched on `Product_Code__c`; null quantity = 0)\n- Lock the rows while reading them\n- On any failure: if the event has been retried fewer than 4 times, throw `EventBus.RetryableException` so the batch is redelivered; otherwise insert a `Log__c` with the error message",
    starter: "trigger InventoryAdjustTrigger on Inventory_Adjust__e (after insert) {\n    // TODO\n}\n\npublic without sharing class InventoryAdjustHandler {\n    public static void handle(List<Inventory_Adjust__e> events) {\n        // TODO\n    }\n}\n",
    solution: "trigger InventoryAdjustTrigger on Inventory_Adjust__e (after insert) {\n    InventoryAdjustHandler.handle(Trigger.new);\n}\n\npublic without sharing class InventoryAdjustHandler {\n    @TestVisible private static final Integer MAX_RETRIES = 4;\n\n    public static void handle(List<Inventory_Adjust__e> events) {\n        Map<String, Decimal> deltaByCode = new Map<String, Decimal>();\n        for (Inventory_Adjust__e evt : events) {\n            Decimal running = deltaByCode.containsKey(evt.Product_Code__c) ? deltaByCode.get(evt.Product_Code__c) : 0;\n            deltaByCode.put(evt.Product_Code__c, running + (evt.Delta__c == null ? 0 : evt.Delta__c));\n        }\n        try {\n            List<Stock_Level__c> levels = [\n                SELECT Id, Product_Code__c, Quantity__c\n                FROM Stock_Level__c\n                WHERE Product_Code__c IN :deltaByCode.keySet()\n                FOR UPDATE\n            ];\n            for (Stock_Level__c lvl : levels) {\n                Decimal onHand = lvl.Quantity__c == null ? 0 : lvl.Quantity__c;\n                lvl.Quantity__c = onHand + deltaByCode.get(lvl.Product_Code__c);\n            }\n            update levels;\n        } catch (Exception e) {\n            if (EventBus.TriggerContext.currentContext().retries < MAX_RETRIES) {\n                throw new EventBus.RetryableException('Stock update failed, retrying: ' + e.getMessage());\n            }\n            insert new Log__c(Source__c = 'InventoryAdjustHandler', Message__c = e.getMessage().abbreviate(255));\n        }\n    }\n}\n",
    checks: [
      { re: /throw\s+new\s+EventBus\.RetryableException\s*\(/i, msg: "Throws EventBus.RetryableException" },
      { re: /currentContext\s*\(\s*\)\s*\.\s*retries/i, msg: "Checks EventBus.TriggerContext.currentContext().retries" },
      { re: /FOR\s+UPDATE/i, msg: "Locks the stock rows with FOR UPDATE" },
      { re: /catch\s*\(/i, msg: "Catches the failure" },
      { re: /Log__c/i, msg: "Logs once retries are exhausted" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" }
    ],
    hints: ["RetryableException makes the platform resend the whole batch; retries tells you how many times it already did.","Aggregate deltas first so each Stock_Level__c row is updated once."],
    ai: "Verify deltas are summed per code, the retry path only throws while retries < 4, the final failure is logged instead of thrown, and query/DML run once outside loops."
  },
  {
    id: "TR088", track: 'triggers', level: "Easy", topic: "Platform events & CDC",
    title: "CDC: task when account rating changes",
    task: "Stourbridge Bank enabled Change Data Capture on Account.\nWrite trigger `AccountChangeTrigger` on `AccountChangeEvent` that creates a Task for each account whose `Rating` changed:\n- Only UPDATE change events whose header lists 'Rating' in the changed fields\n- One event can cover several records: create a Task per record Id (`WhatId`), Subject \"Rating changed to \" + new rating, due tomorrow\n- CDC triggers run as the Automated Process user, so set `OwnerId` to the user who made the change (commit user)\n- One insert",
    starter: "trigger AccountChangeTrigger on AccountChangeEvent (after insert) {\n    // TODO\n}\n",
    solution: "trigger AccountChangeTrigger on AccountChangeEvent (after insert) {\n    List<Task> tasks = new List<Task>();\n    for (AccountChangeEvent evt : Trigger.new) {\n        EventBus.ChangeEventHeader header = evt.ChangeEventHeader;\n        if (header.changeType != 'UPDATE' || !header.changedFields.contains('Rating')) {\n            continue;\n        }\n        for (String recordId : header.recordIds) {\n            tasks.add(new Task(\n                WhatId = recordId,\n                OwnerId = header.commitUser,\n                Subject = 'Rating changed to ' + evt.Rating,\n                ActivityDate = Date.today().addDays(1)\n            ));\n        }\n    }\n    if (!tasks.isEmpty()) {\n        insert tasks;\n    }\n}\n",
    checks: [
      { re: /on\s+AccountChangeEvent\s*\(\s*after\s+insert/i, msg: "Trigger on AccountChangeEvent after insert" },
      { re: /ChangeEventHeader/i, msg: "Reads the ChangeEventHeader" },
      { re: /changedFields|getChangedFields\s*\(/i, msg: "Checks changedFields" },
      { re: /recordIds|getRecordIds\s*\(/i, msg: "Iterates over all recordIds" },
      { re: /commitUser|getCommitUser\s*\(/i, msg: "Assigns the task to the commit user" },
      { re: /'UPDATE'/, msg: "Only UPDATE changes" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" }
    ],
    hints: ["evt.ChangeEventHeader exposes changeType, changedFields, recordIds and commitUser.","Loop the header's recordIds inside the event loop; one event can represent several records."],
    ai: "Verify only UPDATE events with Rating in changedFields count, a task is created for every recordId (not just the first), OwnerId is the commit user, and the insert is outside the loops."
  },
  {
    id: "TR089", track: 'triggers', level: "Medium", topic: "Platform events & CDC",
    title: "CDC: commission requests for won deals",
    task: "Gatwick Leisure Group creates commission paperwork from `OpportunityChangeEvent`.\nWrite trigger `OpportunityChangeTrigger` and `CommissionRequestCreator.handle(List<OpportunityChangeEvent> events)`:\n- Act on CREATE events, or UPDATE events whose changed fields include 'StageName', where the event's StageName is 'Closed Won' (in UPDATE events unchanged fields are null)\n- Create a `Commission_Request__c` per record Id: `Opportunity__c`, `Opportunity_Key__c` (unique external Id = opp Id), `Requested_By__c` = commit user, `Status__c` 'Pending'\n- Events can be redelivered: never create duplicates\n- No SOQL",
    starter: "trigger OpportunityChangeTrigger on OpportunityChangeEvent (after insert) {\n    // TODO\n}\n\npublic without sharing class CommissionRequestCreator {\n    public static void handle(List<OpportunityChangeEvent> events) {\n        // TODO\n    }\n}\n",
    solution: "trigger OpportunityChangeTrigger on OpportunityChangeEvent (after insert) {\n    CommissionRequestCreator.handle(Trigger.new);\n}\n\npublic without sharing class CommissionRequestCreator {\n    public static void handle(List<OpportunityChangeEvent> events) {\n        Map<String, Commission_Request__c> requests = new Map<String, Commission_Request__c>();\n        for (OpportunityChangeEvent evt : events) {\n            EventBus.ChangeEventHeader header = evt.ChangeEventHeader;\n            Boolean stageInPayload = header.changeType == 'CREATE'\n                || (header.changeType == 'UPDATE' && header.changedFields.contains('StageName'));\n            if (!stageInPayload || evt.StageName != 'Closed Won') {\n                continue;\n            }\n            for (String oppId : header.recordIds) {\n                requests.put(oppId, new Commission_Request__c(\n                    Opportunity__c = oppId,\n                    Opportunity_Key__c = oppId,\n                    Requested_By__c = header.commitUser,\n                    Status__c = 'Pending'\n                ));\n            }\n        }\n        if (!requests.isEmpty()) {\n            upsert requests.values() Opportunity_Key__c;\n        }\n    }\n}\n",
    checks: [
      { re: /on\s+OpportunityChangeEvent\s*\(\s*after\s+insert/i, msg: "Trigger on OpportunityChangeEvent after insert" },
      { re: /changedFields|getChangedFields\s*\(/i, msg: "Checks changedFields for StageName" },
      { re: /'Closed Won'/i, msg: "Only Closed Won" },
      { re: /recordIds|getRecordIds\s*\(/i, msg: "Handles every recordId in the event" },
      { re: /upsert[^;]*Opportunity_Key__c/i, msg: "Upserts on Opportunity_Key__c to avoid duplicates" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" },
      { re: /\[\s*SELECT/i, msg: "No SOQL needed: the event carries the data" }
    ],
    hints: ["In UPDATE events only changed fields are populated, so check changedFields before trusting evt.StageName.","Upsert on the external Id so a redelivered event updates instead of duplicating."],
    ai: "Verify CREATE and UPDATE paths are handled correctly (StageName only trusted when in changedFields), every recordId gets a request, duplicates are prevented via upsert on Opportunity_Key__c, and there is no SOQL."
  },
  {
    id: "TR090", track: 'triggers', level: "Hard", topic: "Platform events & CDC",
    title: "CDC snapshot sync with gap events",
    task: "Wolverton Distribution mirrors accounts into `Account_Snapshot__c` (`Account_Id__c` unique external Id, `Name__c`, `Rating__c`, `Annual_Revenue__c`) from `AccountChangeEvent`.\nWrite trigger `AccountSnapshotTrigger` and `AccountSnapshotSync.handle(List<AccountChangeEvent> events)`:\n- CREATE: upsert a full snapshot\n- UPDATE: copy only fields listed in changedFields (Name, Rating, AnnualRevenue)\n- DELETE: delete the snapshot\n- Any other change type (GAP_*, UNDELETE): re-query the account and upsert a full snapshot\n- Handle all recordIds; one upsert, one delete, at most one query",
    starter: "trigger AccountSnapshotTrigger on AccountChangeEvent (after insert) {\n    // TODO\n}\n\npublic without sharing class AccountSnapshotSync {\n    public static void handle(List<AccountChangeEvent> events) {\n        // TODO\n    }\n}\n",
    solution: "trigger AccountSnapshotTrigger on AccountChangeEvent (after insert) {\n    AccountSnapshotSync.handle(Trigger.new);\n}\n\npublic without sharing class AccountSnapshotSync {\n    public static void handle(List<AccountChangeEvent> events) {\n        Map<String, Account_Snapshot__c> upserts = new Map<String, Account_Snapshot__c>();\n        Set<String> toDelete = new Set<String>();\n        Set<String> toRequery = new Set<String>();\n\n        for (AccountChangeEvent evt : events) {\n            EventBus.ChangeEventHeader header = evt.ChangeEventHeader;\n            String changeType = header.changeType;\n            for (String accId : header.recordIds) {\n                if (changeType == 'DELETE') {\n                    toDelete.add(accId);\n                    upserts.remove(accId);\n                } else if (changeType == 'CREATE') {\n                    upserts.put(accId, new Account_Snapshot__c(\n                        Account_Id__c = accId, Name__c = evt.Name,\n                        Rating__c = evt.Rating, Annual_Revenue__c = evt.AnnualRevenue));\n                } else if (changeType == 'UPDATE') {\n                    Account_Snapshot__c snap = upserts.containsKey(accId)\n                        ? upserts.get(accId) : new Account_Snapshot__c(Account_Id__c = accId);\n                    List<String> changed = header.changedFields;\n                    if (changed.contains('Name')) {\n                        snap.Name__c = evt.Name;\n                    }\n                    if (changed.contains('Rating')) {\n                        snap.Rating__c = evt.Rating;\n                    }\n                    if (changed.contains('AnnualRevenue')) {\n                        snap.Annual_Revenue__c = evt.AnnualRevenue;\n                    }\n                    upserts.put(accId, snap);\n                } else {\n                    // GAP_CREATE, GAP_UPDATE, GAP_DELETE, GAP_UNDELETE, UNDELETE: trust the database, not the event\n                    toRequery.add(accId);\n                }\n            }\n        }\n\n        if (!toRequery.isEmpty()) {\n            for (Account acc : [SELECT Id, Name, Rating, AnnualRevenue FROM Account WHERE Id IN :toRequery]) {\n                upserts.put(acc.Id, new Account_Snapshot__c(\n                    Account_Id__c = acc.Id, Name__c = acc.Name,\n                    Rating__c = acc.Rating, Annual_Revenue__c = acc.AnnualRevenue));\n                toDelete.remove(acc.Id);\n            }\n        }\n        if (!upserts.isEmpty()) {\n            upsert upserts.values() Account_Snapshot__c.Account_Id__c;\n        }\n        if (!toDelete.isEmpty()) {\n            delete [SELECT Id FROM Account_Snapshot__c WHERE Account_Id__c IN :toDelete];\n        }\n    }\n}\n",
    checks: [
      { re: /changedFields|getChangedFields\s*\(/i, msg: "Copies only changed fields on UPDATE" },
      { re: /GAP_|else\s*\{/i, msg: "Handles gap and other change types" },
      { re: /'DELETE'/, msg: "Handles DELETE events" },
      { re: /FROM\s+Account\b/i, msg: "Re-queries accounts for gap events" },
      { re: /upsert[^;]*Account_Id__c/i, msg: "Upserts snapshots on Account_Id__c" },
      { re: /recordIds|getRecordIds\s*\(/i, msg: "Handles every recordId" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" }
    ],
    hints: ["Gap events carry no field values, only record Ids; re-read the records from the database.","Accumulate upserts in Map<String, Account_Snapshot__c> keyed by account Id so later events in the batch override earlier ones."],
    ai: "Verify UPDATE only writes fields named in changedFields (so unchanged fields are not nulled), gap/undelete events re-query, deletes remove snapshots, all recordIds are processed, and there is at most one query plus one upsert and one delete."
  },
  {
    id: "TR091", track: 'triggers', level: "Easy", topic: "Async from triggers",
    title: "Enqueue an enrichment job from a trigger",
    task: "Quayside Accountancy enriches new client accounts with Companies House data asynchronously.\nWrite trigger `AccountTrigger` (after insert) and Queueable class `AccountEnrichmentJob` with constructor `AccountEnrichmentJob(Set<Id> accountIds)`:\n- Only accounts with a non-blank `Company_Number__c`\n- Enqueue ONE job for the whole batch, and nothing when no account qualifies\n- `execute` re-queries the accounts and sets `Enrichment_Status__c` = 'Pending' and `Enrichment_Requested_On__c` = now",
    starter: "trigger AccountTrigger on Account (after insert) {\n    // TODO\n}\n\npublic with sharing class AccountEnrichmentJob {\n    // TODO\n}\n",
    solution: "trigger AccountTrigger on Account (after insert) {\n    Set<Id> ids = new Set<Id>();\n    for (Account acc : Trigger.new) {\n        if (String.isNotBlank(acc.Company_Number__c)) {\n            ids.add(acc.Id);\n        }\n    }\n    if (!ids.isEmpty()) {\n        System.enqueueJob(new AccountEnrichmentJob(ids));\n    }\n}\n\npublic with sharing class AccountEnrichmentJob implements Queueable {\n    private final Set<Id> accountIds;\n\n    public AccountEnrichmentJob(Set<Id> accountIds) {\n        this.accountIds = accountIds;\n    }\n\n    public void execute(QueueableContext context) {\n        List<Account> accounts = [\n            SELECT Id, Company_Number__c FROM Account WHERE Id IN :accountIds WITH USER_MODE\n        ];\n        for (Account acc : accounts) {\n            acc.Enrichment_Status__c = 'Pending';\n            acc.Enrichment_Requested_On__c = System.now();\n        }\n        update accounts;\n    }\n}\n",
    checks: [
      { re: /implements\s+Queueable/i, msg: "Class implements Queueable" },
      { re: /execute\s*\(\s*QueueableContext\s+\w+\s*\)/i, msg: "Implements execute(QueueableContext)" },
      { re: /System\.enqueueJob\s*\(\s*new\s+AccountEnrichmentJob\s*\(/i, msg: "Enqueues AccountEnrichmentJob" },
      { re: /isEmpty\s*\(\s*\)|size\s*\(\s*\)\s*>\s*0/i, msg: "Skips enqueueing when nothing qualifies" },
      { re: /Company_Number__c/i, msg: "Filters on Company_Number__c" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*System\.enqueueJob/i, msg: "Enqueue once per transaction, not once per record" },
      { re: /@future/i, msg: "Use Queueable, not @future" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" }
    ],
    hints: ["Collect qualifying Ids in a Set first, then enqueue once after the loop.","Pass the Ids through the constructor and re-query inside execute."],
    ai: "Verify one job per trigger batch, no job when nothing qualifies, the job re-queries rather than holding stale sObjects, and its DML is outside the loop."
  },
  {
    id: "TR092", track: 'triggers', level: "Medium", topic: "Async from triggers",
    title: "Enqueue validation once per transaction",
    task: "Pemberton Utilities validates `Meter_Reading__c` records asynchronously. Bulk Apex inserts fire the trigger in 200-record chunks within one transaction, and each chunk was enqueuing its own job.\nWrite trigger `MeterReadingTrigger`, class `MeterReadingService` and Queueable `MeterValidationJob`:\n- Before insert/update: set `Needs_Validation__c = true` on new readings or when `Reading_Value__c` changes\n- After insert/update: enqueue ONE `MeterValidationJob` per transaction (static flag) and only if queueable limits allow\n- Job: query up to 2,000 flagged readings, set `Status__c` 'Rejected' (null/negative) or 'Validated', clear the flag, and chain another job if more may remain",
    starter: "trigger MeterReadingTrigger on Meter_Reading__c (before insert, before update, after insert, after update) {\n    // TODO\n}\n\npublic with sharing class MeterReadingService {\n    // TODO\n}\n\npublic with sharing class MeterValidationJob implements Queueable {\n    public void execute(QueueableContext context) {\n        // TODO\n    }\n}\n",
    solution: "trigger MeterReadingTrigger on Meter_Reading__c (before insert, before update, after insert, after update) {\n    switch on Trigger.operationType {\n        when BEFORE_INSERT, BEFORE_UPDATE {\n            MeterReadingService.flagForValidation(Trigger.new, Trigger.oldMap);\n        }\n        when AFTER_INSERT, AFTER_UPDATE {\n            MeterReadingService.enqueueOnce(Trigger.new);\n        }\n    }\n}\n\npublic with sharing class MeterReadingService {\n    @TestVisible private static Boolean jobEnqueued = false;\n\n    public static void flagForValidation(List<Meter_Reading__c> readings, Map<Id, Meter_Reading__c> oldMap) {\n        for (Meter_Reading__c r : readings) {\n            if (oldMap == null || r.Reading_Value__c != oldMap.get(r.Id).Reading_Value__c) {\n                r.Needs_Validation__c = true;\n            }\n        }\n    }\n\n    public static void enqueueOnce(List<Meter_Reading__c> readings) {\n        if (jobEnqueued) {\n            return;\n        }\n        Boolean anyFlagged = false;\n        for (Meter_Reading__c r : readings) {\n            if (r.Needs_Validation__c) {\n                anyFlagged = true;\n                break;\n            }\n        }\n        if (anyFlagged && Limits.getQueueableJobs() < Limits.getLimitQueueableJobs()) {\n            System.enqueueJob(new MeterValidationJob());\n            jobEnqueued = true;\n        }\n    }\n}\n\npublic with sharing class MeterValidationJob implements Queueable {\n    private static final Integer CHUNK = 2000;\n\n    public void execute(QueueableContext context) {\n        List<Meter_Reading__c> pending = [\n            SELECT Id, Reading_Value__c\n            FROM Meter_Reading__c\n            WHERE Needs_Validation__c = true\n            LIMIT :CHUNK\n        ];\n        for (Meter_Reading__c r : pending) {\n            r.Status__c = (r.Reading_Value__c == null || r.Reading_Value__c < 0) ? 'Rejected' : 'Validated';\n            r.Needs_Validation__c = false;\n        }\n        update pending;\n        if (pending.size() == CHUNK && !Test.isRunningTest()) {\n            System.enqueueJob(new MeterValidationJob());\n        }\n    }\n}\n",
    checks: [
      { re: /static\s+Boolean\s+\w+/i, msg: "Uses a static flag to enqueue once per transaction" },
      { re: /Limits\.getQueueableJobs\s*\(\s*\)/i, msg: "Checks the queueable limit" },
      { re: /System\.enqueueJob\s*\(\s*new\s+MeterValidationJob/i, msg: "Enqueues MeterValidationJob" },
      { re: /Needs_Validation__c\s*=\s*true/i, msg: "Flags readings in the before trigger" },
      { re: /Needs_Validation__c\s*=\s*false/i, msg: "Job clears the flag" },
      { re: /WHERE[^\]]*Needs_Validation__c\s*=\s*true/i, msg: "Job queries flagged readings instead of carrying Ids" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*System\.enqueueJob/i, msg: "Enqueue once per transaction, not once per record" },
      { re: /@future/i, msg: "Use Queueable, not @future" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" }
    ],
    hints: ["Static variables live for the whole transaction, across all trigger chunks.","Because the job queries Needs_Validation__c = true, it picks up every chunk's records even though it was enqueued by the first chunk."],
    ai: "Verify only one job is enqueued per transaction even across chunks, the job finds records via the flag (so later chunks are not missed), clearing the flag does not re-trigger enqueueing, and chaining is guarded."
  },
  {
    id: "TR093", track: 'triggers', level: "Medium", topic: "Async from triggers",
    title: "Sync new leads to a marketing API",
    task: "Thistle Insurance Brokers pushes new leads to its marketing hub. Triggers cannot make callouts directly.\nWrite trigger `LeadTrigger` (after insert) and `LeadSyncJob` (constructor `LeadSyncJob(List<Id> leadIds)`):\n- Only leads with an Email; one job per batch\n- In the job, POST one JSON array of {leadId, email, company} to Named Credential `callout:Marketing_Hub/leads`\n- 2xx response: set `Sync_Status__c` 'Synced' on those leads; any other status or a CalloutException: 'Failed'\n- Exactly one callout and one update per job",
    starter: "trigger LeadTrigger on Lead (after insert) {\n    // TODO\n}\n\npublic with sharing class LeadSyncJob {\n    // TODO\n}\n",
    solution: "trigger LeadTrigger on Lead (after insert) {\n    List<Id> leadIds = new List<Id>();\n    for (Lead ld : Trigger.new) {\n        if (String.isNotBlank(ld.Email)) {\n            leadIds.add(ld.Id);\n        }\n    }\n    if (!leadIds.isEmpty()) {\n        System.enqueueJob(new LeadSyncJob(leadIds));\n    }\n}\n\npublic with sharing class LeadSyncJob implements Queueable, Database.AllowsCallouts {\n    private final List<Id> leadIds;\n\n    public LeadSyncJob(List<Id> leadIds) {\n        this.leadIds = leadIds;\n    }\n\n    public void execute(QueueableContext context) {\n        List<Lead> leads = [SELECT Id, Email, Company FROM Lead WHERE Id IN :leadIds];\n        List<Map<String, Object>> payload = new List<Map<String, Object>>();\n        for (Lead ld : leads) {\n            payload.add(new Map<String, Object>{\n                'leadId' => ld.Id, 'email' => ld.Email, 'company' => ld.Company\n            });\n        }\n        HttpRequest req = new HttpRequest();\n        req.setEndpoint('callout:Marketing_Hub/leads');\n        req.setMethod('POST');\n        req.setHeader('Content-Type', 'application/json');\n        req.setBody(JSON.serialize(payload));\n        req.setTimeout(20000);\n\n        String status;\n        try {\n            HttpResponse res = new Http().send(req);\n            status = (res.getStatusCode() >= 200 && res.getStatusCode() < 300) ? 'Synced' : 'Failed';\n        } catch (CalloutException e) {\n            status = 'Failed';\n        }\n        for (Lead ld : leads) {\n            ld.Sync_Status__c = status;\n        }\n        update leads;\n    }\n}\n",
    checks: [
      { re: /Database\.AllowsCallouts/i, msg: "Queueable implements Database.AllowsCallouts" },
      { re: /implements\s+Queueable/i, msg: "Implements Queueable" },
      { re: /callout:Marketing_Hub/i, msg: "Uses the Marketing_Hub Named Credential" },
      { re: /setMethod\s*\(\s*'POST'\s*\)/i, msg: "POSTs the payload" },
      { re: /System\.enqueueJob\s*\(\s*new\s+LeadSyncJob/i, msg: "Trigger enqueues LeadSyncJob" },
      { re: /catch\s*\(\s*(System\.)?CalloutException/i, msg: "Handles CalloutException" }
    ],
    forbid: [
      { re: /@future/i, msg: "Use Queueable, not @future" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*System\.enqueueJob/i, msg: "Enqueue once per transaction, not once per record" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*\.send\s*\(/i, msg: "Send one batched request, not one callout per lead" }
    ],
    hints: ["A Queueable needs Database.AllowsCallouts to make HTTP callouts.","Serialize a List<Map<String, Object>>, send once, then stamp the status on every lead."],
    ai: "Verify the trigger only enqueues (no callout in trigger context), one batched callout is made via the Named Credential, non-2xx and exceptions both mark Failed, and the update happens after the callout."
  },
  {
    id: "TR094", track: 'triggers', level: "Hard", topic: "Async from triggers",
    title: "Chained Queueable for per-record callouts",
    task: "Carrick Fleet Leasing's telematics API accepts one vehicle per call.\nWrite trigger `VehicleTrigger` (after update) and `TelematicsSyncJob` (Queueable, callouts) with `static void enqueue(List<Id> vehicleIds)`:\n- Only vehicles whose `Mileage__c` changed\n- `enqueue` only calls System.enqueueJob when `Limits` allow; otherwise insert a `Log__c`\n- Each job makes at most 50 callouts (PUT `callout:Telematics_API/vehicles/{Id}` with {\"mileage\": n}) and chains a new job for the remaining Ids\n- Set `Telematics_Status__c` 'Synced'/'Failed' per vehicle; do all callouts BEFORE any DML\n- The status update must not re-trigger syncing",
    starter: "trigger VehicleTrigger on Vehicle__c (after update) {\n    // TODO\n}\n\npublic with sharing class TelematicsSyncJob {\n    // TODO\n}\n",
    solution: "trigger VehicleTrigger on Vehicle__c (after update) {\n    List<Id> changed = new List<Id>();\n    for (Vehicle__c v : (List<Vehicle__c>) Trigger.new) {\n        Vehicle__c prior = (Vehicle__c) Trigger.oldMap.get(v.Id);\n        if (v.Mileage__c != prior.Mileage__c) {\n            changed.add(v.Id);\n        }\n    }\n    if (!changed.isEmpty()) {\n        TelematicsSyncJob.enqueue(changed);\n    }\n}\n\npublic with sharing class TelematicsSyncJob implements Queueable, Database.AllowsCallouts {\n    @TestVisible private static final Integer CALLOUTS_PER_JOB = 50;\n    private final List<Id> vehicleIds;\n\n    public TelematicsSyncJob(List<Id> vehicleIds) {\n        this.vehicleIds = vehicleIds;\n    }\n\n    public static void enqueue(List<Id> vehicleIds) {\n        if (Limits.getQueueableJobs() < Limits.getLimitQueueableJobs()) {\n            System.enqueueJob(new TelematicsSyncJob(vehicleIds));\n        } else {\n            insert new Log__c(\n                Source__c = 'TelematicsSyncJob',\n                Message__c = 'Queueable limit reached; ' + vehicleIds.size() + ' vehicles not synced'\n            );\n        }\n    }\n\n    public void execute(QueueableContext context) {\n        List<Id> thisRun = new List<Id>();\n        List<Id> remaining = new List<Id>();\n        for (Integer i = 0; i < vehicleIds.size(); i++) {\n            if (i < CALLOUTS_PER_JOB) {\n                thisRun.add(vehicleIds[i]);\n            } else {\n                remaining.add(vehicleIds[i]);\n            }\n        }\n        List<Vehicle__c> vehicles = [SELECT Id, Mileage__c FROM Vehicle__c WHERE Id IN :thisRun];\n        for (Vehicle__c v : vehicles) {\n            HttpRequest req = new HttpRequest();\n            req.setEndpoint('callout:Telematics_API/vehicles/' + v.Id);\n            req.setMethod('PUT');\n            req.setHeader('Content-Type', 'application/json');\n            req.setBody(JSON.serialize(new Map<String, Object>{ 'mileage' => v.Mileage__c }));\n            try {\n                HttpResponse res = new Http().send(req);\n                v.Telematics_Status__c = res.getStatusCode() == 200 ? 'Synced' : 'Failed';\n            } catch (CalloutException e) {\n                v.Telematics_Status__c = 'Failed';\n            }\n        }\n        if (!remaining.isEmpty()) {\n            System.enqueueJob(new TelematicsSyncJob(remaining));\n        }\n        // Mileage__c is unchanged by this update, so the trigger will not enqueue again.\n        update vehicles;\n    }\n}\n",
    checks: [
      { re: /Database\.AllowsCallouts/i, msg: "Job allows callouts" },
      { re: /\b50\b/, msg: "Caps callouts per job at 50" },
      { re: /System\.enqueueJob\s*\(\s*new\s+TelematicsSyncJob/i, msg: "Chains a new TelematicsSyncJob" },
      { re: /Limits\.getQueueableJobs\s*\(\s*\)/i, msg: "Checks queueable limits before enqueueing" },
      { re: /Mileage__c\s*!=|!=\s*[^;]*Mileage__c/i, msg: "Only vehicles whose mileage changed" },
      { re: /callout:Telematics_API/i, msg: "Uses the Telematics_API Named Credential" }
    ],
    forbid: [
      { re: /@future/i, msg: "Use Queueable, not @future" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*System\.enqueueJob/i, msg: "Enqueue once per transaction, not once per record" }
    ],
    hints: ["Split the Id list into the first 50 and the rest; pass the rest to a new job.","Callouts are not allowed after uncommitted DML in the same transaction: do every send() first, then update."],
    ai: "Verify no job makes more than 50 callouts, remaining Ids are chained, all callouts happen before the update, the enqueue is limit-guarded with a logged fallback, and the status update cannot cause another sync (mileage unchanged)."
  },
  {
    id: "TR095", track: 'triggers', level: "Medium", topic: "Async from triggers",
    title: "Replace @future geocoding with Queueable",
    task: "Knaresborough Water's AccountTrigger called an `@future(callout=true)` method, which fails when accounts are updated from Batch Apex (\"Future method cannot be called from a future or batch method\").\nRewrite it:\n- Trigger `AccountTrigger` (after insert, after update): collect accounts inserted with a `BillingPostalCode` or whose BillingPostalCode changed\n- `AccountGeocodeService.request(Set<Id> accountIds)`: if queueable limits allow, enqueue `AccountGeocodeJob`; otherwise set `Geocode_Status__c` = 'Pending' on those accounts (a nightly job sweeps them)\n- `AccountGeocodeJob` (Queueable, callouts) calls the existing `GeoCoder.geocodeNow(Set<Id>)`",
    starter: "trigger AccountTrigger on Account (after insert, after update) {\n    // TODO\n}\n\npublic with sharing class AccountGeocodeService {\n    public static void request(Set<Id> accountIds) {\n        // TODO\n    }\n}\n\npublic with sharing class AccountGeocodeJob {\n    // TODO\n}\n",
    solution: "trigger AccountTrigger on Account (after insert, after update) {\n    Set<Id> ids = new Set<Id>();\n    for (Account acc : (List<Account>) Trigger.new) {\n        Boolean needsGeocode = Trigger.isInsert\n            ? acc.BillingPostalCode != null\n            : acc.BillingPostalCode != ((Account) Trigger.oldMap.get(acc.Id)).BillingPostalCode;\n        if (needsGeocode) {\n            ids.add(acc.Id);\n        }\n    }\n    if (!ids.isEmpty()) {\n        AccountGeocodeService.request(ids);\n    }\n}\n\npublic with sharing class AccountGeocodeService {\n    public static void request(Set<Id> accountIds) {\n        if (Limits.getQueueableJobs() < Limits.getLimitQueueableJobs()) {\n            System.enqueueJob(new AccountGeocodeJob(accountIds));\n            return;\n        }\n        List<Account> pending = new List<Account>();\n        for (Id accId : accountIds) {\n            pending.add(new Account(Id = accId, Geocode_Status__c = 'Pending'));\n        }\n        update pending;\n    }\n}\n\npublic with sharing class AccountGeocodeJob implements Queueable, Database.AllowsCallouts {\n    private final Set<Id> accountIds;\n\n    public AccountGeocodeJob(Set<Id> accountIds) {\n        this.accountIds = accountIds;\n    }\n\n    public void execute(QueueableContext context) {\n        GeoCoder.geocodeNow(accountIds);\n    }\n}\n",
    checks: [
      { re: /implements\s+Queueable\s*,\s*Database\.AllowsCallouts|implements\s+Database\.AllowsCallouts\s*,\s*Queueable/i, msg: "AccountGeocodeJob implements Queueable and Database.AllowsCallouts" },
      { re: /Limits\.getQueueableJobs\s*\(\s*\)/i, msg: "Checks queueable limits (works from batch and future contexts)" },
      { re: /GeoCoder\.geocodeNow\s*\(/i, msg: "Job calls GeoCoder.geocodeNow" },
      { re: /'Pending'/i, msg: "Falls back to Pending when no job can be enqueued" },
      { re: /BillingPostalCode\s*!=/i, msg: "Only when the postcode is set or changed" }
    ],
    forbid: [
      { re: /@future/i, msg: "Use Queueable, not @future" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*System\.enqueueJob/i, msg: "Enqueue once per transaction, not once per record" }
    ],
    hints: ["Batch execute and future methods may each enqueue one Queueable, but cannot call @future.","Limits.getQueueableJobs() < Limits.getLimitQueueableJobs() tells you if one more job fits."],
    ai: "Verify @future is gone, enqueueing is limit-guarded with the Pending fallback, only new or changed postcodes trigger geocoding, and the Pending update cannot cause an infinite loop."
  },
  {
    id: "TR096", track: 'triggers', level: "Easy", topic: "Async from triggers",
    title: "Enqueue email sync only for changed contacts",
    task: "Marchmont Events syncs contact email changes to its ticketing platform via an existing Queueable `ContactEmailSyncJob(Set<Id> contactIds)`.\nWrite trigger `ContactTrigger` (after update) and `ContactTriggerHandler.afterUpdate(List<Contact> contacts, Map<Id, Contact> oldMap)`:\n- Collect only contacts whose `Email` actually changed\n- Enqueue one ContactEmailSyncJob with those Ids\n- Don't enqueue anything if no email changed",
    starter: "trigger ContactTrigger on Contact (after update) {\n    // TODO\n}\n\npublic with sharing class ContactTriggerHandler {\n    public static void afterUpdate(List<Contact> contacts, Map<Id, Contact> oldMap) {\n        // TODO\n    }\n}\n",
    solution: "trigger ContactTrigger on Contact (after update) {\n    ContactTriggerHandler.afterUpdate(Trigger.new, Trigger.oldMap);\n}\n\npublic with sharing class ContactTriggerHandler {\n    public static void afterUpdate(List<Contact> contacts, Map<Id, Contact> oldMap) {\n        Set<Id> changed = new Set<Id>();\n        for (Contact c : contacts) {\n            if (c.Email != oldMap.get(c.Id).Email) {\n                changed.add(c.Id);\n            }\n        }\n        if (!changed.isEmpty()) {\n            System.enqueueJob(new ContactEmailSyncJob(changed));\n        }\n    }\n}\n",
    checks: [
      { re: /after\s+update/i, msg: "Trigger runs after update" },
      { re: /Email\s*!=|!=\s*[^;]*\.Email\b/i, msg: "Compares old and new Email" },
      { re: /System\.enqueueJob\s*\(\s*new\s+ContactEmailSyncJob/i, msg: "Enqueues ContactEmailSyncJob" },
      { re: /isEmpty\s*\(\s*\)|size\s*\(\s*\)\s*>\s*0/i, msg: "Skips when nothing changed" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*System\.enqueueJob/i, msg: "Enqueue once per transaction, not once per record" },
      { re: /@future/i, msg: "Use Queueable, not @future" }
    ],
    hints: ["oldMap.get(c.Id).Email is the value before the update.","Collect into a Set<Id> and enqueue once after the loop."],
    ai: "Verify only actual email changes are collected, a single job is enqueued after the loop, and nothing is enqueued when the set is empty."
  },
  {
    id: "TR097", track: 'triggers', level: "Hard", topic: "Async from triggers",
    title: "Queueable finalizer with logging and retry",
    task: "Rothbury Energy provisions smart meters for new `Meter_Install__c` records via an API that sometimes fails.\nWrite trigger `MeterInstallTrigger` (after insert), Queueable `SmartMeterProvisionJob(List<Id> installIds, Integer attempt)` and `ProvisionFinalizer`:\n- Job POSTs the installs (Id, `MPAN__c`) to `callout:Meter_Provisioning/provision`; non-202 throws a custom exception; success sets `Provisioning_Status__c` 'Submitted'\n- Job attaches the finalizer with `System.attachFinalizer`\n- Finalizer: on an unhandled exception, insert a `Log__c` (message, attempt, async job Id) and re-enqueue the job with attempt + 1, up to 3 attempts in total",
    starter: "trigger MeterInstallTrigger on Meter_Install__c (after insert) {\n    // TODO\n}\n\npublic with sharing class SmartMeterProvisionJob {\n    // TODO\n}\n\npublic with sharing class ProvisionFinalizer {\n    // TODO\n}\n",
    solution: "trigger MeterInstallTrigger on Meter_Install__c (after insert) {\n    System.enqueueJob(new SmartMeterProvisionJob(new List<Id>(Trigger.newMap.keySet()), 1));\n}\n\npublic with sharing class SmartMeterProvisionJob implements Queueable, Database.AllowsCallouts {\n    public class ProvisioningException extends Exception {}\n\n    private final List<Id> installIds;\n    private final Integer attempt;\n\n    public SmartMeterProvisionJob(List<Id> installIds, Integer attempt) {\n        this.installIds = installIds;\n        this.attempt = attempt;\n    }\n\n    public void execute(QueueableContext context) {\n        System.attachFinalizer(new ProvisionFinalizer(installIds, attempt));\n        List<Meter_Install__c> installs = [\n            SELECT Id, MPAN__c FROM Meter_Install__c WHERE Id IN :installIds\n        ];\n        HttpRequest req = new HttpRequest();\n        req.setEndpoint('callout:Meter_Provisioning/provision');\n        req.setMethod('POST');\n        req.setHeader('Content-Type', 'application/json');\n        req.setBody(JSON.serialize(installs));\n        HttpResponse res = new Http().send(req);\n        if (res.getStatusCode() != 202) {\n            throw new ProvisioningException('Provisioning API returned ' + res.getStatusCode());\n        }\n        for (Meter_Install__c mi : installs) {\n            mi.Provisioning_Status__c = 'Submitted';\n        }\n        update installs;\n    }\n}\n\npublic with sharing class ProvisionFinalizer implements Finalizer {\n    @TestVisible private static final Integer MAX_ATTEMPTS = 3;\n    private final List<Id> installIds;\n    private final Integer attempt;\n\n    public ProvisionFinalizer(List<Id> installIds, Integer attempt) {\n        this.installIds = installIds;\n        this.attempt = attempt;\n    }\n\n    public void execute(FinalizerContext ctx) {\n        if (ctx.getResult() != ParentJobResult.UNHANDLED_EXCEPTION) {\n            return;\n        }\n        insert new Log__c(\n            Source__c = 'SmartMeterProvisionJob',\n            Message__c = ('Attempt ' + attempt + ' failed: ' + ctx.getException().getMessage()).abbreviate(255),\n            Async_Job_Id__c = ctx.getAsyncApexJobId()\n        );\n        if (attempt < MAX_ATTEMPTS) {\n            System.enqueueJob(new SmartMeterProvisionJob(installIds, attempt + 1));\n        }\n    }\n}\n",
    checks: [
      { re: /implements\s+Finalizer/i, msg: "ProvisionFinalizer implements Finalizer" },
      { re: /System\.attachFinalizer\s*\(/i, msg: "Job attaches the finalizer" },
      { re: /ParentJobResult\.UNHANDLED_EXCEPTION/i, msg: "Checks ParentJobResult.UNHANDLED_EXCEPTION" },
      { re: /getException\s*\(\s*\)/i, msg: "Logs the exception from FinalizerContext" },
      { re: /attempt\s*\+\s*1|attempt\s*<\s*\w+|\b3\b/i, msg: "Retries with an attempt counter up to 3" },
      { re: /Database\.AllowsCallouts/i, msg: "Job allows callouts" }
    ],
    forbid: [
      { re: /@future/i, msg: "Use Queueable, not @future" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*System\.enqueueJob/i, msg: "Enqueue once per transaction, not once per record" }
    ],
    hints: ["Call System.attachFinalizer at the start of execute so it runs even if the job throws.","FinalizerContext.getResult() and getException() tell you whether and why the parent job failed; pass attempt + 1 to the re-enqueued job."],
    ai: "Verify the finalizer is attached before the callout, only unhandled exceptions are logged and retried, retries stop after 3 attempts, and the job raises a real exception on non-202 responses."
  },
  {
    id: "TR098", track: 'triggers', level: "Easy", topic: "Error handling",
    title: "Field-level error for free email domains",
    task: "Brackley Accountancy needs company email addresses on business contacts.\nWrite trigger `ContactTrigger` (before insert, before update) and `ContactEmailValidator.validate(List<Contact> contacts)`:\n- Only contacts with `Is_Business_Contact__c = true` and a non-blank Email\n- If the domain (after '@', case-insensitive) is gmail.com, hotmail.com, yahoo.co.uk or outlook.com, show the error ON the Email field: \"Business contacts need a company email address, not <domain>.\"\n- Other contacts in the batch must still save; no SOQL/DML",
    starter: "trigger ContactTrigger on Contact (before insert, before update) {\n    // TODO\n}\n\npublic with sharing class ContactEmailValidator {\n    public static void validate(List<Contact> contacts) {\n        // TODO\n    }\n}\n",
    solution: "trigger ContactTrigger on Contact (before insert, before update) {\n    ContactEmailValidator.validate(Trigger.new);\n}\n\npublic with sharing class ContactEmailValidator {\n    private static final Set<String> FREE_DOMAINS = new Set<String>{\n        'gmail.com', 'hotmail.com', 'yahoo.co.uk', 'outlook.com'\n    };\n\n    public static void validate(List<Contact> contacts) {\n        for (Contact c : contacts) {\n            if (!c.Is_Business_Contact__c || String.isBlank(c.Email)) {\n                continue;\n            }\n            String domain = c.Email.substringAfter('@').toLowerCase();\n            if (FREE_DOMAINS.contains(domain)) {\n                c.addError(Contact.Email, 'Business contacts need a company email address, not ' + domain + '.');\n            }\n        }\n    }\n}\n",
    checks: [
      { re: /addError\s*\(\s*Contact\.Email|\.Email\.addError\s*\(/i, msg: "Error is attached to the Email field" },
      { re: /gmail\.com/i, msg: "Includes the blocked domains" },
      { re: /substringAfter\s*\(\s*'@'\s*\)|split\s*\(\s*'@'\s*\)|indexOf\s*\(\s*'@'\s*\)|endsWithIgnoreCase/i, msg: "Extracts or matches the domain" },
      { re: /toLowerCase\s*\(\s*\)|IgnoreCase/i, msg: "Compares case-insensitively" },
      { re: /Is_Business_Contact__c/i, msg: "Only business contacts" }
    ],
    forbid: [
      { re: /\b(insert|update|upsert|delete)\s+\w+\s*;/i, msg: "No DML needed: set fields on Trigger.new in a before trigger" },
      { re: /\[\s*SELECT/i, msg: "No SOQL needed" }
    ],
    hints: ["record.addError(Contact.Email, msg) highlights the field in the UI.","Use a static final Set<String> of domains and Email.substringAfter('@').toLowerCase()."],
    ai: "Verify the error is field-level, matching is case-insensitive on the exact domain (not a substring like \"notgmail.com\"), non-business contacts pass, and there is no SOQL/DML."
  },
  {
    id: "TR099", track: 'triggers', level: "Easy", topic: "Error handling",
    title: "Buffered Log__c logger for trigger handlers",
    task: "Saltash Marine wants failures in non-critical trigger logic logged, not shown to users.\nWrite class `Logger` with:\n- `public static void error(String source, Exception e)` buffering a `Log__c`: `Source__c`, `Type__c` (exception type name), `Message__c` (max 255 chars), `Stack_Trace__c`\n- `public static void flush()` inserting all buffered logs in one DML (nothing if empty) and clearing the buffer\nAnd trigger `OpportunityTrigger` (after update) that calls `OpportunitySyncService.sync(Trigger.new)`, logs any exception via Logger, and always flushes.",
    starter: "trigger OpportunityTrigger on Opportunity (after update) {\n    // TODO\n}\n\npublic without sharing class Logger {\n    // TODO\n}\n",
    solution: "trigger OpportunityTrigger on Opportunity (after update) {\n    try {\n        OpportunitySyncService.sync(Trigger.new);\n    } catch (Exception e) {\n        Logger.error('OpportunityTrigger', e);\n    } finally {\n        Logger.flush();\n    }\n}\n\npublic without sharing class Logger {\n    private static List<Log__c> buffer = new List<Log__c>();\n\n    public static void error(String source, Exception e) {\n        String message = e.getMessage();\n        buffer.add(new Log__c(\n            Source__c = source,\n            Type__c = e.getTypeName(),\n            Message__c = message == null ? null : message.abbreviate(255),\n            Stack_Trace__c = e.getStackTraceString()\n        ));\n    }\n\n    public static void flush() {\n        if (buffer.isEmpty()) {\n            return;\n        }\n        List<Log__c> toInsert = buffer;\n        buffer = new List<Log__c>();\n        insert toInsert;\n    }\n}\n",
    checks: [
      { re: /static\s+void\s+error\s*\(\s*String\s+\w+\s*,\s*Exception\s+\w+\s*\)/i, msg: "Has error(String, Exception)" },
      { re: /static\s+void\s+flush\s*\(\s*\)/i, msg: "Has flush()" },
      { re: /getStackTraceString\s*\(\s*\)/i, msg: "Captures the stack trace" },
      { re: /abbreviate\s*\(\s*255\s*\)|left\s*\(\s*255\s*\)|substring\s*\(\s*0\s*,\s*255\s*\)/i, msg: "Truncates the message to 255 chars" },
      { re: /catch\s*\(\s*Exception\s+\w+\s*\)/i, msg: "Trigger catches exceptions" },
      { re: /finally\s*\{[^}]*Logger\.flush|Logger\.flush\s*\(\s*\)/i, msg: "Trigger flushes the logs" }
    ],
    forbid: [
      { re: /static\s+void\s+error[^}]*\binsert\b/i, msg: "error() must buffer, not insert immediately" }
    ],
    hints: ["Keep a private static List<Log__c> as the buffer.","Swap the buffer for a new list before inserting so flush() can be called again safely."],
    ai: "Verify error() only buffers, flush() inserts once and resets the buffer, long or null messages are handled, and the trigger flushes in finally without rethrowing."
  },
  {
    id: "TR100", track: 'triggers', level: "Medium", topic: "Error handling",
    title: "Map child DML failures back to parent accounts",
    task: "Wickham Property copies the account billing address to contacts that opted in.\nWrite trigger `AccountTrigger` (after update) and `AccountAddressSync.pushToContacts(Map<Id, Account> newMap, Map<Id, Account> oldMap)`:\n- When BillingStreet, BillingCity or BillingPostalCode changes, copy them to MailingStreet/City/PostalCode on that account's contacts with `Use_Account_Address__c = true`\n- Update contacts with partial success (`allOrNone = false`)\n- For each failed contact, add an error to its parent account: \"Could not update contact <Name>: <message>\"\n- One query, one DML",
    starter: "trigger AccountTrigger on Account (after update) {\n    // TODO\n}\n\npublic with sharing class AccountAddressSync {\n    public static void pushToContacts(Map<Id, Account> newMap, Map<Id, Account> oldMap) {\n        // TODO\n    }\n}\n",
    solution: "trigger AccountTrigger on Account (after update) {\n    AccountAddressSync.pushToContacts(Trigger.newMap, Trigger.oldMap);\n}\n\npublic with sharing class AccountAddressSync {\n    public static void pushToContacts(Map<Id, Account> newMap, Map<Id, Account> oldMap) {\n        Set<Id> changed = new Set<Id>();\n        for (Account acc : newMap.values()) {\n            Account prior = oldMap.get(acc.Id);\n            if (acc.BillingStreet != prior.BillingStreet || acc.BillingCity != prior.BillingCity\n                    || acc.BillingPostalCode != prior.BillingPostalCode) {\n                changed.add(acc.Id);\n            }\n        }\n        if (changed.isEmpty()) {\n            return;\n        }\n        List<Contact> contacts = [\n            SELECT Id, Name, AccountId FROM Contact\n            WHERE AccountId IN :changed AND Use_Account_Address__c = true\n        ];\n        for (Contact c : contacts) {\n            Account acc = newMap.get(c.AccountId);\n            c.MailingStreet = acc.BillingStreet;\n            c.MailingCity = acc.BillingCity;\n            c.MailingPostalCode = acc.BillingPostalCode;\n        }\n        List<Database.SaveResult> results = Database.update(contacts, false);\n        for (Integer i = 0; i < results.size(); i++) {\n            if (results[i].isSuccess()) {\n                continue;\n            }\n            Contact failed = contacts[i];\n            newMap.get(failed.AccountId).addError(\n                'Could not update contact ' + failed.Name + ': ' + results[i].getErrors()[0].getMessage()\n            );\n        }\n    }\n}\n",
    checks: [
      { re: /Database\.update\s*\([^;]*false\s*\)/i, msg: "Uses Database.update with allOrNone = false" },
      { re: /Database\.SaveResult/i, msg: "Inspects SaveResults" },
      { re: /isSuccess\s*\(\s*\)/i, msg: "Checks isSuccess()" },
      { re: /getErrors\s*\(\s*\)/i, msg: "Reads the error message" },
      { re: /\.addError\s*\(/i, msg: "Adds the error to the parent account" },
      { re: /Use_Account_Address__c\s*=\s*true/i, msg: "Only opted-in contacts" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" }
    ],
    hints: ["SaveResults come back in the same order as the input list, so results[i] belongs to contacts[i].","Use Trigger.newMap to find the parent account record to call addError on."],
    ai: "Verify only address changes trigger the sync, the result index is mapped back to the right contact and account, the error includes the contact name and message, and query/DML run once."
  },
  {
    id: "TR101", track: 'triggers', level: "Easy", topic: "Error handling",
    title: "Create projects with partial success and logs",
    task: "Morecambe Bay Builders auto-creates a `Project__c` when an opportunity is won. A failing project must never stop the opportunity from saving.\nWrite trigger `OpportunityTrigger` (after update) and `ProjectCreator.createForWonDeals(List<Opportunity> opps, Map<Id, Opportunity> oldMap)`:\n- Only when StageName changes to 'Closed Won': Project__c with Name (opp name, max 80 chars), `Opportunity__c`, `Account__c`\n- Insert with `allOrNone = false`\n- For each failure insert a `Log__c` (`Source__c` 'ProjectCreator', `Record_Id__c` = opportunity Id, `Message__c`)\n- Never call addError",
    starter: "trigger OpportunityTrigger on Opportunity (after update) {\n    // TODO\n}\n\npublic with sharing class ProjectCreator {\n    public static void createForWonDeals(List<Opportunity> opps, Map<Id, Opportunity> oldMap) {\n        // TODO\n    }\n}\n",
    solution: "trigger OpportunityTrigger on Opportunity (after update) {\n    ProjectCreator.createForWonDeals(Trigger.new, Trigger.oldMap);\n}\n\npublic with sharing class ProjectCreator {\n    public static void createForWonDeals(List<Opportunity> opps, Map<Id, Opportunity> oldMap) {\n        List<Project__c> projects = new List<Project__c>();\n        for (Opportunity opp : opps) {\n            if (opp.StageName == 'Closed Won' && oldMap.get(opp.Id).StageName != 'Closed Won') {\n                projects.add(new Project__c(\n                    Name = opp.Name.left(80),\n                    Opportunity__c = opp.Id,\n                    Account__c = opp.AccountId\n                ));\n            }\n        }\n        if (projects.isEmpty()) {\n            return;\n        }\n        List<Database.SaveResult> results = Database.insert(projects, false);\n        List<Log__c> logs = new List<Log__c>();\n        for (Integer i = 0; i < results.size(); i++) {\n            if (!results[i].isSuccess()) {\n                logs.add(new Log__c(\n                    Source__c = 'ProjectCreator',\n                    Record_Id__c = projects[i].Opportunity__c,\n                    Message__c = results[i].getErrors()[0].getMessage().abbreviate(255)\n                ));\n            }\n        }\n        if (!logs.isEmpty()) {\n            insert logs;\n        }\n    }\n}\n",
    checks: [
      { re: /Database\.insert\s*\([^;]*false\s*\)/i, msg: "Inserts with allOrNone = false" },
      { re: /isSuccess\s*\(\s*\)/i, msg: "Checks each SaveResult" },
      { re: /getErrors\s*\(\s*\)/i, msg: "Captures the error message" },
      { re: /new\s+Log__c\s*\(/i, msg: "Creates Log__c records for failures" },
      { re: /oldMap|Trigger\.old/i, msg: "Only on the transition to Closed Won" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" },
      { re: /\.addError\s*\(/i, msg: "Do not block the opportunity with addError" }
    ],
    hints: ["Database.insert(list, false) returns a SaveResult per record, in order.","Collect Log__c rows for failures and insert them once at the end."],
    ai: "Verify only newly won opportunities create projects, failures are logged with the opportunity Id instead of blocking, and both inserts are outside loops."
  },
  {
    id: "TR102", track: 'triggers', level: "Hard", topic: "Error handling",
    title: "Logs that survive a rolled-back transaction",
    task: "Ilkley Print Works blocks edits to the amount of sent invoices, and audit wants every blocked attempt logged. A Log__c inserted in the same transaction is rolled back with the addError.\nBuild:\n- Trigger `InvoiceTrigger` (before update) + `InvoiceLockGuard.validate(List<Invoice__c> invoices, Map<Id, Invoice__c> oldMap)`: if old `Status__c` is 'Sent' and `Amount__c` changed, addError on Amount__c and log via LogPublisher\n- `LogPublisher` with `add(String source, Id recordId, String message)` and `flush()` that publishes buffered `Log_Event__e` (configured \"Publish Immediately\") in one call\n- Trigger `LogEventTrigger` that turns Log_Event__e into `Log__c` (`User__c` = publisher)",
    starter: "trigger InvoiceTrigger on Invoice__c (before update) {\n    // TODO\n}\n\ntrigger LogEventTrigger on Log_Event__e (after insert) {\n    // TODO\n}\n\npublic with sharing class InvoiceLockGuard {\n    // TODO\n}\n\npublic without sharing class LogPublisher {\n    // TODO\n}\n",
    solution: "trigger InvoiceTrigger on Invoice__c (before update) {\n    InvoiceLockGuard.validate(Trigger.new, Trigger.oldMap);\n}\n\ntrigger LogEventTrigger on Log_Event__e (after insert) {\n    List<Log__c> logs = new List<Log__c>();\n    for (Log_Event__e evt : Trigger.new) {\n        logs.add(new Log__c(\n            Source__c = evt.Source__c,\n            Record_Id__c = evt.Record_Id__c,\n            Message__c = evt.Message__c,\n            User__c = evt.CreatedById\n        ));\n    }\n    insert logs;\n}\n\npublic with sharing class InvoiceLockGuard {\n    public static void validate(List<Invoice__c> invoices, Map<Id, Invoice__c> oldMap) {\n        for (Invoice__c inv : invoices) {\n            Invoice__c prior = oldMap.get(inv.Id);\n            if (prior.Status__c == 'Sent' && inv.Amount__c != prior.Amount__c) {\n                inv.addError(Invoice__c.Amount__c, 'Amount cannot change once an invoice has been sent.');\n                LogPublisher.add('InvoiceLockGuard', inv.Id, 'Blocked amount change on sent invoice');\n            }\n        }\n        LogPublisher.flush();\n    }\n}\n\npublic without sharing class LogPublisher {\n    private static List<Log_Event__e> pending = new List<Log_Event__e>();\n\n    public static void add(String source, Id recordId, String message) {\n        pending.add(new Log_Event__e(Source__c = source, Record_Id__c = recordId, Message__c = message));\n    }\n\n    public static void flush() {\n        if (pending.isEmpty()) {\n            return;\n        }\n        List<Log_Event__e> toPublish = pending;\n        pending = new List<Log_Event__e>();\n        List<Database.SaveResult> results = EventBus.publish(toPublish);\n        for (Database.SaveResult sr : results) {\n            if (!sr.isSuccess()) {\n                System.debug(LoggingLevel.ERROR, 'Log event publish failed: ' + sr.getErrors()[0].getMessage());\n            }\n        }\n    }\n}\n",
    checks: [
      { re: /EventBus\.publish\s*\(/i, msg: "Publishes Log_Event__e with EventBus.publish" },
      { re: /on\s+Log_Event__e\s*\(\s*after\s+insert/i, msg: "Event trigger on Log_Event__e after insert" },
      { re: /new\s+Log__c\s*\(/i, msg: "Event trigger creates Log__c" },
      { re: /addError\s*\(/i, msg: "Invoice change is still blocked with addError" },
      { re: /'Sent'/i, msg: "Applies to invoices in status 'Sent'" },
      { re: /static\s+void\s+flush\s*\(\s*\)/i, msg: "LogPublisher has flush()" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" },
      { re: /class\s+InvoiceLockGuard[\s\S]*?\binsert\s+(new\s+)?\w*Log/i, msg: "Do not insert Log__c directly in the guard; it would roll back" }
    ],
    hints: ["Platform events with \"Publish Immediately\" are not rolled back when the publishing transaction fails.","Buffer events in a static list, publish once with EventBus.publish, and let a Log_Event__e trigger insert Log__c in its own transaction."],
    ai: "Verify the guard still blocks the change, logs travel via a publish-immediately platform event published once per batch (not per record), the event trigger inserts Log__c in bulk, and no Log__c is inserted directly in the failing transaction."
  },
  {
    id: "TR103", track: 'triggers', level: "Medium", topic: "Error handling",
    title: "Block closing deals with open high-priority tasks",
    task: "Ludlow Consulting won't let reps close an opportunity (Won or Lost) while high-priority tasks are open on it.\nWrite trigger `OpportunityTrigger` (before update) and `OpportunityCloseGuard.validate(List<Opportunity> opps, Map<Id, Opportunity> oldMap)`:\n- Applies when StageName changes from an open stage to 'Closed Won' or 'Closed Lost'\n- If the opportunity has open Tasks (`IsClosed = false`) with Priority 'High', error on StageName: \"Complete the N open high-priority task(s) before closing.\"\n- Only the offending opportunities fail; one aggregate query",
    starter: "trigger OpportunityTrigger on Opportunity (before update) {\n    // TODO\n}\n\npublic with sharing class OpportunityCloseGuard {\n    public static void validate(List<Opportunity> opps, Map<Id, Opportunity> oldMap) {\n        // TODO\n    }\n}\n",
    solution: "trigger OpportunityTrigger on Opportunity (before update) {\n    OpportunityCloseGuard.validate(Trigger.new, Trigger.oldMap);\n}\n\npublic with sharing class OpportunityCloseGuard {\n    private static final Set<String> CLOSED_STAGES = new Set<String>{ 'Closed Won', 'Closed Lost' };\n\n    public static void validate(List<Opportunity> opps, Map<Id, Opportunity> oldMap) {\n        Map<Id, Opportunity> closing = new Map<Id, Opportunity>();\n        for (Opportunity opp : opps) {\n            if (CLOSED_STAGES.contains(opp.StageName) && !CLOSED_STAGES.contains(oldMap.get(opp.Id).StageName)) {\n                closing.put(opp.Id, opp);\n            }\n        }\n        if (closing.isEmpty()) {\n            return;\n        }\n        for (AggregateResult ar : [\n            SELECT WhatId oppId, COUNT(Id) openTasks\n            FROM Task\n            WHERE WhatId IN :closing.keySet() AND IsClosed = false AND Priority = 'High'\n            GROUP BY WhatId\n        ]) {\n            Opportunity opp = closing.get((Id) ar.get('oppId'));\n            opp.addError(Opportunity.StageName,\n                'Complete the ' + ar.get('openTasks') + ' open high-priority task(s) before closing.');\n        }\n    }\n}\n",
    checks: [
      { re: /FROM\s+Task\b/i, msg: "Queries tasks" },
      { re: /Priority\s*=\s*'High'/i, msg: "Only high-priority tasks" },
      { re: /IsClosed\s*=\s*false|Status\s*!=\s*'Completed'/i, msg: "Only open tasks" },
      { re: /COUNT\s*\(/i, msg: "Counts the open tasks" },
      { re: /addError\s*\(/i, msg: "Blocks the offending opportunities" },
      { re: /oldMap|Trigger\.old/i, msg: "Only on the transition to a closed stage" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" },
      { re: /\b(insert|update|upsert|delete)\s+\w+\s*;/i, msg: "No DML needed: set fields on Trigger.new in a before trigger" }
    ],
    hints: ["COUNT(Id) GROUP BY WhatId gives the number of open tasks per opportunity.","Keep closing opportunities in a Map<Id, Opportunity> so each aggregate row can find its record."],
    ai: "Verify both closed stages are covered, only open-to-closed transitions are checked, the message includes the count, and only opportunities with matching tasks get errors."
  },
  {
    id: "TR104", track: 'triggers', level: "Hard", topic: "Error handling",
    title: "No half-built invoices on order activation",
    task: "Bideford Wholesale invoices orders when they activate. Activation must always succeed, but there must never be an invoice with missing lines.\nWrite trigger `OrderTrigger` (after update) and `OrderInvoiceBuilder.onActivated(Map<Id, Order> newMap, Map<Id, Order> oldMap)`:\n- When Status changes to 'Activated', create `Invoice__c` (`Order__c`, `Account__c`) and one `Invoice_Line__c` per OrderItem (`Product__c`, `Quantity__c`, `Unit_Price__c`)\n- Insert invoices and lines with partial success\n- If any line of an invoice fails, delete that invoice (lines are master-detail)\n- Every failure (invoice or line) becomes a `Log__c` with `Record_Id__c` = order Id\n- No addError; no SOQL/DML in loops",
    starter: "trigger OrderTrigger on Order (after update) {\n    // TODO\n}\n\npublic with sharing class OrderInvoiceBuilder {\n    public static void onActivated(Map<Id, Order> newMap, Map<Id, Order> oldMap) {\n        // TODO\n    }\n}\n",
    solution: "trigger OrderTrigger on Order (after update) {\n    OrderInvoiceBuilder.onActivated(Trigger.newMap, Trigger.oldMap);\n}\n\npublic with sharing class OrderInvoiceBuilder {\n    public static void onActivated(Map<Id, Order> newMap, Map<Id, Order> oldMap) {\n        List<Invoice__c> invoices = new List<Invoice__c>();\n        for (Order o : newMap.values()) {\n            if (o.Status == 'Activated' && oldMap.get(o.Id).Status != 'Activated') {\n                invoices.add(new Invoice__c(Order__c = o.Id, Account__c = o.AccountId));\n            }\n        }\n        if (invoices.isEmpty()) {\n            return;\n        }\n        List<Log__c> logs = new List<Log__c>();\n\n        Map<Id, Invoice__c> invoiceByOrder = new Map<Id, Invoice__c>();\n        List<Database.SaveResult> invoiceResults = Database.insert(invoices, false);\n        for (Integer i = 0; i < invoiceResults.size(); i++) {\n            if (invoiceResults[i].isSuccess()) {\n                invoiceByOrder.put(invoices[i].Order__c, invoices[i]);\n            } else {\n                logs.add(newLog(invoices[i].Order__c, 'Invoice failed: ' + invoiceResults[i].getErrors()[0].getMessage()));\n            }\n        }\n\n        if (!invoiceByOrder.isEmpty()) {\n            List<Invoice_Line__c> lines = new List<Invoice_Line__c>();\n            for (OrderItem item : [\n                SELECT OrderId, Product2Id, Quantity, UnitPrice\n                FROM OrderItem\n                WHERE OrderId IN :invoiceByOrder.keySet()\n            ]) {\n                lines.add(new Invoice_Line__c(\n                    Invoice__c = invoiceByOrder.get(item.OrderId).Id,\n                    Product__c = item.Product2Id,\n                    Quantity__c = item.Quantity,\n                    Unit_Price__c = item.UnitPrice\n                ));\n            }\n            Map<Id, String> failedInvoices = new Map<Id, String>();\n            List<Database.SaveResult> lineResults = Database.insert(lines, false);\n            for (Integer i = 0; i < lineResults.size(); i++) {\n                if (!lineResults[i].isSuccess() && !failedInvoices.containsKey(lines[i].Invoice__c)) {\n                    failedInvoices.put(lines[i].Invoice__c, lineResults[i].getErrors()[0].getMessage());\n                }\n            }\n            List<Invoice__c> toRemove = new List<Invoice__c>();\n            for (Invoice__c inv : invoiceByOrder.values()) {\n                if (failedInvoices.containsKey(inv.Id)) {\n                    toRemove.add(inv);\n                    logs.add(newLog(inv.Order__c, 'Invoice line failed: ' + failedInvoices.get(inv.Id)));\n                }\n            }\n            if (!toRemove.isEmpty()) {\n                delete toRemove;\n            }\n        }\n        if (!logs.isEmpty()) {\n            insert logs;\n        }\n    }\n\n    private static Log__c newLog(Id orderId, String message) {\n        return new Log__c(Source__c = 'OrderInvoiceBuilder', Record_Id__c = orderId, Message__c = message.abbreviate(255));\n    }\n}\n",
    checks: [
      { re: /Database\.insert\s*\([^;]*false\s*\)/i, msg: "Inserts with allOrNone = false" },
      { re: /isSuccess\s*\(\s*\)/i, msg: "Checks SaveResults" },
      { re: /FROM\s+OrderItem/i, msg: "Reads the order items in one query" },
      { re: /\bdelete\s+\w+\s*;|Database\.delete\s*\(/i, msg: "Deletes invoices whose lines failed" },
      { re: /Log__c/i, msg: "Logs failures to Log__c" },
      { re: /'Activated'/i, msg: "Acts on activation" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" },
      { re: /\.addError\s*\(/i, msg: "Activation must not be blocked with addError" }
    ],
    hints: ["Map order Id → successfully inserted invoice, then build lines from one OrderItem query.","Track invoices with at least one failed line in a Map<Id, String>, delete those invoices once, and log everything at the end."],
    ai: "Verify invoice and line failures are both logged against the order, any invoice with a failed line is deleted (no partial invoices remain), successful invoices keep all lines, nothing calls addError, and all DML/SOQL is outside loops."
  },
  {
    id: "TR105", track: 'triggers', level: "Easy", topic: "Testing triggers",
    title: "Bulk test for a region-stamping trigger",
    task: "Ashworth Lettings has trigger `AccountRegionTrigger` (before insert) that sets `Region__c` = 'UK&I' when BillingCountry is 'United Kingdom' or 'Ireland', otherwise 'International'.\nWrite test class `AccountRegionTriggerTest` with method `setsRegionForBulkInsert`:\n- Insert 200 accounts in one DML: half 'United Kingdom', half 'France'\n- Wrap the DML in Test.startTest/stopTest\n- Re-query and assert every account's Region__c, and that exactly 100 are 'UK&I'\n- Use the `Assert` class; no SeeAllData",
    starter: "@IsTest\nprivate class AccountRegionTriggerTest {\n    @IsTest\n    static void setsRegionForBulkInsert() {\n        // TODO\n    }\n}\n",
    solution: "@IsTest\nprivate class AccountRegionTriggerTest {\n    @IsTest\n    static void setsRegionForBulkInsert() {\n        List<Account> accounts = new List<Account>();\n        for (Integer i = 0; i < 200; i++) {\n            accounts.add(new Account(\n                Name = 'Bulk Test ' + i,\n                BillingCountry = Math.mod(i, 2) == 0 ? 'United Kingdom' : 'France'\n            ));\n        }\n\n        Test.startTest();\n        insert accounts;\n        Test.stopTest();\n\n        Integer ukCount = 0;\n        for (Account acc : [SELECT BillingCountry, Region__c FROM Account WHERE Id IN :accounts]) {\n            String expected = acc.BillingCountry == 'United Kingdom' ? 'UK&I' : 'International';\n            Assert.areEqual(expected, acc.Region__c, 'Wrong region for ' + acc.BillingCountry);\n            if (acc.Region__c == 'UK&I') {\n                ukCount++;\n            }\n        }\n        Assert.areEqual(100, ukCount, 'Half the accounts should be UK&I');\n    }\n}\n",
    checks: [
      { re: /\b200\b/, msg: "Inserts 200 records" },
      { re: /Test\.startTest\s*\(\s*\)/i, msg: "Uses Test.startTest()" },
      { re: /\binsert\s+\w+\s*;|Database\.insert\s*\(/i, msg: "Inserts the accounts in one DML" },
      { re: /\[\s*SELECT[^\]]*Region__c/i, msg: "Re-queries Region__c after insert" },
      { re: /Assert\.(areEqual|isTrue|areNotEqual)\s*\(/i, msg: "Asserts with the Assert class" }
    ],
    forbid: [
      { re: /SeeAllData\s*=\s*true/i, msg: "Do not use SeeAllData=true" },
      { re: /System\.assert(Equals|NotEquals)?\s*\(/i, msg: "Use the Assert class (Assert.areEqual, Assert.isTrue, ...)" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(insert|update|delete|upsert)\s+\w+\s*;/i, msg: "No DML inside a loop" }
    ],
    hints: ["Field values set in a before trigger are only visible after re-querying.","Build the list in a loop and insert it once so the trigger sees 200 records."],
    ai: "Verify the test inserts 200 records in a single DML, re-queries to read the trigger result, asserts both regions with messages, and uses the Assert class without SeeAllData."
  },
  {
    id: "TR106", track: 'triggers', level: "Easy", topic: "Testing triggers",
    title: "Test that a delete guard blocks correctly",
    task: "Thamesbridge Logistics' `AccountTrigger` blocks deleting accounts with open opportunities (message contains \"open opportunities\").\nWrite test class `AccountDeleteGuardTest` with method `blocksOnlyAccountsWithOpenOpportunities`:\n- Create one account with an open Opportunity and one with none\n- Delete both in one call that doesn't throw (partial success)\n- Assert the first failed with the expected message and the second succeeded\n- Use the Assert class",
    starter: "@IsTest\nprivate class AccountDeleteGuardTest {\n    @IsTest\n    static void blocksOnlyAccountsWithOpenOpportunities() {\n        // TODO\n    }\n}\n",
    solution: "@IsTest\nprivate class AccountDeleteGuardTest {\n    @IsTest\n    static void blocksOnlyAccountsWithOpenOpportunities() {\n        Account withOpp = new Account(Name = 'Has Pipeline Ltd');\n        Account withoutOpp = new Account(Name = 'Quiet Ltd');\n        insert new List<Account>{ withOpp, withoutOpp };\n        insert new Opportunity(\n            Name = 'Renewal',\n            AccountId = withOpp.Id,\n            StageName = 'Prospecting',\n            CloseDate = Date.today().addDays(30)\n        );\n\n        Test.startTest();\n        List<Database.DeleteResult> results = Database.delete(new List<Account>{ withOpp, withoutOpp }, false);\n        Test.stopTest();\n\n        Assert.isFalse(results[0].isSuccess(), 'Account with an open opportunity must not be deleted');\n        Assert.isTrue(results[0].getErrors()[0].getMessage().contains('open opportunities'), 'Unexpected error message');\n        Assert.isTrue(results[1].isSuccess(), 'Account without opportunities should be deleted');\n    }\n}\n",
    checks: [
      { re: /Database\.delete\s*\([^;]*false\s*\)/i, msg: "Deletes with allOrNone = false" },
      { re: /new\s+Opportunity\s*\(/i, msg: "Creates an open opportunity" },
      { re: /isSuccess\s*\(\s*\)/i, msg: "Checks each DeleteResult" },
      { re: /getMessage\s*\(\s*\)/i, msg: "Asserts the error message" },
      { re: /Assert\.(isFalse|isTrue|areEqual)\s*\(/i, msg: "Asserts with the Assert class" }
    ],
    forbid: [
      { re: /SeeAllData\s*=\s*true/i, msg: "Do not use SeeAllData=true" },
      { re: /System\.assert(Equals|NotEquals)?\s*\(/i, msg: "Use the Assert class (Assert.areEqual, Assert.isTrue, ...)" }
    ],
    hints: ["Database.delete(records, false) returns DeleteResults instead of throwing.","Results are in input order: results[0] is the account with the opportunity."],
    ai: "Verify the test covers both the blocked and the allowed path in one partial delete, checks the message text, uses an open stage, and uses Assert methods with messages."
  },
  {
    id: "TR107", track: 'triggers', level: "Medium", topic: "Testing triggers",
    title: "Test a trigger bypass custom setting",
    task: "Rowan & Pike's `AccountTriggerHandler` stamps `Customer_Number__c` on insert, unless the hierarchy custom setting `Trigger_Settings__c.Bypass_Account_Trigger__c` is true for the running user.\nWrite test class `AccountTriggerBypassTest` with two methods:\n- `populatesCustomerNumberWhenActive`: insert 200 accounts, assert every Customer_Number__c is populated\n- `skipsLogicWhenBypassed`: create the setting for the current user with the bypass on, insert 200 accounts, assert none has a Customer_Number__c\n- Shared helper to build accounts; Assert class only",
    starter: "@IsTest\nprivate class AccountTriggerBypassTest {\n    @IsTest\n    static void populatesCustomerNumberWhenActive() {\n        // TODO\n    }\n\n    @IsTest\n    static void skipsLogicWhenBypassed() {\n        // TODO\n    }\n}\n",
    solution: "@IsTest\nprivate class AccountTriggerBypassTest {\n    private static List<Account> buildAccounts(Integer count) {\n        List<Account> accounts = new List<Account>();\n        for (Integer i = 0; i < count; i++) {\n            accounts.add(new Account(Name = 'Bypass Test ' + i));\n        }\n        return accounts;\n    }\n\n    @IsTest\n    static void populatesCustomerNumberWhenActive() {\n        List<Account> accounts = buildAccounts(200);\n        Test.startTest();\n        insert accounts;\n        Test.stopTest();\n        for (Account acc : [SELECT Customer_Number__c FROM Account WHERE Id IN :accounts]) {\n            Assert.isNotNull(acc.Customer_Number__c, 'Trigger should stamp a customer number');\n        }\n    }\n\n    @IsTest\n    static void skipsLogicWhenBypassed() {\n        insert new Trigger_Settings__c(SetupOwnerId = UserInfo.getUserId(), Bypass_Account_Trigger__c = true);\n        List<Account> accounts = buildAccounts(200);\n        Test.startTest();\n        insert accounts;\n        Test.stopTest();\n        Integer stamped = [SELECT COUNT() FROM Account WHERE Id IN :accounts AND Customer_Number__c != null];\n        Assert.areEqual(0, stamped, 'Bypassed trigger must not stamp customer numbers');\n    }\n}\n",
    checks: [
      { re: /new\s+Trigger_Settings__c\s*\(/i, msg: "Creates the bypass custom setting" },
      { re: /SetupOwnerId\s*=/i, msg: "Scopes the setting to a user/profile with SetupOwnerId" },
      { re: /Bypass_Account_Trigger__c\s*=\s*true/i, msg: "Turns the bypass on" },
      { re: /\b200\b/, msg: "Bulk tests with 200 records" },
      { re: /Assert\.\w+\s*\(/i, msg: "Uses the Assert class" }
    ],
    forbid: [
      { re: /SeeAllData\s*=\s*true/i, msg: "Do not use SeeAllData=true" },
      { re: /System\.assert(Equals|NotEquals)?\s*\(/i, msg: "Use the Assert class (Assert.areEqual, Assert.isTrue, ...)" }
    ],
    hints: ["Hierarchy custom settings are data in tests: insert one with SetupOwnerId = UserInfo.getUserId().","Assert in the bypass test that a COUNT() of stamped accounts is 0."],
    ai: "Verify both the active and bypassed paths are tested with 200 records, the setting is created inside the test (no SeeAllData), and assertions re-query the data."
  },
  {
    id: "TR108", track: 'triggers', level: "Medium", topic: "Testing triggers",
    title: "Test a trigger-enqueued callout job",
    task: "Thistle Insurance Brokers' `LeadTrigger` enqueues `LeadSyncJob`, which POSTs leads to `callout:Marketing_Hub/leads` and sets `Sync_Status__c` to 'Synced' (2xx) or 'Failed'.\nWrite test class `LeadSyncJobTest`:\n- An inner `HttpCalloutMock` whose status code is passed in the constructor and that asserts the request method is POST\n- `marksLeadsSyncedOnSuccess` (mock 200) and `marksLeadsFailedOnServerError` (mock 500)\n- Each inserts 200 leads with emails; make sure the queueable runs before asserting",
    starter: "@IsTest\nprivate class LeadSyncJobTest {\n    @IsTest\n    static void marksLeadsSyncedOnSuccess() {\n        // TODO\n    }\n\n    @IsTest\n    static void marksLeadsFailedOnServerError() {\n        // TODO\n    }\n}\n",
    solution: "@IsTest\nprivate class LeadSyncJobTest {\n    private class MarketingHubMock implements HttpCalloutMock {\n        private final Integer statusCode;\n\n        MarketingHubMock(Integer statusCode) {\n            this.statusCode = statusCode;\n        }\n\n        public HttpResponse respond(HttpRequest req) {\n            Assert.areEqual('POST', req.getMethod(), 'Sync must POST');\n            HttpResponse res = new HttpResponse();\n            res.setStatusCode(statusCode);\n            res.setBody('{}');\n            return res;\n        }\n    }\n\n    private static List<Lead> buildLeads() {\n        List<Lead> leads = new List<Lead>();\n        for (Integer i = 0; i < 200; i++) {\n            leads.add(new Lead(LastName = 'Lead ' + i, Company = 'Prospect ' + i, Email = 'lead' + i + '@example.co.uk'));\n        }\n        return leads;\n    }\n\n    @IsTest\n    static void marksLeadsSyncedOnSuccess() {\n        Test.setMock(HttpCalloutMock.class, new MarketingHubMock(200));\n        List<Lead> leads = buildLeads();\n        Test.startTest();\n        insert leads;\n        Test.stopTest();\n        Integer synced = [SELECT COUNT() FROM Lead WHERE Id IN :leads AND Sync_Status__c = 'Synced'];\n        Assert.areEqual(200, synced, 'All leads should be synced');\n    }\n\n    @IsTest\n    static void marksLeadsFailedOnServerError() {\n        Test.setMock(HttpCalloutMock.class, new MarketingHubMock(500));\n        List<Lead> leads = buildLeads();\n        Test.startTest();\n        insert leads;\n        Test.stopTest();\n        Integer failed = [SELECT COUNT() FROM Lead WHERE Id IN :leads AND Sync_Status__c = 'Failed'];\n        Assert.areEqual(200, failed, 'All leads should be marked failed');\n    }\n}\n",
    checks: [
      { re: /implements\s+HttpCalloutMock/i, msg: "Implements HttpCalloutMock" },
      { re: /Test\.setMock\s*\(\s*HttpCalloutMock\.class/i, msg: "Registers the mock with Test.setMock" },
      { re: /Test\.stopTest\s*\(\s*\)/i, msg: "Uses Test.stopTest() so the queueable runs" },
      { re: /\b200\b/, msg: "Inserts 200 leads" },
      { re: /'Failed'/, msg: "Asserts the failure path" },
      { re: /'Synced'/, msg: "Asserts the success path" }
    ],
    forbid: [
      { re: /SeeAllData\s*=\s*true/i, msg: "Do not use SeeAllData=true" },
      { re: /System\.assert(Equals|NotEquals)?\s*\(/i, msg: "Use the Assert class (Assert.areEqual, Assert.isTrue, ...)" }
    ],
    hints: ["Async work enqueued between Test.startTest() and Test.stopTest() runs synchronously at stopTest().","Make the mock configurable through its constructor so one class serves both tests."],
    ai: "Verify the mock is set before the DML, the job runs via startTest/stopTest, both success and failure statuses are asserted against re-queried data, and the mock checks the HTTP method."
  },
  {
    id: "TR109", track: 'triggers', level: "Medium", topic: "Testing triggers",
    title: "Test a platform event trigger in bulk",
    task: "Dunmore Freight's `ShipmentDispatchedTrigger` creates a `Shipment_Log__c` (`Order_Number__c`, `Carrier__c`, `Tracking_Number__c`, `Dispatched_At__c`) per `Shipment_Dispatched__e` event.\nWrite test class `ShipmentDispatchedTriggerTest` with method `createsOneLogPerEvent`:\n- Publish 200 events in one call\n- Make sure they are delivered to the trigger before asserting\n- Assert every publish succeeded, exactly 200 logs exist, and one sample log has the right carrier",
    starter: "@IsTest\nprivate class ShipmentDispatchedTriggerTest {\n    @IsTest\n    static void createsOneLogPerEvent() {\n        // TODO\n    }\n}\n",
    solution: "@IsTest\nprivate class ShipmentDispatchedTriggerTest {\n    @IsTest\n    static void createsOneLogPerEvent() {\n        List<Shipment_Dispatched__e> events = new List<Shipment_Dispatched__e>();\n        for (Integer i = 0; i < 200; i++) {\n            events.add(new Shipment_Dispatched__e(\n                Order_Number__c = 'ORD-' + i,\n                Carrier__c = 'Royal Mail',\n                Tracking_Number__c = 'RM' + i + 'GB',\n                Dispatched_At__c = System.now()\n            ));\n        }\n\n        Test.startTest();\n        List<Database.SaveResult> results = EventBus.publish(events);\n        Test.stopTest();\n\n        for (Database.SaveResult sr : results) {\n            Assert.isTrue(sr.isSuccess(), 'Publish should succeed');\n        }\n        Assert.areEqual(200, [SELECT COUNT() FROM Shipment_Log__c], 'One log per event expected');\n        Shipment_Log__c sample = [SELECT Carrier__c FROM Shipment_Log__c WHERE Order_Number__c = 'ORD-0'];\n        Assert.areEqual('Royal Mail', sample.Carrier__c, 'Carrier should be copied');\n    }\n}\n",
    checks: [
      { re: /EventBus\.publish\s*\(/i, msg: "Publishes with EventBus.publish" },
      { re: /Test\.stopTest\s*\(\s*\)|Test\.getEventBus\s*\(\s*\)\s*\.\s*deliver\s*\(/i, msg: "Delivers events with Test.stopTest() or Test.getEventBus().deliver()" },
      { re: /\b200\b/, msg: "Publishes 200 events" },
      { re: /FROM\s+Shipment_Log__c/i, msg: "Queries the created logs" },
      { re: /Assert\.\w+\s*\(/i, msg: "Uses the Assert class" }
    ],
    forbid: [
      { re: /SeeAllData\s*=\s*true/i, msg: "Do not use SeeAllData=true" },
      { re: /System\.assert(Equals|NotEquals)?\s*\(/i, msg: "Use the Assert class (Assert.areEqual, Assert.isTrue, ...)" }
    ],
    hints: ["Published events are delivered at Test.stopTest() or when you call Test.getEventBus().deliver().","Check each SaveResult from EventBus.publish, then count the logs."],
    ai: "Verify events are published in one call, delivery is forced before assertions, the count and a sample field are asserted, and Assert is used."
  },
  {
    id: "TR110", track: 'triggers', level: "Hard", topic: "Testing triggers",
    title: "Test a custom-permission guard with runAs",
    task: "Kestrel Energy's `OpportunityTrigger` blocks deleting Closed Won opportunities unless the user has custom permission `Delete_Won_Opportunities`, granted by permission set `Finance_Admin`.\nWrite test class `OpportunityDeleteGuardTest`:\n- Helper creating a 'Standard User' user (unique username) and a helper creating N Closed Won opportunities\n- `blocksUsersWithoutPermission`: as a plain user, create 200 won opps and delete them with partial success; assert every delete failed\n- `allowsUsersWithCustomPermission`: assign Finance_Admin, then as that user create and delete 200 won opps; assert they are gone\n- Avoid MIXED_DML errors; Assert class only",
    starter: "@IsTest\nprivate class OpportunityDeleteGuardTest {\n    @IsTest\n    static void blocksUsersWithoutPermission() {\n        // TODO\n    }\n\n    @IsTest\n    static void allowsUsersWithCustomPermission() {\n        // TODO\n    }\n}\n",
    solution: "@IsTest\nprivate class OpportunityDeleteGuardTest {\n    private static User makeUser(String alias) {\n        Profile p = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];\n        String uniqueName = alias + System.currentTimeMillis() + '@kestrel-energy.test';\n        User u = new User(\n            Alias = alias, Email = uniqueName, Username = uniqueName,\n            LastName = 'Tester', ProfileId = p.Id,\n            TimeZoneSidKey = 'Europe/London', LocaleSidKey = 'en_GB',\n            EmailEncodingKey = 'UTF-8', LanguageLocaleKey = 'en_US'\n        );\n        insert u;\n        return u;\n    }\n\n    private static List<Opportunity> createWonOpps(Integer count) {\n        Account acc = new Account(Name = 'Kestrel Customer');\n        insert acc;\n        List<Opportunity> opps = new List<Opportunity>();\n        for (Integer i = 0; i < count; i++) {\n            opps.add(new Opportunity(\n                Name = 'Won ' + i, AccountId = acc.Id, StageName = 'Closed Won',\n                CloseDate = Date.today(), Amount = 1000\n            ));\n        }\n        insert opps;\n        return opps;\n    }\n\n    @IsTest\n    static void blocksUsersWithoutPermission() {\n        User rep = makeUser('rep');\n        System.runAs(rep) {\n            List<Opportunity> opps = createWonOpps(200);\n            Test.startTest();\n            List<Database.DeleteResult> results = Database.delete(opps, false);\n            Test.stopTest();\n            for (Database.DeleteResult dr : results) {\n                Assert.isFalse(dr.isSuccess(), 'Won opportunity delete should be blocked');\n            }\n        }\n    }\n\n    @IsTest\n    static void allowsUsersWithCustomPermission() {\n        User finance = makeUser('fin');\n        PermissionSet ps = [SELECT Id FROM PermissionSet WHERE Name = 'Finance_Admin' LIMIT 1];\n        insert new PermissionSetAssignment(AssigneeId = finance.Id, PermissionSetId = ps.Id);\n        System.runAs(finance) {\n            List<Opportunity> opps = createWonOpps(200);\n            Test.startTest();\n            delete opps;\n            Test.stopTest();\n            Assert.areEqual(0, [SELECT COUNT() FROM Opportunity WHERE Id IN :opps], 'Finance admins can delete won opportunities');\n        }\n    }\n}\n",
    checks: [
      { re: /System\.runAs\s*\(/i, msg: "Runs as specific users with System.runAs" },
      { re: /new\s+PermissionSetAssignment\s*\(/i, msg: "Assigns the permission set" },
      { re: /Finance_Admin/i, msg: "Uses the Finance_Admin permission set" },
      { re: /\b200\b/, msg: "Tests 200 records" },
      { re: /Database\.delete\s*\([^;]*false\s*\)|catch\s*\(\s*(System\.)?DmlException/i, msg: "Captures the blocked deletes" },
      { re: /Assert\.\w+\s*\(/i, msg: "Uses the Assert class" }
    ],
    forbid: [
      { re: /SeeAllData\s*=\s*true/i, msg: "Do not use SeeAllData=true" },
      { re: /System\.assert(Equals|NotEquals)?\s*\(/i, msg: "Use the Assert class (Assert.areEqual, Assert.isTrue, ...)" }
    ],
    hints: ["Insert the User and PermissionSetAssignment (setup objects) outside runAs, and create Accounts/Opportunities inside runAs to avoid MIXED_DML_OPERATION.","FeatureManagement.checkPermission reflects permission sets assigned to the runAs user."],
    ai: "Verify the negative and positive paths both run as dedicated users, setup and non-setup DML are separated by runAs, 200 records are used, and assertions cover every result."
  }
);
