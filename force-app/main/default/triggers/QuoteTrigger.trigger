trigger QuoteTrigger on Quote (after insert) {
    for(Quote qt : Trigger.new) {
        QuoteEvent__e qevt = new QuoteEvent__e();
        qevt.QuoteId__c = qt.Id;
        EventBus.publish(qevt);
    }
}