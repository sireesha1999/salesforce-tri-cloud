@IsTest
private class StaleLeadBatchTest {
    @IsTest
    static void closesStaleLeads() {
        List<Lead> leads = new List<Lead>();
        for (Integer i = 0; i < 50; i++) {
            leads.add(new Lead(LastName = 'Lead' + i, Company = 'Co' + i, Status = 'Open - Not Contacted'));
        }
        insert leads;

        Test.startTest();
        // staleDays = -1 puts the cutoff in the future, so every lead qualifies
        // (LastModifiedDate cannot be back-dated in tests).
        Database.executeBatch(new StaleLeadBatch(-1), 200);
        Test.stopTest();

        Assert.areEqual(50, [SELECT COUNT() FROM Lead WHERE Status = :StaleLeadBatch.CLOSED_STATUS]);
    }

    @IsTest
    static void schedulesNightly() {
        Test.startTest();
        String jobId = System.schedule('Stale leads test', '0 0 2 * * ?', new StaleLeadBatch(90));
        Test.stopTest();
        Assert.isNotNull(jobId);
    }
}
