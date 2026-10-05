SELECT
  UnifiedIndividual__dlm.ssot__Id__c                      AS customer_id__c,
  SUM(Product_Usage_Event__dlm.quantity__c)               AS usage_30d__c,
  SUM(CASE WHEN Product_Usage_Event__dlm.event_type__c = 'alert_error'
           THEN 1 ELSE 0 END)                             AS errors_30d__c,
  COUNT(DISTINCT Product_Usage_Event__dlm.device_id__c)   AS active_devices_30d__c
FROM Product_Usage_Event__dlm
JOIN IndividualIdentityLink__dlm      -- replace with your ruleset's link DMO
  ON Product_Usage_Event__dlm.app_user_id__c = IndividualIdentityLink__dlm.SourceRecordId__c
JOIN UnifiedIndividual__dlm           -- replace with your ruleset's unified DMO
  ON IndividualIdentityLink__dlm.UnifiedRecordId__c = UnifiedIndividual__dlm.ssot__Id__c
WHERE Product_Usage_Event__dlm.event_ts__c >= DATE_SUB(CURRENT_DATE(), 30)
GROUP BY UnifiedIndividual__dlm.ssot__Id__c
