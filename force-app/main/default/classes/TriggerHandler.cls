/**
 * Minimal trigger framework: one trigger per object delegates to a handler
 * that overrides only the events it needs. Supports bypassing a handler by
 * name (for data loads and tests).
 *
 * Interview talking points:
 *  - one trigger per object keeps order of execution predictable
 *  - logic lives in testable classes, not in the trigger body
 *  - bypass lets bulk data loads skip automation deliberately
 */
public virtual class TriggerHandler {
    private static final Set<String> BYPASSED = new Set<String>();

    public static void bypass(String handlerName) {
        BYPASSED.add(handlerName);
    }

    public static void clearBypass(String handlerName) {
        BYPASSED.remove(handlerName);
    }

    public static Boolean isBypassed(String handlerName) {
        return BYPASSED.contains(handlerName);
    }

    /** Called from the trigger body. */
    public void run() {
        if (!Trigger.isExecuting || isBypassed(getHandlerName())) {
            return;
        }
        switch on Trigger.operationType {
            when BEFORE_INSERT {
                beforeInsert(Trigger.new);
            }
            when BEFORE_UPDATE {
                beforeUpdate(Trigger.new, Trigger.oldMap);
            }
            when BEFORE_DELETE {
                beforeDelete(Trigger.old);
            }
            when AFTER_INSERT {
                afterInsert(Trigger.new);
            }
            when AFTER_UPDATE {
                afterUpdate(Trigger.new, Trigger.oldMap);
            }
            when AFTER_DELETE {
                afterDelete(Trigger.old);
            }
            when AFTER_UNDELETE {
                afterUndelete(Trigger.new);
            }
        }
    }

    @TestVisible
    protected String getHandlerName() {
        return String.valueOf(this).substringBefore(':');
    }

    protected virtual void beforeInsert(List<SObject> newList) {}
    protected virtual void beforeUpdate(List<SObject> newList, Map<Id, SObject> oldMap) {}
    protected virtual void beforeDelete(List<SObject> oldList) {}
    protected virtual void afterInsert(List<SObject> newList) {}
    protected virtual void afterUpdate(List<SObject> newList, Map<Id, SObject> oldMap) {}
    protected virtual void afterDelete(List<SObject> oldList) {}
    protected virtual void afterUndelete(List<SObject> newList) {}
}
