# F2 · Flow design: guided returns screen flow

**Level:** Easy · **Time:** 20 min

## Brief

Build a screen flow for agents to process a device return: choose the device, capture the reason, calculate the refund (business rules in Apex), create a Return__c record and a credit task.

## Answer

- Screen 1: lookup or data table of the customer's assets.
- Screen 2: reason picklist and condition; conditional visibility for damage photos.
- Apex action (invocable) to calculate refund — keeps business rules testable.
- Create Records: Return__c; Create Records: Task for finance.
- Fault path showing a friendly message and logging.
- Launch from a quick action on Asset or Case.

## Talk track

Screens for UX, Apex for rules, fault paths for resilience.

## Likely follow-ups

- How would you let an Agentforce agent do the same? (reuse the autolaunched parts as an agent action)
