/**
 * Recalculates open-case counts with ONE aggregate query and ONE DML,
 * whatever the batch size (bulk-safe, 200 records per trigger chunk).
 */
public with sharing class AccountCaseRollupService {
    public static void recalculate(Set<Id> accountIds) {
        accountIds.remove(null);
        if (accountIds.isEmpty()) {
            return;
        }

        // Default every account to zero so accounts that lost their last case are reset.
        Map<Id, Integer> counts = new Map<Id, Integer>();
        for (Id accountId : accountIds) {
            counts.put(accountId, 0);
        }

        for (AggregateResult ar : [
            SELECT AccountId acc, COUNT(Id) cnt
            FROM Case
            WHERE AccountId IN :accountIds AND IsClosed = FALSE
            GROUP BY AccountId
        ]) {
            counts.put((Id) ar.get('acc'), (Integer) ar.get('cnt'));
        }

        List<Account> updates = new List<Account>();
        for (Id accountId : counts.keySet()) {
            updates.add(new Account(Id = accountId, Open_Case_Count__c = counts.get(accountId)));
        }
        update updates;
    }
}
