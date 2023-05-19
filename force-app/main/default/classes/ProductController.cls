public without sharing class ProductController {
    
    public class ProductWrapper {
        public Integer recordStart { get; set; }
        public Integer pageNumber { get; set; }
        public Integer totalRecords { get; set; }
        public Integer recordEnd { get; set; }
        public Integer pageSize { get; set; }
        public List<Product2> products { get; set; }
    }

    private class RecentlyViewedWrapper {
        public String id { get; set; }
        public String name { get; set; }
    }

    private class ProductWrapper2 {
        public String id { get; set; }
        public String name { get; set; }
        public String address { get; set; }
        public Double price { get; set; }
        public Double size { get; set; }
        public String displayUrl { get; set; }
        public Boolean wifi { get; set; }
        public Boolean parking { get; set; }
        public Boolean elevator { get; set; }
        public Boolean kitchen { get; set; }
        public String agentId { get; set; }
        public String agentName { get; set; }
        public String agentEmail { get; set; }
        public Boolean isReserved { get; set; }
    }

    private class EventWrapper {
        public String id { get; set; }
        public String agentId { get; set; }
        public String agentName { get; set; }
        public String agentEmail { get; set; }
        public String whatId { get; set; }
        public String whatName { get; set; }
        public String whoId { get; set; }
        public String subject { get; set; }
        public Datetime starts { get; set; }
        public Datetime ends { get; set; }
        public String startsStr { get; set; }
        public String endsStr { get; set; }
        public String hour { get; set; }
        public String location { get; set; }
    }

    private class EventsWrapper {
        public List<EventWrapper> events { get; set; }
        public List<String> hours { get; set; }
    }

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

    @AuraEnabled
    public static String getProductById(String id) {
        String jsonStr = '';
        Product2 product = [
            SELECT Id, Name, Product_Address__City__s, Product_Address__PostalCode__s, Product_Address__Street__s, Price__c, Size__c, DisplayUrl, Wi_Fi__c, Parking__c, Elevator__c, Kitchen__c, Agent__c, IsReservation__c
            FROM Product2
            WHERE Id = :id
        ];
        ProductWrapper2 wrapper = new ProductWrapper2();
        wrapper.id = product.Id;
        wrapper.name = product.Name;
        wrapper.address = (String.isBlank(product.Product_Address__City__s) ? '' : product.Product_Address__City__s) + 
            (String.isBlank(product.Product_Address__Street__s) ? '' : ', ' + product.Product_Address__Street__s) +  
            (String.isBlank(product.Product_Address__PostalCode__s) ? '' : ', ' + product.Product_Address__PostalCode__s);
        wrapper.price = product.Price__c;
        wrapper.size = product.Size__c;
        wrapper.displayUrl = product.DisplayUrl;
        wrapper.wifi = product.Wi_Fi__c;
        wrapper.parking = product.Parking__c;
        wrapper.elevator = product.Elevator__c;
        wrapper.kitchen = product.Kitchen__c;
        wrapper.agentId = product.Agent__c;
        User agent = [SELECT Id, Name, SenderEmail FROM User WHERE Id = :product.Agent__c];
        wrapper.agentName = agent.Name;
        wrapper.agentEmail = agent.SenderEmail;
        wrapper.isReserved = product.IsReservation__c;
        jsonStr = JSON.serialize(wrapper);
        return jsonStr;
    }

    @AuraEnabled
    public static String getUserReservations(String whoId, String whatId) {
        String jsonStr = '';
        User contact = [SELECT Id, ContactId FROM User WHERE Id = :whoId];
        List<Reservation__c> res = [
            SELECT Id, Start_Date__c, End_Date__c, No_Days__c, WhatId__c, WhoId__c, AgentId__c, Price__c
            FROM Reservation__c
            WHERE WhoId__c = :contact.ContactId AND WhatId__c = :whatId
            LIMIT 1
        ];
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
    public static String getUserEvents(String whoId, String whatId) {
        String jsonStr = '';
        User contact = [SELECT Id, ContactId FROM User WHERE Id = :whoId];
        List<Event> events = [
            SELECT Id, OwnerId, WhatId, WhoId, Subject, StartDateTime, EndDateTime, Location
            FROM Event
            WHERE WhoId = :contact.ContactId AND WhatId = :whatId
            LIMIT 1
        ];
        if(events.size() > 0) {
            Event e = events.get(0);
            EventWrapper wrapper = new EventWrapper();
            wrapper.id = e.Id;
            wrapper.agentId = e.OwnerId;
            wrapper.whatId = e.WhatId;
            wrapper.whoId = e.WhoId;
            wrapper.subject = e.Subject;
            wrapper.starts = e.StartDateTime;
            wrapper.ends = e.EndDateTime;
            String stringStart = String.valueOfGmt(e.StartDateTime);
            wrapper.startsStr = stringStart.substring(0, 10) + ' ' + stringStart.substring(11, 16);
            String stringEnd = String.valueOfGmt(e.EndDateTime);
            wrapper.endsStr = stringEnd.substring(0, 10) + ' ' + stringEnd.substring(11, 16);
            wrapper.location = e.Location;
            jsonStr = JSON.serialize(wrapper);
        }
        return jsonStr;
    }

    @AuraEnabled
    public static String getAllUserEvents(String whoId) {
        String jsonStr = '';
        User contact = [SELECT Id, ContactId FROM User WHERE Id = :whoId];
        List<Event> events = [
            SELECT Id, OwnerId, WhatId, WhoId, Subject, StartDateTime, EndDateTime, Location
            FROM Event
            WHERE WhoId = :contact.ContactId
        ];
        List<EventWrapper> wrappers = new List<EventWrapper>();
        for(Event e : events) {
            EventWrapper wrapper = new EventWrapper();
            wrapper.id = e.Id;
            wrapper.agentId = e.OwnerId;
            User agent = [SELECT FirstName, LastName, Email FROM User WHERE Id = :e.OwnerId];
            wrapper.agentName = agent.FirstName + ' ' + agent.LastName;
            wrapper.agentEmail = agent.Email;
            wrapper.whatId = e.WhatId;
            Product2 prod = [SELECT Id, Name FROM Product2 WHERE Id = :e.WhatId];
            wrapper.whatName = prod.Name;
            wrapper.whoId = e.WhoId;
            wrapper.subject = e.Subject;
            wrapper.starts = e.StartDateTime;
            wrapper.ends = e.EndDateTime;
            String stringStart = String.valueOfGmt(e.StartDateTime);
            wrapper.startsStr = stringStart.substring(0, 10) + ' ' + stringStart.substring(11, 16);
            String stringEnd = String.valueOfGmt(e.EndDateTime);
            wrapper.endsStr = stringEnd.substring(0, 10) + ' ' + stringEnd.substring(11, 16);
            wrapper.location = e.Location;
            wrappers.add(wrapper);
        }      
        jsonStr = JSON.serialize(wrappers);
        return jsonStr;
    }

    @AuraEnabled
    public static String getProductEventsForGivenDay(String whatId, Datetime start) {
        String jsonStr = '';
        Date day = start.date();
        List<String> initialHours = new List<String>{
            '9:00','9:30',
            '10:00','10:30',
            '11:00','11:30',
            '12:00','12:30',
            '13:00','13:30',
            '14:00','14:30',
            '15:00','15:30',
            '16:00','16:30'
        };
        Datetime currentDatetime = System.now();
        List<Event> events = [
            SELECT Id, OwnerId, WhatId, WhoId, Subject, StartDateTime, EndDateTime, Location
            FROM Event
            WHERE DAY_ONLY(convertTimezone(StartDateTime)) = :day AND StartDateTime >= :currentDatetime
        ];
        List<EventWrapper> wrappers = new List<EventWrapper>();
        for(Event e : events) {
            EventWrapper wrapper = new EventWrapper();
            wrapper.id = e.Id;
            wrapper.agentId = e.OwnerId;
            wrapper.whatId = e.WhatId;
            wrapper.whoId = e.WhoId;
            wrapper.subject = e.Subject;
            wrapper.starts = e.StartDateTime;
            wrapper.ends = e.EndDateTime;
            wrapper.hour = String.valueOf(e.StartDateTime.hour() - 2) + ':' + (String.valueOf(e.StartDateTime.minute()).equals('0') ? '00' : '30');
            wrapper.location = e.Location;
            wrappers.add(wrapper);
        }
        List<String> existingHours = new List<String>();
        for(EventWrapper wrapper : wrappers) {
            existingHours.add(wrapper.hour);
        }
        List<String> availableHours = new List<String>();
        Boolean k = false;
        for(String str1 : initialHours) {
            for(String str2 : existingHours) {
                if(str1.equals(str2)) {
                    k = true;
                    continue;
                }
            }
            if(k == false) {
                availableHours.add(str1);
            }
            k = false;
        }
        EventsWrapper ewr = new EventsWrapper();
        ewr.events = wrappers;
        ewr.hours = availableHours;
        jsonStr = JSON.serialize(ewr);
        return jsonStr;
    }

    @AuraEnabled
    public static void createEvent(String agentId, String whoId, String whatId, String location, Integer year, Integer month, Integer day, Integer hour, Integer minute) {
        Event event = new Event();
        event.OwnerId = agentId;
        User contact = [SELECT Id, ContactId FROM User WHERE Id = :whoId];
        event.WhoId = contact.ContactId;
        event.WhatId = whatId;
        event.Subject = Label.business_premise_demo;
        Datetime start = Datetime.newInstance(
            Date.newInstance(year, month, day),
            Time.newInstance(hour, minute, 0, 0)
        );
        event.StartDateTime = start;
        event.EndDateTime = start.addMinutes(30);
        event.Location = location;
        List<Event> agentReservations = [
            SELECT Id, OwnerId, StartDateTime
            FROM Event
            WHERE StartDateTime = :start AND OwnerId = :agentId
        ];
        if(agentReservations.size() == 0) {
            insert event;
        }
    }

    @AuraEnabled
    public static void deleteEvent(String id) {
        Event event = [
            SELECT Id
            FROM Event
            WHERE Id = :id
        ];
        delete event;
    }

    @AuraEnabled
    public static void markProductAsRecentlyViewed(String id) {
        Product2 product = [
            SELECT Id, Name
            FROM Product2
            WHERE Id = :id
            FOR VIEW
        ];
        update product;
    }

    @AuraEnabled
    public static String getProductPremisesList(Integer pageSize, Integer pageNumber, String name, String city, Boolean wifi, Boolean parking, Boolean elevator, Boolean kitchen, Double price, Double size) {

        List<PricebookEntry> entries = [
            SELECT Id, Product2Id, UnitPrice
            FROM PricebookEntry
            WHERE Pricebook2Id = :Label.pbid
        ];
        List<Product2> prods = [
            SELECT Id, Price__c
            FROM Product2
        ];
        for(Product2 prod : prods) {
            for(PricebookEntry entry : entries) {
                if(entry.Product2Id == prod.Id) {
                    prod.Price__c = entry.UnitPrice;
                    update prod;
                }
            } 
        }

        String jsonItem = '';

        name = String.isBlank(name) ? '%' : '%' + name + '%';
        city = String.isBlank(city) ? '%' : '%' + city + '%';
        wifi = (wifi == null) ? false : wifi;
        parking = (parking == null) ? false : parking;
        elevator = (elevator == null) ? false : elevator;
        kitchen = (kitchen == null) ? false : kitchen;
        Integer offset = (pageNumber - 1) * pageSize;
        Integer totalRecords = [
            SELECT COUNT() 
            FROM Product2
            WHERE RecordType.Name = :Label.businesspremises AND ((Name LIKE :name AND Product_Address__City__s LIKE :city AND Price__c <= :price) OR (Wi_Fi__c = :wifi AND Parking__c = :parking AND Elevator__c = :elevator AND Kitchen__c = :kitchen))
        ];
        Integer recordEnd = pageSize * pageNumber;

        ProductWrapper wrapper = new ProductWrapper();      
        wrapper.pageNumber = pageNumber;
        wrapper.pageSize = pageSize;
        wrapper.recordStart = offset + 1;
        wrapper.recordEnd = totalRecords >= recordEnd ? recordEnd : totalRecords;
        wrapper.totalRecords = totalRecords;
        wrapper.products = [
            SELECT Id, Name, Product_Address__City__s, Default_Image__c, DisplayUrl, (SELECT UnitPrice FROM PricebookEntries WHERE Pricebook2Id = :Label.pbid), Size__c, Agent__c, IsReservation__c
            FROM Product2
            WHERE RecordType.Name = :Label.businesspremises AND ((Name LIKE :name AND Product_Address__City__s LIKE :city AND Price__c <= :price) OR (Wi_Fi__c = :wifi AND Parking__c = :parking AND Elevator__c = :elevator AND Kitchen__c = :kitchen))
            LIMIT :pageSize
            OFFSET :offset
        ];
        jsonItem = JSON.serialize(wrapper);
        return jsonItem;
    }

    @AuraEnabled
    public static String getProductApartmentsList(Integer pageSize, Integer pageNumber, String name, String city, String type, Boolean laundry, Boolean balcony, Boolean lk) {
        String jsonItem = '';
        name = String.isBlank(name) ? '%' : '%' + name + '%';
        city = String.isBlank(city) ? '%' : '%' + city + '%';
        type = String.isBlank(type) ? 'null' : ((type == 'All Types') ? '%' : '%' + type + '%');
        laundry = (laundry == null) ? false : laundry;
        balcony = (balcony == null) ? false : balcony;
        lk = (lk == null) ? false : lk;
        Integer offset = (pageNumber - 1) * pageSize;
        Integer totalRecords = [
            SELECT COUNT() 
            FROM Product2
            WHERE RecordType.Name = 'Apartments' AND (Name LIKE :name OR Product_Address__City__s LIKE :city OR (Apartment_Type__c LIKE :type OR (Laundry__c = :laundry AND Balcony__c = :balcony AND Living_Room_with_Kitchen__c = :lk)))
        ];
        Integer recordEnd = pageSize * pageNumber;

        ProductWrapper wrapper = new ProductWrapper();      
        wrapper.pageNumber = pageNumber;
        wrapper.pageSize = pageSize;
        wrapper.recordStart = offset + 1;
        wrapper.recordEnd = totalRecords >= recordEnd ? recordEnd : totalRecords;
        wrapper.totalRecords = totalRecords;
        wrapper.products = [
            SELECT Id, Name, Product_Address__City__s, Default_Image__c, DisplayUrl
            FROM Product2
            WHERE RecordType.Name = 'Apartments' AND (Name LIKE :name OR Product_Address__City__s LIKE :city OR (Apartment_Type__c LIKE :type OR (Laundry__c = :laundry AND Balcony__c = :balcony AND Living_Room_with_Kitchen__c = :lk)))
            LIMIT :pageSize
            OFFSET :offset
        ];     
        jsonItem = JSON.serialize(wrapper);
        return jsonItem;
    }

    @AuraEnabled
    public static String getUserRecentlyViewedProducts() {
        String jsonStr = '';
        List<Product2> premises = [
            SELECT Id, Name
            FROM Product2
            WHERE RecordType.Name = :Label.businesspremises
        ];
        Integer length = premises.size();
        List<RecentlyViewed> last = [
            SELECT Id, Name, LastViewedDate
            FROM RecentlyViewed
            WHERE Type IN (:Label.product2) AND RecordType.Name IN (:Label.businesspremises)
            ORDER BY LastViewedDate DESC
            LIMIT :length
        ];
        List<RecentlyViewedWrapper> wrappers = new List<RecentlyViewedWrapper>();
        for(RecentlyViewed rv : last) {
            RecentlyViewedWrapper wrapper = new RecentlyViewedWrapper();
            wrapper.id = rv.Id;
            wrapper.name = rv.Name;
            wrappers.add(wrapper);
        }
        List<RecentlyViewedWrapper> finalwrappers = new List<RecentlyViewedWrapper>();
        Integer k = 0;
        for(Integer i = 0; i < wrappers.size(); i++) {
            for(Integer j = i + 1; j < wrappers.size(); j++) {
                if(wrappers[i].equals(wrappers[j])) {
                    k++;
                }
            }
            if(k == 0) {
                finalwrappers.add(wrappers[i]);
            }
            k = 0;
        }
        jsonStr = JSON.serialize(finalwrappers);
        return jsonStr;
    }

    @AuraEnabled
    public static String getUserRecentlyViewedProducts2(Integer pageSize, Integer pageNumber, String name, String city) {
        String jsonStr = '';
        name = String.isBlank(name) ? '%' : '%' + name + '%';
        city = String.isBlank(city) ? '%' : '%' + city + '%';
        List<Product2> premises = [
            SELECT Id, Name
            FROM Product2
            WHERE RecordType.Name = :Label.businesspremises
        ];
        Integer length = premises.size();
        List<RecentlyViewed> last = [
            SELECT Id, Name, LastViewedDate
            FROM RecentlyViewed
            WHERE Type IN (:Label.product2) AND RecordType.Name IN (:Label.businesspremises)
            ORDER BY LastViewedDate DESC
            LIMIT :length
        ];
        Set<String> ids = new Set<String>();
        for(RecentlyViewed rv : last) {
            ids.add(rv.Id);
        }

        Integer offset = (pageNumber - 1) * pageSize;
        Integer totalRecords = ids.size();
        Integer recordEnd = pageSize * pageNumber;

        ProductWrapper wrapper = new ProductWrapper();      
        wrapper.pageNumber = pageNumber;
        wrapper.pageSize = pageSize;
        wrapper.recordStart = offset + 1;
        wrapper.recordEnd = totalRecords >= recordEnd ? recordEnd : totalRecords;
        wrapper.totalRecords = totalRecords;
        wrapper.products = [
            SELECT Id, Name, Product_Address__City__s, Default_Image__c, DisplayUrl, (SELECT UnitPrice FROM PricebookEntries WHERE Pricebook2Id = :Label.pbid), Size__c, Agent__c, IsReservation__c
            FROM Product2
            WHERE Id IN :ids AND (Name LIKE :name AND Product_Address__City__s LIKE :city)
            LIMIT :pageSize
            OFFSET :offset
        ];
        jsonStr = JSON.serialize(wrapper);
        return jsonStr;
    }

    @AuraEnabled
    public static String createReservation(String whatId, String whoId, String agentId, Decimal noDays) {
        String jsonStr = '';
        try{
            Integer nDays = (Integer) noDays;
            date dt = date.today();
            date dt2 = dt.addDays(nDays);
            List<User> us = [SELECT Id, Name, Email, ContactId FROM User WHERE Id = :whoId];
            List<Contact> con = [SELECT Id, Name, Email FROM Contact WHERE Id = :us[0].ContactId];
            List<Product2> prod = [SELECT Id, Name, Price__c FROM Product2 WHERE Id = :whatId];
            List<Event> events = [SELECT Id FROM Event WHERE WhatId = :whatId];
            List<Opportunity> opps = [SELECT Id FROM Opportunity WHERE ProductId__c = :whatId];
            List<Quote> qts = [SELECT Id FROM Quote WHERE ProductId__c = :whatId];
            if(events.size() == 0) {
                prod[0].IsReservation__c = true;
                update prod;

                Reservation__c res = new Reservation__c();
                res.WhatId__c = whatId;
                List<User> contact = [SELECT Id, ContactId FROM User WHERE Id = :whoId];
                res.WhoId__c = contact[0].ContactId;
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
                        Quote qt = new Quote();
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
            return jsonStr;  
        } catch(Exception e) {
            jsonStr = e.getMessage();
            return jsonStr;
        }   
    }

    @AuraEnabled
    public static String createQuote(String whatId, String whoId, String agentId) {
        String jsonStr = '';
        try{
            date dt = date.today();
            date dt2 = dt.addDays(7);
            List<User> us = [SELECT Id, Name, Email, ContactId FROM User WHERE Id = :whoId];
            List<Contact> con = [SELECT Id, Name, Email FROM Contact WHERE Id = :us[0].ContactId];
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
                    Quote qt = new Quote();
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
                    createPDFInvoker(qt.Id);

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
            return jsonStr;
        } catch (Exception e) {
            jsonStr = e.getMessage();
            return jsonStr;
        }
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

    @future(callout=true)
    public static void createPDF(Id quoteId) {      
        String quoteUrl = 'https://britenet-10a-dev-ed.develop.my.salesforce.com/quote/quoteTemplateDataViewer.apexp?id=';
        quoteUrl += quoteId;
        quoteUrl += '&headerHeight=190&footerHeight=188&summlid=0EH7S000000dEFm#toolbar=1&navpanes=0&zoom=90';
        PageReference pg = new PageReference(quoteUrl);
        QuoteDocument quotedoc = new QuoteDocument();
        Blob b = pg.getContentAsPDF();
        quotedoc.Document = b;
        quotedoc.QuoteId = quoteId;
        insert quotedoc;
    }
}