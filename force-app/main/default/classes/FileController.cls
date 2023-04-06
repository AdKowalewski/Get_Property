public with sharing class FileController {

    private class ResponseWrapper {
        public String message { get; set; }
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
}