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
        public String productId { get; set; }
        public String productName { get; set; }
        public Decimal price { get; set; }
    }
    
    @AuraEnabled
    public static String initPriceBooks() {
        String json = '';
        List<Pricebook2> priceBooks = [
            SELECT Id, Name, Start_Date__c, End_Date__c, Product_Type__c, IsActive, isStandard
            FROM Pricebook2
        ];
        List<PriceBookWrapper> pbWrappers = new List<PriceBookWrapper>();
        for(Pricebook2 pb : priceBooks) {
            PriceBookEntryWrapper wrapper = new PriceBookEntryWrapper();
            wrapper.id = pb.Id;
            wrapper.name = pb.Name;
            wrapper.startDate = pb.Start_Date__c;
            wrapper.endDate = pb.End_Date__c;
            wrapper.productType = pb.Product_Type__c;
            wrapper.isActive = pb.IsActive;
            wrapper.isStandard = pb.isStandard;
            pbWrappers.add(wrapper);
        }
        json = JSON.serialize(pbWrappers);
        return json;
    }

    @AuraEnabled
    public static String searchPriceBooks(String name) {
        String json = '';
        name = (String.isBlank(name)) ? '%' : '%' + name + '%';
        List<Pricebook2> priceBooks = [
            SELECT Id, Name, Start_Date__c, End_Date__c, Product_Type__c, IsActive, isStandard
            FROM Pricebook2
            WHERE Name = :name
        ];
        List<PriceBookWrapper> pbWrappers = new List<PriceBookWrapper>();
        for(Pricebook2 pb : priceBooks) {
            PriceBookEntryWrapper wrapper = new PriceBookEntryWrapper();
            wrapper.id = pb.Id;
            wrapper.name = pb.Name;
            wrapper.startDate = pb.Start_Date__c;
            wrapper.endDate = pb.End_Date__c;
            wrapper.productType = pb.Product_Type__c;
            wrapper.isActive = pb.IsActive;
            wrapper.isStandard = pb.isStandard;
            pbWrappers.add(wrapper);
        }
        json = JSON.serialize(pbWrappers);
        return json;
    }

    @AuraEnabled
    public static String getEntriesFromPriceBook() {
        
    }

    @AuraEnabled
    public static String createPriceBook() {
        
    }

    @AuraEnabled
    public static String updatePriceBook() {
        
    }

    @AuraEnabled
    public static String createEntry() {
        
    }

    @AuraEnabled
    public static String updateEntry() {
        
    }
}