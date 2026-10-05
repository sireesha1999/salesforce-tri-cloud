@IsTest
private class OrderEventPublisherTest {
    @IsTest
    static void publishedEventCreatesTask() {
        Account a = new Account(Name = 'Harbour Movers');
        insert a;

        Test.startTest();
        List<Database.SaveResult> results = OrderEventPublisher.publishShipped(new Map<String, Id>{ 'ORD-1001' => a.Id });
        Test.stopTest(); // delivers published events to subscribers

        Assert.isTrue(results[0].isSuccess(), 'Event published');
        Task t = [SELECT Subject, WhatId FROM Task LIMIT 1];
        Assert.areEqual(a.Id, t.WhatId);
        Assert.isTrue(t.Subject.contains('ORD-1001'));
    }

    @IsTest
    static void deliverWithoutStopTest() {
        Account a = new Account(Name = 'Bluebird Vans');
        insert a;
        OrderEventPublisher.publishShipped(new Map<String, Id>{ 'ORD-2002' => a.Id });
        Test.getEventBus().deliver(); // explicit delivery inside the test
        Assert.areEqual(1, [SELECT COUNT() FROM Task WHERE WhatId = :a.Id]);
    }
}
