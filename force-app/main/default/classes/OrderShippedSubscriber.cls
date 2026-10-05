/**
 * Subscriber logic for Order_Shipped__e (called from the event trigger).
 * Platform event triggers run as the Automated Process user unless a
 * PlatformEventSubscriberConfig sets a running user, and they receive up to
 * 2,000 events per batch. setResumeCheckpoint lets a retry continue after the
 * last successfully processed event instead of reprocessing the whole batch.
 */
public without sharing class OrderShippedSubscriber {
    public static void handle(List<Order_Shipped__e> events) {
        List<Task> tasks = new List<Task>();
        for (Order_Shipped__e e : events) {
            if (String.isBlank(e.Account_Id__c)) {
                continue;
            }
            tasks.add(new Task(
                WhatId = e.Account_Id__c,
                Subject = 'Order ' + e.Order_Number__c + ' shipped — confirm delivery',
                ActivityDate = Date.today().addDays(2)
            ));
        }
        if (!tasks.isEmpty()) {
            insert tasks;
        }
        if (!events.isEmpty() && !Test.isRunningTest()) {
            EventBus.TriggerContext.currentContext().setResumeCheckpoint(events[events.size() - 1].ReplayId);
        }
    }
}
