@IsTest
private class BusinessDaysCalculatorTest {
    @IsTest
    static void countsAcrossWeekend() {
        // Fri 2 Oct 2026 -> Mon 5 Oct 2026 = 1 business day (Monday)
        Assert.areEqual(1, BusinessDaysCalculator.between(Date.newInstance(2026, 10, 2), Date.newInstance(2026, 10, 5)));
    }

    @IsTest
    static void countsFullWeek() {
        // Mon 5 Oct -> Mon 12 Oct = Tue..Fri (4) + Mon (1)
        Assert.areEqual(5, BusinessDaysCalculator.between(Date.newInstance(2026, 10, 5), Date.newInstance(2026, 10, 12)));
    }

    @IsTest
    static void handlesReversedAndNull() {
        Assert.areEqual(-5, BusinessDaysCalculator.between(Date.newInstance(2026, 10, 12), Date.newInstance(2026, 10, 5)));
        Assert.isNull(BusinessDaysCalculator.between(null, Date.today()));
    }

    @IsTest
    static void invocableIsBulkSafe() {
        List<BusinessDaysCalculator.Request> reqs = new List<BusinessDaysCalculator.Request>();
        for (Integer i = 0; i < 200; i++) {
            BusinessDaysCalculator.Request r = new BusinessDaysCalculator.Request();
            r.startDate = Date.newInstance(2026, 10, 5);
            r.endDate = Date.newInstance(2026, 10, 12);
            reqs.add(r);
        }
        List<BusinessDaysCalculator.Result> results = BusinessDaysCalculator.calculate(reqs);
        Assert.areEqual(200, results.size());
        Assert.areEqual(5, results[199].businessDays);
    }
}
