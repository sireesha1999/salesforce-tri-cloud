/**
 * Scenario A1 — keep Account.Open_Case_Count__c accurate.
 * Handles insert, close/reopen, re-parenting, delete and undelete in bulk.
 */
public with sharing class CaseTriggerHandler extends TriggerHandler {
    protected override void afterInsert(List<SObject> newList) {
        AccountCaseRollupService.recalculate(accountIds(newList));
    }

    protected override void afterUpdate(List<SObject> newList, Map<Id, SObject> oldMap) {
        Set<Id> ids = new Set<Id>();
        for (Case c : (List<Case>) newList) {
            Case old = (Case) oldMap.get(c.Id);
            // Only recalculate when something that affects the count changed.
            if (c.AccountId != old.AccountId || c.IsClosed != old.IsClosed) {
                ids.add(c.AccountId);
                ids.add(old.AccountId); // the account the case moved away from
            }
        }
        AccountCaseRollupService.recalculate(ids);
    }

    protected override void afterDelete(List<SObject> oldList) {
        AccountCaseRollupService.recalculate(accountIds(oldList));
    }

    protected override void afterUndelete(List<SObject> newList) {
        AccountCaseRollupService.recalculate(accountIds(newList));
    }

    private static Set<Id> accountIds(List<SObject> cases) {
        Set<Id> ids = new Set<Id>();
        for (Case c : (List<Case>) cases) {
            ids.add(c.AccountId);
        }
        return ids;
    }
}
