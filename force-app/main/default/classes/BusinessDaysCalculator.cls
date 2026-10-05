/**
 * Scenario A8 — an invocable action for Flow (and Agentforce):
 * number of business days (Mon–Fri) after startDate up to and including endDate.
 * Locale-independent: weekday is derived from a known Monday, not toStartOfWeek().
 */
public with sharing class BusinessDaysCalculator {
    private static final Date KNOWN_MONDAY = Date.newInstance(1900, 1, 1);

    public class Request {
        @InvocableVariable(label='Start date' description='Counting starts the day after this date' required=true)
        public Date startDate;
        @InvocableVariable(label='End date' description='Last day counted (inclusive)' required=true)
        public Date endDate;
    }

    public class Result {
        @InvocableVariable(label='Business days' description='Weekdays between the dates; negative if end is before start')
        public Integer businessDays;
    }

    @InvocableMethod(label='Count business days' description='Counts Monday-to-Friday days between two dates' category='Utilities')
    public static List<Result> calculate(List<Request> requests) {
        List<Result> results = new List<Result>();
        for (Request r : requests) {
            Result res = new Result();
            res.businessDays = between(r.startDate, r.endDate);
            results.add(res);
        }
        return results;
    }

    public static Integer between(Date startDate, Date endDate) {
        if (startDate == null || endDate == null) {
            return null;
        }
        if (endDate < startDate) {
            return -between(endDate, startDate);
        }
        Integer count = 0;
        for (Date d = startDate.addDays(1); d <= endDate; d = d.addDays(1)) {
            if (isWeekday(d)) {
                count++;
            }
        }
        return count;
    }

    public static Boolean isWeekday(Date d) {
        Integer dayIndex = Math.mod(KNOWN_MONDAY.daysBetween(d), 7); // 0 = Monday ... 6 = Sunday
        return dayIndex < 5;
    }
}
