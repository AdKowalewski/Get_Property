public without sharing class GenerateQuotePDFDocument {
    
    @InvocableMethod   
    public static void CreateQuote(List<Id> quoteIds)  
    { 
        createQuoteFutureMethod(quoteIds);
    }
    
    @future(callout=true)
    public static void createQuoteFutureMethod (List<Id> quoteIds) {
        List<Quote> qt = [SELECT Id, Name, Email FROM Quote WHERE Id IN :quoteIds];
        String quoteUrl = Label.quoteurl1;
        for(Id quoteId : quoteIds) {           
            quoteUrl += quoteId;
            quoteUrl += Label.quoteurl2;
            PageReference pg = new PageReference(quoteUrl);
            Blob b = pg.getContentAsPDF();
            QuoteDocument quotedoc = new QuoteDocument();
            quotedoc.Document = b;
            quotedoc.QuoteId = quoteId;
            insert quotedoc;
            
            Messaging.EmailFileAttachment efa = new Messaging.EmailFileAttachment();
            efa.setFileName(qt[0].Name + '.pdf');
            efa.setBody(b);
            List<Messaging.SingleEmailMessage> mailList =  new List<Messaging.SingleEmailMessage>();
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            EmailTemplate et = [SELECT Id, Subject, Body, HtmlValue FROM EmailTemplate WHERE Id = :Label.EmailTemplateId];
            mail.setTemplateId(et.Id);
            List<string> toAddress = new List<string>();
            toAddress.add(qt[0].Email);
            mail.setToAddresses(toAddress);
            mail.setSubject(et.Subject);
            mail.setHTMLBody(et.HtmlValue);
            mail.setSaveAsActivity(false);
            mail.setUseSignature(false);
            List<Messaging.EmailFileAttachment> efaList = new List<Messaging.EmailFileAttachment>();
            efaList.add(efa);
            mail.setFileAttachments(efaList);
            mailList.add(mail);
            Messaging.sendEmail(mailList, true);
        }  
    }
}