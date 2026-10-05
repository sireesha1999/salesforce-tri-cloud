trigger ContactTrigger on Contact (before insert, before update) {
    new ContactTriggerHandler().run();
}
