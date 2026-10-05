public with sharing class NimbusUsageAlertHandler {
    // Replace with the exact identity-link DMO API name from your ruleset
    @TestVisible private static final String LINK_DMO = 'IndividualIdentityLink__dlm';

    public class Req {
        @InvocableVariable(required=true label='Payload JSON') public String payloadJson;
    }
    public class Res {
        @InvocableVariable public String appUserId;
        @InvocableVariable public Integer errorCount;
        @InvocableVariable public Id contactId;
    }

    @InvocableMethod(label='Parse Nimbus Usage Alert' description='Parses a Data 360 data action payload and finds the linked CRM Contact')
    public static List<Res> parse(List<Req> requests) {
        List<Res> out = new List<Res>();
        for (Req r : requests) {
            Map<String, Object> m = (Map<String, Object>) JSON.deserializeUntyped(r.payloadJson);
            Res res = new Res();
            res.appUserId  = (String) m.get('app_user_id__c');
            Object ec = m.get('error_count__c');
            res.errorCount = ec == null ? 0 : Decimal.valueOf(String.valueOf(ec)).intValue();
            res.contactId  = findCrmContact(res.appUserId);
            out.add(res);
        }
        return out;
    }

    @TestVisible
    private static Id findCrmContact(String appUserId) {
        if (String.isBlank(appUserId) || Test.isRunningTest()) return null;
        String safe = String.escapeSingleQuotes(appUserId);
        ConnectApi.CdpQueryInput q = new ConnectApi.CdpQueryInput();
        q.sql = 'SELECT l2.SourceRecordId__c FROM ' + LINK_DMO + ' l1 '
              + 'JOIN ' + LINK_DMO + ' l2 ON l1.UnifiedRecordId__c = l2.UnifiedRecordId__c '
              + 'WHERE l1.SourceRecordId__c = \'' + safe + '\' '
              + 'AND l2.SourceRecordId__c LIKE \'003%\' LIMIT 1';
        ConnectApi.CdpQueryOutputV2 res = ConnectApi.CdpQuery.queryAnsiSqlV2(q);
        if (res.data != null && !res.data.isEmpty() && !res.data[0].rowData.isEmpty()) {
            return Id.valueOf(String.valueOf(res.data[0].rowData[0]));
        }
        return null;
    }
}
