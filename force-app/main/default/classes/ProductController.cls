public without sharing class ProductController {
    
    public class ProductWrapper {
        public Integer recordStart { get; set; }
        public Integer pageNumber { get; set; }
        public Integer totalRecords { get; set; }
        public Integer recordEnd { get; set; }
        public Integer pageSize { get; set; }
        public List<Product2> products { get; set; }
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
}