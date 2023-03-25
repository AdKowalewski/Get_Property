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
        public String id { get; set; }
        public String productId { get; set; }
        public String productName { get; set; }
        public String pricebookId { get; set; }
        public String pricebookName { get; set; }
        public Decimal price { get; set; }
        public Decimal discount { get; set; }
        public String discountType { get; set; }
    }

    public class ProductWrapper {
        public String id { get; set; }
        public String name { get; set; }
    }

    public class ResponseWrapper {
        public String message { get; set; }
    }

    public class ResponseWrapperNumber {
        public Decimal message { get; set; }
    }
    
    @AuraEnabled
    public static String initPriceBooks() {
        String jsonStr = '';
        List<Pricebook2> priceBooks = [
            SELECT Id, Name, Start_Date__c, End_Date__c, Product_Type__c, IsActive, IsStandard
            FROM Pricebook2
        ];
        List<PriceBookWrapper> pbWrappers = new List<PriceBookWrapper>();
        for(Pricebook2 pb : priceBooks) {
            PriceBookWrapper wrapper = new PriceBookWrapper();
            wrapper.id = pb.Id;
            wrapper.name = pb.Name;
            wrapper.startDate = pb.Start_Date__c;
            wrapper.endDate = pb.End_Date__c;
            wrapper.productType = pb.Product_Type__c;
            wrapper.isActive = pb.IsActive;
            wrapper.isStandard = pb.isStandard;
            pbWrappers.add(wrapper);
        }
        jsonStr = JSON.serialize(pbWrappers);
        return jsonStr;
    }

    @AuraEnabled
    public static String searchPriceBooks(String name) {
        String jsonStr = '';
        name = (String.isBlank(name)) ? '%' : '%' + name + '%';
        List<Pricebook2> priceBooks = [
            SELECT Id, Name, Start_Date__c, End_Date__c, Product_Type__c, IsActive, IsStandard
            FROM Pricebook2
            WHERE Name LIKE :name
        ];
        List<PriceBookWrapper> pbWrappers = new List<PriceBookWrapper>();
        for(Pricebook2 pb : priceBooks) {
            PriceBookWrapper wrapper = new PriceBookWrapper();
            wrapper.id = pb.Id;
            wrapper.name = pb.Name;
            wrapper.startDate = pb.Start_Date__c;
            wrapper.endDate = pb.End_Date__c;
            wrapper.productType = pb.Product_Type__c;
            wrapper.isActive = pb.IsActive;
            wrapper.isStandard = pb.isStandard;
            pbWrappers.add(wrapper);
        }
        jsonStr = JSON.serialize(pbWrappers);
        return jsonStr;
    }

    @AuraEnabled
    public static String getStandardPricebook() {
        String jsonStr = '';
        Pricebook2 standard = [
            SELECT Id, Name, Start_Date__c, End_Date__c, Product_Type__c, IsActive, IsStandard
            FROM Pricebook2
            WHERE Name = 'Standard Price Book'
        ];
        PriceBookWrapper wrapper = new PriceBookWrapper();
        wrapper.id = standard.Id;
        wrapper.name = standard.Name;
        wrapper.startDate = standard.Start_Date__c;
        wrapper.endDate = standard.End_Date__c;
        wrapper.productType = standard.Product_Type__c;
        wrapper.isActive = standard.IsActive;
        wrapper.isStandard = standard.isStandard;
        jsonStr = JSON.serialize(wrapper);
        return jsonStr;
    }

    @AuraEnabled
    public static String getPricebookById(String id) {
        String jsonStr = '';
        Pricebook2 standard = [
            SELECT Id, Name, Start_Date__c, End_Date__c, Product_Type__c, IsActive, IsStandard
            FROM Pricebook2
            WHERE Id = :id
        ];
        PriceBookWrapper wrapper = new PriceBookWrapper();
        wrapper.id = standard.Id;
        wrapper.name = standard.Name;
        wrapper.startDate = standard.Start_Date__c;
        wrapper.endDate = standard.End_Date__c;
        wrapper.productType = standard.Product_Type__c;
        wrapper.isActive = standard.IsActive;
        wrapper.isStandard = standard.isStandard;
        jsonStr = JSON.serialize(wrapper);
        return jsonStr;
    }

    @AuraEnabled
    public static String getStandardPricebookEntries() {
        String jsonStr = '';
        List<PricebookEntry> entries = [
            SELECT Id, Product2.Id, Product2.Name, Pricebook2.Id, Pricebook2.Name, UnitPrice, Discount__c, Discount_Type__c
            FROM PricebookEntry 
            WHERE Pricebook2.Name = 'Standard Price Book'
        ];
        List<PriceBookEntryWrapper> eWrappers = new List<PriceBookEntryWrapper>();
        for(PricebookEntry entry : entries) {
            PriceBookEntryWrapper wrapper = new PriceBookEntryWrapper();
            wrapper.id = entry.Id;
            wrapper.productId = entry.Product2.Id;
            wrapper.productName = entry.Product2.Name;
            wrapper.pricebookId = entry.Pricebook2.Id;
            wrapper.pricebookName = entry.Pricebook2.Name;
            wrapper.price = entry.UnitPrice;
            wrapper.discount = entry.Discount__c;
            wrapper.discountType = entry.Discount_Type__c;
            eWrappers.add(wrapper);
        }
        jsonStr = JSON.serialize(eWrappers);
        return jsonStr;
    }

    @AuraEnabled
    public static String getEntriesFromPriceBook(String id) {
        String jsonStr = '';
        List<PricebookEntry> entries = [
            SELECT Id, Product2.Id, Product2.Name, Pricebook2.Id, Pricebook2.Name, UnitPrice, Discount__c, Discount_Type__c
            FROM PricebookEntry 
            WHERE Pricebook2.Id = :id
        ];
        List<PriceBookEntryWrapper> eWrappers = new List<PriceBookEntryWrapper>();
        for(PricebookEntry entry : entries) {
            PriceBookEntryWrapper wrapper = new PriceBookEntryWrapper();
            wrapper.id = entry.Id;
            wrapper.productId = entry.Product2.Id;
            wrapper.productName = entry.Product2.Name;
            wrapper.pricebookId = entry.Pricebook2.Id;
            wrapper.pricebookName = entry.Pricebook2.Name;
            wrapper.price = entry.UnitPrice;
            wrapper.discount = entry.Discount__c;
            wrapper.discountType = entry.Discount_Type__c;
            eWrappers.add(wrapper);
        }
        jsonStr = JSON.serialize(eWrappers);
        return jsonStr;
    }

    @AuraEnabled
    public static String getMinimalPrice(String id) {
        String jsonStr = '';
        AggregateResult minimalPrice = [
            SELECT MIN(UnitPrice)minP
            FROM PricebookEntry 
            WHERE Pricebook2.Id = :id
        ];
        ResponseWrapperNumber wrapper = new ResponseWrapperNumber();
        wrapper.message = (Decimal)minimalPrice.get('minP');
        jsonStr = JSON.serialize(wrapper);
        return jsonStr;
    }

    @AuraEnabled
    public static String searchEntriesFromPriceBook(String id, String name) {
        String jsonStr = '';
        name = (String.isBlank(name)) ? '%' : '%' + name + '%';
        List<PricebookEntry> entries = [
            SELECT Id, Product2.Id, Product2.Name, Pricebook2.Id, Pricebook2.Name, UnitPrice, Discount__c, Discount_Type__c
            FROM PricebookEntry 
            WHERE Pricebook2.Id = :id AND Product2.Name LIKE :name
        ];
        List<PriceBookEntryWrapper> eWrappers = new List<PriceBookEntryWrapper>();
        for(PricebookEntry entry : entries) {
            PriceBookEntryWrapper wrapper = new PriceBookEntryWrapper();
            wrapper.id = entry.Id;
            wrapper.productId = entry.Product2.Id;
            wrapper.productName = entry.Product2.Name;
            wrapper.pricebookId = entry.Pricebook2.Id;
            wrapper.pricebookName = entry.Pricebook2.Name;
            wrapper.price = entry.UnitPrice;
            wrapper.discount = entry.Discount__c;
            wrapper.discountType = entry.Discount_Type__c;
            eWrappers.add(wrapper);
        }
        jsonStr = JSON.serialize(eWrappers);
        return jsonStr;
    }

    @AuraEnabled
    public static String createPriceBook(String name, Date startDate, Date endDate, String productType) {
        String jsonStr = '';

        Pricebook2 pricebook = new Pricebook2();
        pricebook.Name = name;
        pricebook.Start_Date__c = startDate;
        pricebook.End_Date__c = endDate;
        pricebook.Product_Type__c = productType;

        List<Pricebook2> check = [
            SELECT Id, Name, Start_Date__c, End_Date__c, Product_Type__c, IsActive, IsStandard
            FROM Pricebook2
            WHERE Product_Type__c = :productType
        ];

        List<Pricebook2> check2 = new List<Pricebook2>();
        for(Pricebook2 pb : check) {
            if(pricebook.End_Date__c < pb.Start_Date__c || pricebook.Start_Date__c > pb.End_Date__c) {
                check2.add(pb);
            }
        }

        List<Pricebook2> check3 = new List<Pricebook2>();
        for(Pricebook2 pb : check) {
            if(!check2.contains(pb)) {
                check3.add(pb);
            }
        }

        ResponseWrapper wrapper = new ResponseWrapper();
        if(check3.size() == 0) {
            insert pricebook;
            wrapper.message = '';
        } else {
            String message = 'There is date overlapping with Price Books: ';
            for(Pricebook2 pb : check3) {
                message += pb.Name + ' | ';
            }
            wrapper.message = message;
        }

        jsonStr = JSON.serialize(wrapper);
        return jsonStr;
    }

    @AuraEnabled
    public static String updatePriceBook(String id, String name, Date startDate, Date endDate) {
        String jsonStr = '';

        Pricebook2 pricebook = [
            SELECT Id, Name, Start_Date__c, End_Date__c, Product_Type__c, IsActive, IsStandard
            FROM Pricebook2
            WHERE Id = :id 
        ];
        if(String.isNotBlank(name) && startDate == null && endDate == null) {
            pricebook.Name = name;
        } else {
            pricebook.Name = name;
            pricebook.Start_Date__c = startDate;
            pricebook.End_Date__c = endDate;
        }

        List<Pricebook2> check = [
            SELECT Id, Name, Start_Date__c, End_Date__c, Product_Type__c, IsActive, IsStandard
            FROM Pricebook2
            WHERE Product_Type__c = :pricebook.Product_Type__c AND (NOT(Id = :id))
        ];

        List<Pricebook2> check2 = new List<Pricebook2>();
        for(Pricebook2 pb : check) {
            if(pricebook.End_Date__c < pb.Start_Date__c || pricebook.Start_Date__c > pb.End_Date__c) {
                check2.add(pb);
            }
        }

        List<Pricebook2> check3 = new List<Pricebook2>();
        for(Pricebook2 pb : check) {
            if(!check2.contains(pb)) {
                check3.add(pb);
            }
        }

        ResponseWrapper wrapper = new ResponseWrapper();
        if(check3.size() == 0) {
            update pricebook;  
            wrapper.message = '';
        } else {
            String message = 'There is date overlapping with Price Books: ';
            for(Pricebook2 pb : check3) {
                message += pb.Name + ' | ';
            }
            wrapper.message = message;
        }

        jsonStr = JSON.serialize(wrapper);
        return jsonStr;
    }

    @AuraEnabled
    public static void deactivatePricebook(String id) {
        Pricebook2 pricebook = [
            SELECT Id, Name, Start_Date__c, End_Date__c, Product_Type__c, IsActive, IsStandard
            FROM Pricebook2
            WHERE Id = :id 
        ];
        
        if(pricebook.IsActive == true) {
            pricebook.IsActive = false;
            pricebook.End_Date__c = Date.today();
        }     
        update pricebook;
    }

    @AuraEnabled
    public static void createEntry(String productId, String pricebookId, Decimal price) {
        PricebookEntry entry = new PricebookEntry(
            Pricebook2Id = pricebookId,
            Product2Id = productId,
            UnitPrice = price,
            UseStandardPrice = false,
            IsActive = true,
            Discount__c = 0.0,
            Discount_Type__c = 'Percentage'
        );
        insert entry;
    }
    
    @AuraEnabled
    public static void updateSingleEntry(String id, String discountType, Decimal discount, Decimal price) {
        PricebookEntry entry = [
            SELECT Id, UnitPrice, Discount__c, Discount_Type__c
            FROM PricebookEntry 
            WHERE Id = :id
        ];
        entry.UnitPrice = price;
        entry.Discount__c = discount;
        entry.Discount_Type__c = discountType;
        if(discountType == 'Percentage') {
            Decimal sub = entry.UnitPrice * (discount / 100);
            entry.UnitPrice = entry.UnitPrice - sub;
        } else if(discountType == 'Amount') {
            entry.UnitPrice = entry.UnitPrice - discount;
        }
        update entry;
    }

    @AuraEnabled
    public static void updateAllEntries(String pricebookId, String discountType, Decimal discount) {
        List<PricebookEntry> entriesToUpdate = [
            SELECT Id, Product2.Id, Product2.Name, Pricebook2.Id, Pricebook2.Name, UnitPrice, Discount__c, Discount_Type__c
            FROM PricebookEntry 
            WHERE Pricebook2.Id = :pricebookId
        ];
        for(PricebookEntry entry : entriesToUpdate) {
            entry.Discount__c = discount;
            entry.Discount_Type__c = discountType;
            if(discountType == 'Percentage') {
                Decimal sub = entry.UnitPrice * (discount / 100);
                entry.UnitPrice = entry.UnitPrice - sub;
            } else if(discountType == 'Amount') {
                entry.UnitPrice = entry.UnitPrice - discount;
            }
        }
        update entriesToUpdate;
    }

    @AuraEnabled
    public static void updateSelectedEntries(List<String> ids, String discountType, Decimal discount) {
        List<PricebookEntry> entriesToUpdate = [
            SELECT Id, Product2.Id, Product2.Name, Pricebook2.Id, Pricebook2.Name, UnitPrice, Discount__c, Discount_Type__c
            FROM PricebookEntry 
            WHERE Id IN :ids
        ];
        for(PricebookEntry entry : entriesToUpdate) {
            entry.Discount__c = discount;
            entry.Discount_Type__c = discountType;
            if(discountType == 'Percentage') {
                Decimal sub = entry.UnitPrice * (discount / 100);
                entry.UnitPrice = entry.UnitPrice - sub;
            } else if(discountType == 'Amount') {
                entry.UnitPrice = entry.UnitPrice - discount;
            }
        }
        update entriesToUpdate;
    }

    @AuraEnabled
    public static String getApartments(String pricebookId) {
        String jsonStr = '';
        List<Product2> products = [
            SELECT Id, Name
            FROM Product2
            WHERE RecordType.Name = 'Apartments'
        ];
        List<PricebookEntry> pbentries = [
            SELECT Id, Product2.Name
            FROM PricebookEntry 
            WHERE Pricebook2.Id = :pricebookId
        ];
        List<String> names = new List<String>();
        for(PricebookEntry entry : pbentries) {
            names.add(entry.Product2.Name);
        }

        Boolean k = false;
        List<Product2> products2 = new List<Product2>();
        for(Integer i = 0; i < products.size(); i++) {
            for(Integer j = 0; j < names.size(); j++) {
                if(products.get(i).Name.equals(names.get(j))) {
                    k = true;
                }
            }
            if(k == false) {
                products2.add(products.get(i));
            }
            k = false;
        }

        List<ProductWrapper> wrappers = new List<ProductWrapper>();
        for(Product2 prod : products2) {
            ProductWrapper wrapper = new ProductWrapper();
            wrapper.id = prod.Id;
            wrapper.name = prod.Name;
            wrappers.add(wrapper);
        }
        jsonStr = JSON.serialize(wrappers);
        return jsonStr;
    }

    @AuraEnabled
    public static String getPremises(String pricebookId) {
        String jsonStr = '';
        List<Product2> products = [
            SELECT Id, Name
            FROM Product2
            WHERE RecordType.Name = 'Business Premises'
        ];
        List<PricebookEntry> pbentries = [
            SELECT Id, Product2.Name
            FROM PricebookEntry 
            WHERE Pricebook2.Id = :pricebookId
        ];
        List<String> names = new List<String>();
        for(PricebookEntry entry : pbentries) {
            names.add(entry.Product2.Name);
        }

        Boolean k = false;
        List<Product2> products2 = new List<Product2>();
        for(Integer i = 0; i < products.size(); i++) {
            for(Integer j = 0; j < names.size(); j++) {
                if(products.get(i).Name.equals(names.get(j))) {
                    k = true;
                }
            }
            if(k == false) {
                products2.add(products.get(i));
            }
            k = false;
        }

        List<ProductWrapper> wrappers = new List<ProductWrapper>();
        for(Product2 prod : products2) {
            ProductWrapper wrapper = new ProductWrapper();
            wrapper.id = prod.Id;
            wrapper.name = prod.Name;
            wrappers.add(wrapper);
        }
        jsonStr = JSON.serialize(wrappers);
        return jsonStr;
    }
}