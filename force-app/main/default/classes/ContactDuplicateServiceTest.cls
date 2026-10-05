@IsTest
private class ContactDuplicateServiceTest {
    @IsTest
    static void blocksDuplicateAgainstDatabase() {
        insert new Contact(LastName = 'Original', Email = 'amara@example.com');
        Database.SaveResult sr = Database.insert(new Contact(LastName = 'Copy', Email = 'AMARA@example.com'), false);
        Assert.isFalse(sr.isSuccess(), 'Case-insensitive duplicate should be blocked');
    }

    @IsTest
    static void blocksDuplicateWithinBatch() {
        List<Contact> batch = new List<Contact>{
            new Contact(LastName = 'A', Email = 'dev@example.com'),
            new Contact(LastName = 'B', Email = 'dev@example.com')
        };
        List<Database.SaveResult> results = Database.insert(batch, false);
        Assert.isTrue(results[0].isSuccess(), 'First record is kept');
        Assert.isFalse(results[1].isSuccess(), 'Second record in the same batch is blocked');
    }

    @IsTest
    static void allowsUpdateWithoutEmailChange() {
        Contact c = new Contact(LastName = 'Same', Email = 'same@example.com');
        insert c;
        c.LastName = 'Renamed';
        update c; // must not flag itself as a duplicate
        Assert.areEqual('Renamed', [SELECT LastName FROM Contact WHERE Id = :c.Id].LastName);
    }

    @IsTest
    static void bulkInsertOfUniqueEmails() {
        List<Contact> contacts = new List<Contact>();
        for (Integer i = 0; i < 200; i++) {
            contacts.add(new Contact(LastName = 'Bulk' + i, Email = 'bulk' + i + '@example.com'));
        }
        Test.startTest();
        insert contacts;
        Test.stopTest();
        Assert.areEqual(200, [SELECT COUNT() FROM Contact]);
    }
}
