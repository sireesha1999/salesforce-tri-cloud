trigger CaseTrigger on Case (after insert, after update, after delete, after undelete) {
    new CaseTriggerHandler().run();
}
