public without sharing class CaseController {
    
    private class CaseWrapper {
        public String id { get; set; }
        public String subject { get; set; }
        public String description { get; set; }
        public String type { get; set; }
        public Datetime dt { get; set; }
    }

    @AuraEnabled
    public static void createCase(String whoId, String subject, String type, String description) {
        Case caseObj = new Case();
        List<Contact> con = new List<Contact>();
        if(whoId == Label.auserid) {
            con = [SELECT Id, Name, Email FROM Contact WHERE Id = :Label.acontactid];
        } else {
            List<User> us = [SELECT Id, Name, Email, ContactId FROM User WHERE Id = :whoId];
            con = [SELECT Id, Name, Email FROM Contact WHERE Id = :us[0].ContactId];
        }
        caseObj.ContactId = con[0].Id;
        caseObj.Status = 'New';
        caseObj.Origin = 'Web';
        caseObj.Subject = subject;
        caseObj.Type = type;
        caseObj.Description = description;
        // Id paymentQueueId = [SELECT Queue.Id FROM queuesobject WHERE Queue.Name = 'Payment Cases'].Queue.Id;
        // Id technicalQueueId = [SELECT Queue.Id FROM queuesobject WHERE Queue.Name = 'Technical Cases'].Queue.Id;
        // Id invoicingQueueId = [SELECT Queue.Id FROM queuesobject WHERE Queue.Name = 'Invoicing Cases'].Queue.Id;
        // if(type == 'Payment') {
        //     caseObj.OwnerId = paymentQueueId;
        // } else if(type == 'Technical') {
        //     caseObj.OwnerId = technicalQueueId;
        // } else if(type == 'Invoicing') {
        //     caseObj.OwnerId = invoicingQueueId;
        // }
        AssignmentRule ar = [SELECT Id FROM AssignmentRule WHERE SobjectType = 'Case' AND Active = true LIMIT 1];
        Database.DMLOptions dmlOpts = new Database.DMLOptions();
        dmlOpts.assignmentRuleHeader.assignmentRuleId = ar.Id;
        caseObj.setOptions(dmlOpts);
        insert caseObj;
    }

    @AuraEnabled
    public static String getCases(String whoId) {
        String jsonStr = '';

        Case caseObj = new Case();
        List<Contact> con = new List<Contact>();
        if(whoId == Label.auserid) {
            con = [SELECT Id, Name, Email FROM Contact WHERE Id = :Label.acontactid];
        } else {
            List<User> us = [SELECT Id, Name, Email, ContactId FROM User WHERE Id = :whoId];
            con = [SELECT Id, Name, Email FROM Contact WHERE Id = :us[0].ContactId];
        }

        List<Case> cases = [
            SELECT Id, Subject, Type, Description, CreatedDate, ContactId
            FROM Case
            WHERE ContactId = :con[0].Id
        ];
        List<CaseWrapper> wrappers = new List<CaseWrapper>();
        for(Case c : cases) {
            CaseWrapper wrapper = new CaseWrapper();
            wrapper.id = c.Id;
            wrapper.subject = c.Subject;
            wrapper.type = c.Type;
            wrapper.description = c.Description;
            wrapper.dt = c.CreatedDate;
            wrappers.add(wrapper);
        }
        jsonStr = JSON.serialize(wrappers);
        return jsonStr;
    }
}