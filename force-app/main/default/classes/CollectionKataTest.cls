@IsTest
private class CollectionKataTest {
    @IsTest
    static void topOpportunity() {
        Id acc = '001000000000001';
        List<Opportunity> opps = new List<Opportunity>{
            new Opportunity(AccountId = acc, Name = 'Small', Amount = 100),
            new Opportunity(AccountId = acc, Name = 'Big', Amount = 900),
            new Opportunity(AccountId = acc, Name = 'NoAmount')
        };
        Assert.areEqual('Big', CollectionKata.topOpportunityByAccount(opps).get(acc).Name);
    }

    @IsTest
    static void secondHighestDistinct() {
        Assert.areEqual(7, CollectionKata.secondHighest(new List<Decimal>{ 9, 7, 9, 3 }));
        Assert.isNull(CollectionKata.secondHighest(new List<Decimal>{ 5, 5 }));
    }

    @IsTest
    static void anagrams() {
        Assert.isTrue(CollectionKata.isAnagram('Dormitory', 'Dirty room!'));
        Assert.isFalse(CollectionKata.isAnagram('Apex', 'Flow'));
    }

    @IsTest
    static void groupsByDomain() {
        Map<String, List<Contact>> g = CollectionKata.contactsByDomain(new List<Contact>{
            new Contact(LastName = 'A', Email = 'a@Acme.com'),
            new Contact(LastName = 'B', Email = 'b@acme.com'),
            new Contact(LastName = 'C')
        });
        Assert.areEqual(2, g.get('acme.com').size());
        Assert.areEqual(1, g.get('').size());
    }

    @IsTest
    static void chunks() {
        List<Id> ids = new List<Id>();
        for (Integer i = 0; i < 5; i++) {
            ids.add('001000000000001');
        }
        List<List<Id>> c = CollectionKata.chunk(ids, 2);
        Assert.areEqual(3, c.size());
        Assert.areEqual(1, c[2].size());
    }

    @IsTest
    static void firstUnique() {
        Assert.areEqual('a', CollectionKata.firstUniqueChar('salesforce')); // s,a,l,e,s... -> 'a' appears once first
        Assert.isNull(CollectionKata.firstUniqueChar('aabb'));
    }
}
