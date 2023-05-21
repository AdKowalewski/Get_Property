public without sharing class LastSeenPremisesController {

    public class ProductWrapper {
        public Integer recordStart { get; set; }
        public Integer pageNumber { get; set; }
        public Integer totalRecords { get; set; }
        public Integer recordEnd { get; set; }
        public Integer pageSize { get; set; }
        public List<Product2> products { get; set; }
    }
    
    private class RecentlyViewedWrapper {
        public String id { get; set; }
        public String name { get; set; }
    }

    @AuraEnabled
    public static void markProductAsRecentlyViewed(String id) {
        Product2 product = [
            SELECT Id, Name
            FROM Product2
            WHERE Id = :id
            FOR VIEW
        ];
        update product;
    }

    @AuraEnabled
    public static String getUserRecentlyViewedProducts() {
        String jsonStr = '';
        List<Product2> premises = [
            SELECT Id, Name
            FROM Product2
            WHERE RecordType.Name = :Label.businesspremises
        ];
        Integer length = premises.size();
        List<RecentlyViewed> last = [
            SELECT Id, Name, LastViewedDate
            FROM RecentlyViewed
            WHERE Type IN (:Label.product2) AND RecordType.Name IN (:Label.businesspremises)
            ORDER BY LastViewedDate DESC
            LIMIT :length
        ];
        List<RecentlyViewedWrapper> wrappers = new List<RecentlyViewedWrapper>();
        for(RecentlyViewed rv : last) {
            RecentlyViewedWrapper wrapper = new RecentlyViewedWrapper();
            wrapper.id = rv.Id;
            wrapper.name = rv.Name;
            wrappers.add(wrapper);
        }
        List<RecentlyViewedWrapper> finalwrappers = new List<RecentlyViewedWrapper>();
        Integer k = 0;
        for(Integer i = 0; i < wrappers.size(); i++) {
            for(Integer j = i + 1; j < wrappers.size(); j++) {
                if(wrappers[i].equals(wrappers[j])) {
                    k++;
                }
            }
            if(k == 0) {
                finalwrappers.add(wrappers[i]);
            }
            k = 0;
        }
        jsonStr = JSON.serialize(finalwrappers);
        return jsonStr;
    }

    @AuraEnabled
    public static String getUserRecentlyViewedProducts2(Integer pageSize, Integer pageNumber, String name, String city) {
        String jsonStr = '';
        name = String.isBlank(name) ? '%' : '%' + name + '%';
        city = String.isBlank(city) ? '%' : '%' + city + '%';
        List<Product2> premises = [
            SELECT Id, Name
            FROM Product2
            WHERE RecordType.Name = :Label.businesspremises
        ];
        Integer length = premises.size();
        List<RecentlyViewed> last = [
            SELECT Id, Name, LastViewedDate
            FROM RecentlyViewed
            WHERE Type IN (:Label.product2) AND RecordType.Name IN (:Label.businesspremises)
            ORDER BY LastViewedDate DESC
            LIMIT :length
        ];
        Set<String> ids = new Set<String>();
        for(RecentlyViewed rv : last) {
            ids.add(rv.Id);
        }

        Integer offset = (pageNumber - 1) * pageSize;
        Integer totalRecords = ids.size();
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
            WHERE Id IN :ids AND (Name LIKE :name AND Product_Address__City__s LIKE :city)
            LIMIT :pageSize
            OFFSET :offset
        ];
        jsonStr = JSON.serialize(wrapper);
        return jsonStr;
    }
}