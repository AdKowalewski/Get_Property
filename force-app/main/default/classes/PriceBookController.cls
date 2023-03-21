public with sharing class PriceBookController {

    public class PriceBookWrapper {
        public String id { get; set; }
        public String name { get; set; }
        public Date startDate { get; set; }
        public Date endDate { get; set; }
        public String productType { get; set; }
        public Boolean isActive { get; set; }
        public Boolean isStandard { get; set; }
    }

    public class PriceBookEntryWrapper {
        public String id { get; set; }
        public String productId { get; set; }
        public String productName { get; set; }
        public String pricebookId { get; set; }
        public String pricebookName { get; set; }
        public Decimal price { get; set; }
    }
    
    @AuraEnabled
    public static String initPriceBooks() {
        String jsonStr = '';
        List<Pricebook2> priceBooks = [
            SELECT Id, Name, Start_Date__c, End_Date__c, Product_Type__c, IsActive, isStandard
            FROM Pricebook2
        ];
        List<PriceBookWrapper> pbWrappers = new List<PriceBookWrapper>();
        for(Pricebook2 pb : priceBooks) {
            PriceBookWrapper wrapper = new PriceBookWrapper();
            wrapper.id = pb.Id;
            wrapper.name = pb.Name;
            wrapper.startDate = pb.Start_Date__c;
            wrapper.endDate = pb.End_Date__c;
            wrapper.productType = pb.Product_Type__c;
            wrapper.isActive = pb.IsActive;
            wrapper.isStandard = pb.isStandard;
            pbWrappers.add(wrapper);
        }
        jsonStr = JSON.serialize(pbWrappers);
        return jsonStr;
    }

    @AuraEnabled
    public static String searchPriceBooks(String name) {
        String jsonStr = '';
        name = (String.isBlank(name)) ? '%' : '%' + name + '%';
        List<Pricebook2> priceBooks = [
            SELECT Id, Name, Start_Date__c, End_Date__c, Product_Type__c, IsActive, isStandard
            FROM Pricebook2
            WHERE Name = :name
        ];
        List<PriceBookWrapper> pbWrappers = new List<PriceBookWrapper>();
        for(Pricebook2 pb : priceBooks) {
            PriceBookWrapper wrapper = new PriceBookWrapper();
            wrapper.id = pb.Id;
            wrapper.name = pb.Name;
            wrapper.startDate = pb.Start_Date__c;
            wrapper.endDate = pb.End_Date__c;
            wrapper.productType = pb.Product_Type__c;
            wrapper.isActive = pb.IsActive;
            wrapper.isStandard = pb.isStandard;
            pbWrappers.add(wrapper);
        }
        jsonStr = JSON.serialize(pbWrappers);
        return jsonStr;
    }

    @AuraEnabled
    public static String getEntriesFromPriceBook(String id) {
        String jsonStr = '';
        List<PricebookEntry> entries = [
            SELECT Id, Product2.Id, Product2.Name, Pricebook2.Id, Pricebook2.Name, UnitPrice 
            FROM PricebookEntry 
            WHERE Pricebook2.Id = :id
        ];
        List<PriceBookEntryWrapper> eWrappers = new List<PriceBookEntryWrapper>();
        for(PricebookEntry entry : entries) {
            PriceBookEntryWrapper wrapper = new PriceBookEntryWrapper();
            wrapper.id = entry.Id;
            wrapper.productId = entry.Product2.Id;
            wrapper.productName = entry.Product2.Name;
            wrapper.pricebookId = entry.Pricebook2.Id;
            wrapper.pricebookName = entry.Pricebook2.Name;
            wrapper.price = entry.UnitPrice;
            eWrappers.add(wrapper);
        }
        jsonStr = JSON.serialize(eWrappers);
        return jsonStr;
    }

    @AuraEnabled
    public static String searchEntriesFromPriceBook(String id, String name) {
        String jsonStr = '';
        name = (String.isBlank(name)) ? '%' : '%' + name + '%';
        List<PricebookEntry> entries = [
            SELECT Id, Product2.Id, Product2.Name, Pricebook2.Id, Pricebook2.Name, UnitPrice 
            FROM PricebookEntry 
            WHERE Pricebook2.Id = :id AND Product2.Name = :name
        ];
        List<PriceBookEntryWrapper> eWrappers = new List<PriceBookEntryWrapper>();
        for(PricebookEntry entry : entries) {
            PriceBookEntryWrapper wrapper = new PriceBookEntryWrapper();
            wrapper.id = entry.Id;
            wrapper.productId = entry.Product2.Id;
            wrapper.productName = entry.Product2.Name;
            wrapper.pricebookId = entry.Pricebook2.Id;
            wrapper.pricebookName = entry.Pricebook2.Name;
            wrapper.price = entry.UnitPrice;
            eWrappers.add(wrapper);
        }
        jsonStr = JSON.serialize(eWrappers);
        return jsonStr;
    }

    @AuraEnabled
    public static void createPriceBook(String name, Date startDate, Date endDate, String productType) {
        Pricebook2 pricebook = new Pricebook2();
        pricebook.Name = name;
        pricebook.Start_Date__c = startDate;
        pricebook.End_Date__c = endDate;
        pricebook.Product_Type__c = productType;
        insert pricebook;
    }

    @AuraEnabled
    public static void updatePriceBook(String id, String name, Date startDate, Date endDate) {
        Pricebook2 pricebook = [
            SELECT Id, Name, Start_Date__c, End_Date__c, Product_Type__c, IsActive, isStandard
            FROM Pricebook2
            WHERE Id = :id 
        ];
        pricebook.Name = name;
        pricebook.Start_Date__c = startDate;
        pricebook.End_Date__c = endDate;
        update pricebook;
    }

    @AuraEnabled
    public static void createEntry(String productId, String productName, String pricebookId, String pricebookName, Decimal price) {
        PricebookEntry entry = new PricebookEntry();
        entry.Product2.Id = productId;
        entry.Product2.Name = productName;
        entry.Pricebook2.Id = pricebookId;
        entry.Pricebook2.Name = pricebookName;
        entry.UnitPrice = price;
        insert entry;
    }

    @AuraEnabled
    public static void updateEntry(String id, String discountType, Decimal discount) {
        PricebookEntry entry = [
            SELECT Id, UnitPrice 
            FROM PricebookEntry 
            WHERE Id = :id
        ];
        if(discountType == 'percentage') {
            Decimal sub = entry.UnitPrice * discount;
            entry.UnitPrice = entry.UnitPrice - sub;
        } else if(discountType == 'amount') {
            entry.UnitPrice = entry.UnitPrice - discount;
        }
        update entry;
    }
}