/**
 * Scenario A5 — close leads untouched for N days.
 *  - Batchable over a QueryLocator (up to 50 million rows)
 *  - Database.Stateful keeps running totals across execute() chunks
 *  - Partial-success DML so one bad record doesn't fail the chunk
 *  - Schedulable so it can run nightly:  System.schedule('Stale leads', '0 0 2 * * ?', new StaleLeadBatch(90));
 */
public with sharing class StaleLeadBatch implements Database.Batchable<SObject>, Database.Stateful, Schedulable {
    public static final String CLOSED_STATUS = 'Closed - Not Converted';
    private final Integer staleDays;
    @TestVisible
    private Integer closed = 0;
    @TestVisible
    private Integer failed = 0;

    public StaleLeadBatch(Integer staleDays) {
        this.staleDays = staleDays;
    }

    public Database.QueryLocator start(Database.BatchableContext bc) {
        Datetime cutoff = System.now().addDays(-staleDays);
        return Database.getQueryLocator([
            SELECT Id, Status
            FROM Lead
            WHERE IsConverted = FALSE AND Status != :CLOSED_STATUS AND LastModifiedDate < :cutoff
        ]);
    }

    public void execute(Database.BatchableContext bc, List<Lead> scope) {
        for (Lead l : scope) {
            l.Status = CLOSED_STATUS;
        }
        for (Database.SaveResult sr : Database.update(scope, false)) {
            if (sr.isSuccess()) {
                closed++;
            } else {
                failed++;
            }
        }
    }

    public void finish(Database.BatchableContext bc) {
        // Real projects: send a summary email or write a log record.
        System.debug(LoggingLevel.INFO, 'StaleLeadBatch closed=' + closed + ' failed=' + failed);
    }

    public void execute(SchedulableContext sc) {
        Database.executeBatch(new StaleLeadBatch(staleDays), 200);
    }
}
