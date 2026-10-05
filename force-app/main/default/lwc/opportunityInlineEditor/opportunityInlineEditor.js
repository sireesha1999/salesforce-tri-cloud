/**
 * Scenario L2 — inline-edit open opportunities on an Account page.
 * Shows: @api recordId, wired Apex, datatable draft values, saving with
 * Lightning Data Service updateRecord (respects FLS/validation, no Apex DML),
 * partial-failure handling, toast messages and refreshApex.
 */
import { LightningElement, api, wire } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import openOpportunities from '@salesforce/apex/ContactSearchController.openOpportunities';

const COLUMNS = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'Stage', fieldName: 'StageName', editable: true },
    { label: 'Amount', fieldName: 'Amount', type: 'currency', editable: true },
    { label: 'Close date', fieldName: 'CloseDate', type: 'date-local', editable: true }
];

export default class OpportunityInlineEditor extends LightningElement {
    @api recordId;
    columns = COLUMNS;
    draftValues = [];
    wiredResult;
    opportunities = [];
    error;

    @wire(openOpportunities, { accountId: '$recordId' })
    wired(result) {
        this.wiredResult = result; // keep the provisioned value for refreshApex
        if (result.data) {
            this.opportunities = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error.body ? result.error.body.message : 'Could not load opportunities';
        }
    }

    async handleSave(event) {
        const drafts = event.detail.draftValues;
        const results = await Promise.allSettled(drafts.map((d) => updateRecord({ fields: { ...d } })));
        const failed = results.filter((r) => r.status === 'rejected');

        if (failed.length === 0) {
            this.toast('Saved', `${drafts.length} opportunity(ies) updated`, 'success');
            this.draftValues = [];
        } else {
            const reason = failed[0].reason && failed[0].reason.body ? failed[0].reason.body.message : 'Unknown error';
            this.toast('Some changes were not saved', `${failed.length} failed: ${reason}`, 'error');
        }
        await refreshApex(this.wiredResult);
    }

    toast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    get hasRows() {
        return this.opportunities.length > 0;
    }
}
