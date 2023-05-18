public without sharing class MailController {
    
    @AuraEnabled
    public static void sendEmail(String quoteId) {
        Quote qt = [SELECT Id, Name, Email FROM Quote WHERE Id = :quoteId];

        QuoteDocument quotedoc = [SELECT Id, Document, QuoteId FROM QuoteDocument WHERE QuoteId = :quoteId];
        Messaging.EmailFileAttachment efa = new Messaging.EmailFileAttachment();
        efa.setFileName(qt.Name + '.pdf');
        efa.setBody(quotedoc.Document);

        List<Messaging.SingleEmailMessage> mailList =  new List<Messaging.SingleEmailMessage>();
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        EmailTemplate et = [SELECT Id, Subject, Body, HtmlValue FROM EmailTemplate WHERE Id = :Label.EmailTemplateId];
        mail.setTemplateId(et.Id);
        List<string> toAddress = new List<string>();
        toAddress.add(qt.Email);
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