/**
 * Scenario A3 — when an opportunity becomes Closed Won, create ONE kick-off
 * task. A static set guards against recursion (workflow/flow field updates
 * can re-fire the update trigger in the same transaction).
 */
public with sharing class OpportunityTriggerHandler extends TriggerHandler {
    @TestVisible
    private static final Set<Id> ALREADY_PROCESSED = new Set<Id>();

    protected override void afterUpdate(List<SObject> newList, Map<Id, SObject> oldMap) {
        List<Task> tasks = new List<Task>();
        for (Opportunity opp : (List<Opportunity>) newList) {
            Opportunity old = (Opportunity) oldMap.get(opp.Id);
            Boolean justWon = opp.IsWon && !old.IsWon;
            if (justWon && !ALREADY_PROCESSED.contains(opp.Id)) {
                ALREADY_PROCESSED.add(opp.Id);
                tasks.add(new Task(
                    WhatId = opp.Id,
                    OwnerId = opp.OwnerId,
                    Subject = 'Kick-off call',
                    Priority = 'High',
                    ActivityDate = Date.today().addDays(3)
                ));
            }
        }
        if (!tasks.isEmpty()) {
            insert tasks;
        }
    }
}
