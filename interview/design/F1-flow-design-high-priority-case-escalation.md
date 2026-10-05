# F1 · Flow design: high-priority case escalation

**Level:** Medium · **Time:** 25 min

## Brief

When a Case is created with Priority = High for a customer with a Premium entitlement, set a target response time, assign to the Premium queue and notify the account owner. If it is still New after 1 hour, escalate to the duty manager.

## Answer

- **Before-save record-triggered flow** on Case (create): if Priority = High → set Target_Response__c = now + 1 hour (no DML).
- **After-save record-triggered flow**: Get the account's active entitlement; if Premium → update OwnerId to the Premium queue (or let assignment rules do it), send a notification or email to the account owner.
- **Scheduled path** on the after-save flow: 1 hour after CreatedDate, re-check Status = New → assign to duty manager queue and post to a Slack or Chatter channel.
- **Fault paths** on Get/Update elements → log to an Error_Log__c record.
- Alternative: entitlement processes with milestones and violation actions — preferable when SLAs are contractual.

## Talk track

Before-save for same-record fields, after-save for related actions, scheduled path for time-based escalation, and entitlements if SLAs must be reported.

## Likely follow-ups

- How would you test this flow? (Flow Test Mode / tests in Flow Builder)
