trigger QuoteLineItemTrigger on QuoteLineItem (after insert) {
    for(QuoteLineItem qt : Trigger.new) {
        QuoteEvent__e qevt = new QuoteEvent__e();
        qevt.QuoteId__c = qt.QuoteId;
        EventBus.publish(qevt);
    }
}