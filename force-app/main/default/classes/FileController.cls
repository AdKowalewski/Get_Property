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

    private class LinkWrapper {
        public String link { get; set; }
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
    public static String getVersionFiles2(String recordId){
        String jsonStr = '';
        List<ContentVersion> versions = [
            SELECT Id, Title, ContentDocumentId, FileType, ContentSize, FileExtension, 
                VersionNumber, CreatedDate, VersionData, FirstPublishLocationId
            FROM ContentVersion
            WHERE FirstPublishLocationId =:recordId
            ORDER BY CreatedDate DESC
        ];

        List<ContentWrapper> wrappers = new List<ContentWrapper>();
        for(ContentVersion v : versions) {
            ContentWrapper wrapper = new ContentWrapper();
            wrapper.id = v.Id;
            wrapper.title = v.Title;
            wrapper.contentDocumentId = v.ContentDocumentId;
            wrapper.fileType = v.FileType;
            wrapper.contentSize = v.ContentSize;
            wrapper.fileExtension = v.FileExtension;
            wrapper.versionNumber = v.VersionNumber;
            wrapper.createdDate = v.CreatedDate;
            wrapper.versionData = v.VersionData;
            wrapper.firstPublishLocationId = v.FirstPublishLocationId;
            List<ContentDistribution> dist = [
                SELECT Id, ContentVersionId, ContentDownloadUrl
                FROM ContentDistribution
                WHERE ContentVersionId = :v.Id
                LIMIT 1
            ];
            wrapper.downloadUrl = dist[0].ContentDownloadUrl;
            wrappers.add(wrapper);
        }
        jsonStr = JSON.serialize(wrappers);
        return jsonStr;
    }

    @AuraEnabled
    public static String getImages(String recordId) {
        String jsonStr = '';
        List<ContentDistribution> dists = [
            SELECT Name, ContentDownloadUrl
            FROM ContentDistribution
            WHERE Name = :recordId
        ];
        List<LinkWrapper> links = new List<LinkWrapper>();
        for(ContentDistribution dist : dists) {
            LinkWrapper wrapper = new LinkWrapper();
            wrapper.link = dist.ContentDownloadUrl;
            links.add(wrapper);
        }
        jsonStr = JSON.serialize(links);
        return jsonStr;
    }

    // @AuraEnabled
    // public static void createContentDistributions(String recordId, Integer limitnum) {
    //     List<ContentVersion> versions = [
    //         SELECT Id, ContentDocumentId
    //         FROM ContentVersion
    //         WHERE FirstPublishLocationId = :recordId
    //         ORDER BY CreatedDate DESC
    //         LIMIT :limitnum
    //     ];
    //     for(ContentVersion cv : versions) {
    //         ContentDistribution cd = new ContentDistribution();
    //         cd.Name = 'test';
    //         cd.ContentVersionId = cv.Id;
    //         cd.PreferencesAllowViewInBrowser= true;
    //         cd.PreferencesLinkLatestVersion=true;
    //         cd.PreferencesNotifyOnVisit=false;
    //         cd.PreferencesPasswordRequired=false;
    //         cd.PreferencesAllowOriginalDownload= true;
    //         insert cd;
    //     }
    // }

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