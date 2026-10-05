/**
 * Scenario A7 — publish a platform event when an order ships.
 * Order_Shipped__e is High Volume with "Publish After Commit", so subscribers
 * only see events from transactions that actually committed.
 * EventBus.publish returns SaveResults: always check them.
 */
public with sharing class OrderEventPublisher {
    public static List<Database.SaveResult> publishShipped(Map<String, Id> accountIdByOrderNumber) {
        List<Order_Shipped__e> events = new List<Order_Shipped__e>();
        for (String orderNumber : accountIdByOrderNumber.keySet()) {
            events.add(new Order_Shipped__e(
                Order_Number__c = orderNumber,
                Account_Id__c = accountIdByOrderNumber.get(orderNumber)
            ));
        }
        List<Database.SaveResult> results = EventBus.publish(events);
        for (Database.SaveResult sr : results) {
            if (!sr.isSuccess()) {
                for (Database.Error err : sr.getErrors()) {
                    System.debug(LoggingLevel.ERROR, 'Publish failed: ' + err.getStatusCode() + ' ' + err.getMessage());
                }
            }
        }
        return results;
    }
}
