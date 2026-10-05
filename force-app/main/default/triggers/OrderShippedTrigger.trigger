trigger OrderShippedTrigger on Order_Shipped__e (after insert) {
    OrderShippedSubscriber.handle(Trigger.new);
}
