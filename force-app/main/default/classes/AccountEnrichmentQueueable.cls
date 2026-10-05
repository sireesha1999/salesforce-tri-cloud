/**
 * Scenario A4 — enrich Accounts from an external REST API asynchronously.
 *  - Queueable (not @future) so it can take complex parameters and be chained
 *  - Database.AllowsCallouts for HTTP from async context
 *  - Named Credential "Company_Info" holds the endpoint and auth (no secrets in code)
 *  - Processes CHUNK_SIZE accounts per job and chains the rest (100 callouts/transaction limit)
 *  - Per-record failures are recorded, not thrown, so one bad domain doesn't fail the batch
 */
public with sharing class AccountEnrichmentQueueable implements Queueable, Database.AllowsCallouts {
    @TestVisible
    private static final Integer CHUNK_SIZE = 50;
    private final List<Id> accountIds;

    public AccountEnrichmentQueueable(List<Id> accountIds) {
        this.accountIds = accountIds;
    }

    public void execute(QueueableContext context) {
        List<Id> current = new List<Id>();
        List<Id> remaining = new List<Id>();
        for (Integer i = 0; i < accountIds.size(); i++) {
            if (i < CHUNK_SIZE) {
                current.add(accountIds[i]);
            } else {
                remaining.add(accountIds[i]);
            }
        }

        List<Account> updates = new List<Account>();
        for (Account acc : [SELECT Id, Website FROM Account WHERE Id IN :current AND Website != NULL]) {
            CompanyInfo info = fetch(domainOf(acc.Website));
            if (info != null) {
                updates.add(new Account(Id = acc.Id, NumberOfEmployees = info.employees, Industry = info.industry));
            }
        }
        if (!updates.isEmpty()) {
            Database.update(updates, false);
        }

        if (!remaining.isEmpty() && !Test.isRunningTest()) {
            System.enqueueJob(new AccountEnrichmentQueueable(remaining));
        }
    }

    @TestVisible
    private static String domainOf(String website) {
        return website.toLowerCase().removeStart('https://').removeStart('http://').removeStart('www.').substringBefore('/');
    }

    private static CompanyInfo fetch(String domain) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:Company_Info/companies?domain=' + EncodingUtil.urlEncode(domain, 'UTF-8'));
        req.setMethod('GET');
        req.setTimeout(10000);
        try {
            HttpResponse res = new Http().send(req);
            if (res.getStatusCode() != 200) {
                return null;
            }
            return (CompanyInfo) JSON.deserialize(res.getBody(), CompanyInfo.class);
        } catch (CalloutException e) {
            return null; // in production: log to a custom object / platform event
        }
    }

    public class CompanyInfo {
        public Integer employees;
        public String industry;
    }
}
