# Project 1 · Data 360 Real-Time Identity & Insights Engine

**Scenario:** Nimbus Fleet's customers exist in three systems (CRM, product app, billing) with different IDs and messy emails. Customer success can't see product usage, and device error spikes are noticed days late.

**Solution:** Data 360 unifies ~500 source records into ~300 unified individuals, streams usage events through the Ingestion API, computes a 30-day health insight and detects 5-minute error spikes that automatically create a CSM task and flag the contact as At Risk.

See [`architecture.txt`](architecture.txt) for the flow diagram.

## Files

| File | Purpose |
|---|---|
| [`scripts/generate_nimbus_data.py`](scripts/generate_nimbus_data.py) | Synthetic CRM, app and billing data with deliberate overlaps (test oracle: ~300 unified from ~500 rows) |
| [`schema/nimbus_usage.yaml`](schema/nimbus_usage.yaml) | OpenAPI schema for the Ingestion API connector |
| [`scripts/ingestion_api_auth.sh`](scripts/ingestion_api_auth.sh) | Core token → Data 360 token exchange → streaming POST |
| [`scripts/send_usage.py`](scripts/send_usage.py) | 30 days of baseline usage, and error bursts for testing |
| [`sql/calculated_insight_30d_health.sql`](sql/calculated_insight_30d_health.sql) | Calculated insight per unified customer |
| [`sql/streaming_insight_error_spike.sql`](sql/streaming_insight_error_spike.sql) | 5-minute windowed streaming insight |
| [`sql/validate_no_duplicate_emails.sql`](sql/validate_no_duplicate_emails.sql) | Verification query for missed matches |
| [`NimbusUsageAlertHandler.cls`](../../force-app/main/default/classes/NimbusUsageAlertHandler.cls) | Invocable Apex: parses the data action payload and traverses the identity graph to the CRM Contact |

## Identity ruleset

1. Normalised email (exact normalised)
2. Fuzzy first name + exact last name + normalised phone
3. App ID via Party Identification

Reconciliation: last updated by default; source priority for email (CRM > Billing > App).

## Verification

Nine tests cover ingestion counts, mapping, identity (including known non-merges), insights, positive/negative/unmatched alert paths and latency. Results: _record your consolidation rate and end-to-end latency here._
