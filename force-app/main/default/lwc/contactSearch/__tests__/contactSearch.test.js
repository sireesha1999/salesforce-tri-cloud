import { createElement } from 'lwc';
import ContactSearch from 'c/contactSearch';
import searchContacts from '@salesforce/apex/ContactSearchController.searchContacts';

// sfdx-lwc-jest auto-mocks @salesforce/apex imports as wire adapters,
// so tests can push data or errors into the component.
jest.mock(
    '@salesforce/apex/ContactSearchController.searchContacts',
    () => {
        const { createApexTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
        return { default: createApexTestWireAdapter(jest.fn()) };
    },
    { virtual: true }
);

const flush = () => Promise.resolve();

describe('c-contact-search', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    it('renders contacts returned by the wire', async () => {
        const el = createElement('c-contact-search', { is: ContactSearch });
        document.body.appendChild(el);

        searchContacts.emit([{ Id: '003000000000001', Name: 'Priya Patel', Email: 'priya@swift.example', Account: { Name: 'Swift' } }]);
        await flush();

        const table = el.shadowRoot.querySelector('lightning-datatable');
        expect(table).not.toBeNull();
        expect(table.data[0].AccountName).toBe('Swift');
    });

    it('shows the error message when the wire fails', async () => {
        const el = createElement('c-contact-search', { is: ContactSearch });
        document.body.appendChild(el);

        searchContacts.error({ message: 'Insufficient access' });
        await flush();

        const error = el.shadowRoot.querySelector('[data-id="error"]');
        expect(error).not.toBeNull();
    });
});
