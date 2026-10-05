/**
 * Scenario A10 — dynamic SOQL done safely.
 *  - user input goes into BIND variables (Database.queryWithBinds), never concatenated
 *  - sort field and direction are whitelisted (cannot be bound)
 *  - AccessLevel.USER_MODE enforces CRUD, FLS and sharing for the running user
 */
public with sharing class AccountSearchService {
    private static final Set<String> SORTABLE = new Set<String>{ 'Name', 'AnnualRevenue', 'CreatedDate' };

    public class Criteria {
        @AuraEnabled public String nameContains;
        @AuraEnabled public String industry;
        @AuraEnabled public Decimal minRevenue;
        @AuraEnabled public String sortBy;
        @AuraEnabled public Boolean descending;
        @AuraEnabled public Integer maxRows;
    }

    public static List<Account> search(Criteria c) {
        List<String> clauses = new List<String>();
        Map<String, Object> binds = new Map<String, Object>();

        if (c != null && String.isNotBlank(c.nameContains)) {
            clauses.add('Name LIKE :namePattern');
            binds.put('namePattern', '%' + escapeLike(c.nameContains.trim()) + '%');
        }
        if (c != null && String.isNotBlank(c.industry)) {
            clauses.add('Industry = :industry');
            binds.put('industry', c.industry);
        }
        if (c != null && c.minRevenue != null) {
            clauses.add('AnnualRevenue >= :minRevenue');
            binds.put('minRevenue', c.minRevenue);
        }

        String sortField = (c != null && SORTABLE.contains(c.sortBy)) ? c.sortBy : 'Name';
        String direction = (c != null && c.descending == true) ? 'DESC' : 'ASC';
        Integer rows = (c == null || c.maxRows == null) ? 50 : Math.max(1, Math.min(c.maxRows, 200));
        binds.put('maxRows', rows);

        String soql = 'SELECT Id, Name, Industry, AnnualRevenue FROM Account'
            + (clauses.isEmpty() ? '' : ' WHERE ' + String.join(clauses, ' AND '))
            + ' ORDER BY ' + sortField + ' ' + direction + ' NULLS LAST'
            + ' LIMIT :maxRows';
        return Database.queryWithBinds(soql, binds, AccessLevel.USER_MODE);
    }

    /** Escape LIKE wildcards so a user typing % or _ searches literally. */
    @TestVisible
    private static String escapeLike(String s) {
        return s.replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_');
    }
}
