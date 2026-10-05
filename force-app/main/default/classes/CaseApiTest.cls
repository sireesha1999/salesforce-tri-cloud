@IsTest
private class CaseApiTest {
    private static void setUp(String method, String uri, String body) {
        RestRequest req = new RestRequest();
        req.httpMethod = method;
        req.requestURI = uri;
        if (body != null) {
            req.requestBody = Blob.valueOf(body);
        }
        RestContext.request = req;
        RestContext.response = new RestResponse();
    }

    @IsTest
    static void createsAndReadsCase() {
        Account a = new Account(Name = 'Thames Couriers');
        insert a;

        setUp('POST', '/services/apexrest/v1/cases', '{"accountId":"' + a.Id + '","subject":"Tracker offline","priority":"High"}');
        CaseApi.createCase();
        Assert.areEqual(201, RestContext.response.statusCode);
        Map<String, Object> created = (Map<String, Object>) JSON.deserializeUntyped(RestContext.response.responseBody.toString());
        String caseId = (String) created.get('id');

        setUp('GET', '/services/apexrest/v1/cases/' + caseId, null);
        CaseApi.getCase();
        Assert.areEqual(200, RestContext.response.statusCode);
        Map<String, Object> fetched = (Map<String, Object>) JSON.deserializeUntyped(RestContext.response.responseBody.toString());
        Assert.areEqual('Tracker offline', fetched.get('subject'));
    }

    @IsTest
    static void rejectsMissingSubject() {
        setUp('POST', '/services/apexrest/v1/cases', '{"priority":"Low"}');
        CaseApi.createCase();
        Assert.areEqual(400, RestContext.response.statusCode);
    }

    @IsTest
    static void rejectsInvalidJson() {
        setUp('POST', '/services/apexrest/v1/cases', '{not json');
        CaseApi.createCase();
        Assert.areEqual(400, RestContext.response.statusCode);
    }

    @IsTest
    static void returns404ForUnknownCase() {
        setUp('GET', '/services/apexrest/v1/cases/500000000000001', null);
        CaseApi.getCase();
        Assert.areEqual(404, RestContext.response.statusCode);
    }
}
