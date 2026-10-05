/** Apex for the LWC scenarios (L1, L2). cacheable=true allows @wire and client caching. */
public with sharing class ContactSearchController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> searchContacts(String term) {
        if (String.isBlank(term) || term.trim().length() < 2) {
            return new List<Contact>();
        }
        String pattern = '%' + term.trim().replace('%', '\\%').replace('_', '\\_') + '%';
        return [
            SELECT Id, Name, Email, Phone, Account.Name
            FROM Contact
            WHERE Name LIKE :pattern OR Email LIKE :pattern
            WITH USER_MODE
            ORDER BY Name
            LIMIT 20
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Opportunity> openOpportunities(Id accountId) {
        return [
            SELECT Id, Name, StageName, Amount, CloseDate
            FROM Opportunity
            WHERE AccountId = :accountId AND IsClosed = FALSE
            WITH USER_MODE
            ORDER BY CloseDate
            LIMIT 50
        ];
    }
}
