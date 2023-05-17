trigger QuoteCreationTrigger on Quote (after insert) {
    String templateID = '0EH7S000000dEFm';
    List<Messaging.SingleEmailMessage> mailList =  new List<Messaging.SingleEmailMessage>();
    for(Quote qt : Trigger.new) {
        String quoteUrl = '/quote/quoteTemplateDataViewer.apexp?id=';
        quoteUrl += qt.Id;
        quoteUrl += '&headerHeight=190&footerHeight=188&summlid=';
        quoteUrl += templateID ;
        quoteUrl += '#toolbar=1&navpanes=0&zoom=90';
        PageReference pg = new PageReference(quoteUrl);
        QuoteDocument quotedoc = new QuoteDocument();
        Blob b = pg.getContentAsPDF();
        quotedoc.Document = b;
        quotedoc.QuoteId = qt.Id;
        insert quotedoc;

        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        EmailTemplate et = [SELECT Id, Subject, Body FROM EmailTemplate WHERE Id ='00X7S000000cwFA'];
        mail.setTemplateId(et.Id);
        List<string> toAddress = new List<string>();
        toAddress.add(qt.Email);
        mail.setToAddresses(toAddress);
        mail.setSubject(et.Subject);
        mail.setHTMLBody(et.Body);
        mail.setSaveAsActivity(false);
        mail.setUseSignature(false);
        List<String> docid = new List<String>();      
        docid.add(quotedoc.Id);
        mail.setEntityAttachments(docid);
        mailList.add(mail);
    }
    Messaging.sendEmail(mailList); 
}