public without sharing class FileController {

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

    private class ContentWrapper {
        public String id { get; set; }
        public String title { get; set; }
        public String contentDocumentId { get; set; }
        public String fileType { get; set; }
        public Integer contentSize { get; set; }
        public String fileExtension { get; set; }
        public String versionNumber { get; set; }
        public DateTime createdDate { get; set; }
        public Blob versionData { get; set; }
        public String firstPublishLocationId { get; set; }
        public String downloadUrl { get; set; }
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

    @AuraEnabled(cacheable=true)
    public static List<ContentWrapper> getVersionFiles2(String recordId){
        try {
            List<ContentVersion> versions = [
                SELECT Id, Title, ContentDocumentId, FileType, ContentSize, FileExtension, 
                    VersionNumber, CreatedDate, VersionData, FirstPublishLocationId
                FROM ContentVersion
                WHERE FirstPublishLocationId =:recordId
                ORDER BY CreatedDate DESC
            ];
            // List<String> ids = new List<String>();
            // for(ContentVersion cv : versions) {
            //     ids.add(cv.Id);
            // }
            // List<ContentDistribution> cds = [
            //     SELECT Id, ContentVersionId, ContentDownloadUrl
            //     FROM ContentDistribution
            //     WHERE ContentVersionId IN :ids
            // ];

            List<ContentWrapper> wrappers = new List<ContentWrapper>();
            for(Integer i = 0; i < versions.size(); i++) {
                ContentWrapper wrapper = new ContentWrapper();
                wrapper.id = versions[i].Id;
                wrapper.title = versions[i].Title;
                wrapper.contentDocumentId = versions[i].ContentDocumentId;
                wrapper.fileType = versions[i].FileType;
                wrapper.contentSize = versions[i].ContentSize;
                wrapper.fileExtension = versions[i].FileExtension;
                wrapper.versionNumber = versions[i].VersionNumber;
                wrapper.createdDate = versions[i].CreatedDate;
                wrapper.versionData = versions[i].VersionData;
                wrapper.firstPublishLocationId = versions[i].FirstPublishLocationId;
                List<ContentDistribution> cd = [
                    SELECT Id, ContentVersionId, ContentDownloadUrl
                    FROM ContentDistribution
                    WHERE ContentVersionId = :versions[i].Id
                ];
                wrapper.downloadUrl = cd[0].ContentDownloadUrl;
                wrappers.add(wrapper);
            }
            return wrappers;
        } catch (Exception e) {
           throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void createContentDistributions(String recordId, Integer limitnum) {
        List<ContentVersion> versions = [
            SELECT Id, ContentDocumentId
            FROM ContentVersion
            WHERE FirstPublishLocationId = :recordId
            ORDER BY CreatedDate DESC
            LIMIT :limitnum
        ];
        for(ContentVersion cv : versions) {
            ContentDistribution cd = new ContentDistribution();
            cd.Name = 'test';
            cd.ContentVersionId = cv.Id;
            cd.PreferencesAllowViewInBrowser= true;
            cd.PreferencesLinkLatestVersion=true;
            cd.PreferencesNotifyOnVisit=false;
            cd.PreferencesPasswordRequired=false;
            cd.PreferencesAllowOriginalDownload= true;
            insert cd;
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