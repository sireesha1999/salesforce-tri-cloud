@IsTest
private class AccountEnrichmentQueueableTest {
    private class CompanyApiMock implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest req) {
            HttpResponse res = new HttpResponse();
            if (req.getEndpoint().contains('broken.example')) {
                res.setStatusCode(500);
                res.setBody('{"error":"boom"}');
            } else {
                res.setStatusCode(200);
                res.setBody('{"employees": 250, "industry": "Transportation"}');
            }
            return res;
        }
    }

    @IsTest
    static void enrichesAccountsAndSkipsFailures() {
        Account ok = new Account(Name = 'Swift Haulage', Website = 'https://www.swifthaulage.example/about');
        Account bad = new Account(Name = 'Broken', Website = 'broken.example');
        insert new List<Account>{ ok, bad };

        Test.setMock(HttpCalloutMock.class, new CompanyApiMock());
        Test.startTest();
        System.enqueueJob(new AccountEnrichmentQueueable(new List<Id>{ ok.Id, bad.Id }));
        Test.stopTest();

        Account okAfter = [SELECT NumberOfEmployees, Industry FROM Account WHERE Id = :ok.Id];
        Assert.areEqual(250, okAfter.NumberOfEmployees);
        Assert.areEqual('Transportation', okAfter.Industry);
        Assert.isNull([SELECT Industry FROM Account WHERE Id = :bad.Id].Industry, 'Failed callout leaves record untouched');
    }

    @IsTest
    static void extractsDomain() {
        Assert.areEqual('acme.com', AccountEnrichmentQueueable.domainOf('HTTPS://www.Acme.com/contact'));
    }
}
