/** Scenario A2 — block duplicate Contact emails (within the batch and against the database). */
public with sharing class ContactTriggerHandler extends TriggerHandler {
    protected override void beforeInsert(List<SObject> newList) {
        ContactDuplicateService.preventDuplicates((List<Contact>) newList, null);
    }

    protected override void beforeUpdate(List<SObject> newList, Map<Id, SObject> oldMap) {
        ContactDuplicateService.preventDuplicates((List<Contact>) newList, oldMap);
    }
}
