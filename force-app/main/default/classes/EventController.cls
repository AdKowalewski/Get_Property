public without sharing class EventController {
    
    private class EventWrapper {
        public String id { get; set; }
        public String agentId { get; set; }
        public String agentName { get; set; }
        public String agentEmail { get; set; }
        public String whatId { get; set; }
        public String whatName { get; set; }
        public String whoId { get; set; }
        public String subject { get; set; }
        public Datetime starts { get; set; }
        public Datetime ends { get; set; }
        public String startsStr { get; set; }
        public String endsStr { get; set; }
        public String hour { get; set; }
        public String location { get; set; }
    }

    private class EventsWrapper {
        public List<EventWrapper> events { get; set; }
        public List<String> hours { get; set; }
    }

    @AuraEnabled
    public static String getUserEvents(String whoId, String whatId) {
        String jsonStr = '';
        User contact = [SELECT Id, ContactId FROM User WHERE Id = :whoId];
        List<Event> events = [
            SELECT Id, OwnerId, WhatId, WhoId, Subject, StartDateTime, EndDateTime, Location
            FROM Event
            WHERE WhoId = :contact.ContactId AND WhatId = :whatId
            LIMIT 1
        ];
        if(events.size() > 0) {
            Event e = events.get(0);
            EventWrapper wrapper = new EventWrapper();
            wrapper.id = e.Id;
            wrapper.agentId = e.OwnerId;
            wrapper.whatId = e.WhatId;
            wrapper.whoId = e.WhoId;
            wrapper.subject = e.Subject;
            wrapper.starts = e.StartDateTime;
            wrapper.ends = e.EndDateTime;
            String stringStart = String.valueOfGmt(e.StartDateTime);
            wrapper.startsStr = stringStart.substring(0, 10) + ' ' + stringStart.substring(11, 16);
            String stringEnd = String.valueOfGmt(e.EndDateTime);
            wrapper.endsStr = stringEnd.substring(0, 10) + ' ' + stringEnd.substring(11, 16);
            wrapper.location = e.Location;
            jsonStr = JSON.serialize(wrapper);
        }
        return jsonStr;
    }

    @AuraEnabled
    public static String getAllUserEvents(String whoId) {
        String jsonStr = '';
        User contact = [SELECT Id, ContactId FROM User WHERE Id = :whoId];
        List<Event> events = [
            SELECT Id, OwnerId, WhatId, WhoId, Subject, StartDateTime, EndDateTime, Location
            FROM Event
            WHERE WhoId = :contact.ContactId
        ];
        List<EventWrapper> wrappers = new List<EventWrapper>();
        for(Event e : events) {
            EventWrapper wrapper = new EventWrapper();
            wrapper.id = e.Id;
            wrapper.agentId = e.OwnerId;
            User agent = [SELECT FirstName, LastName, Email FROM User WHERE Id = :e.OwnerId];
            wrapper.agentName = agent.FirstName + ' ' + agent.LastName;
            wrapper.agentEmail = agent.Email;
            wrapper.whatId = e.WhatId;
            Product2 prod = [SELECT Id, Name FROM Product2 WHERE Id = :e.WhatId];
            wrapper.whatName = prod.Name;
            wrapper.whoId = e.WhoId;
            wrapper.subject = e.Subject;
            wrapper.starts = e.StartDateTime;
            wrapper.ends = e.EndDateTime;
            String stringStart = String.valueOfGmt(e.StartDateTime);
            wrapper.startsStr = stringStart.substring(0, 10) + ' ' + stringStart.substring(11, 16);
            String stringEnd = String.valueOfGmt(e.EndDateTime);
            wrapper.endsStr = stringEnd.substring(0, 10) + ' ' + stringEnd.substring(11, 16);
            wrapper.location = e.Location;
            wrappers.add(wrapper);
        }      
        jsonStr = JSON.serialize(wrappers);
        return jsonStr;
    }

    @AuraEnabled
    public static String getProductEventsForGivenDay(String whatId, Datetime start) {
        String jsonStr = '';
        Date day = start.date();
        List<String> initialHours = new List<String>{
            '9:00','9:30',
            '10:00','10:30',
            '11:00','11:30',
            '12:00','12:30',
            '13:00','13:30',
            '14:00','14:30',
            '15:00','15:30',
            '16:00','16:30'
        };
        Datetime currentDatetime = System.now();
        List<Event> events = [
            SELECT Id, OwnerId, WhatId, WhoId, Subject, StartDateTime, EndDateTime, Location
            FROM Event
            WHERE DAY_ONLY(convertTimezone(StartDateTime)) = :day AND StartDateTime >= :currentDatetime
        ];
        List<EventWrapper> wrappers = new List<EventWrapper>();
        for(Event e : events) {
            EventWrapper wrapper = new EventWrapper();
            wrapper.id = e.Id;
            wrapper.agentId = e.OwnerId;
            wrapper.whatId = e.WhatId;
            wrapper.whoId = e.WhoId;
            wrapper.subject = e.Subject;
            wrapper.starts = e.StartDateTime;
            wrapper.ends = e.EndDateTime;
            wrapper.hour = String.valueOf(e.StartDateTime.hour() - 2) + ':' + (String.valueOf(e.StartDateTime.minute()).equals('0') ? '00' : '30');
            wrapper.location = e.Location;
            wrappers.add(wrapper);
        }
        List<String> existingHours = new List<String>();
        for(EventWrapper wrapper : wrappers) {
            existingHours.add(wrapper.hour);
        }
        List<String> availableHours = new List<String>();
        Boolean k = false;
        for(String str1 : initialHours) {
            for(String str2 : existingHours) {
                if(str1.equals(str2)) {
                    k = true;
                    continue;
                }
            }
            if(k == false) {
                availableHours.add(str1);
            }
            k = false;
        }
        EventsWrapper ewr = new EventsWrapper();
        ewr.events = wrappers;
        ewr.hours = availableHours;
        jsonStr = JSON.serialize(ewr);
        return jsonStr;
    }

    @AuraEnabled
    public static void createEvent(String agentId, String whoId, String whatId, String location, Integer year, Integer month, Integer day, Integer hour, Integer minute) {
        Event event = new Event();
        event.OwnerId = agentId;
        User contact = [SELECT Id, ContactId FROM User WHERE Id = :whoId];
        event.WhoId = contact.ContactId;
        event.WhatId = whatId;
        event.Subject = Label.business_premise_demo;
        Datetime start = Datetime.newInstance(
            Date.newInstance(year, month, day),
            Time.newInstance(hour, minute, 0, 0)
        );
        event.StartDateTime = start;
        event.EndDateTime = start.addMinutes(30);
        event.Location = location;
        List<Event> agentReservations = [
            SELECT Id, OwnerId, StartDateTime
            FROM Event
            WHERE StartDateTime = :start AND OwnerId = :agentId
        ];
        if(agentReservations.size() == 0) {
            insert event;
        }
    }

    @AuraEnabled
    public static void deleteEvent(String id) {
        Event event = [
            SELECT Id
            FROM Event
            WHERE Id = :id
        ];
        delete event;
    }
}