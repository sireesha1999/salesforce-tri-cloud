@IsTest
private class AccountSearchServiceTest {
    @TestSetup
    static void data() {
        insert new List<Account>{
            new Account(Name = 'Thames Couriers', Industry = 'Transportation', AnnualRevenue = 5000000),
            new Account(Name = 'Essex Freight', Industry = 'Transportation', AnnualRevenue = 900000),
            new Account(Name = 'Acme 100% Labs', Industry = 'Technology', AnnualRevenue = 2000000)
        };
    }

    @IsTest
    static void filtersAndSorts() {
        AccountSearchService.Criteria c = new AccountSearchService.Criteria();
        c.industry = 'Transportation';
        c.sortBy = 'AnnualRevenue';
        c.descending = true;
        List<Account> res = AccountSearchService.search(c);
        Assert.areEqual(2, res.size());
        Assert.areEqual('Thames Couriers', res[0].Name);
    }

    @IsTest
    static void escapesWildcardsAndIgnoresBadSortField() {
        AccountSearchService.Criteria c = new AccountSearchService.Criteria();
        c.nameContains = '100%';
        c.sortBy = 'Name; DELETE'; // not whitelisted -> falls back to Name
        List<Account> res = AccountSearchService.search(c);
        Assert.areEqual(1, res.size());
        Assert.areEqual('Acme 100% Labs', res[0].Name);
    }

    @IsTest
    static void minRevenueAndLimit() {
        AccountSearchService.Criteria c = new AccountSearchService.Criteria();
        c.minRevenue = 1000000;
        c.maxRows = 1;
        Assert.areEqual(1, AccountSearchService.search(c).size());
    }
}
