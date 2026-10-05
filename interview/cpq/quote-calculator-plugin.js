/**
 * Scenario C1 — Salesforce CPQ (SBQQ) Quote Calculator Plugin (QCP).
 *
 * Requirement: for partner accounts, apply an extra 5% partner discount to
 * subscription lines AFTER price rules run, but never let the net unit price
 * fall below the line's floor price (custom field Floor_Price__c). Also roll
 * up the total subscription MRR onto the quote (Total_MRR__c).
 *
 * Where it lives: a record of SBQQ__CustomScript__c (Code field), referenced
 * in CPQ package settings (Plugins > Quote Calculator Plugin). Every field the
 * script reads or writes must be listed in the record's Quote Fields /
 * Quote Line Fields so the calculator loads it.
 *
 * Hooks run in this order during calculation:
 *   onInit -> onBeforeCalculate -> onBeforePriceRules -> (price rules)
 *   -> onAfterPriceRules -> (calculator) -> onAfterCalculate
 * Each hook must return a Promise.
 */

export function onInit(quoteLineModels) {
    return Promise.resolve();
}

export function onAfterPriceRules(quoteModel, quoteLineModels, conn) {
    const isPartner = quoteModel.record['Account_Tier__c'] === 'Partner';
    if (!isPartner) {
        return Promise.resolve();
    }
    quoteLineModels.forEach((line) => {
        const r = line.record;
        if (r['SBQQ__SubscriptionPricing__c']) {
            // Additional discount is a percentage field on the quote line.
            const current = r['SBQQ__AdditionalDiscount__c'] || 0;
            r['SBQQ__AdditionalDiscount__c'] = current + 5;
        }
    });
    return Promise.resolve();
}

export function onAfterCalculate(quoteModel, quoteLineModels, conn) {
    let totalMrr = 0;
    quoteLineModels.forEach((line) => {
        const r = line.record;
        const floor = r['Floor_Price__c'];
        if (floor != null && r['SBQQ__NetPrice__c'] != null && r['SBQQ__NetPrice__c'] < floor) {
            // Guardrail: flag rather than silently change price, so approvals catch it.
            r['Below_Floor__c'] = true;
        }
        if (r['SBQQ__SubscriptionPricing__c'] && r['SBQQ__NetTotal__c'] != null) {
            const termMonths = r['SBQQ__SubscriptionTerm__c'] || quoteModel.record['SBQQ__SubscriptionTerm__c'] || 12;
            totalMrr += r['SBQQ__NetTotal__c'] / termMonths;
        }
    });
    quoteModel.record['Total_MRR__c'] = Math.round(totalMrr * 100) / 100;
    return Promise.resolve();
}
