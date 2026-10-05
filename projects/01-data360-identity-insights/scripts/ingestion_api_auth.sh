# 1) Core platform token (client credentials)
curl -s -X POST "https://YOUR_DOMAIN.my.salesforce.com/services/oauth2/token" \
  -d grant_type=client_credentials -d client_id="$CK" -d client_secret="$CS"
# -> copy access_token into CORE_TOKEN

# 2) Exchange for a Data 360 token
curl -s -X POST "https://YOUR_DOMAIN.my.salesforce.com/services/a360/token" \
  -d grant_type=urn:salesforce:grant-type:external:cdp \
  -d subject_token="$CORE_TOKEN" \
  -d subject_token_type=urn:ietf:params:oauth:token-type:access_token
# -> copy access_token into DC_TOKEN and instance_url into TENANT_URL (add https:// if missing)

# 3) Stream one event (expect HTTP 202 Accepted)
curl -s -o /dev/null -w "%{http_code}\n" -X POST \
  "$TENANT_URL/api/v1/ingest/sources/Nimbus_Usage/usage_event" \
  -H "Authorization: Bearer $DC_TOKEN" -H "Content-Type: application/json" \
  -d '{"data":[{"event_id":"e-0001","app_user_id":"APP-10060","device_id":"TRK-501","event_type":"gps_ping","quantity":1,"event_ts":"2026-10-05T15:30:00.000Z"}]}'
