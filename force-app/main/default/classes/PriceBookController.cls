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
        public Double price { get; set; }
    }
    
    @AuraEnabled
    public static String initPriceBooks() {

    }

    @AuraEnabled
    public static String searchPriceBooks() {
        
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