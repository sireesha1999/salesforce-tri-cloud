@IsTest
private class AccountCaseRollupServiceTest {
    private static Decimal openCount(Id accountId) {
        return [SELECT Open_Case_Count__c FROM Account WHERE Id = :accountId].Open_Case_Count__c;
    }

    @IsTest
    static void countsOpenCasesAcrossLifecycle() {
        Account a = new Account(Name = 'Acme');
        Account b = new Account(Name = 'Globex');
        insert new List<Account>{ a, b };

        List<Case> cases = new List<Case>{
            new Case(AccountId = a.Id, Subject = 'One', Status = 'New'),
            new Case(AccountId = a.Id, Subject = 'Two', Status = 'New'),
            new Case(AccountId = a.Id, Subject = 'Three', Status = 'Closed')
        };

        Test.startTest();
        insert cases;
        Assert.areEqual(2, openCount(a.Id), 'Two open cases after insert');

        cases[0].Status = 'Closed';
        update cases[0];
        Assert.areEqual(1, openCount(a.Id), 'Closing a case decrements');

        cases[1].AccountId = b.Id;
        update cases[1];
        Assert.areEqual(0, openCount(a.Id), 'Re-parent removes from old account');
        Assert.areEqual(1, openCount(b.Id), 'Re-parent adds to new account');

        delete cases[1];
        Assert.areEqual(0, openCount(b.Id), 'Delete decrements');

        undelete cases[1];
        Assert.areEqual(1, openCount(b.Id), 'Undelete restores');
        Test.stopTest();
    }

    @IsTest
    static void bulkInsertOfTwoHundredCases() {
        Account a = new Account(Name = 'Bulk Co');
        insert a;
        List<Case> cases = new List<Case>();
        for (Integer i = 0; i < 200; i++) {
            cases.add(new Case(AccountId = a.Id, Subject = 'Case ' + i, Status = 'New'));
        }
        Test.startTest();
        insert cases;
        Test.stopTest();
        Assert.areEqual(200, openCount(a.Id), 'All 200 counted in one transaction');
    }
}
