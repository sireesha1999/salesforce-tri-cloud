# I1 · Design: order sync with an ERP

**Level:** Hard · **Time:** 45 min

## Brief

Activated orders must reach the ERP within minutes; the ERP sends back invoice numbers and shipping status. The ERP is sometimes down for maintenance. Design the integration.

## Answer

- **Outbound**: on order activation publish an Order_Activated__e platform event (Publish After Commit) or use CDC on Order.
- **Middleware** (MuleSoft or similar) subscribes via the **Pub/Sub API**, transforms and calls the ERP; retries with backoff while the ERP is down; replay IDs cover outages up to 72 hours; dead-letter queue beyond that.
- **Inbound**: middleware calls Salesforce REST (Composite or upsert on an External ID such as ERP_Invoice_Id__c) using an integration user authenticated with JWT bearer or client credentials.
- **Idempotency**: external IDs on Order and Invoice; event IDs in a processed table.
- **Monitoring**: integration log object, alerts on failures, reconciliation report.
- **Security**: integration user with least privilege (permission sets), Named/External Credentials if Salesforce calls out.

## Talk track

Event-driven out, upsert-based in, middleware for retries and transformation, and external IDs for idempotency.

## Likely follow-ups

- What if volume is 1 million orders a day? (Bulk API 2.0 for inbound, high-volume events)
