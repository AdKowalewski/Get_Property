public without sharing class ReservationController {
    
    private class ReservationWrapper {
        public String id { get; set; }
        public Date startDate { get; set; }
        public Date endDate { get; set; }
        public Decimal noDays { get; set; }
        public Double price { get; set; }
        public String whoId { get; set; }
        public String whatId { get; set; }
        public String agentId { get; set; }
    }

    private class QuoteWrapper {
        public String id { get; set; }
    }

    @AuraEnabled
    public static String getUserReservations(String whoId, String whatId) {
        String jsonStr = '';
        List<Reservation__c> res = new List<Reservation__c>();
        if(whoId == '0057S000001cVXiQAM') {
            res = [
                SELECT Id, Start_Date__c, End_Date__c, No_Days__c, WhatId__c, WhoId__c, AgentId__c, Price__c
                FROM Reservation__c
                WHERE WhoId__c = '0037S00000NhbkzQAB' AND WhatId__c = :whatId
                LIMIT 1
            ];
        } else {
            User contact = [SELECT Id, ContactId FROM User WHERE Id = :whoId];
            res = [
                SELECT Id, Start_Date__c, End_Date__c, No_Days__c, WhatId__c, WhoId__c, AgentId__c, Price__c
                FROM Reservation__c
                WHERE WhoId__c = :contact.ContactId AND WhatId__c = :whatId
                LIMIT 1
            ];
        }      
        if(res.size() > 0) {
            Reservation__c r = res.get(0);
            ReservationWrapper wrapper = new ReservationWrapper();
            wrapper.id = r.Id;
            wrapper.startDate = r.Start_Date__c;
            wrapper.endDate = r.End_Date__c;
            wrapper.noDays = r.No_Days__c;
            wrapper.price = r.Price__c;
            wrapper.whatId = r.WhatId__c;
            wrapper.whoId = r.WhoId__c;
            wrapper.agentId = r.AgentId__c;
            jsonStr = JSON.serialize(wrapper);
        }
        return jsonStr;
    }

    @AuraEnabled
    public static String createReservation(String whatId, String whoId, String agentId, Decimal noDays, String userId) {
        String jsonStr = '';
        Quote qt = new Quote();
        // try{
            Integer nDays = (Integer) noDays;
            date dt = date.today();
            date dt2 = dt.addDays(nDays);
            List<Contact> con = new List<Contact>();
            if(userId == '0057S000001cVXiQAM') {
                con = [SELECT Id, Name, Email FROM Contact WHERE Id = '0037S00000NhbkzQAB'];
            } else {
                List<User> us = [SELECT Id, Name, Email, ContactId FROM User WHERE Id = :whoId];
                con = [SELECT Id, Name, Email FROM Contact WHERE Id = :us[0].ContactId];
            }           
            List<Product2> prod = [SELECT Id, Name, Price__c FROM Product2 WHERE Id = :whatId];
            List<Event> events = [SELECT Id FROM Event WHERE WhatId = :whatId];
            List<Opportunity> opps = [SELECT Id FROM Opportunity WHERE ProductId__c = :whatId];
            List<Quote> qts = [SELECT Id FROM Quote WHERE ProductId__c = :whatId];
            if(events.size() == 0) {
                prod[0].IsReservation__c = true;
                update prod;

                Reservation__c res = new Reservation__c();
                res.WhatId__c = whatId;
                // List<User> contact = [SELECT Id, ContactId FROM User WHERE Id = :whoId];
                res.WhoId__c = con[0].Id;
                res.AgentId__c = agentId;
                res.No_Days__c = noDays;
                res.Price__c = noDays * 100;
                res.Start_Date__c = dt;
                res.End_Date__c = dt2;
                insert res;

                if(opps.size() == 0) {
                    Opportunity opp = new Opportunity();
                    opp.Name = con[0].Name + ' - ' + prod[0].Name;
                    opp.RecordTypeId = Label.recordtypeid;         
                    opp.CloseDate = dt2;
                    opp.StageName = Label.qualified;
                    opp.ProductId__c = whatId;
                    opp.OwnerId = agentId;
                    insert opp;

                    if(qts.size() == 0) {
                        qt.Name = opp.Name;
                        qt.ProductId__c = whatId;
                        qt.ContactId = con[0].Id;
                        qt.Email = con[0].Email;
                        qt.OpportunityId = opp.Id;
                        List<Pricebook2> pb = [
                            SELECT Id, Name
                            FROM Pricebook2 
                            WHERE Name = :Label.spb
                        ];
                        qt.Pricebook2Id = pb[0].Id;
                        qt.Status = 'Approved';
                        insert qt;
        
                        QuoteLineItem qli = new QuoteLineItem();
                        qli.Product2Id = whatId;
                        qli.Quantity = 1;
                        qli.QuoteId = qt.Id;
                        qli.UnitPrice = prod[0].Price__c;
                        List<PricebookEntry> entry = [
                            SELECT Id, Product2.Id
                            FROM PricebookEntry 
                            WHERE Pricebook2.Name = :Label.spb AND Product2.Id = :whatId
                        ];
                        qli.PricebookEntryId = entry[0].Id;
                        insert qli;
                    }
                }
            }
            QuoteWrapper wrapper = new QuoteWrapper();
            wrapper.id = qt.Id;
            jsonStr = JSON.serialize(wrapper);
            return jsonStr;  
        // } catch(Exception e) {
        //     jsonStr = e.getMessage();
        //     return jsonStr;
        // }   
    }

    // @AuraEnabled
    // public static String createQuoteAndPDF(String whatId, String whoId, String agentId) {
    //     String jsonStr = '';
    //     try {
    //         Quote qt = createQuote(whatId, whoId, agentId);
    //         createPDF(qt.Id);
    //         return jsonStr;
    //     } catch(Exception e) {
    //         jsonStr = e.getMessage();
    //         return jsonStr;
    //     }
    // }

    @AuraEnabled
    public static String createQuote(String whatId, String whoId, String agentId, String userId) {
        String jsonStr = '';
        Quote qt = new Quote();
        // try{
            date dt = date.today();
            date dt2 = dt.addDays(7);
            List<Contact> con = new List<Contact>();
            if(userId == '0057S000001cVXiQAM') {
                con = [SELECT Id, Name, Email FROM Contact WHERE Id = '0037S00000NhbkzQAB'];
            } else {
                List<User> us = [SELECT Id, Name, Email, ContactId FROM User WHERE Id = :whoId];
                con = [SELECT Id, Name, Email FROM Contact WHERE Id = :us[0].ContactId];
            }
            List<Product2> prod = [SELECT Id, Name, Price__c FROM Product2 WHERE Id = :whatId];
            List<Opportunity> opps = [SELECT Id FROM Opportunity WHERE ProductId__c = :whatId];
            List<Quote> qts = [SELECT Id FROM Quote WHERE ProductId__c = :whatId];

            if(opps.size() == 0) {
                Opportunity opp = new Opportunity();
                opp.Name = con[0].Name + ' - ' + prod[0].Name;
                opp.RecordTypeId = Label.recordtypeid;         
                opp.CloseDate = dt2;
                opp.StageName = Label.qualified;
                opp.ProductId__c = whatId;
                opp.OwnerId = agentId;
                insert opp;

                if(qts.size() == 0) {                
                    qt.Name = opp.Name;
                    qt.ProductId__c = whatId;
                    qt.ContactId = con[0].Id;
                    qt.Email = con[0].Email;
                    qt.OpportunityId = opp.Id;
                    List<Pricebook2> pb = [
                        SELECT Id, Name
                        FROM Pricebook2 
                        WHERE Name = :Label.spb
                    ];
                    qt.Pricebook2Id = pb[0].Id;
                    qt.Status = 'Approved';
                    insert qt;
        
                    QuoteLineItem qli = new QuoteLineItem();
                    qli.Product2Id = whatId;
                    qli.Quantity = 1;
                    qli.QuoteId = qt.Id;
                    qli.UnitPrice = prod[0].Price__c;
                    List<PricebookEntry> entry = [
                        SELECT Id, Product2.Id
                        FROM PricebookEntry 
                        WHERE Pricebook2.Name = :Label.spb AND Product2.Id = :whatId
                    ];
                    qli.PricebookEntryId = entry[0].Id;
                    insert qli;

                    // createPDF(qt.Id);
                    // createPDFInvoker(qt.Id);

                    // String quoteUrl = 'https://britenet-10a-dev-ed.develop.my.salesforce.com/quote/quoteTemplateDataViewer.apexp?id=';
                    // quoteUrl += qt.Id;
                    // quoteUrl += '&headerHeight=190&footerHeight=188&summlid=0EH7S000000dEFm#toolbar=1&navpanes=0&zoom=90';
                    // PageReference pg = new PageReference(quoteUrl);
                    // QuoteDocument quotedoc = new QuoteDocument();
                    // Blob b = pg.getContentAsPDF();
                    // quotedoc.Document = b;
                    // quotedoc.QuoteId = qt.Id;
                    // insert quotedoc;

                    // Messaging.EmailFileAttachment efa = new Messaging.EmailFileAttachment();
                    // efa.setFileName(qt.Name + '.pdf');
                    // efa.setBody(quotedoc.Document);
                    // List<Messaging.SingleEmailMessage> mailList =  new List<Messaging.SingleEmailMessage>();
                    // Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
                    // EmailTemplate et = [SELECT Id, Subject, Body, HtmlValue FROM EmailTemplate WHERE Id = :Label.EmailTemplateId];
                    // mail.setTemplateId(et.Id);
                    // List<string> toAddress = new List<string>();
                    // toAddress.add(qt.Email);
                    // mail.setToAddresses(toAddress);
                    // mail.setSubject(et.Subject);
                    // mail.setHTMLBody(et.HtmlValue);
                    // mail.setSaveAsActivity(false);
                    // mail.setUseSignature(false);
                    // List<Messaging.EmailFileAttachment> efaList = new List<Messaging.EmailFileAttachment>();
                    // efaList.add(efa);
                    // mail.setFileAttachments(efaList);
                    // mailList.add(mail);
                    // Messaging.sendEmail(mailList, true); 
                }
            }
            QuoteWrapper wrapper = new QuoteWrapper();
            wrapper.id = qt.Id;
            jsonStr = JSON.serialize(wrapper);
            return jsonStr;
            // return jsonStr;
        // } catch (Exception e) {
            // jsonStr = e.getMessage();
            // return jsonStr;
        // }
    }

    @AuraEnabled
    public static String checkOpps(String whatId) {
        String jsonStr = '';
        List<Opportunity> opps = [SELECT Id FROM Opportunity WHERE ProductId__c = :whatId];
        List<Quote> qts = [SELECT Id FROM Quote WHERE ProductId__c = :whatId];
        if(opps.size() == 0 && qts.size() == 0) {
            jsonStr = 'empty';
        } else if(opps.size() != 0 || qts.size() != 0) {
            jsonStr = 'not empty';
        }
        return jsonStr;
    }

    @AuraEnabled
    public static void createPDFInvoker(Id quoteId) {
        createPDF(quoteId);
    }

    @AuraEnabled
    public static void createPDF(Id quoteId) {
        // createPDFFuture(quoteId);
        Map<String, Object> params = new Map<String, Object>();
        params.put('QuoteId', '0Q07S000000zoLHSAY');
        Flow.Interview flow1 = new Flow.Interview.AutolanchedPDFGeneration(params);
        flow1.start();
    }

    @future(callout=true)
    public static void createPDFFuture(Id quoteId) { 
        Quote qt = [SELECT Id, Name, Email FROM Quote WHERE Id = :quoteId];

        String quoteUrl = 'https://britenet-10a-dev-ed.develop.my.salesforce.com/quote/quoteTemplateDataViewer.apexp?id=';
        quoteUrl += quoteId;
        quoteUrl += '&headerHeight=190&footerHeight=188&summlid=0EH7S000000dEFm#toolbar=1&navpanes=0&zoom=90';
        PageReference pg = new PageReference(quoteUrl);
        Blob b = pg.getContentAsPDF();
        // ContentVersion cv = new ContentVersion();
        // cv.title = qt.Name + '.pdf';
        // cv.PathOnClient = qt.Name + '.pdf';
        // cv.VersionData = b;
        // cv.FirstPublishLocationId = quoteId;
        // insert cv;
        // QuoteDocument quotedoc = new QuoteDocument();
        // quotedoc.Document = b;
        // quotedoc.QuoteId = quoteId;
        // insert quotedoc;

        Messaging.EmailFileAttachment efa = new Messaging.EmailFileAttachment();
        efa.setFileName(qt.Name + '.pdf');
        efa.setBody(b);
        List<Messaging.SingleEmailMessage> mailList =  new List<Messaging.SingleEmailMessage>();
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        EmailTemplate et = [SELECT Id, Subject, Body, HtmlValue FROM EmailTemplate WHERE Id = :Label.EmailTemplateId];
        mail.setTemplateId(et.Id);
        List<string> toAddress = new List<string>();
        toAddress.add(qt.Email);
        mail.setToAddresses(toAddress);
        // mail.setSubject(et.Subject);
        mail.setSubject('New Quote');
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