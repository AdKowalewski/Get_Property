public with sharing class ProductController {
    
    public class ProductWrapper {
        public Integer recordStart { get; set; }
        public Integer pageNumber { get; set; }
        public Integer totalRecords { get; set; }
        public Integer recordEnd { get; set; }
        public Integer pageSize { get; set; }
        public List<Product2> products { get; set; }
    }

    @AuraEnabled
    public static String getProductPremisesList(Integer pageSize, Integer pageNumber, String name, String city, Boolean wifi, Boolean parking, Boolean elevator, Boolean kitchen, Double price, Double size) {

        List<PricebookEntry> entries = [
            SELECT Id, Product2Id, UnitPrice
            FROM PricebookEntry
            WHERE Pricebook2Id = '01s7S000002VqAzQAK'
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
            WHERE RecordType.Name = 'Business Premises' AND ((Name LIKE :name AND Product_Address__City__s LIKE :city AND Price__c <= :price) OR (Wi_Fi__c = :wifi AND Parking__c = :parking AND Elevator__c = :elevator AND Kitchen__c = :kitchen))
        ];
        Integer recordEnd = pageSize * pageNumber;

        ProductWrapper wrapper = new ProductWrapper();      
        wrapper.pageNumber = pageNumber;
        wrapper.pageSize = pageSize;
        wrapper.recordStart = offset + 1;
        wrapper.recordEnd = totalRecords >= recordEnd ? recordEnd : totalRecords;
        wrapper.totalRecords = totalRecords;
        wrapper.products = [
            SELECT Id, Name, Product_Address__City__s, Default_Image__c, DisplayUrl, (SELECT UnitPrice FROM PricebookEntries WHERE Pricebook2Id = '01s7S000002VqAzQAK'), Size__c
            FROM Product2
            WHERE RecordType.Name = 'Business Premises' AND ((Name LIKE :name AND Product_Address__City__s LIKE :city AND Price__c <= :price) OR (Wi_Fi__c = :wifi AND Parking__c = :parking AND Elevator__c = :elevator AND Kitchen__c = :kitchen))
            LIMIT :pageSize
            OFFSET :offset
        ];
        jsonItem = JSON.serialize(wrapper);
        System.debug(jsonItem);
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
}