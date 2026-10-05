/**
 * Duplicate-email guard.
 *  - normalises email (trim + lower case)
 *  - catches duplicates inside the same insert/update batch
 *  - catches duplicates already in the database with ONE query
 *  - ignores updates where the email did not change
 * In production you would usually use Duplicate Rules; interviewers ask for
 * the Apex version to test bulkification and map/set skills.
 */
public with sharing class ContactDuplicateService {
    public static void preventDuplicates(List<Contact> contacts, Map<Id, SObject> oldMap) {
        Map<String, Contact> byEmail = new Map<String, Contact>();

        for (Contact c : contacts) {
            if (String.isBlank(c.Email)) {
                continue;
            }
            if (oldMap != null) {
                Contact old = (Contact) oldMap.get(c.Id);
                if (old != null && old.Email == c.Email) {
                    continue; // unchanged (Apex string == is case-insensitive)
                }
            }
            String key = c.Email.trim().toLowerCase();
            if (byEmail.containsKey(key)) {
                c.Email.addError('Duplicate email in this batch: ' + c.Email);
                continue;
            }
            byEmail.put(key, c);
        }

        if (byEmail.isEmpty()) {
            return;
        }

        for (Contact existing : [SELECT Id, Email FROM Contact WHERE Email IN :byEmail.keySet()]) {
            Contact incoming = byEmail.get(existing.Email.toLowerCase());
            if (incoming != null && incoming.Id != existing.Id) {
                incoming.Email.addError('A contact with this email already exists (' + existing.Id + ')');
            }
        }
    }
}
