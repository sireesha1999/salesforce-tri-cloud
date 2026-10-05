@IsTest
private class ContactSearchControllerTest {
    @IsTest
    static void searchesByNameOrEmail() {
        Account a = new Account(Name = 'Swift Haulage');
        insert a;
        insert new List<Contact>{
            new Contact(LastName = 'Patel', FirstName = 'Priya', Email = 'priya@swift.example', AccountId = a.Id),
            new Contact(LastName = 'Jones', FirstName = 'Rhys', Email = 'rhys@other.example')
        };
        Assert.areEqual(1, ContactSearchController.searchContacts('pat').size());
        Assert.areEqual(1, ContactSearchController.searchContacts('swift.example').size());
        Assert.areEqual(0, ContactSearchController.searchContacts('a').size(), 'Too short returns nothing');
    }

    @IsTest
    static void listsOpenOpportunities() {
        Account a = new Account(Name = 'Essex Freight');
        insert a;
        insert new Opportunity(Name = 'Renewal', AccountId = a.Id, StageName = 'Prospecting', CloseDate = Date.today());
        Assert.areEqual(1, ContactSearchController.openOpportunities(a.Id).size());
    }
}
