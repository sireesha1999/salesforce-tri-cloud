@IsTest
private class OpportunityTriggerHandlerTest {
    private static String wonStage() {
        return [SELECT ApiName FROM OpportunityStage WHERE IsWon = TRUE AND IsActive = TRUE LIMIT 1].ApiName;
    }

    @IsTest
    static void createsOneTaskPerWonOpportunityInBulk() {
        List<Opportunity> opps = new List<Opportunity>();
        for (Integer i = 0; i < 200; i++) {
            opps.add(new Opportunity(Name = 'Opp ' + i, StageName = 'Prospecting', CloseDate = Date.today().addDays(30)));
        }
        insert opps;

        String won = wonStage();
        for (Opportunity o : opps) {
            o.StageName = won;
        }
        Test.startTest();
        update opps;
        update opps; // second update must not create more tasks
        Test.stopTest();

        Assert.areEqual(200, [SELECT COUNT() FROM Task WHERE Subject = 'Kick-off call'], 'Exactly one task per opportunity');
    }

    @IsTest
    static void bypassSkipsAutomation() {
        Opportunity o = new Opportunity(Name = 'Bypass', StageName = 'Prospecting', CloseDate = Date.today());
        insert o;
        TriggerHandler.bypass('OpportunityTriggerHandler');
        o.StageName = wonStage();
        update o;
        TriggerHandler.clearBypass('OpportunityTriggerHandler');
        Assert.areEqual(0, [SELECT COUNT() FROM Task], 'Bypassed handler creates nothing');
    }
}
