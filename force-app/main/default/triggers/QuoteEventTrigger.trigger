trigger QuoteEventTrigger on QuoteEvent__e (after insert) {

    List<String> ids = new List<String>();
    for(QuoteEvent__e e : Trigger.new) {
        ids.add(e.QuoteId__c);
    }

    List<Quote> quotes = [SELECT Id, Name, Email FROM Quote WHERE Id IN :ids];
    EmailTemplate et = [SELECT Id, Subject, Body, HtmlValue FROM EmailTemplate WHERE Id = :Label.EmailTemplateId];

    for(Quote qt : quotes) {
        String quoteUrl = 'https://britenet-10a-dev-ed.develop.my.salesforce.com/quote/quoteTemplateDataViewer.apexp?id=';
        quoteUrl += qt.Id;
        quoteUrl += '&headerHeight=190&footerHeight=188&summlid=0EH7S000000dEFm#toolbar=1&navpanes=0&zoom=90';
        PageReference pg = new PageReference(quoteUrl);
        Blob b = pg.getContentAsPDF();
        QuoteDocument quotedoc = new QuoteDocument();
        quotedoc.Document = b;
        quotedoc.QuoteId = qt.Id;
        insert quotedoc;

        Messaging.EmailFileAttachment efa = new Messaging.EmailFileAttachment();
        efa.setFileName(qt.Name + '.pdf');
        efa.setBody(b);
        List<Messaging.SingleEmailMessage> mailList =  new List<Messaging.SingleEmailMessage>();
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();      
        mail.setTemplateId(et.Id);
        List<string> toAddress = new List<string>();
        toAddress.add(qt.Email);
        mail.setToAddresses(toAddress);
        mail.setSubject(et.Subject);
        // mail.setSubject('New Quote');
        mail.setHTMLBody(et.HtmlValue);
        // mail.setPlainTextBody('New Quote PDF Document is in attachment.');
        mail.setSaveAsActivity(false);
        mail.setUseSignature(false);
        List<Messaging.EmailFileAttachment> efaList = new List<Messaging.EmailFileAttachment>();
        efaList.add(efa);
        mail.setFileAttachments(efaList);
        mailList.add(mail);
        Messaging.sendEmail(mailList, true);
    }
}