trigger ImageDistributionTrigger on ContentVersion (after insert) {
    List<ContentDistribution> cds = new List<ContentDistribution>();
    for(ContentVersion cv : Trigger.new) {
        ContentDistribution cd = new ContentDistribution();
        cd.Name = cv.FirstPublishLocationId;
        cd.ContentVersionId = cv.Id;
        cd.PreferencesAllowViewInBrowser= true;
        cd.PreferencesLinkLatestVersion=true;
        cd.PreferencesNotifyOnVisit=false;
        cd.PreferencesPasswordRequired=false;
        cd.PreferencesAllowOriginalDownload= true;
        cds.add(cd);
    }
    insert cds;
}