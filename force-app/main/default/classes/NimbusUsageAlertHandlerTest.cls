@IsTest
private class NimbusUsageAlertHandlerTest {
    @IsTest static void parsesPayload() {
        NimbusUsageAlertHandler.Req r = new NimbusUsageAlertHandler.Req();
        r.payloadJson = '{"app_user_id__c":"APP-10060","error_count__c":7}';
        List<NimbusUsageAlertHandler.Res> out =
            NimbusUsageAlertHandler.parse(new List<NimbusUsageAlertHandler.Req>{ r });
        System.assertEquals('APP-10060', out[0].appUserId);
        System.assertEquals(7, out[0].errorCount);
    }
}
