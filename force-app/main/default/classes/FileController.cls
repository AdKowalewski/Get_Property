public with sharing class FileController {

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
    public static void deleteFile(String recordId){
        System.debug(recordId);
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
        System.debug(contentDocument);
        delete contentDocument;
    } 
}