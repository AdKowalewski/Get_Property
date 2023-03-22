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
        public Decimal discount { get; set; }
    }
    
    @AuraEnabled
    public static String initPriceBooks() {
        String jsonStr = '';
        List<Pricebook2> priceBooks = [
            SELECT Id, Name, Start_Date__c, End_Date__c, Product_Type__c, IsActive, IsStandard
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
            SELECT Id, Name, Start_Date__c, End_Date__c, Product_Type__c, IsActive, IsStandard
            FROM Pricebook2
            WHERE Name LIKE :name
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
    public static String getStandardPricebook() {
        String jsonStr = '';
        Pricebook2 standard = [
            SELECT Id, Name, Start_Date__c, End_Date__c, Product_Type__c, IsActive, IsStandard
            FROM Pricebook2
            WHERE Name = 'Standard Price Book'
        ];
        PriceBookWrapper wrapper = new PriceBookWrapper();
        wrapper.id = standard.Id;
        wrapper.name = standard.Name;
        wrapper.startDate = standard.Start_Date__c;
        wrapper.endDate = standard.End_Date__c;
        wrapper.productType = standard.Product_Type__c;
        wrapper.isActive = standard.IsActive;
        wrapper.isStandard = standard.isStandard;
        jsonStr = JSON.serialize(wrapper);
        return jsonStr;
    }

    @AuraEnabled
    public static String getPricebookById(String id) {
        String jsonStr = '';
        Pricebook2 standard = [
            SELECT Id, Name, Start_Date__c, End_Date__c, Product_Type__c, IsActive, IsStandard
            FROM Pricebook2
            WHERE Id = :id
        ];
        PriceBookWrapper wrapper = new PriceBookWrapper();
        wrapper.id = standard.Id;
        wrapper.name = standard.Name;
        wrapper.startDate = standard.Start_Date__c;
        wrapper.endDate = standard.End_Date__c;
        wrapper.productType = standard.Product_Type__c;
        wrapper.isActive = standard.IsActive;
        wrapper.isStandard = standard.isStandard;
        jsonStr = JSON.serialize(wrapper);
        return jsonStr;
    }

    @AuraEnabled
    public static String getStandardPricebookEntries() {
        String jsonStr = '';
        List<PricebookEntry> entries = [
            SELECT Id, Product2.Id, Product2.Name, Pricebook2.Id, Pricebook2.Name, UnitPrice, Discount__c
            FROM PricebookEntry 
            WHERE Pricebook2.Name = 'Standard Price Book'
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
            wrapper.discount = entry.Discount__c;
            eWrappers.add(wrapper);
        }
        jsonStr = JSON.serialize(eWrappers);
        return jsonStr;
    }

    @AuraEnabled
    public static String getEntriesFromPriceBook(String id) {
        String jsonStr = '';
        List<PricebookEntry> entries = [
            SELECT Id, Product2.Id, Product2.Name, Pricebook2.Id, Pricebook2.Name, UnitPrice, Discount__c
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
            wrapper.discount = entry.Discount__c;
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
            SELECT Id, Product2.Id, Product2.Name, Pricebook2.Id, Pricebook2.Name, UnitPrice, Discount__c
            FROM PricebookEntry 
            WHERE Pricebook2.Id = :id AND Product2.Name LIKE :name
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
            wrapper.discount = entry.Discount__c;
            eWrappers.add(wrapper);
        }
        jsonStr = JSON.serialize(eWrappers);
        return jsonStr;
    }

    @AuraEnabled
    public static String createPriceBook(String name, Date startDate, Date endDate, String productType) {
        String message = '';

        Pricebook2 pricebook = new Pricebook2();
        pricebook.Name = name;
        pricebook.Start_Date__c = startDate;
        pricebook.End_Date__c = endDate;
        pricebook.Product_Type__c = productType;

        List<Pricebook2> check = [
            SELECT Id, Name, Start_Date__c, End_Date__c, Product_Type__c, IsActive, IsStandard
            FROM Pricebook2
            WHERE Product_Type__c = :pricebook.Product_Type__c AND IsActive = true
        ];

        if(check.size() == 0) {
            insert pricebook;
        } else {
            message += 'There is date overlapping with Price Books: ';
            for(Pricebook2 pb : check) {
                message += pb.Name + ', ';
            }
        }

        return JSON.serialize(message);
    }

    @AuraEnabled
    public static String updatePriceBook(String id, String name, Date startDate, Date endDate) {
        String message = '';

        Pricebook2 pricebook = [
            SELECT Id, Name, Start_Date__c, End_Date__c, Product_Type__c, IsActive, IsStandard
            FROM Pricebook2
            WHERE Id = :id 
        ];

        List<Pricebook2> check = [
            SELECT Id, Name, Start_Date__c, End_Date__c, Product_Type__c, IsActive, IsStandard
            FROM Pricebook2
            WHERE Product_Type__c = :pricebook.Product_Type__c AND IsActive = true
        ];

        if(check.size() == 0) {
            pricebook.Name = name;
            pricebook.Start_Date__c = startDate;
            pricebook.End_Date__c = endDate;
            update pricebook;
        } else {
            message += 'There is date overlapping with Price Books: ';
            for(Pricebook2 pb : check) {
                message += pb.Name + ', ';
            }
        }

        return JSON.serialize(message);
    }

    @AuraEnabled
    public static void deactivatePricebook(String id) {
        Pricebook2 pricebook = [
            SELECT Id, Name, Start_Date__c, End_Date__c, Product_Type__c, IsActive, IsStandard
            FROM Pricebook2
            WHERE Id = :id 
        ];
        if(pricebook.IsActive == true) {
            pricebook.IsActive = false;
            pricebook.End_Date__c = Date.today().addDays(-1);
        }     
        update pricebook;
    }

    @AuraEnabled
    public static void createEntry(String productId, String productName, String pricebookId, String pricebookName, Decimal price, Decimal discount) {
        if(discount == null) {
            discount = 0.0;
        }
        PricebookEntry entry = new PricebookEntry();
        entry.Product2.Id = productId;
        entry.Product2.Name = productName;
        entry.Pricebook2.Id = pricebookId;
        entry.Pricebook2.Name = pricebookName;
        entry.UnitPrice = price;
        entry.Discount__c = discount;
        insert entry;
    }

    @AuraEnabled
    public static void updateEntry(String id, String discountType, Decimal discount) {
        PricebookEntry entry = [
            SELECT Id, UnitPrice, Discount__c
            FROM PricebookEntry 
            WHERE Id = :id
        ];
        entry.Discount__c = discount;
        if(discountType == 'percentage') {
            Decimal sub = entry.UnitPrice * discount;
            entry.UnitPrice = entry.UnitPrice - sub;
        } else if(discountType == 'amount') {
            entry.UnitPrice = entry.UnitPrice - discount;
        }
        update entry;
    }
}