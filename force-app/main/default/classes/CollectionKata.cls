/**
 * Scenario A9 — classic whiteboard / live-coding exercises in Apex.
 * Each method is O(n) or O(n log n) and handles null/empty input.
 */
public with sharing class CollectionKata {
    /** Largest-amount opportunity per account (ties: first seen wins). */
    public static Map<Id, Opportunity> topOpportunityByAccount(List<Opportunity> opps) {
        Map<Id, Opportunity> best = new Map<Id, Opportunity>();
        if (opps == null) {
            return best;
        }
        for (Opportunity o : opps) {
            if (o.AccountId == null || o.Amount == null) {
                continue;
            }
            Opportunity current = best.get(o.AccountId);
            if (current == null || o.Amount > current.Amount) {
                best.put(o.AccountId, o);
            }
        }
        return best;
    }

    /** Second-highest DISTINCT value, or null if there isn't one. */
    public static Decimal secondHighest(List<Decimal> values) {
        Decimal first = null;
        Decimal second = null;
        if (values == null) {
            return null;
        }
        for (Decimal v : values) {
            if (v == null || v == first) {
                continue;
            }
            if (first == null || v > first) {
                second = first;
                first = v;
            } else if (second == null || v > second) {
                second = v;
            }
        }
        return second;
    }

    /** Anagram check ignoring case, spaces and punctuation. */
    public static Boolean isAnagram(String a, String b) {
        if (a == null || b == null) {
            return false;
        }
        return sortedLetters(a) == sortedLetters(b);
    }

    private static String sortedLetters(String s) {
        List<String> chars = s.toLowerCase().replaceAll('[^a-z0-9]', '').split('');
        chars.sort();
        return String.join(chars, '');
    }

    /** Group contacts by email domain (lower case). Contacts without email go under ''. */
    public static Map<String, List<Contact>> contactsByDomain(List<Contact> contacts) {
        Map<String, List<Contact>> groups = new Map<String, List<Contact>>();
        if (contacts == null) {
            return groups;
        }
        for (Contact c : contacts) {
            String domain = String.isBlank(c.Email) ? '' : c.Email.substringAfter('@').toLowerCase();
            if (!groups.containsKey(domain)) {
                groups.put(domain, new List<Contact>());
            }
            groups.get(domain).add(c);
        }
        return groups;
    }

    /** Split a list of Ids into chunks of at most size n (e.g. for callout or DML batching). */
    public static List<List<Id>> chunk(List<Id> ids, Integer n) {
        List<List<Id>> chunks = new List<List<Id>>();
        if (ids == null || n == null || n < 1) {
            return chunks;
        }
        List<Id> current = new List<Id>();
        for (Id i : ids) {
            current.add(i);
            if (current.size() == n) {
                chunks.add(current);
                current = new List<Id>();
            }
        }
        if (!current.isEmpty()) {
            chunks.add(current);
        }
        return chunks;
    }

    /** First non-repeating character, or null. */
    public static String firstUniqueChar(String s) {
        if (String.isEmpty(s)) {
            return null;
        }
        Map<String, Integer> counts = new Map<String, Integer>();
        List<String> chars = s.split('');
        for (String ch : chars) {
            counts.put(ch, counts.containsKey(ch) ? counts.get(ch) + 1 : 1);
        }
        for (String ch : chars) {
            if (counts.get(ch) == 1) {
                return ch;
            }
        }
        return null;
    }
}
