SELECT
  Product_Usage_Event__dlm.app_user_id__c           AS app_user_id__c,
  COUNT(Product_Usage_Event__dlm.event_id__c)       AS error_count__c,
  WINDOW.START                                       AS window_start__c,
  WINDOW.END                                         AS window_end__c
FROM Product_Usage_Event__dlm
WHERE Product_Usage_Event__dlm.event_type__c = 'alert_error'
GROUP BY window(Product_Usage_Event__dlm.event_ts__c, '5 MINUTE'),
         Product_Usage_Event__dlm.app_user_id__c
