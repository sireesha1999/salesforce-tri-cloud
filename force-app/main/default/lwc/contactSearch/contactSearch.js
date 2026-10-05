/**
 * Scenario L1 — debounced contact search.
 * Shows: @wire with a reactive parameter ($searchTerm), debouncing to avoid a
 * server call per keystroke, loading/empty/error states, and a datatable.
 */
import { LightningElement, wire } from 'lwc';
import searchContacts from '@salesforce/apex/ContactSearchController.searchContacts';

const DELAY_MS = 300;
const COLUMNS = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'Email', fieldName: 'Email', type: 'email' },
    { label: 'Phone', fieldName: 'Phone', type: 'phone' },
    { label: 'Account', fieldName: 'AccountName' }
];

export default class ContactSearch extends LightningElement {
    columns = COLUMNS;
    searchTerm = '';
    contacts = [];
    error;
    isLoading = false;
    delayTimeout;

    @wire(searchContacts, { term: '$searchTerm' })
    wiredContacts({ data, error }) {
        this.isLoading = false;
        if (data) {
            // Flatten the relationship field for the datatable.
            this.contacts = data.map((c) => ({ ...c, AccountName: c.Account ? c.Account.Name : '' }));
            this.error = undefined;
        } else if (error) {
            this.contacts = [];
            this.error = error.body ? error.body.message : 'Unknown error';
        }
    }

    handleChange(event) {
        const value = event.target.value;
        window.clearTimeout(this.delayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayTimeout = setTimeout(() => {
            this.isLoading = value.trim().length >= 2;
            this.searchTerm = value; // changing the reactive param re-invokes the wire
        }, DELAY_MS);
    }

    get hasResults() {
        return this.contacts.length > 0;
    }

    get showEmpty() {
        return !this.isLoading && !this.error && this.searchTerm.trim().length >= 2 && this.contacts.length === 0;
    }

    disconnectedCallback() {
        window.clearTimeout(this.delayTimeout);
    }
}
