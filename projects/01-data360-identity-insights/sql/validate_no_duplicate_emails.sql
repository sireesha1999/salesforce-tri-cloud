SELECT ssot__EmailAddress__c, COUNT(DISTINCT l.UnifiedRecordId__c) AS profiles
FROM ssot__ContactPointEmail__dlm e
JOIN IndividualIdentityLink__dlm l ON e.ssot__PartyId__c = l.SourceRecordId__c
GROUP BY ssot__EmailAddress__c
HAVING COUNT(DISTINCT l.UnifiedRecordId__c) > 1
