public without sharing class GenerateQuotePDFDocument {
    
    @InvocableMethod   
    public static void CreateQuote(List<Id> quoteIds)  
    { 
        createQuoteFutureMethod(quoteIds);
    }
    
    @future(callout=true)
    public static void createQuoteFutureMethod (List<Id> quoteIds) {
        List<Quote> qt = [SELECT Id, Name, Email FROM Quote WHERE Id IN :quoteIds];
        String quoteUrl = 'https://britenet-10a-dev-ed.develop.my.salesforce.com/quote/quoteTemplateDataViewer.apexp?id=';
        for(Id quoteId : quoteIds) {           
            quoteUrl += quoteId;
            quoteUrl += '&headerHeight=190&footerHeight=188&summlid=0EH7S000000dEFm#toolbar=1&navpanes=0&zoom=90';
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
}