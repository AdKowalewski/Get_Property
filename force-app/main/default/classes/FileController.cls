public with sharing class FileController {

    private class ResponseWrapper {
        public String message { get; set; }
    }

    private class ProductWrapper {
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
    }

    @AuraEnabled(cacheable=true)
    public static List<ContentVersion> getVersionFiles(String recordId){
        try {
            return [
                SELECT Id, Title, ContentDocumentId, FileType, ContentSize, FileExtension, 
                    VersionNumber, CreatedDate, VersionData, FirstPublishLocationId
                FROM ContentVersion
                WHERE FirstPublishLocationId =:recordId
                ORDER BY CreatedDate DESC
		    ];        
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String getProductDisplayUrl(String id) {
        String jsonStr = '';
        Product2 prod =  [
            SELECT DisplayUrl
            FROM Product2
            WHERE Id = :id
        ];
        ResponseWrapper wrapper = new ResponseWrapper();
        wrapper.message = prod.DisplayUrl;
        jsonStr = JSON.serialize(wrapper);
        System.debug(jsonStr);
        return jsonStr;
    }

    @AuraEnabled
    public static void deleteFile(String recordId){
        ContentVersion contentVersion = [
            SELECT Id, ContentDocumentId
            FROM ContentVersion
            WHERE Id =:recordId
            ORDER BY CreatedDate DESC
        ];
        ContentDocument contentDocument = [
            SELECT Id, Title
            FROM ContentDocument
            WHERE Id =:contentVersion.ContentDocumentId
        ];
        delete contentDocument;
    } 

    @AuraEnabled
    public static String getProductById(String id) {
        String jsonStr = '';
        Product2 product = [
            SELECT Id, Name, Product_Address__City__s, Product_Address__PostalCode__s, Product_Address__Street__s, Price__c, Size__c, DisplayUrl, Wi_Fi__c, Parking__c, Elevator__c, Kitchen__c
            FROM Product2
            WHERE Id = :id
        ];
        ProductWrapper wrapper = new ProductWrapper();
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

        jsonStr = JSON.serialize(wrapper);
        return jsonStr;
    }
}