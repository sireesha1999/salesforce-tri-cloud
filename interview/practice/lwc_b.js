PRACTICE.push(
  {
    id: "LW056",
    track: "lwc",
    level: "Easy",
    topic: "Component communication",
    title: "Opportunity tile with @api inputs",
    task: "Thornbury Logistics wants a reusable pipeline tile. Build child component `opportunityTile` and use it from `opportunityList`.\n- `opportunityTile` exposes public properties `opportunity` (object with Id, Name, Amount, StageName) and `currencyCode` (default `GBP`)\n- Show the Name, the Amount formatted with `lightning-formatted-number` as currency, and the StageName\n- Show a \"Won\" badge only when StageName is `Closed Won` (use a getter)\n- In `opportunityList.html`, render one tile per item in `opportunities` with `for:each` and a proper key",
    starter: {
      "opportunityTile.js": "import { LightningElement } from 'lwc';\n\nexport default class OpportunityTile extends LightningElement {\n    // TODO: public properties and getter\n}\n",
      "opportunityTile.html": "<template>\n    <!-- TODO -->\n</template>\n",
      "opportunityList.html": "<template>\n    <lightning-card title=\"Pipeline\">\n        <!-- TODO: one c-opportunity-tile per opportunity -->\n    </lightning-card>\n</template>\n"
    },
    solution: {
      "opportunityTile.js": "import { LightningElement, api } from 'lwc';\n\nexport default class OpportunityTile extends LightningElement {\n    @api opportunity;\n    @api currencyCode = 'GBP';\n\n    get isWon() {\n        return this.opportunity?.StageName === 'Closed Won';\n    }\n}\n",
      "opportunityTile.html": "<template>\n    <article class=\"slds-box slds-box_x-small slds-m-bottom_x-small\">\n        <p class=\"slds-text-heading_small\">{opportunity.Name}</p>\n        <lightning-formatted-number value={opportunity.Amount} format-style=\"currency\" currency-code={currencyCode}></lightning-formatted-number>\n        <p>{opportunity.StageName}</p>\n        <template lwc:if={isWon}>\n            <lightning-badge label=\"Won\" class=\"slds-theme_success\"></lightning-badge>\n        </template>\n    </article>\n</template>\n",
      "opportunityList.html": "<template>\n    <lightning-card title=\"Pipeline\">\n        <div class=\"slds-p-around_small\">\n            <template for:each={opportunities} for:item=\"opp\">\n                <c-opportunity-tile key={opp.Id} opportunity={opp}></c-opportunity-tile>\n            </template>\n        </div>\n    </lightning-card>\n</template>\n"
    },
    checks: [
      {
        re: /@api\s+opportunity\s*;/i,
        msg: "Exposes @api opportunity",
        file: "opportunityTile.js"
      },
      {
        re: /@api\s+currencyCode\s*=\s*['"]GBP['"]/i,
        msg: "Exposes @api currencyCode defaulting to GBP",
        file: "opportunityTile.js"
      },
      {
        re: /get\s+\w+\s*\(\s*\)\s*\{[\s\S]*Closed Won/i,
        msg: "Uses a getter to detect Closed Won",
        file: "opportunityTile.js"
      },
      {
        re: /<lightning-formatted-number[^>]*format-style=["']currency["']/i,
        msg: "Formats Amount as currency",
        file: "opportunityTile.html"
      },
      {
        re: /for:each=\{\s*opportunities\s*\}[\s\S]*<c-opportunity-tile[^>]*key=\{[^}]+\}[^>]*opportunity=\{|for:each=\{\s*opportunities\s*\}[\s\S]*<c-opportunity-tile[^>]*opportunity=\{[^}]+\}[^>]*key=\{/i,
        msg: "Parent renders a keyed c-opportunity-tile per item and passes opportunity",
        file: "opportunityList.html"
      }
    ],
    forbid: [
      {
        re: /if:true/i,
        msg: "Use lwc:if instead of the legacy if:true directive"
      }
    ],
    hints: [
      "Public properties are declared with the @api decorator imported from lwc.",
      "Child tag names are kebab-case: c-opportunity-tile, and attributes map camelCase properties to kebab-case."
    ],
    ai: "Verify the child never mutates the @api opportunity, the Won badge depends only on StageName === \"Closed Won\", and the parent loop uses a unique key (Id) per tile."
  },
  {
    id: "LW057",
    track: "lwc",
    level: "Easy",
    topic: "Component communication",
    title: "Star rating fires a custom event",
    task: "Halden Broadband runs CSAT surveys after a case closes. Build `ratingPicker` (child) that shows 1–5 star buttons.\n- When a star is clicked, store it as the selected value and dispatch a `ratingchange` CustomEvent with `detail: { value }` (a Number)\n- Highlight stars up to the selected value (variant `brand`)\n- In the parent `csatSurvey.js`, implement `handleRatingChange(event)` that stores `event.detail.value` in `score`\n- Event name must be lowercase with no hyphens",
    starter: {
      "ratingPicker.js": "import { LightningElement } from 'lwc';\n\nexport default class RatingPicker extends LightningElement {\n    selected = 0;\n\n    get stars() {\n        return [1, 2, 3, 4, 5].map((n) => ({ value: n, variant: n <= this.selected ? 'brand' : 'border' }));\n    }\n\n    handleClick(event) {\n        // TODO\n    }\n}\n",
      "ratingPicker.html": "<template>\n    <template for:each={stars} for:item=\"star\">\n        <lightning-button-icon key={star.value} icon-name=\"utility:favorite\" variant={star.variant}\n            data-value={star.value} onclick={handleClick} alternative-text=\"Rate\"></lightning-button-icon>\n    </template>\n</template>\n",
      "csatSurvey.js": "import { LightningElement } from 'lwc';\n\nexport default class CsatSurvey extends LightningElement {\n    score;\n\n    handleRatingChange(event) {\n        // TODO\n    }\n}\n"
    },
    solution: {
      "ratingPicker.js": "import { LightningElement } from 'lwc';\n\nexport default class RatingPicker extends LightningElement {\n    selected = 0;\n\n    get stars() {\n        return [1, 2, 3, 4, 5].map((n) => ({ value: n, variant: n <= this.selected ? 'brand' : 'border' }));\n    }\n\n    handleClick(event) {\n        const value = Number(event.currentTarget.dataset.value);\n        this.selected = value;\n        this.dispatchEvent(new CustomEvent('ratingchange', { detail: { value } }));\n    }\n}\n",
      "ratingPicker.html": "<template>\n    <template for:each={stars} for:item=\"star\">\n        <lightning-button-icon key={star.value} icon-name=\"utility:favorite\" variant={star.variant}\n            data-value={star.value} onclick={handleClick} alternative-text=\"Rate\"></lightning-button-icon>\n    </template>\n</template>\n",
      "csatSurvey.js": "import { LightningElement } from 'lwc';\n\nexport default class CsatSurvey extends LightningElement {\n    score;\n\n    handleRatingChange(event) {\n        this.score = event.detail.value;\n    }\n}\n"
    },
    checks: [
      {
        re: /new\s+CustomEvent\(\s*['"]ratingchange['"]/,
        msg: "Creates a CustomEvent named ratingchange",
        file: "ratingPicker.js"
      },
      {
        re: /detail\s*:\s*\{\s*value/i,
        msg: "Passes the value inside detail",
        file: "ratingPicker.js"
      },
      {
        re: /this\.dispatchEvent\(/,
        msg: "Dispatches the event from the component",
        file: "ratingPicker.js"
      },
      {
        re: /dataset\.value/i,
        msg: "Reads the clicked star from data-value",
        file: "ratingPicker.js"
      },
      {
        re: /this\.score\s*=\s*event\.detail\.value/i,
        msg: "Parent reads event.detail.value",
        file: "csatSurvey.js"
      }
    ],
    forbid: [
      {
        re: /CustomEvent\(\s*['"][^'"]*[A-Z-][^'"]*['"]/,
        msg: "Event names must be lowercase with no hyphens"
      }
    ],
    hints: [
      "Use event.currentTarget.dataset.value — it is a string, so convert it.",
      "this.dispatchEvent(new CustomEvent(name, { detail: {...} }))."
    ],
    ai: "Check the value is converted to a Number, the internal selected state updates (so stars re-render), and the parent only reads event.detail rather than reaching into the child."
  },
  {
    id: "LW058",
    track: "lwc",
    level: "Medium",
    topic: "Component communication",
    title: "Normalise an @api value with a setter",
    task: "Ardent Water Services passes Case priority to a `priorityBadge` component from several places with inconsistent casing (\"HIGH\", \" medium \", null).\n- Expose `priority` as an @api getter/setter pair; the setter trims and lower-cases the value into a private field (null → empty string)\n- Getter `badgeClass` returns `slds-theme_error` for high, `slds-theme_warning` for medium, `slds-theme_success` for low, otherwise `slds-theme_shade`\n- Getter `label` returns the value capitalised (e.g. \"High\"), or \"None\" when empty\n- Render a `lightning-badge` using both getters",
    starter: {
      "priorityBadge.js": "import { LightningElement, api } from 'lwc';\n\nexport default class PriorityBadge extends LightningElement {\n    // TODO: @api priority getter/setter, badgeClass, label\n}\n",
      "priorityBadge.html": "<template>\n    <!-- TODO -->\n</template>\n"
    },
    solution: {
      "priorityBadge.js": "import { LightningElement, api } from 'lwc';\n\nconst CLASSES = {\n    high: 'slds-theme_error',\n    medium: 'slds-theme_warning',\n    low: 'slds-theme_success'\n};\n\nexport default class PriorityBadge extends LightningElement {\n    _priority = '';\n\n    @api\n    get priority() {\n        return this._priority;\n    }\n    set priority(value) {\n        this._priority = (value ?? '').toString().trim().toLowerCase();\n    }\n\n    get badgeClass() {\n        return CLASSES[this._priority] || 'slds-theme_shade';\n    }\n\n    get label() {\n        if (!this._priority) return 'None';\n        return this._priority.charAt(0).toUpperCase() + this._priority.slice(1);\n    }\n}\n",
      "priorityBadge.html": "<template>\n    <lightning-badge label={label} class={badgeClass}></lightning-badge>\n</template>\n"
    },
    checks: [
      {
        re: /@api\s+get\s+priority\s*\(\s*\)/i,
        msg: "Declares @api get priority()",
        file: "priorityBadge.js"
      },
      {
        re: /set\s+priority\s*\(\s*\w+\s*\)/i,
        msg: "Declares set priority(value)",
        file: "priorityBadge.js"
      },
      {
        re: /trim\(\)[\s\S]*toLowerCase\(\)|toLowerCase\(\)[\s\S]*trim\(\)/i,
        msg: "Trims and lower-cases the value",
        file: "priorityBadge.js"
      },
      {
        re: /slds-theme_error[\s\S]*slds-theme_warning|slds-theme_warning[\s\S]*slds-theme_error/i,
        msg: "Maps priorities to SLDS theme classes",
        file: "priorityBadge.js"
      },
      {
        re: /<lightning-badge[^>]*class=\{\s*badgeClass\s*\}|<lightning-badge[^>]*label=\{\s*label\s*\}/i,
        msg: "Renders a lightning-badge bound to the getters",
        file: "priorityBadge.html"
      }
    ],
    forbid: [
      {
        re: /this\.priority\s*=(?!=)/,
        msg: "Don't reassign the public property inside the component — store into a private field"
      }
    ],
    hints: [
      "Put @api on the getter only; the setter shares the same name.",
      "Store the normalised value in a private field like _priority."
    ],
    ai: "Verify null/undefined input does not throw, unknown values fall back to slds-theme_shade and \"None\"/capitalised label, and the component never assigns to its own @api property."
  },
  {
    id: "LW059",
    track: "lwc",
    level: "Medium",
    topic: "Component communication",
    title: "Bubbling remove event in a quote editor",
    task: "Kestrel Telecom's quote editor renders many `c-quote-line-item` children. Rather than wiring a handler on every child, the parent listens once on a wrapper div.\n- In `quoteLineItem.js`, `handleRemove()` dispatches `lineremove` with `detail: { lineId: this.lineId }`, `bubbles: true` and `composed: false` (set both explicitly — it must not escape the parent's shadow tree)\n- In `quoteEditor.html`, put `onlineremove={handleLineRemove}` on the `<div>` that wraps the loop\n- In `quoteEditor.js`, remove the line immutably from `lines` (reassign a new array)",
    starter: {
      "quoteLineItem.js": "import { LightningElement, api } from 'lwc';\n\nexport default class QuoteLineItem extends LightningElement {\n    @api lineId;\n    @api productName;\n\n    handleRemove() {\n        // TODO\n    }\n}\n",
      "quoteEditor.js": "import { LightningElement } from 'lwc';\n\nexport default class QuoteEditor extends LightningElement {\n    lines = [\n        { id: 'L1', productName: 'Fibre 900' },\n        { id: 'L2', productName: 'Static IP' }\n    ];\n\n    handleLineRemove(event) {\n        // TODO\n    }\n}\n",
      "quoteEditor.html": "<template>\n    <!-- TODO: wrapper div with the listener -->\n    <template for:each={lines} for:item=\"line\">\n        <c-quote-line-item key={line.id} line-id={line.id} product-name={line.productName}></c-quote-line-item>\n    </template>\n</template>\n"
    },
    solution: {
      "quoteLineItem.js": "import { LightningElement, api } from 'lwc';\n\nexport default class QuoteLineItem extends LightningElement {\n    @api lineId;\n    @api productName;\n\n    handleRemove() {\n        this.dispatchEvent(\n            new CustomEvent('lineremove', {\n                detail: { lineId: this.lineId },\n                bubbles: true,\n                composed: false\n            })\n        );\n    }\n}\n",
      "quoteEditor.js": "import { LightningElement } from 'lwc';\n\nexport default class QuoteEditor extends LightningElement {\n    lines = [\n        { id: 'L1', productName: 'Fibre 900' },\n        { id: 'L2', productName: 'Static IP' }\n    ];\n\n    handleLineRemove(event) {\n        const { lineId } = event.detail;\n        this.lines = this.lines.filter((line) => line.id !== lineId);\n    }\n}\n",
      "quoteEditor.html": "<template>\n    <div onlineremove={handleLineRemove}>\n        <template for:each={lines} for:item=\"line\">\n            <c-quote-line-item key={line.id} line-id={line.id} product-name={line.productName}></c-quote-line-item>\n        </template>\n    </div>\n</template>\n"
    },
    checks: [
      {
        re: /new\s+CustomEvent\(\s*['"]lineremove['"]/,
        msg: "Dispatches a lineremove CustomEvent",
        file: "quoteLineItem.js"
      },
      {
        re: /bubbles\s*:\s*true/,
        msg: "Sets bubbles: true",
        file: "quoteLineItem.js"
      },
      {
        re: /composed\s*:\s*false/,
        msg: "Sets composed: false",
        file: "quoteLineItem.js"
      },
      {
        re: /<div[^>]*onlineremove=\{\s*handleLineRemove\s*\}/i,
        msg: "Listens once on the wrapper div",
        file: "quoteEditor.html"
      },
      {
        re: /this\.lines\s*=\s*this\.lines\.filter\(|this\.lines\s*=\s*\[\s*\.\.\./i,
        msg: "Reassigns a new lines array",
        file: "quoteEditor.js"
      }
    ],
    forbid: [
      {
        re: /composed\s*:\s*true/,
        msg: "composed: true would leak the event past the parent's shadow boundary"
      },
      {
        re: /\.splice\(/,
        msg: "Avoid mutating the array in place with splice"
      }
    ],
    hints: [
      "With bubbles: true the event travels up the parent's template DOM to the div.",
      "filter() returns a new array — assign it back to this.lines."
    ],
    ai: "Confirm the event uses bubbles:true/composed:false, the parent reads event.detail.lineId (not event.target internals), and removal is immutable so the template re-renders."
  },
  {
    id: "LW060",
    track: "lwc",
    level: "Medium",
    topic: "Component communication",
    title: "Publish an account on a message channel",
    task: "Brackley Engineering's service console has unrelated components on one Lightning page. Build `accountSelector`.\n- Show a `lightning-record-picker` for Account\n- On change, publish `{ recordId }` on the `AccountSelected__c` Lightning Message Channel (already deployed, see the meta file)\n- Get the MessageContext with `@wire(MessageContext)`\n- Do not publish when the picker is cleared (recordId null)",
    starter: {
      "accountSelector.js": "import { LightningElement } from 'lwc';\n\nexport default class AccountSelector extends LightningElement {\n    handleChange(event) {\n        // TODO\n    }\n}\n",
      "accountSelector.html": "<template>\n    <lightning-card title=\"Select account\">\n        <!-- TODO -->\n    </lightning-card>\n</template>\n",
      "AccountSelected.messageChannel-meta.xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<LightningMessageChannel xmlns=\"http://soap.sforce.com/2006/04/metadata\">\n    <masterLabel>AccountSelected</masterLabel>\n    <isExposed>true</isExposed>\n    <lightningMessageFields>\n        <fieldName>recordId</fieldName>\n    </lightningMessageFields>\n</LightningMessageChannel>\n"
    },
    solution: {
      "accountSelector.js": "import { LightningElement, wire } from 'lwc';\nimport { publish, MessageContext } from 'lightning/messageService';\nimport ACCOUNT_SELECTED from '@salesforce/messageChannel/AccountSelected__c';\n\nexport default class AccountSelector extends LightningElement {\n    @wire(MessageContext)\n    messageContext;\n\n    handleChange(event) {\n        const recordId = event.detail.recordId;\n        if (!recordId) return;\n        publish(this.messageContext, ACCOUNT_SELECTED, { recordId });\n    }\n}\n",
      "accountSelector.html": "<template>\n    <lightning-card title=\"Select account\">\n        <div class=\"slds-p-around_small\">\n            <lightning-record-picker label=\"Account\" object-api-name=\"Account\" onchange={handleChange}></lightning-record-picker>\n        </div>\n    </lightning-card>\n</template>\n",
      "AccountSelected.messageChannel-meta.xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<LightningMessageChannel xmlns=\"http://soap.sforce.com/2006/04/metadata\">\n    <masterLabel>AccountSelected</masterLabel>\n    <isExposed>true</isExposed>\n    <lightningMessageFields>\n        <fieldName>recordId</fieldName>\n    </lightningMessageFields>\n</LightningMessageChannel>\n"
    },
    checks: [
      {
        re: /import[^;]*\bpublish\b[^;]*from\s*['"]lightning\/messageService['"]/,
        msg: "Imports publish from lightning/messageService",
        file: "accountSelector.js"
      },
      {
        re: /@wire\(\s*MessageContext\s*\)/,
        msg: "Wires MessageContext",
        file: "accountSelector.js"
      },
      {
        re: /from\s*['"]@salesforce\/messageChannel\/AccountSelected__c['"]/,
        msg: "Imports the AccountSelected__c channel",
        file: "accountSelector.js"
      },
      {
        re: /publish\(\s*this\.\w+\s*,\s*\w+\s*,\s*\{[^}]*recordId/,
        msg: "Publishes { recordId } with the message context",
        file: "accountSelector.js"
      },
      {
        re: /<lightning-record-picker[^>]*object-api-name=["']Account["']/i,
        msg: "Uses a record picker for Account",
        file: "accountSelector.html"
      }
    ],
    forbid: [
      {
        re: /fireEvent|pubsub/i,
        msg: "Use Lightning Message Service, not the legacy pubsub module"
      }
    ],
    hints: [
      "The channel is imported from @salesforce/messageChannel/<Name>__c.",
      "publish(messageContext, channel, payload)."
    ],
    ai: "Verify the cleared-picker case does not publish, the payload shape is exactly { recordId }, and MessageContext comes from @wire rather than being constructed manually."
  },
  {
    id: "LW061",
    track: "lwc",
    level: "Hard",
    topic: "Component communication",
    title: "Subscribe safely to a message channel",
    task: "Brackley Engineering also needs `accountInsightsPanel`, placed in a utility bar, that reacts to `AccountSelected__c` messages from any tab.\n- Subscribe in `connectedCallback` using `APPLICATION_SCOPE`; never subscribe twice\n- Store `message.recordId` in `accountId`\n- Use `@wire(getRecord)` with a reactive `$accountId` to load Account Name, Industry and AnnualRevenue\n- Unsubscribe in `disconnectedCallback` and clear the subscription reference\n- Show \"Select an account\" until an id arrives",
    starter: {
      "accountInsightsPanel.js": "import { LightningElement, wire } from 'lwc';\nimport { getRecord, getFieldValue } from 'lightning/uiRecordApi';\nimport NAME from '@salesforce/schema/Account.Name';\nimport INDUSTRY from '@salesforce/schema/Account.Industry';\nimport REVENUE from '@salesforce/schema/Account.AnnualRevenue';\n\nexport default class AccountInsightsPanel extends LightningElement {\n    accountId;\n    // TODO: message context, subscription, wire, lifecycle hooks\n}\n",
      "accountInsightsPanel.html": "<template>\n    <!-- TODO -->\n</template>\n"
    },
    solution: {
      "accountInsightsPanel.js": "import { LightningElement, wire } from 'lwc';\nimport { getRecord, getFieldValue } from 'lightning/uiRecordApi';\nimport { subscribe, unsubscribe, MessageContext, APPLICATION_SCOPE } from 'lightning/messageService';\nimport ACCOUNT_SELECTED from '@salesforce/messageChannel/AccountSelected__c';\nimport NAME from '@salesforce/schema/Account.Name';\nimport INDUSTRY from '@salesforce/schema/Account.Industry';\nimport REVENUE from '@salesforce/schema/Account.AnnualRevenue';\n\nexport default class AccountInsightsPanel extends LightningElement {\n    accountId;\n    subscription = null;\n\n    @wire(MessageContext)\n    messageContext;\n\n    @wire(getRecord, { recordId: '$accountId', fields: [NAME, INDUSTRY, REVENUE] })\n    account;\n\n    connectedCallback() {\n        if (this.subscription) return;\n        this.subscription = subscribe(\n            this.messageContext,\n            ACCOUNT_SELECTED,\n            (message) => {\n                this.accountId = message.recordId;\n            },\n            { scope: APPLICATION_SCOPE }\n        );\n    }\n\n    disconnectedCallback() {\n        unsubscribe(this.subscription);\n        this.subscription = null;\n    }\n\n    get name() {\n        return getFieldValue(this.account.data, NAME);\n    }\n    get industry() {\n        return getFieldValue(this.account.data, INDUSTRY);\n    }\n    get revenue() {\n        return getFieldValue(this.account.data, REVENUE);\n    }\n}\n",
      "accountInsightsPanel.html": "<template>\n    <lightning-card title=\"Account insights\">\n        <div class=\"slds-p-around_small\">\n            <template lwc:if={account.data}>\n                <p class=\"slds-text-heading_small\">{name}</p>\n                <p>{industry}</p>\n                <lightning-formatted-number value={revenue} format-style=\"currency\" currency-code=\"GBP\"></lightning-formatted-number>\n            </template>\n            <template lwc:else>\n                <p>Select an account</p>\n            </template>\n        </div>\n    </lightning-card>\n</template>\n"
    },
    checks: [
      {
        re: /subscribe\(\s*this\.\w+\s*,\s*\w+\s*,[\s\S]*APPLICATION_SCOPE/,
        msg: "Subscribes with APPLICATION_SCOPE",
        file: "accountInsightsPanel.js"
      },
      {
        re: /connectedCallback\s*\(\s*\)\s*\{[\s\S]*subscribe\(/,
        msg: "Subscribes in connectedCallback",
        file: "accountInsightsPanel.js"
      },
      {
        re: /disconnectedCallback\s*\(\s*\)\s*\{[\s\S]*unsubscribe\(/,
        msg: "Unsubscribes in disconnectedCallback",
        file: "accountInsightsPanel.js"
      },
      {
        re: /recordId\s*:\s*['"]\$accountId['"]/,
        msg: "Wires getRecord with reactive $accountId",
        file: "accountInsightsPanel.js"
      },
      {
        re: /if\s*\(\s*!?\s*this\.subscription/,
        msg: "Guards against subscribing twice",
        file: "accountInsightsPanel.js"
      }
    ],
    forbid: [
      {
        re: /setInterval\(/,
        msg: "No polling — rely on LMS messages"
      }
    ],
    hints: [
      "subscribe() takes an options object as the 4th argument: { scope: APPLICATION_SCOPE }.",
      "Keep the returned subscription so you can unsubscribe and null it out."
    ],
    ai: "Check the subscribe guard, cleanup in disconnectedCallback, the reactive wire (no imperative getRecord calls), and the placeholder before any message arrives."
  },
  {
    id: "LW062",
    track: "lwc",
    level: "Medium",
    topic: "Component communication",
    title: "Basket total from child quantity events",
    task: "Penrose Office Supplies has a B2B basket. Child `basketLine` dispatches `quantitychange` with `detail: { lineId, quantity }` (quantity as a Number, min 0). Parent `basketSummary` keeps `lines` (id, name, unitPrice, quantity).\n- In the child, read the lightning-input value, clamp negatives to 0 and dispatch the event\n- In the parent, update the matching line immutably using `map` and spread\n- Add a `total` getter (sum of unitPrice × quantity) shown with `lightning-formatted-number` in GBP",
    starter: {
      "basketLine.js": "import { LightningElement, api } from 'lwc';\n\nexport default class BasketLine extends LightningElement {\n    @api line;\n\n    handleQuantity(event) {\n        // TODO\n    }\n}\n",
      "basketSummary.js": "import { LightningElement } from 'lwc';\n\nexport default class BasketSummary extends LightningElement {\n    lines = [\n        { id: 'A4', name: 'A4 paper (box)', unitPrice: 24.5, quantity: 2 },\n        { id: 'TN', name: 'Toner cartridge', unitPrice: 61, quantity: 1 }\n    ];\n\n    handleQuantityChange(event) {\n        // TODO\n    }\n\n    // TODO: total getter\n}\n",
      "basketSummary.html": "<template>\n    <template for:each={lines} for:item=\"line\">\n        <c-basket-line key={line.id} line={line} onquantitychange={handleQuantityChange}></c-basket-line>\n    </template>\n    <!-- TODO: total -->\n</template>\n"
    },
    solution: {
      "basketLine.js": "import { LightningElement, api } from 'lwc';\n\nexport default class BasketLine extends LightningElement {\n    @api line;\n\n    handleQuantity(event) {\n        const quantity = Math.max(0, Number(event.target.value) || 0);\n        this.dispatchEvent(\n            new CustomEvent('quantitychange', { detail: { lineId: this.line.id, quantity } })\n        );\n    }\n}\n",
      "basketSummary.js": "import { LightningElement } from 'lwc';\n\nexport default class BasketSummary extends LightningElement {\n    lines = [\n        { id: 'A4', name: 'A4 paper (box)', unitPrice: 24.5, quantity: 2 },\n        { id: 'TN', name: 'Toner cartridge', unitPrice: 61, quantity: 1 }\n    ];\n\n    handleQuantityChange(event) {\n        const { lineId, quantity } = event.detail;\n        this.lines = this.lines.map((line) => (line.id === lineId ? { ...line, quantity } : line));\n    }\n\n    get total() {\n        return this.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);\n    }\n}\n",
      "basketSummary.html": "<template>\n    <template for:each={lines} for:item=\"line\">\n        <c-basket-line key={line.id} line={line} onquantitychange={handleQuantityChange}></c-basket-line>\n    </template>\n    <p class=\"slds-text-heading_small\">\n        Total: <lightning-formatted-number value={total} format-style=\"currency\" currency-code=\"GBP\"></lightning-formatted-number>\n    </p>\n</template>\n"
    },
    checks: [
      {
        re: /new\s+CustomEvent\(\s*['"]quantitychange['"][\s\S]*detail\s*:\s*\{[^}]*(lineId[^}]*quantity|quantity[^}]*lineId)/,
        msg: "Child dispatches quantitychange with lineId and quantity",
        file: "basketLine.js"
      },
      {
        re: /Math\.max\(\s*0|<\s*0/,
        msg: "Clamps negative quantities to 0",
        file: "basketLine.js"
      },
      {
        re: /this\.lines\s*=\s*this\.lines\.map\(/,
        msg: "Updates lines immutably with map",
        file: "basketSummary.js"
      },
      {
        re: /\.\.\.\s*\w+/,
        msg: "Copies the line object with spread",
        file: "basketSummary.js"
      },
      {
        re: /get\s+total\s*\(\s*\)/,
        msg: "Adds a total getter",
        file: "basketSummary.js"
      },
      {
        re: /value=\{\s*total\s*\}/,
        msg: "Displays the total",
        file: "basketSummary.html"
      }
    ],
    forbid: [
      {
        re: /\bline\.quantity\s*=(?!=)|this\.line\.\w+\s*=(?!=)/,
        msg: "Don't mutate line objects in place"
      }
    ],
    hints: [
      "The child should not change the @api line object — it only reports the new quantity.",
      "map over lines and return { ...line, quantity } for the matching id."
    ],
    ai: "Verify the child never mutates @api line, non-numeric/negative input is clamped to 0, and the total is derived (getter) rather than stored and manually kept in sync."
  },
  {
    id: "LW063",
    track: "lwc",
    level: "Easy",
    topic: "Data tables",
    title: "Open cases datatable via @wire Apex",
    task: "Calder Housing Association's repairs desk wants a list of open cases. Build `openCasesTable` with an Apex controller `CaseController`.\n- Apex: `@AuraEnabled(cacheable=true) public static List<Case> getOpenCases()` returning Id, CaseNumber, Subject, Priority, Status for open cases, newest first, max 200, `WITH USER_MODE`\n- LWC: wire the method and show a `lightning-datatable` with columns Case Number, Subject, Priority, Status\n- `key-field` must be Id; show an error message when the wire returns an error",
    starter: {
      "openCasesTable.js": "import { LightningElement } from 'lwc';\n\nexport default class OpenCasesTable extends LightningElement {\n    // TODO: columns and wire\n}\n",
      "openCasesTable.html": "<template>\n    <lightning-card title=\"Open repairs\">\n        <!-- TODO -->\n    </lightning-card>\n</template>\n",
      "CaseController.cls": "public with sharing class CaseController {\n    // TODO: getOpenCases\n}\n"
    },
    solution: {
      "openCasesTable.js": "import { LightningElement, wire } from 'lwc';\nimport getOpenCases from '@salesforce/apex/CaseController.getOpenCases';\n\nconst COLUMNS = [\n    { label: 'Case Number', fieldName: 'CaseNumber' },\n    { label: 'Subject', fieldName: 'Subject' },\n    { label: 'Priority', fieldName: 'Priority' },\n    { label: 'Status', fieldName: 'Status' }\n];\n\nexport default class OpenCasesTable extends LightningElement {\n    columns = COLUMNS;\n\n    @wire(getOpenCases)\n    cases;\n}\n",
      "openCasesTable.html": "<template>\n    <lightning-card title=\"Open repairs\">\n        <template lwc:if={cases.data}>\n            <lightning-datatable key-field=\"Id\" data={cases.data} columns={columns} hide-checkbox-column></lightning-datatable>\n        </template>\n        <template lwc:elseif={cases.error}>\n            <p class=\"slds-p-around_small slds-text-color_error\">Unable to load cases.</p>\n        </template>\n    </lightning-card>\n</template>\n",
      "CaseController.cls": "public with sharing class CaseController {\n    @AuraEnabled(cacheable=true)\n    public static List<Case> getOpenCases() {\n        return [\n            SELECT Id, CaseNumber, Subject, Priority, Status\n            FROM Case\n            WHERE IsClosed = false\n            WITH USER_MODE\n            ORDER BY CreatedDate DESC\n            LIMIT 200\n        ];\n    }\n}\n"
    },
    checks: [
      {
        re: /@AuraEnabled\(\s*cacheable\s*=\s*true\s*\)\s*public\s+static\s+List<\s*Case\s*>\s+getOpenCases\s*\(\s*\)/i,
        msg: "Apex method is cacheable with the required signature",
        file: "CaseController.cls"
      },
      {
        re: /WITH\s+USER_MODE/i,
        msg: "Query runs WITH USER_MODE",
        file: "CaseController.cls"
      },
      {
        re: /IsClosed\s*=\s*false/i,
        msg: "Filters to open cases",
        file: "CaseController.cls"
      },
      {
        re: /@wire\(\s*getOpenCases\s*\)/,
        msg: "Wires getOpenCases",
        file: "openCasesTable.js"
      },
      {
        re: /<lightning-datatable[^>]*key-field=["']Id["']/i,
        msg: "Datatable uses key-field=\"Id\"",
        file: "openCasesTable.html"
      },
      {
        re: /\.error\}/i,
        msg: "Handles the wire error",
        file: "openCasesTable.html"
      }
    ],
    forbid: [
      {
        re: /connectedCallback[\s\S]*getOpenCases\(/,
        msg: "Use @wire for this read-only list"
      }
    ],
    hints: [
      "Import Apex with @salesforce/apex/Class.method.",
      "A wired property has .data and .error."
    ],
    ai: "Check the SOQL orders by CreatedDate DESC with LIMIT 200, columns use fieldName matching the queried fields, and error state renders without breaking the template."
  },
  {
    id: "LW064",
    track: "lwc",
    level: "Easy",
    topic: "Data tables",
    title: "Typed columns for a renewals table",
    task: "Lindqvist Software UK tracks renewals. `renewalsTable` already wires `getRenewals` (Opportunity Id, Name, Amount, CloseDate). Configure the datatable properly.\n- Name column: type `url` linking to the record (`/` + Id) with the Name as the label\n- Amount: type `currency` with `currencyCode: 'GBP'`\n- CloseDate: type `date`\n- Build the rows with `.map()` in a getter or wire handler, adding `recordUrl`; never mutate wired data",
    starter: {
      "renewalsTable.js": "import { LightningElement, wire } from 'lwc';\nimport getRenewals from '@salesforce/apex/RenewalController.getRenewals';\n\nexport default class RenewalsTable extends LightningElement {\n    columns = []; // TODO\n\n    @wire(getRenewals)\n    renewals;\n\n    get rows() {\n        // TODO\n        return [];\n    }\n}\n",
      "renewalsTable.html": "<template>\n    <lightning-datatable key-field=\"Id\" data={rows} columns={columns} hide-checkbox-column></lightning-datatable>\n</template>\n"
    },
    solution: {
      "renewalsTable.js": "import { LightningElement, wire } from 'lwc';\nimport getRenewals from '@salesforce/apex/RenewalController.getRenewals';\n\nexport default class RenewalsTable extends LightningElement {\n    columns = [\n        {\n            label: 'Opportunity',\n            fieldName: 'recordUrl',\n            type: 'url',\n            typeAttributes: { label: { fieldName: 'Name' }, target: '_self' }\n        },\n        { label: 'Amount', fieldName: 'Amount', type: 'currency', typeAttributes: { currencyCode: 'GBP' } },\n        { label: 'Close Date', fieldName: 'CloseDate', type: 'date' }\n    ];\n\n    @wire(getRenewals)\n    renewals;\n\n    get rows() {\n        return (this.renewals?.data || []).map((opp) => ({ ...opp, recordUrl: '/' + opp.Id }));\n    }\n}\n",
      "renewalsTable.html": "<template>\n    <lightning-datatable key-field=\"Id\" data={rows} columns={columns} hide-checkbox-column></lightning-datatable>\n</template>\n"
    },
    checks: [
      {
        re: /type\s*:\s*['"]url['"]/,
        msg: "Name column uses type url",
        file: "renewalsTable.js"
      },
      {
        re: /label\s*:\s*\{\s*fieldName\s*:\s*['"]Name['"]\s*\}/,
        msg: "URL label comes from the Name field",
        file: "renewalsTable.js"
      },
      {
        re: /type\s*:\s*['"]currency['"][\s\S]*currencyCode\s*:\s*['"]GBP['"]/,
        msg: "Amount is currency in GBP",
        file: "renewalsTable.js"
      },
      {
        re: /type\s*:\s*['"]date['"]/,
        msg: "CloseDate uses type date",
        file: "renewalsTable.js"
      },
      {
        re: /\.map\(\s*\(?\s*\w+\s*\)?\s*=>\s*\(\s*\{\s*\.\.\./,
        msg: "Builds new row objects with map and spread",
        file: "renewalsTable.js"
      }
    ],
    forbid: [
      {
        re: /\.data\.forEach\([^)]*=>\s*\{?[^}]*\.recordUrl\s*=/,
        msg: "Wired data is read-only — don't mutate it"
      }
    ],
    hints: [
      "A url column shows fieldName as the href and typeAttributes.label for the text.",
      "Wired results are frozen; copy each record with { ...record }."
    ],
    ai: "Verify rows handle undefined data (before the wire resolves), the url uses the record Id, and wired records are copied rather than mutated."
  },
  {
    id: "LW065",
    track: "lwc",
    level: "Medium",
    topic: "Data tables",
    title: "Client-side sorting in a lead table",
    task: "Marlow Solar's inside sales team wants to sort leads. `leadTable` receives `@api leads` (Name, Company, Rating, CreatedDate).\n- Mark Name, Company and CreatedDate columns `sortable: true`\n- Handle `onsort`: store `sortedBy` and `sortDirection` from `event.detail`, and sort a **copy** of the data\n- Nulls always sort last; strings compare case-insensitively\n- Bind `sorted-by` and `sorted-direction` on the datatable",
    starter: {
      "leadTable.js": "import { LightningElement, api } from 'lwc';\n\nexport default class LeadTable extends LightningElement {\n    @api leads = [];\n    columns = [\n        { label: 'Name', fieldName: 'Name' },\n        { label: 'Company', fieldName: 'Company' },\n        { label: 'Rating', fieldName: 'Rating' },\n        { label: 'Created', fieldName: 'CreatedDate', type: 'date' }\n    ];\n    sortedBy;\n    sortDirection = 'asc';\n\n    // TODO: rows getter + handleSort\n}\n",
      "leadTable.html": "<template>\n    <lightning-datatable key-field=\"Id\" data={leads} columns={columns}></lightning-datatable>\n</template>\n"
    },
    solution: {
      "leadTable.js": "import { LightningElement, api } from 'lwc';\n\nexport default class LeadTable extends LightningElement {\n    @api leads = [];\n    columns = [\n        { label: 'Name', fieldName: 'Name', sortable: true },\n        { label: 'Company', fieldName: 'Company', sortable: true },\n        { label: 'Rating', fieldName: 'Rating' },\n        { label: 'Created', fieldName: 'CreatedDate', type: 'date', sortable: true }\n    ];\n    sortedBy;\n    sortDirection = 'asc';\n\n    handleSort(event) {\n        const { fieldName, sortDirection } = event.detail;\n        this.sortedBy = fieldName;\n        this.sortDirection = sortDirection;\n    }\n\n    get rows() {\n        const data = [...(this.leads || [])];\n        if (!this.sortedBy) return data;\n        const field = this.sortedBy;\n        const dir = this.sortDirection === 'asc' ? 1 : -1;\n        return data.sort((a, b) => {\n            const x = a[field];\n            const y = b[field];\n            if (x == null && y == null) return 0;\n            if (x == null) return 1;\n            if (y == null) return -1;\n            if (typeof x === 'string' && typeof y === 'string') {\n                return x.localeCompare(y, undefined, { sensitivity: 'base' }) * dir;\n            }\n            return (x > y ? 1 : x < y ? -1 : 0) * dir;\n        });\n    }\n}\n",
      "leadTable.html": "<template>\n    <lightning-datatable key-field=\"Id\" data={rows} columns={columns}\n        sorted-by={sortedBy} sorted-direction={sortDirection} onsort={handleSort}></lightning-datatable>\n</template>\n"
    },
    checks: [
      {
        re: /sortable\s*:\s*true/,
        msg: "Marks columns sortable",
        file: "leadTable.js"
      },
      {
        re: /onsort=\{\s*\w+\s*\}/i,
        msg: "Handles onsort",
        file: "leadTable.html"
      },
      {
        re: /sorted-by=\{[^}]+\}[\s\S]*sorted-direction=\{|sorted-direction=\{[^}]+\}[\s\S]*sorted-by=\{/i,
        msg: "Binds sorted-by and sorted-direction",
        file: "leadTable.html"
      },
      {
        re: /event\.detail/,
        msg: "Reads fieldName/sortDirection from event.detail",
        file: "leadTable.js"
      },
      {
        re: /\[\s*\.\.\.\s*\(?\s*this\.\w+[\s\S]*\.sort\(|\.slice\(\s*\)[\s\S]*\.sort\(/,
        msg: "Sorts a copy of the data",
        file: "leadTable.js"
      }
    ],
    forbid: [
      {
        re: /this\.leads\.sort\(/,
        msg: "Don't sort the @api array in place"
      }
    ],
    hints: [
      "The @api array is owned by the parent — copy it with [...arr] before sorting.",
      "Return 1 for a null left value so nulls end up last regardless of direction."
    ],
    ai: "Check nulls sort last in both directions, string comparison is case-insensitive, and the @api leads array is never mutated."
  },
  {
    id: "LW066",
    track: "lwc",
    level: "Medium",
    topic: "Data tables",
    title: "Row actions: view and delete",
    task: "Ashcombe Facilities manages service contracts. In `contractTable` (wired to `getContracts`, stored as `wiredContracts`), add a row action menu.\n- Add a column `type: 'action'` with actions View (`view`) and Delete (`delete`)\n- Handle `onrowaction`: switch on `event.detail.action.name`\n- view → `NavigationMixin.Navigate` to the record page (standard__recordPage, actionName view)\n- delete → `deleteRecord(row.Id)`, show a success toast, then `refreshApex` the wired result; show an error toast on failure",
    starter: {
      "contractTable.js": "import { LightningElement, wire } from 'lwc';\nimport getContracts from '@salesforce/apex/ContractController.getContracts';\n\nexport default class ContractTable extends LightningElement {\n    columns = [\n        { label: 'Contract', fieldName: 'ContractNumber' },\n        { label: 'Status', fieldName: 'Status' },\n        { label: 'End Date', fieldName: 'EndDate', type: 'date' }\n    ];\n\n    @wire(getContracts)\n    wiredContracts;\n\n    // TODO: row actions\n}\n",
      "contractTable.html": "<template>\n    <lightning-datatable key-field=\"Id\" data={wiredContracts.data} columns={columns} hide-checkbox-column></lightning-datatable>\n</template>\n"
    },
    solution: {
      "contractTable.js": "import { LightningElement, wire } from 'lwc';\nimport { NavigationMixin } from 'lightning/navigation';\nimport { deleteRecord } from 'lightning/uiRecordApi';\nimport { refreshApex } from '@salesforce/apex';\nimport { ShowToastEvent } from 'lightning/platformShowToastEvent';\nimport getContracts from '@salesforce/apex/ContractController.getContracts';\n\nconst ACTIONS = [\n    { label: 'View', name: 'view' },\n    { label: 'Delete', name: 'delete' }\n];\n\nexport default class ContractTable extends NavigationMixin(LightningElement) {\n    columns = [\n        { label: 'Contract', fieldName: 'ContractNumber' },\n        { label: 'Status', fieldName: 'Status' },\n        { label: 'End Date', fieldName: 'EndDate', type: 'date' },\n        { type: 'action', typeAttributes: { rowActions: ACTIONS } }\n    ];\n\n    @wire(getContracts)\n    wiredContracts;\n\n    handleRowAction(event) {\n        const row = event.detail.row;\n        switch (event.detail.action.name) {\n            case 'view':\n                this[NavigationMixin.Navigate]({\n                    type: 'standard__recordPage',\n                    attributes: { recordId: row.Id, actionName: 'view' }\n                });\n                break;\n            case 'delete':\n                this.deleteRow(row.Id);\n                break;\n            default:\n        }\n    }\n\n    async deleteRow(recordId) {\n        try {\n            await deleteRecord(recordId);\n            this.dispatchEvent(new ShowToastEvent({ title: 'Contract deleted', variant: 'success' }));\n            await refreshApex(this.wiredContracts);\n        } catch (error) {\n            this.dispatchEvent(\n                new ShowToastEvent({ title: 'Delete failed', message: error.body?.message, variant: 'error' })\n            );\n        }\n    }\n}\n",
      "contractTable.html": "<template>\n    <lightning-datatable key-field=\"Id\" data={wiredContracts.data} columns={columns}\n        hide-checkbox-column onrowaction={handleRowAction}></lightning-datatable>\n</template>\n"
    },
    checks: [
      {
        re: /type\s*:\s*['"]action['"][\s\S]*rowActions/,
        msg: "Adds an action column with rowActions",
        file: "contractTable.js"
      },
      {
        re: /onrowaction=\{\s*\w+\s*\}/i,
        msg: "Handles onrowaction",
        file: "contractTable.html"
      },
      {
        re: /action\.name/,
        msg: "Branches on event.detail.action.name",
        file: "contractTable.js"
      },
      {
        re: /NavigationMixin\.Navigate\][\s\S]*standard__recordPage/,
        msg: "Navigates to the record page",
        file: "contractTable.js"
      },
      {
        re: /deleteRecord\(/,
        msg: "Deletes with deleteRecord",
        file: "contractTable.js"
      },
      {
        re: /refreshApex\(\s*this\.wiredContracts\s*\)/,
        msg: "Refreshes the wired result",
        file: "contractTable.js"
      }
    ],
    forbid: [
      {
        re: /window\.location/,
        msg: "Use NavigationMixin, not window.location"
      }
    ],
    hints: [
      "The class must extend NavigationMixin(LightningElement).",
      "refreshApex needs the whole wired value, not .data."
    ],
    ai: "Confirm errors are caught with an error toast, refreshApex is called only after a successful delete, and navigation uses the PageReference shape correctly."
  },
  {
    id: "LW067",
    track: "lwc",
    level: "Medium",
    topic: "Data tables",
    title: "Bulk assign selected cases",
    task: "Northgate Energy's triage team selects up to 20 cases and clicks \"Assign to me\". Build `bulkAssignTable` and Apex `CaseAssignController`.\n- `max-row-selection` 20; track selected Ids from `onrowselection` (`event.detail.selectedRows`)\n- The button is disabled when nothing is selected or while saving\n- Apex: `@AuraEnabled public static void assignToMe(List<Id> caseIds)` sets OwnerId to the running user in one DML using user mode\n- After success, clear selection (`selected-rows`) and `refreshApex` the wired `getUnassignedCases` result",
    starter: {
      "bulkAssignTable.js": "import { LightningElement, wire } from 'lwc';\nimport getUnassignedCases from '@salesforce/apex/CaseAssignController.getUnassignedCases';\n\nexport default class BulkAssignTable extends LightningElement {\n    columns = [\n        { label: 'Case', fieldName: 'CaseNumber' },\n        { label: 'Subject', fieldName: 'Subject' }\n    ];\n    selectedIds = [];\n\n    @wire(getUnassignedCases)\n    wiredCases;\n\n    // TODO\n}\n",
      "bulkAssignTable.html": "<template>\n    <lightning-card title=\"Unassigned cases\">\n        <!-- TODO: button + datatable -->\n    </lightning-card>\n</template>\n",
      "CaseAssignController.cls": "public with sharing class CaseAssignController {\n    @AuraEnabled(cacheable=true)\n    public static List<Case> getUnassignedCases() {\n        return [SELECT Id, CaseNumber, Subject FROM Case WHERE Owner.Type = 'Queue' AND IsClosed = false WITH USER_MODE LIMIT 500];\n    }\n\n    // TODO: assignToMe\n}\n"
    },
    solution: {
      "bulkAssignTable.js": "import { LightningElement, wire } from 'lwc';\nimport { refreshApex } from '@salesforce/apex';\nimport { ShowToastEvent } from 'lightning/platformShowToastEvent';\nimport getUnassignedCases from '@salesforce/apex/CaseAssignController.getUnassignedCases';\nimport assignToMe from '@salesforce/apex/CaseAssignController.assignToMe';\n\nexport default class BulkAssignTable extends LightningElement {\n    columns = [\n        { label: 'Case', fieldName: 'CaseNumber' },\n        { label: 'Subject', fieldName: 'Subject' }\n    ];\n    selectedIds = [];\n    isSaving = false;\n\n    @wire(getUnassignedCases)\n    wiredCases;\n\n    get assignDisabled() {\n        return this.isSaving || this.selectedIds.length === 0;\n    }\n\n    handleRowSelection(event) {\n        this.selectedIds = event.detail.selectedRows.map((row) => row.Id);\n    }\n\n    async handleAssign() {\n        this.isSaving = true;\n        try {\n            await assignToMe({ caseIds: this.selectedIds });\n            this.dispatchEvent(new ShowToastEvent({ title: 'Cases assigned', variant: 'success' }));\n            this.selectedIds = [];\n            await refreshApex(this.wiredCases);\n        } catch (error) {\n            this.dispatchEvent(new ShowToastEvent({ title: 'Assignment failed', message: error.body?.message, variant: 'error' }));\n        } finally {\n            this.isSaving = false;\n        }\n    }\n}\n",
      "bulkAssignTable.html": "<template>\n    <lightning-card title=\"Unassigned cases\">\n        <lightning-button slot=\"actions\" label=\"Assign to me\" variant=\"brand\"\n            disabled={assignDisabled} onclick={handleAssign}></lightning-button>\n        <lightning-datatable key-field=\"Id\" data={wiredCases.data} columns={columns}\n            max-row-selection=\"20\" selected-rows={selectedIds} onrowselection={handleRowSelection}></lightning-datatable>\n    </lightning-card>\n</template>\n",
      "CaseAssignController.cls": "public with sharing class CaseAssignController {\n    @AuraEnabled(cacheable=true)\n    public static List<Case> getUnassignedCases() {\n        return [SELECT Id, CaseNumber, Subject FROM Case WHERE Owner.Type = 'Queue' AND IsClosed = false WITH USER_MODE LIMIT 500];\n    }\n\n    @AuraEnabled\n    public static void assignToMe(List<Id> caseIds) {\n        if (caseIds == null || caseIds.isEmpty()) return;\n        List<Case> updates = new List<Case>();\n        for (Id caseId : caseIds) {\n            updates.add(new Case(Id = caseId, OwnerId = UserInfo.getUserId()));\n        }\n        Database.update(updates, AccessLevel.USER_MODE);\n    }\n}\n"
    },
    checks: [
      {
        re: /max-row-selection=["'{]?\s*20/i,
        msg: "Limits selection to 20 rows",
        file: "bulkAssignTable.html"
      },
      {
        re: /onrowselection=\{\s*\w+\s*\}/i,
        msg: "Handles onrowselection",
        file: "bulkAssignTable.html"
      },
      {
        re: /detail\.selectedRows/,
        msg: "Reads event.detail.selectedRows",
        file: "bulkAssignTable.js"
      },
      {
        re: /disabled=\{\s*\w+\s*\}/i,
        msg: "Disables the button via a property/getter",
        file: "bulkAssignTable.html"
      },
      {
        re: /public\s+static\s+void\s+assignToMe\s*\(\s*List<\s*Id\s*>\s+\w+\s*\)/i,
        msg: "Apex assignToMe(List<Id>) signature",
        file: "CaseAssignController.cls"
      },
      {
        re: /AccessLevel\.USER_MODE|update\s+as\s+user/i,
        msg: "Performs the DML in user mode",
        file: "CaseAssignController.cls"
      }
    ],
    forbid: [
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*\b(update|Database\.update)\b/i,
        msg: "No DML inside the loop"
      }
    ],
    hints: [
      "UserInfo.getUserId() gives the running user.",
      "Bind selected-rows to your Id array so clearing it clears the checkboxes."
    ],
    ai: "Verify a single bulk DML in user mode, the button is disabled with no selection and during save, and the selection is cleared and data refreshed after success."
  },
  {
    id: "LW068",
    track: "lwc",
    level: "Hard",
    topic: "Data tables",
    title: "Inline edit with draftValues and updateRecord",
    task: "Elmstead Recruitment wants recruiters to edit candidate Contacts inline. `contactInlineEdit` wires `getContacts` (Id, FirstName, LastName, Email, Phone) into `wiredContacts`.\n- Make Email and Phone `editable: true`; bind `draft-values` and handle `onsave`\n- On save, turn each draft (it contains Id + changed fields) into `{ fields: { ...draft } }` and call `updateRecord` for all drafts in parallel with `Promise.all`\n- On success: success toast, clear `draftValues`, then `refreshApex(this.wiredContacts)`\n- On failure: error toast and keep the drafts so the user can fix them",
    starter: {
      "contactInlineEdit.js": "import { LightningElement, wire } from 'lwc';\nimport getContacts from '@salesforce/apex/RecruitmentController.getContacts';\n\nexport default class ContactInlineEdit extends LightningElement {\n    columns = [\n        { label: 'First Name', fieldName: 'FirstName' },\n        { label: 'Last Name', fieldName: 'LastName' },\n        { label: 'Email', fieldName: 'Email', type: 'email' },\n        { label: 'Phone', fieldName: 'Phone', type: 'phone' }\n    ];\n    draftValues = [];\n\n    @wire(getContacts)\n    wiredContacts;\n\n    // TODO: handleSave\n}\n",
      "contactInlineEdit.html": "<template>\n    <lightning-datatable key-field=\"Id\" data={wiredContacts.data} columns={columns} hide-checkbox-column></lightning-datatable>\n</template>\n"
    },
    solution: {
      "contactInlineEdit.js": "import { LightningElement, wire } from 'lwc';\nimport { updateRecord } from 'lightning/uiRecordApi';\nimport { refreshApex } from '@salesforce/apex';\nimport { ShowToastEvent } from 'lightning/platformShowToastEvent';\nimport getContacts from '@salesforce/apex/RecruitmentController.getContacts';\n\nexport default class ContactInlineEdit extends LightningElement {\n    columns = [\n        { label: 'First Name', fieldName: 'FirstName' },\n        { label: 'Last Name', fieldName: 'LastName' },\n        { label: 'Email', fieldName: 'Email', type: 'email', editable: true },\n        { label: 'Phone', fieldName: 'Phone', type: 'phone', editable: true }\n    ];\n    draftValues = [];\n\n    @wire(getContacts)\n    wiredContacts;\n\n    async handleSave(event) {\n        const records = event.detail.draftValues.map((draft) => ({ fields: { ...draft } }));\n        try {\n            await Promise.all(records.map((recordInput) => updateRecord(recordInput)));\n            this.dispatchEvent(new ShowToastEvent({ title: 'Contacts updated', variant: 'success' }));\n            this.draftValues = [];\n            await refreshApex(this.wiredContacts);\n        } catch (error) {\n            this.dispatchEvent(\n                new ShowToastEvent({ title: 'Update failed', message: error.body?.message, variant: 'error' })\n            );\n        }\n    }\n}\n",
      "contactInlineEdit.html": "<template>\n    <lightning-datatable key-field=\"Id\" data={wiredContacts.data} columns={columns}\n        draft-values={draftValues} onsave={handleSave} hide-checkbox-column></lightning-datatable>\n</template>\n"
    },
    checks: [
      {
        re: /editable\s*:\s*true/,
        msg: "Marks Email/Phone editable",
        file: "contactInlineEdit.js"
      },
      {
        re: /draft-values=\{\s*draftValues\s*\}[\s\S]*onsave=|onsave=[\s\S]*draft-values=\{\s*draftValues\s*\}/i,
        msg: "Binds draft-values and onsave",
        file: "contactInlineEdit.html"
      },
      {
        re: /fields\s*:\s*\{?\s*\.\.\.|fields\s*:\s*\w+/,
        msg: "Builds recordInput objects with fields",
        file: "contactInlineEdit.js"
      },
      {
        re: /Promise\.all\([\s\S]*updateRecord/,
        msg: "Updates in parallel with Promise.all + updateRecord",
        file: "contactInlineEdit.js"
      },
      {
        re: /this\.draftValues\s*=\s*\[\s*\]/,
        msg: "Clears draftValues on success",
        file: "contactInlineEdit.js"
      },
      {
        re: /refreshApex\(\s*this\.wiredContacts\s*\)/,
        msg: "Refreshes the wired Apex result",
        file: "contactInlineEdit.js"
      }
    ],
    forbid: [
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*await\s+updateRecord/,
        msg: "Don't await updateRecord sequentially in a loop"
      }
    ],
    hints: [
      "event.detail.draftValues already contains Id for each changed row.",
      "Only clear drafts after every update succeeded."
    ],
    ai: "Verify drafts are cleared only on success, refreshApex receives the full wired object, failures leave drafts in place, and updates run in parallel."
  },
  {
    id: "LW069",
    track: "lwc",
    level: "Hard",
    topic: "Data tables",
    title: "Partial-success save with row errors",
    task: "Fairhaven Insurance edits renewal Opportunities inline and some rows fail validation rules. Build `renewalEditor` and Apex `RenewalSaveController`.\n- Apex: `@AuraEnabled public static Map<Id, String> saveOpportunities(List<Opportunity> records)` using `Database.update(records, false, AccessLevel.USER_MODE)`; return Id → first error message for failed rows\n- LWC `handleSave`: send `event.detail.draftValues`; build the datatable `errors` object `{ rows: { [id]: { title, messages } }, table: { title, messages } }` for failures\n- Remove only the successful drafts; refreshApex `wiredOpps` when anything succeeded",
    starter: {
      "renewalEditor.js": "import { LightningElement, wire } from 'lwc';\nimport getRenewals from '@salesforce/apex/RenewalSaveController.getRenewals';\n\nexport default class RenewalEditor extends LightningElement {\n    columns = [\n        { label: 'Name', fieldName: 'Name' },\n        { label: 'Amount', fieldName: 'Amount', type: 'currency', editable: true },\n        { label: 'Close Date', fieldName: 'CloseDate', type: 'date-local', editable: true }\n    ];\n    draftValues = [];\n    errors;\n\n    @wire(getRenewals)\n    wiredOpps;\n\n    // TODO: handleSave\n}\n",
      "renewalEditor.html": "<template>\n    <lightning-datatable key-field=\"Id\" data={wiredOpps.data} columns={columns}\n        draft-values={draftValues} onsave={handleSave}></lightning-datatable>\n</template>\n",
      "RenewalSaveController.cls": "public with sharing class RenewalSaveController {\n    @AuraEnabled(cacheable=true)\n    public static List<Opportunity> getRenewals() {\n        return [SELECT Id, Name, Amount, CloseDate FROM Opportunity WHERE Type = 'Renewal' AND IsClosed = false WITH USER_MODE LIMIT 200];\n    }\n\n    // TODO: saveOpportunities\n}\n"
    },
    solution: {
      "renewalEditor.js": "import { LightningElement, wire } from 'lwc';\nimport { refreshApex } from '@salesforce/apex';\nimport getRenewals from '@salesforce/apex/RenewalSaveController.getRenewals';\nimport saveOpportunities from '@salesforce/apex/RenewalSaveController.saveOpportunities';\n\nexport default class RenewalEditor extends LightningElement {\n    columns = [\n        { label: 'Name', fieldName: 'Name' },\n        { label: 'Amount', fieldName: 'Amount', type: 'currency', editable: true },\n        { label: 'Close Date', fieldName: 'CloseDate', type: 'date-local', editable: true }\n    ];\n    draftValues = [];\n    errors;\n\n    @wire(getRenewals)\n    wiredOpps;\n\n    async handleSave(event) {\n        const drafts = event.detail.draftValues;\n        try {\n            const failures = await saveOpportunities({ records: drafts });\n            const failedIds = Object.keys(failures || {});\n            const rows = {};\n            failedIds.forEach((id) => {\n                rows[id] = { title: 'Could not save', messages: [failures[id]] };\n            });\n            this.errors = failedIds.length\n                ? { rows, table: { title: `${failedIds.length} row(s) failed`, messages: Object.values(failures) } }\n                : undefined;\n            this.draftValues = drafts.filter((draft) => failedIds.includes(draft.Id));\n            if (failedIds.length < drafts.length) {\n                await refreshApex(this.wiredOpps);\n            }\n        } catch (error) {\n            this.errors = { table: { title: 'Save failed', messages: [error.body?.message || 'Unknown error'] } };\n        }\n    }\n}\n",
      "renewalEditor.html": "<template>\n    <lightning-datatable key-field=\"Id\" data={wiredOpps.data} columns={columns}\n        draft-values={draftValues} errors={errors} onsave={handleSave}></lightning-datatable>\n</template>\n",
      "RenewalSaveController.cls": "public with sharing class RenewalSaveController {\n    @AuraEnabled(cacheable=true)\n    public static List<Opportunity> getRenewals() {\n        return [SELECT Id, Name, Amount, CloseDate FROM Opportunity WHERE Type = 'Renewal' AND IsClosed = false WITH USER_MODE LIMIT 200];\n    }\n\n    @AuraEnabled\n    public static Map<Id, String> saveOpportunities(List<Opportunity> records) {\n        Map<Id, String> failures = new Map<Id, String>();\n        if (records == null || records.isEmpty()) return failures;\n        List<Database.SaveResult> results = Database.update(records, false, AccessLevel.USER_MODE);\n        for (Integer i = 0; i < results.size(); i++) {\n            if (!results[i].isSuccess()) {\n                failures.put(records[i].Id, results[i].getErrors()[0].getMessage());\n            }\n        }\n        return failures;\n    }\n}\n"
    },
    checks: [
      {
        re: /Map<\s*Id\s*,\s*String\s*>\s+saveOpportunities\s*\(\s*List<\s*Opportunity\s*>\s+\w+\s*\)/i,
        msg: "Apex saveOpportunities signature",
        file: "RenewalSaveController.cls"
      },
      {
        re: /Database\.update\(\s*\w+\s*,\s*false\s*,\s*AccessLevel\.USER_MODE\s*\)/i,
        msg: "Partial-success update in user mode",
        file: "RenewalSaveController.cls"
      },
      {
        re: /getErrors\(\)/i,
        msg: "Reads SaveResult errors",
        file: "RenewalSaveController.cls"
      },
      {
        re: /errors=\{\s*errors\s*\}/i,
        msg: "Binds the datatable errors attribute",
        file: "renewalEditor.html"
      },
      {
        re: /rows[\s\S]*messages/,
        msg: "Builds row-level errors with messages",
        file: "renewalEditor.js"
      },
      {
        re: /refreshApex\(\s*this\.wiredOpps\s*\)/,
        msg: "Refreshes wired data",
        file: "renewalEditor.js"
      }
    ],
    forbid: [
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*Database\.update/i,
        msg: "No DML inside a loop"
      }
    ],
    hints: [
      "SaveResults are in the same order as the input list — use the index to find the Id.",
      "Keep only drafts whose Id is in the failures map."
    ],
    ai: "Verify the Apex uses allOrNone=false in user mode and maps errors by index, the LWC keeps only failed drafts, shows row and table errors, and clears errors when everything saved."
  },
  {
    id: "LW070",
    track: "lwc",
    level: "Easy",
    topic: "LDS & records",
    title: "Account header with loading and error states",
    task: "Wexcombe Wholesale wants a compact header on the Account record page. Build `accountHeader`.\n- `@api recordId` is supplied by the record page\n- Use `@wire(getRecord)` with imported schema fields Account.Name, Account.Rating and Account.Phone (no string field names)\n- Expose getters `name`, `rating`, `phone` using `getFieldValue`\n- Show a spinner until data or error arrives, and an error message on error",
    starter: {
      "accountHeader.js": "import { LightningElement, api } from 'lwc';\n\nexport default class AccountHeader extends LightningElement {\n    @api recordId;\n    // TODO\n}\n",
      "accountHeader.html": "<template>\n    <!-- TODO -->\n</template>\n"
    },
    solution: {
      "accountHeader.js": "import { LightningElement, api, wire } from 'lwc';\nimport { getRecord, getFieldValue } from 'lightning/uiRecordApi';\nimport NAME from '@salesforce/schema/Account.Name';\nimport RATING from '@salesforce/schema/Account.Rating';\nimport PHONE from '@salesforce/schema/Account.Phone';\n\nexport default class AccountHeader extends LightningElement {\n    @api recordId;\n\n    @wire(getRecord, { recordId: '$recordId', fields: [NAME, RATING, PHONE] })\n    account;\n\n    get isLoading() {\n        return !this.account?.data && !this.account?.error;\n    }\n    get name() {\n        return getFieldValue(this.account.data, NAME);\n    }\n    get rating() {\n        return getFieldValue(this.account.data, RATING);\n    }\n    get phone() {\n        return getFieldValue(this.account.data, PHONE);\n    }\n}\n",
      "accountHeader.html": "<template>\n    <lightning-card>\n        <template lwc:if={isLoading}>\n            <lightning-spinner alternative-text=\"Loading\" size=\"small\"></lightning-spinner>\n        </template>\n        <template lwc:elseif={account.data}>\n            <div class=\"slds-p-horizontal_small\">\n                <h2 class=\"slds-text-heading_medium\">{name}</h2>\n                <p>Rating: {rating}</p>\n                <lightning-formatted-phone value={phone}></lightning-formatted-phone>\n            </div>\n        </template>\n        <template lwc:else>\n            <p class=\"slds-p-around_small slds-text-color_error\">Could not load the account.</p>\n        </template>\n    </lightning-card>\n</template>\n"
    },
    checks: [
      {
        re: /from\s*['"]@salesforce\/schema\/Account\.Name['"]/,
        msg: "Imports schema fields",
        file: "accountHeader.js"
      },
      {
        re: /@wire\(\s*getRecord\s*,\s*\{[^}]*recordId\s*:\s*['"]\$recordId['"]/,
        msg: "Wires getRecord with $recordId",
        file: "accountHeader.js"
      },
      {
        re: /getFieldValue\(/,
        msg: "Uses getFieldValue",
        file: "accountHeader.js"
      },
      {
        re: /<lightning-spinner/i,
        msg: "Shows a spinner while loading",
        file: "accountHeader.html"
      }
    ],
    forbid: [
      {
        re: /fields\s*:\s*\[\s*['"]Account\./,
        msg: "Use imported schema references instead of string field names"
      }
    ],
    hints: [
      "Prefix the reactive parameter with $ so the wire re-runs when recordId changes.",
      "getFieldValue(record, FIELD) handles the nested record.fields.X.value shape."
    ],
    ai: "Verify the three states (loading, data, error) are handled, schema imports are used for referential integrity, and getters do not throw when data is undefined."
  },
  {
    id: "LW071",
    track: "lwc",
    level: "Easy",
    topic: "LDS & records",
    title: "Quick lead capture with createRecord",
    task: "Saltash Events captures leads at trade shows on a tablet. Build `leadCapture`.\n- Inputs: First Name, Last Name (required), Company (required), Email\n- On Save call `createRecord` with `apiName` from the Lead object import and the field values\n- On success show a success toast containing the new Id and reset the form fields\n- On failure show an error toast with the error message\n- Disable Save while the request is in flight",
    starter: {
      "leadCapture.js": "import { LightningElement } from 'lwc';\n\nexport default class LeadCapture extends LightningElement {\n    firstName = '';\n    lastName = '';\n    company = '';\n    email = '';\n\n    handleInput(event) {\n        this[event.target.name] = event.target.value;\n    }\n\n    async handleSave() {\n        // TODO\n    }\n}\n",
      "leadCapture.html": "<template>\n    <lightning-card title=\"New lead\">\n        <div class=\"slds-p-around_small\">\n            <lightning-input name=\"firstName\" label=\"First Name\" value={firstName} onchange={handleInput}></lightning-input>\n            <lightning-input name=\"lastName\" label=\"Last Name\" required value={lastName} onchange={handleInput}></lightning-input>\n            <lightning-input name=\"company\" label=\"Company\" required value={company} onchange={handleInput}></lightning-input>\n            <lightning-input name=\"email\" type=\"email\" label=\"Email\" value={email} onchange={handleInput}></lightning-input>\n            <!-- TODO: Save button -->\n        </div>\n    </lightning-card>\n</template>\n"
    },
    solution: {
      "leadCapture.js": "import { LightningElement } from 'lwc';\nimport { createRecord } from 'lightning/uiRecordApi';\nimport { ShowToastEvent } from 'lightning/platformShowToastEvent';\nimport LEAD_OBJECT from '@salesforce/schema/Lead';\nimport FIRST_NAME from '@salesforce/schema/Lead.FirstName';\nimport LAST_NAME from '@salesforce/schema/Lead.LastName';\nimport COMPANY from '@salesforce/schema/Lead.Company';\nimport EMAIL from '@salesforce/schema/Lead.Email';\n\nexport default class LeadCapture extends LightningElement {\n    firstName = '';\n    lastName = '';\n    company = '';\n    email = '';\n    isSaving = false;\n\n    handleInput(event) {\n        this[event.target.name] = event.target.value;\n    }\n\n    async handleSave() {\n        this.isSaving = true;\n        const fields = {\n            [FIRST_NAME.fieldApiName]: this.firstName,\n            [LAST_NAME.fieldApiName]: this.lastName,\n            [COMPANY.fieldApiName]: this.company,\n            [EMAIL.fieldApiName]: this.email\n        };\n        try {\n            const lead = await createRecord({ apiName: LEAD_OBJECT.objectApiName, fields });\n            this.dispatchEvent(new ShowToastEvent({ title: 'Lead created', message: lead.id, variant: 'success' }));\n            this.firstName = '';\n            this.lastName = '';\n            this.company = '';\n            this.email = '';\n        } catch (error) {\n            this.dispatchEvent(new ShowToastEvent({ title: 'Could not create lead', message: error.body?.message, variant: 'error' }));\n        } finally {\n            this.isSaving = false;\n        }\n    }\n}\n",
      "leadCapture.html": "<template>\n    <lightning-card title=\"New lead\">\n        <div class=\"slds-p-around_small\">\n            <lightning-input name=\"firstName\" label=\"First Name\" value={firstName} onchange={handleInput}></lightning-input>\n            <lightning-input name=\"lastName\" label=\"Last Name\" required value={lastName} onchange={handleInput}></lightning-input>\n            <lightning-input name=\"company\" label=\"Company\" required value={company} onchange={handleInput}></lightning-input>\n            <lightning-input name=\"email\" type=\"email\" label=\"Email\" value={email} onchange={handleInput}></lightning-input>\n            <lightning-button class=\"slds-m-top_small\" label=\"Save\" variant=\"brand\" disabled={isSaving} onclick={handleSave}></lightning-button>\n        </div>\n    </lightning-card>\n</template>\n"
    },
    checks: [
      {
        re: /import\s*\{[^}]*createRecord[^}]*\}\s*from\s*['"]lightning\/uiRecordApi['"]/,
        msg: "Imports createRecord",
        file: "leadCapture.js"
      },
      {
        re: /createRecord\(\s*\{[^)]*apiName/,
        msg: "Calls createRecord with apiName and fields",
        file: "leadCapture.js"
      },
      {
        re: /ShowToastEvent/,
        msg: "Shows toasts",
        file: "leadCapture.js"
      },
      {
        re: /catch\s*\(|\.catch\(/,
        msg: "Handles errors",
        file: "leadCapture.js"
      },
      {
        re: /<lightning-button[^>]*disabled=\{\s*\w+\s*\}/i,
        msg: "Disables Save while saving",
        file: "leadCapture.html"
      }
    ],
    forbid: [
      {
        re: /@salesforce\/apex\//,
        msg: "No Apex needed — use Lightning Data Service"
      }
    ],
    hints: [
      "Field names can come from FIELD.fieldApiName to keep references safe.",
      "The resolved record has an id property."
    ],
    ai: "Check the form resets only on success, the button is re-enabled in all paths (finally), and errors surface a readable message."
  },
  {
    id: "LW072",
    track: "lwc",
    level: "Easy",
    topic: "LDS & records",
    title: "Escalate a case with updateRecord",
    task: "Hollin Rail's service agents need a one-click \"Escalate\" button on the Case page. Build `escalateCase`.\n- `@api recordId`\n- On click call `updateRecord` with `{ fields: { Id, Status: 'Escalated', Priority: 'High' } }` using schema field imports\n- Success toast on success, error toast on failure\n- The record page refreshes automatically because LDS is used (no manual reload)",
    starter: {
      "escalateCase.js": "import { LightningElement, api } from 'lwc';\n\nexport default class EscalateCase extends LightningElement {\n    @api recordId;\n\n    async handleEscalate() {\n        // TODO\n    }\n}\n",
      "escalateCase.html": "<template>\n    <lightning-button label=\"Escalate\" variant=\"destructive\" onclick={handleEscalate}></lightning-button>\n</template>\n"
    },
    solution: {
      "escalateCase.js": "import { LightningElement, api } from 'lwc';\nimport { updateRecord } from 'lightning/uiRecordApi';\nimport { ShowToastEvent } from 'lightning/platformShowToastEvent';\nimport ID_FIELD from '@salesforce/schema/Case.Id';\nimport STATUS from '@salesforce/schema/Case.Status';\nimport PRIORITY from '@salesforce/schema/Case.Priority';\n\nexport default class EscalateCase extends LightningElement {\n    @api recordId;\n\n    async handleEscalate() {\n        const fields = {\n            [ID_FIELD.fieldApiName]: this.recordId,\n            [STATUS.fieldApiName]: 'Escalated',\n            [PRIORITY.fieldApiName]: 'High'\n        };\n        try {\n            await updateRecord({ fields });\n            this.dispatchEvent(new ShowToastEvent({ title: 'Case escalated', variant: 'success' }));\n        } catch (error) {\n            this.dispatchEvent(new ShowToastEvent({ title: 'Escalation failed', message: error.body?.message, variant: 'error' }));\n        }\n    }\n}\n",
      "escalateCase.html": "<template>\n    <lightning-button label=\"Escalate\" variant=\"destructive\" onclick={handleEscalate}></lightning-button>\n</template>\n"
    },
    checks: [
      {
        re: /updateRecord\(\s*\{\s*fields/,
        msg: "Calls updateRecord({ fields })",
        file: "escalateCase.js"
      },
      {
        re: /this\.recordId/,
        msg: "Uses the record Id",
        file: "escalateCase.js"
      },
      {
        re: /['"]Escalated['"][\s\S]*['"]High['"]|['"]High['"][\s\S]*['"]Escalated['"]/,
        msg: "Sets Status and Priority",
        file: "escalateCase.js"
      },
      {
        re: /catch\s*\(/,
        msg: "Handles errors",
        file: "escalateCase.js"
      }
    ],
    forbid: [
      {
        re: /location\.reload|eval\(/i,
        msg: "No page reloads — LDS refreshes the record"
      }
    ],
    hints: [
      "The fields object must include the record Id.",
      "Wrap the await in try/catch to show the error toast."
    ],
    ai: "Verify Id is included in fields, both success and error paths toast, and no Apex or page reload is used."
  },
  {
    id: "LW073",
    track: "lwc",
    level: "Medium",
    topic: "LDS & records",
    title: "Confirm, delete and navigate away",
    task: "Ravensworth Property lets managers delete draft Tenancy__c records from the record page. Build `deleteTenancy`.\n- Ask for confirmation with `LightningConfirm.open` (theme `warning`); stop if the user cancels\n- Call `deleteRecord(this.recordId)`\n- On success toast and navigate to the Tenancy__c list view (`standard__objectPage`, actionName `list`, filterName `Recent`)\n- On failure show an error toast",
    starter: {
      "deleteTenancy.js": "import { LightningElement, api } from 'lwc';\n\nexport default class DeleteTenancy extends LightningElement {\n    @api recordId;\n\n    async handleDelete() {\n        // TODO\n    }\n}\n",
      "deleteTenancy.html": "<template>\n    <lightning-button label=\"Delete draft\" variant=\"destructive\" onclick={handleDelete}></lightning-button>\n</template>\n"
    },
    solution: {
      "deleteTenancy.js": "import { LightningElement, api } from 'lwc';\nimport LightningConfirm from 'lightning/confirm';\nimport { deleteRecord } from 'lightning/uiRecordApi';\nimport { NavigationMixin } from 'lightning/navigation';\nimport { ShowToastEvent } from 'lightning/platformShowToastEvent';\n\nexport default class DeleteTenancy extends NavigationMixin(LightningElement) {\n    @api recordId;\n\n    async handleDelete() {\n        const confirmed = await LightningConfirm.open({\n            message: 'Delete this draft tenancy? This cannot be undone.',\n            label: 'Confirm delete',\n            theme: 'warning'\n        });\n        if (!confirmed) return;\n        try {\n            await deleteRecord(this.recordId);\n            this.dispatchEvent(new ShowToastEvent({ title: 'Tenancy deleted', variant: 'success' }));\n            this[NavigationMixin.Navigate]({\n                type: 'standard__objectPage',\n                attributes: { objectApiName: 'Tenancy__c', actionName: 'list' },\n                state: { filterName: 'Recent' }\n            });\n        } catch (error) {\n            this.dispatchEvent(new ShowToastEvent({ title: 'Delete failed', message: error.body?.message, variant: 'error' }));\n        }\n    }\n}\n",
      "deleteTenancy.html": "<template>\n    <lightning-button label=\"Delete draft\" variant=\"destructive\" onclick={handleDelete}></lightning-button>\n</template>\n"
    },
    checks: [
      {
        re: /from\s*['"]lightning\/confirm['"]/,
        msg: "Imports LightningConfirm",
        file: "deleteTenancy.js"
      },
      {
        re: /await\s+\w+\.open\(/,
        msg: "Awaits the confirm dialog",
        file: "deleteTenancy.js"
      },
      {
        re: /if\s*\(\s*!\s*\w+\s*\)\s*(return|\{)/,
        msg: "Stops when the user cancels",
        file: "deleteTenancy.js"
      },
      {
        re: /deleteRecord\(\s*this\.recordId\s*\)/,
        msg: "Deletes the current record",
        file: "deleteTenancy.js"
      },
      {
        re: /standard__objectPage[\s\S]*actionName\s*:\s*['"]list['"]/,
        msg: "Navigates to the list view",
        file: "deleteTenancy.js"
      }
    ],
    forbid: [
      {
        re: /\bconfirm\s*\(\s*['"]|window\.confirm/,
        msg: "Use LightningConfirm, not window.confirm"
      }
    ],
    hints: [
      "LightningConfirm.open resolves to true/false.",
      "Extend NavigationMixin(LightningElement) and call this[NavigationMixin.Navigate]."
    ],
    ai: "Verify cancel performs no delete, navigation only happens after a successful delete, and errors are caught and toasted."
  },
  {
    id: "LW074",
    track: "lwc",
    level: "Medium",
    topic: "LDS & records",
    title: "Refresh LDS after an Apex update",
    task: "Greyfriars Health Supplies recalculates an Order's discount in Apex (`OrderPricingController.applyLoyaltyDiscount(Id orderId)`). The standard record detail on the page keeps showing stale values. Build `applyDiscountButton`.\n- Call the Apex method imperatively with `{ orderId: this.recordId }`\n- Then call `notifyRecordUpdateAvailable([{ recordId: this.recordId }])` so LDS-backed components refresh\n- Show a spinner while working; error toast on failure\n- Do not use `getRecordNotifyChange` (deprecated)",
    starter: {
      "applyDiscountButton.js": "import { LightningElement, api } from 'lwc';\n\nexport default class ApplyDiscountButton extends LightningElement {\n    @api recordId;\n    isWorking = false;\n\n    async handleApply() {\n        // TODO\n    }\n}\n",
      "applyDiscountButton.html": "<template>\n    <!-- TODO: button and spinner -->\n</template>\n"
    },
    solution: {
      "applyDiscountButton.js": "import { LightningElement, api } from 'lwc';\nimport { notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';\nimport { ShowToastEvent } from 'lightning/platformShowToastEvent';\nimport applyLoyaltyDiscount from '@salesforce/apex/OrderPricingController.applyLoyaltyDiscount';\n\nexport default class ApplyDiscountButton extends LightningElement {\n    @api recordId;\n    isWorking = false;\n\n    async handleApply() {\n        this.isWorking = true;\n        try {\n            await applyLoyaltyDiscount({ orderId: this.recordId });\n            await notifyRecordUpdateAvailable([{ recordId: this.recordId }]);\n            this.dispatchEvent(new ShowToastEvent({ title: 'Discount applied', variant: 'success' }));\n        } catch (error) {\n            this.dispatchEvent(new ShowToastEvent({ title: 'Could not apply discount', message: error.body?.message, variant: 'error' }));\n        } finally {\n            this.isWorking = false;\n        }\n    }\n}\n",
      "applyDiscountButton.html": "<template>\n    <div class=\"slds-is-relative\">\n        <template lwc:if={isWorking}>\n            <lightning-spinner alternative-text=\"Applying discount\" size=\"small\"></lightning-spinner>\n        </template>\n        <lightning-button label=\"Apply loyalty discount\" disabled={isWorking} onclick={handleApply}></lightning-button>\n    </div>\n</template>\n"
    },
    checks: [
      {
        re: /from\s*['"]@salesforce\/apex\/OrderPricingController\.applyLoyaltyDiscount['"]/,
        msg: "Imports the Apex method",
        file: "applyDiscountButton.js"
      },
      {
        re: /applyLoyaltyDiscount\(\s*\{\s*orderId\s*:\s*this\.recordId\s*\}\s*\)/,
        msg: "Calls Apex with { orderId }",
        file: "applyDiscountButton.js"
      },
      {
        re: /notifyRecordUpdateAvailable\(\s*\[\s*\{\s*recordId\s*:\s*this\.recordId\s*\}\s*\]\s*\)/,
        msg: "Notifies LDS of the change",
        file: "applyDiscountButton.js"
      },
      {
        re: /<lightning-spinner/i,
        msg: "Shows a spinner",
        file: "applyDiscountButton.html"
      }
    ],
    forbid: [
      {
        re: /getRecordNotifyChange/,
        msg: "getRecordNotifyChange is deprecated"
      }
    ],
    hints: [
      "Imperative Apex returns a Promise; await it before notifying.",
      "notifyRecordUpdateAvailable takes an array of { recordId } objects."
    ],
    ai: "Check notify happens only after Apex succeeds, the spinner is cleared in finally, and the Apex parameter name matches orderId."
  },
  {
    id: "LW075",
    track: "lwc",
    level: "Hard",
    topic: "LDS & records",
    title: "Record-type aware picklist with updateRecord",
    task: "Dunmore Telecom's Cases use record types with different Reason values. Build `caseReasonEditor`.\n- `@api recordId`; wire `getRecord` for Case.Reason and Case.RecordTypeId\n- Wire `getPicklistValues` for Case.Reason using `recordTypeId: '$recordTypeId'`, where `recordTypeId` is a getter returning the record's RecordTypeId (fall back to `getObjectInfo` defaultRecordTypeId)\n- Show a `lightning-combobox` with those options and the current value\n- On change call `updateRecord` and toast; on error toast and keep the old value",
    starter: {
      "caseReasonEditor.js": "import { LightningElement, api, wire } from 'lwc';\nimport CASE_OBJECT from '@salesforce/schema/Case';\nimport REASON from '@salesforce/schema/Case.Reason';\nimport RECORD_TYPE from '@salesforce/schema/Case.RecordTypeId';\n\nexport default class CaseReasonEditor extends LightningElement {\n    @api recordId;\n    // TODO\n}\n",
      "caseReasonEditor.html": "<template>\n    <!-- TODO -->\n</template>\n"
    },
    solution: {
      "caseReasonEditor.js": "import { LightningElement, api, wire } from 'lwc';\nimport { getRecord, getFieldValue, updateRecord } from 'lightning/uiRecordApi';\nimport { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';\nimport { ShowToastEvent } from 'lightning/platformShowToastEvent';\nimport CASE_OBJECT from '@salesforce/schema/Case';\nimport REASON from '@salesforce/schema/Case.Reason';\nimport RECORD_TYPE from '@salesforce/schema/Case.RecordTypeId';\n\nexport default class CaseReasonEditor extends LightningElement {\n    @api recordId;\n\n    @wire(getRecord, { recordId: '$recordId', fields: [REASON, RECORD_TYPE] })\n    caseRecord;\n\n    @wire(getObjectInfo, { objectApiName: CASE_OBJECT })\n    objectInfo;\n\n    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: REASON })\n    reasonPicklist;\n\n    get recordTypeId() {\n        return getFieldValue(this.caseRecord.data, RECORD_TYPE) || this.objectInfo?.data?.defaultRecordTypeId;\n    }\n\n    get options() {\n        return this.reasonPicklist?.data?.values?.map(({ label, value }) => ({ label, value })) || [];\n    }\n\n    get reason() {\n        return getFieldValue(this.caseRecord.data, REASON);\n    }\n\n    async handleChange(event) {\n        const fields = { Id: this.recordId, [REASON.fieldApiName]: event.detail.value };\n        try {\n            await updateRecord({ fields });\n            this.dispatchEvent(new ShowToastEvent({ title: 'Reason updated', variant: 'success' }));\n        } catch (error) {\n            event.target.value = this.reason;\n            this.dispatchEvent(new ShowToastEvent({ title: 'Update failed', message: error.body?.message, variant: 'error' }));\n        }\n    }\n}\n",
      "caseReasonEditor.html": "<template>\n    <lightning-card title=\"Case reason\">\n        <div class=\"slds-p-around_small\">\n            <lightning-combobox label=\"Reason\" options={options} value={reason} onchange={handleChange}></lightning-combobox>\n        </div>\n    </lightning-card>\n</template>\n"
    },
    checks: [
      {
        re: /@wire\(\s*getPicklistValues\s*,\s*\{[^}]*recordTypeId\s*:\s*['"]\$recordTypeId['"]/,
        msg: "Wires getPicklistValues with a reactive recordTypeId",
        file: "caseReasonEditor.js"
      },
      {
        re: /@wire\(\s*getObjectInfo/,
        msg: "Wires getObjectInfo for the default record type",
        file: "caseReasonEditor.js"
      },
      {
        re: /defaultRecordTypeId/,
        msg: "Falls back to defaultRecordTypeId",
        file: "caseReasonEditor.js"
      },
      {
        re: /get\s+recordTypeId\s*\(\s*\)/,
        msg: "Derives recordTypeId with a getter",
        file: "caseReasonEditor.js"
      },
      {
        re: /updateRecord\(/,
        msg: "Saves with updateRecord",
        file: "caseReasonEditor.js"
      },
      {
        re: /<lightning-combobox[^>]*options=\{\s*\w+\s*\}/i,
        msg: "Renders a combobox with options",
        file: "caseReasonEditor.html"
      }
    ],
    forbid: [
      {
        re: /['"]012[A-Za-z0-9]{12,15}['"]/,
        msg: "Don't hard-code record type Ids"
      }
    ],
    hints: [
      "A wire parameter can reference a getter with $ — it re-evaluates when its dependencies change.",
      "getPicklistValues returns { values: [{ label, value }] }."
    ],
    ai: "Verify the picklist wire is driven by the record's actual record type with a sensible fallback, no record type Ids are hard-coded, and failed updates restore the previous value."
  },
  {
    id: "LW076",
    track: "lwc",
    level: "Hard",
    topic: "LDS & records",
    title: "Create account and contacts together",
    task: "Ockham Bikes onboards trade customers with one form. Build `tradeOnboarding`.\n- Inputs: account `name`, and a list `contacts` (each { key, lastName, email }) with an \"Add contact\" button\n- On Submit: `createRecord` the Account, then create all contacts in parallel with `Promise.all`, each with AccountId set to the new account id\n- Skip contacts with a blank lastName\n- On success toast, `refreshApex(this.wiredRecentAccounts)` and navigate to the new Account\n- Errors: toast the message; never leave the button stuck disabled",
    starter: {
      "tradeOnboarding.js": "import { LightningElement, wire } from 'lwc';\nimport getRecentAccounts from '@salesforce/apex/OnboardingController.getRecentAccounts';\n\nlet nextKey = 1;\n\nexport default class TradeOnboarding extends LightningElement {\n    name = '';\n    contacts = [{ key: nextKey++, lastName: '', email: '' }];\n    isSaving = false;\n\n    @wire(getRecentAccounts)\n    wiredRecentAccounts;\n\n    handleName(event) {\n        this.name = event.target.value;\n    }\n\n    handleContactChange(event) {\n        const { key, field } = event.target.dataset;\n        this.contacts = this.contacts.map((c) => (String(c.key) === key ? { ...c, [field]: event.target.value } : c));\n    }\n\n    handleAdd() {\n        this.contacts = [...this.contacts, { key: nextKey++, lastName: '', email: '' }];\n    }\n\n    async handleSubmit() {\n        // TODO\n    }\n}\n",
      "tradeOnboarding.html": "<template>\n    <lightning-card title=\"Trade onboarding\">\n        <div class=\"slds-p-around_small\">\n            <lightning-input label=\"Account name\" required value={name} onchange={handleName}></lightning-input>\n            <template for:each={contacts} for:item=\"c\">\n                <div key={c.key} class=\"slds-grid slds-gutters\">\n                    <lightning-input class=\"slds-col\" label=\"Last name\" data-key={c.key} data-field=\"lastName\" value={c.lastName} onchange={handleContactChange}></lightning-input>\n                    <lightning-input class=\"slds-col\" label=\"Email\" type=\"email\" data-key={c.key} data-field=\"email\" value={c.email} onchange={handleContactChange}></lightning-input>\n                </div>\n            </template>\n            <lightning-button label=\"Add contact\" onclick={handleAdd}></lightning-button>\n            <!-- TODO: submit -->\n        </div>\n    </lightning-card>\n</template>\n"
    },
    solution: {
      "tradeOnboarding.js": "import { LightningElement, wire } from 'lwc';\nimport { createRecord } from 'lightning/uiRecordApi';\nimport { refreshApex } from '@salesforce/apex';\nimport { NavigationMixin } from 'lightning/navigation';\nimport { ShowToastEvent } from 'lightning/platformShowToastEvent';\nimport getRecentAccounts from '@salesforce/apex/OnboardingController.getRecentAccounts';\n\nlet nextKey = 1;\n\nexport default class TradeOnboarding extends NavigationMixin(LightningElement) {\n    name = '';\n    contacts = [{ key: nextKey++, lastName: '', email: '' }];\n    isSaving = false;\n\n    @wire(getRecentAccounts)\n    wiredRecentAccounts;\n\n    handleName(event) {\n        this.name = event.target.value;\n    }\n\n    handleContactChange(event) {\n        const { key, field } = event.target.dataset;\n        this.contacts = this.contacts.map((c) => (String(c.key) === key ? { ...c, [field]: event.target.value } : c));\n    }\n\n    handleAdd() {\n        this.contacts = [...this.contacts, { key: nextKey++, lastName: '', email: '' }];\n    }\n\n    async handleSubmit() {\n        this.isSaving = true;\n        try {\n            const account = await createRecord({ apiName: 'Account', fields: { Name: this.name } });\n            const toCreate = this.contacts.filter((c) => c.lastName && c.lastName.trim());\n            await Promise.all(\n                toCreate.map((c) =>\n                    createRecord({\n                        apiName: 'Contact',\n                        fields: { LastName: c.lastName.trim(), Email: c.email, AccountId: account.id }\n                    })\n                )\n            );\n            this.dispatchEvent(new ShowToastEvent({ title: 'Customer onboarded', variant: 'success' }));\n            await refreshApex(this.wiredRecentAccounts);\n            this[NavigationMixin.Navigate]({\n                type: 'standard__recordPage',\n                attributes: { recordId: account.id, objectApiName: 'Account', actionName: 'view' }\n            });\n        } catch (error) {\n            this.dispatchEvent(new ShowToastEvent({ title: 'Onboarding failed', message: error.body?.message, variant: 'error' }));\n        } finally {\n            this.isSaving = false;\n        }\n    }\n}\n",
      "tradeOnboarding.html": "<template>\n    <lightning-card title=\"Trade onboarding\">\n        <div class=\"slds-p-around_small\">\n            <lightning-input label=\"Account name\" required value={name} onchange={handleName}></lightning-input>\n            <template for:each={contacts} for:item=\"c\">\n                <div key={c.key} class=\"slds-grid slds-gutters\">\n                    <lightning-input class=\"slds-col\" label=\"Last name\" data-key={c.key} data-field=\"lastName\" value={c.lastName} onchange={handleContactChange}></lightning-input>\n                    <lightning-input class=\"slds-col\" label=\"Email\" type=\"email\" data-key={c.key} data-field=\"email\" value={c.email} onchange={handleContactChange}></lightning-input>\n                </div>\n            </template>\n            <lightning-button label=\"Add contact\" onclick={handleAdd}></lightning-button>\n            <lightning-button class=\"slds-m-left_small\" label=\"Submit\" variant=\"brand\" disabled={isSaving} onclick={handleSubmit}></lightning-button>\n        </div>\n    </lightning-card>\n</template>\n"
    },
    checks: [
      {
        re: /await\s+createRecord\(\s*\{[^}]*apiName\s*:\s*[^,]*Account/,
        msg: "Creates the Account first and awaits it",
        file: "tradeOnboarding.js"
      },
      {
        re: /Promise\.all\([\s\S]*createRecord/,
        msg: "Creates contacts in parallel with Promise.all",
        file: "tradeOnboarding.js"
      },
      {
        re: /AccountId\s*:\s*\w+\.id/,
        msg: "Links contacts to the new account id",
        file: "tradeOnboarding.js"
      },
      {
        re: /\.filter\(/,
        msg: "Skips contacts without a last name",
        file: "tradeOnboarding.js"
      },
      {
        re: /refreshApex\(\s*this\.wiredRecentAccounts\s*\)/,
        msg: "Refreshes the wired list",
        file: "tradeOnboarding.js"
      },
      {
        re: /finally\s*\{[\s\S]*isSaving\s*=\s*false/,
        msg: "Resets the saving flag in finally",
        file: "tradeOnboarding.js"
      }
    ],
    forbid: [
      {
        re: /for\s*\([^)]*\)\s*\{[^}]*await\s+createRecord/,
        msg: "Don't create contacts sequentially in a loop"
      }
    ],
    hints: [
      "createRecord resolves to a record whose id you need for the children.",
      "Map the valid contacts to an array of createRecord promises."
    ],
    ai: "Verify the account is created before contacts, blank contacts are skipped, the saving flag always resets, and navigation targets the new account. Accept a single Apex method as an alternative only if the task's LDS requirement is still met."
  },
  {
    id: "LW077",
    track: "lwc",
    level: "Easy",
    topic: "Lifecycle & DOM",
    title: "Queue wait clock with interval cleanup",
    task: "Penmaen Water's contact centre shows how long the oldest caller has waited. Build `queueWaitClock`.\n- `@api startedAt` (ISO date-time string)\n- In `connectedCallback` start a `setInterval` (1000 ms) that updates `elapsedSeconds`\n- In `disconnectedCallback` clear the interval so it does not leak when the user changes tab\n- Getter `display` formats as `mm:ss`",
    starter: {
      "queueWaitClock.js": "import { LightningElement, api } from 'lwc';\n\nexport default class QueueWaitClock extends LightningElement {\n    @api startedAt;\n    elapsedSeconds = 0;\n    // TODO\n}\n",
      "queueWaitClock.html": "<template>\n    <!-- TODO -->\n</template>\n"
    },
    solution: {
      "queueWaitClock.js": "import { LightningElement, api } from 'lwc';\n\nexport default class QueueWaitClock extends LightningElement {\n    @api startedAt;\n    elapsedSeconds = 0;\n    timerId;\n\n    connectedCallback() {\n        this.tick();\n        // eslint-disable-next-line @lwc/lwc/no-async-operation\n        this.timerId = setInterval(() => this.tick(), 1000);\n    }\n\n    disconnectedCallback() {\n        clearInterval(this.timerId);\n        this.timerId = null;\n    }\n\n    tick() {\n        const start = this.startedAt ? new Date(this.startedAt).getTime() : Date.now();\n        this.elapsedSeconds = Math.max(0, Math.floor((Date.now() - start) / 1000));\n    }\n\n    get display() {\n        const m = String(Math.floor(this.elapsedSeconds / 60)).padStart(2, '0');\n        const s = String(this.elapsedSeconds % 60).padStart(2, '0');\n        return `${m}:${s}`;\n    }\n}\n",
      "queueWaitClock.html": "<template>\n    <p class=\"slds-text-heading_large\">{display}</p>\n</template>\n"
    },
    checks: [
      {
        re: /connectedCallback\s*\(\s*\)\s*\{[\s\S]*setInterval\(/,
        msg: "Starts the interval in connectedCallback",
        file: "queueWaitClock.js"
      },
      {
        re: /disconnectedCallback\s*\(\s*\)\s*\{[\s\S]*clearInterval\(/,
        msg: "Clears the interval in disconnectedCallback",
        file: "queueWaitClock.js"
      },
      {
        re: /=\s*setInterval\(/,
        msg: "Keeps the interval id",
        file: "queueWaitClock.js"
      },
      {
        re: /get\s+display\s*\(\s*\)/,
        msg: "Formats via a display getter",
        file: "queueWaitClock.js"
      }
    ],
    forbid: [
      {
        re: /renderedCallback[\s\S]*setInterval/,
        msg: "renderedCallback runs on every render — don't start timers there"
      }
    ],
    hints: [
      "Store the id returned by setInterval on the component.",
      "padStart(2, '0') gives two-digit minutes and seconds."
    ],
    ai: "Verify the interval is created once and cleared on disconnect, elapsed time is computed from startedAt rather than incremented blindly, and display is mm:ss."
  },
  {
    id: "LW078",
    track: "lwc",
    level: "Easy",
    topic: "Lifecycle & DOM",
    title: "Focus an input with lwc:ref",
    task: "Cresswell Dental's reception app has a \"New note\" button. When clicked, show the note textarea and focus it. Build `quickNote`.\n- Clicking \"New note\" sets `showEditor = true`\n- After the editor renders, focus the textarea using `lwc:ref=\"noteInput\"` and `this.refs.noteInput.focus()`\n- Use `renderedCallback` with a guard flag so focus only happens once per open\n- Do not use `document.querySelector`",
    starter: {
      "quickNote.js": "import { LightningElement } from 'lwc';\n\nexport default class QuickNote extends LightningElement {\n    showEditor = false;\n\n    handleNew() {\n        // TODO\n    }\n}\n",
      "quickNote.html": "<template>\n    <lightning-button label=\"New note\" onclick={handleNew}></lightning-button>\n    <!-- TODO: textarea when showEditor -->\n</template>\n"
    },
    solution: {
      "quickNote.js": "import { LightningElement } from 'lwc';\n\nexport default class QuickNote extends LightningElement {\n    showEditor = false;\n    focusPending = false;\n\n    handleNew() {\n        this.showEditor = true;\n        this.focusPending = true;\n    }\n\n    renderedCallback() {\n        if (this.focusPending && this.refs.noteInput) {\n            this.focusPending = false;\n            this.refs.noteInput.focus();\n        }\n    }\n}\n",
      "quickNote.html": "<template>\n    <lightning-button label=\"New note\" onclick={handleNew}></lightning-button>\n    <template lwc:if={showEditor}>\n        <lightning-textarea lwc:ref=\"noteInput\" label=\"Note\"></lightning-textarea>\n    </template>\n</template>\n"
    },
    checks: [
      {
        re: /lwc:ref=["']noteInput["']/,
        msg: "Adds lwc:ref=\"noteInput\"",
        file: "quickNote.html"
      },
      {
        re: /this\.refs\.noteInput[\s\S]*\.focus\(\)/,
        msg: "Focuses via this.refs.noteInput",
        file: "quickNote.js"
      },
      {
        re: /renderedCallback\s*\(\s*\)\s*\{[\s\S]*if\s*\(/,
        msg: "Guards renderedCallback",
        file: "quickNote.js"
      },
      {
        re: /lwc:if=\{\s*showEditor\s*\}/,
        msg: "Renders the editor conditionally",
        file: "quickNote.html"
      }
    ],
    forbid: [
      {
        re: /document\.querySelector/,
        msg: "Don't query the global document"
      }
    ],
    hints: [
      "The textarea doesn't exist until after the re-render, so focusing in the click handler is too early.",
      "Set a flag in the handler; act on it and reset it in renderedCallback."
    ],
    ai: "Verify focus happens after render, only once per click (flag reset), and refs are null-checked."
  },
  {
    id: "LW079",
    track: "lwc",
    level: "Medium",
    topic: "Lifecycle & DOM",
    title: "Load Chart.js once in renderedCallback",
    task: "Hartwell Analytics shows a Data 360 engagement score trend. Build `engagementChart` using the `chartjs` static resource.\n- In `renderedCallback`, load the script with `loadScript(this, CHARTJS)` exactly once (guard flag)\n- After loading, create the chart on a `<canvas lwc:ref=\"chart\">` using `@api scores` (array of numbers)\n- Show an error message if loading fails\n- Destroy the chart in `disconnectedCallback`\n- Don't inject HTML or script tags",
    starter: {
      "engagementChart.js": "import { LightningElement, api } from 'lwc';\nimport CHARTJS from '@salesforce/resourceUrl/chartjs';\n\nexport default class EngagementChart extends LightningElement {\n    @api scores = [];\n    error;\n    // TODO\n}\n",
      "engagementChart.html": "<template>\n    <!-- TODO -->\n</template>\n"
    },
    solution: {
      "engagementChart.js": "import { LightningElement, api } from 'lwc';\nimport { loadScript } from 'lightning/platformResourceLoader';\nimport CHARTJS from '@salesforce/resourceUrl/chartjs';\n\nexport default class EngagementChart extends LightningElement {\n    @api scores = [];\n    error;\n    chartInitialised = false;\n    chart;\n\n    async renderedCallback() {\n        if (this.chartInitialised) return;\n        this.chartInitialised = true;\n        try {\n            await loadScript(this, CHARTJS);\n            const ctx = this.refs.chart.getContext('2d');\n            // eslint-disable-next-line no-undef\n            this.chart = new window.Chart(ctx, {\n                type: 'line',\n                data: {\n                    labels: this.scores.map((_, i) => `Week ${i + 1}`),\n                    datasets: [{ label: 'Engagement score', data: [...this.scores] }]\n                }\n            });\n        } catch (e) {\n            this.error = 'Unable to load the chart library.';\n        }\n    }\n\n    disconnectedCallback() {\n        if (this.chart) {\n            this.chart.destroy();\n            this.chart = null;\n        }\n        this.chartInitialised = false;\n    }\n}\n",
      "engagementChart.html": "<template>\n    <lightning-card title=\"Engagement trend\">\n        <template lwc:if={error}>\n            <p class=\"slds-p-around_small slds-text-color_error\">{error}</p>\n        </template>\n        <div class=\"slds-p-around_small\">\n            <canvas lwc:ref=\"chart\"></canvas>\n        </div>\n    </lightning-card>\n</template>\n"
    },
    checks: [
      {
        re: /from\s*['"]lightning\/platformResourceLoader['"]/,
        msg: "Imports loadScript",
        file: "engagementChart.js"
      },
      {
        re: /renderedCallback\s*\(\s*\)\s*\{\s*if\s*\(\s*this\.\w+\s*\)\s*(return|\{)/,
        msg: "Guards renderedCallback with a flag at the top",
        file: "engagementChart.js"
      },
      {
        re: /loadScript\(\s*this\s*,\s*CHARTJS\s*\)/,
        msg: "Loads the static resource",
        file: "engagementChart.js"
      },
      {
        re: /<canvas[^>]*lwc:ref=/i,
        msg: "Uses a canvas with lwc:ref",
        file: "engagementChart.html"
      },
      {
        re: /disconnectedCallback\s*\(\s*\)\s*\{[\s\S]*destroy\(\)/,
        msg: "Destroys the chart on disconnect",
        file: "engagementChart.js"
      }
    ],
    forbid: [
      {
        re: /innerHTML/i,
        msg: "Don't inject HTML"
      },
      {
        re: /<script/i,
        msg: "Load scripts with loadScript, not script tags"
      }
    ],
    hints: [
      "Set the guard flag before awaiting so a second render doesn't start a second load.",
      "After loadScript resolves, Chart is available on window."
    ],
    ai: "Verify the library loads once, the flag is set before the await, errors are surfaced, and the chart is destroyed on disconnect."
  },
  {
    id: "LW080",
    track: "lwc",
    level: "Medium",
    topic: "Lifecycle & DOM",
    title: "Responsive layout with a resize listener",
    task: "Burnside Field Services shows engineer jobs as cards on mobile and a table on desktop. Build `jobBoard`.\n- Keep `isCompact` true when `window.innerWidth < 768`\n- Add a `resize` listener in `connectedCallback` and remove the **same** function reference in `disconnectedCallback` (store a bound handler)\n- Set the initial value in `connectedCallback`\n- Template: `lwc:if={isCompact}` shows `<c-job-cards>`, `lwc:else` shows `<c-job-table>`",
    starter: {
      "jobBoard.js": "import { LightningElement } from 'lwc';\n\nexport default class JobBoard extends LightningElement {\n    isCompact = false;\n    // TODO\n}\n",
      "jobBoard.html": "<template>\n    <!-- TODO -->\n</template>\n"
    },
    solution: {
      "jobBoard.js": "import { LightningElement } from 'lwc';\n\nconst BREAKPOINT = 768;\n\nexport default class JobBoard extends LightningElement {\n    isCompact = false;\n    resizeHandler = this.handleResize.bind(this);\n\n    connectedCallback() {\n        this.handleResize();\n        window.addEventListener('resize', this.resizeHandler);\n    }\n\n    disconnectedCallback() {\n        window.removeEventListener('resize', this.resizeHandler);\n    }\n\n    handleResize() {\n        this.isCompact = window.innerWidth < BREAKPOINT;\n    }\n}\n",
      "jobBoard.html": "<template>\n    <template lwc:if={isCompact}>\n        <c-job-cards></c-job-cards>\n    </template>\n    <template lwc:else>\n        <c-job-table></c-job-table>\n    </template>\n</template>\n"
    },
    checks: [
      {
        re: /addEventListener\(\s*['"]resize['"]\s*,\s*this\.\w+\s*\)/,
        msg: "Adds the resize listener with a stored reference",
        file: "jobBoard.js"
      },
      {
        re: /removeEventListener\(\s*['"]resize['"]\s*,\s*this\.\w+\s*\)/,
        msg: "Removes the same reference",
        file: "jobBoard.js"
      },
      {
        re: /disconnectedCallback\s*\(\s*\)\s*\{[\s\S]*removeEventListener/,
        msg: "Cleans up in disconnectedCallback",
        file: "jobBoard.js"
      },
      {
        re: /innerWidth\s*<\s*(768|\w+)/,
        msg: "Compares innerWidth to the 768 breakpoint",
        file: "jobBoard.js"
      },
      {
        re: /lwc:if=\{\s*isCompact\s*\}[\s\S]*lwc:else/,
        msg: "Switches layouts with lwc:if / lwc:else",
        file: "jobBoard.html"
      }
    ],
    forbid: [
      {
        re: /removeEventListener\(\s*['"]resize['"]\s*,\s*(this\.\w+\.bind|\(\s*\)\s*=>)/,
        msg: "A new function reference can't remove the original listener"
      }
    ],
    hints: [
      "handler.bind(this) creates a new function every call — create it once and store it.",
      "Arrow-function class fields also give a stable reference."
    ],
    ai: "Verify the exact same function reference is added and removed, the initial value is set on connect, and the template uses lwc:if/lwc:else."
  },
  {
    id: "LW081",
    track: "lwc",
    level: "Easy",
    topic: "Lifecycle & DOM",
    title: "Validate all inputs with querySelectorAll",
    task: "Tamar Credit Union's membership form has several `lightning-input` and `lightning-combobox` fields marked required. Build `membershipForm`'s `handleSubmit`.\n- Use `this.template.querySelectorAll('lightning-input, lightning-combobox')`\n- Call `reportValidity()` on every field (so all errors show, not just the first) and combine with `checkValidity()`\n- Only dispatch a `submit` CustomEvent with the collected values when all are valid",
    starter: {
      "membershipForm.js": "import { LightningElement } from 'lwc';\n\nexport default class MembershipForm extends LightningElement {\n    accountTypes = [\n        { label: 'Saver', value: 'saver' },\n        { label: 'Current', value: 'current' }\n    ];\n\n    handleSubmit() {\n        // TODO\n    }\n}\n",
      "membershipForm.html": "<template>\n    <lightning-input name=\"fullName\" label=\"Full name\" required></lightning-input>\n    <lightning-input name=\"email\" type=\"email\" label=\"Email\" required></lightning-input>\n    <lightning-combobox name=\"accountType\" label=\"Account type\" options={accountTypes} required></lightning-combobox>\n    <lightning-button label=\"Join\" variant=\"brand\" onclick={handleSubmit}></lightning-button>\n</template>\n"
    },
    solution: {
      "membershipForm.js": "import { LightningElement } from 'lwc';\n\nexport default class MembershipForm extends LightningElement {\n    accountTypes = [\n        { label: 'Saver', value: 'saver' },\n        { label: 'Current', value: 'current' }\n    ];\n\n    handleSubmit() {\n        const fields = [...this.template.querySelectorAll('lightning-input, lightning-combobox')];\n        const allValid = fields.reduce((valid, field) => {\n            field.reportValidity();\n            return valid && field.checkValidity();\n        }, true);\n        if (!allValid) return;\n        const values = {};\n        fields.forEach((field) => {\n            values[field.name] = field.value;\n        });\n        this.dispatchEvent(new CustomEvent('submit', { detail: values }));\n    }\n}\n",
      "membershipForm.html": "<template>\n    <lightning-input name=\"fullName\" label=\"Full name\" required></lightning-input>\n    <lightning-input name=\"email\" type=\"email\" label=\"Email\" required></lightning-input>\n    <lightning-combobox name=\"accountType\" label=\"Account type\" options={accountTypes} required></lightning-combobox>\n    <lightning-button label=\"Join\" variant=\"brand\" onclick={handleSubmit}></lightning-button>\n</template>\n"
    },
    checks: [
      {
        re: /this\.template\.querySelectorAll\(\s*['"][^'"]*lightning-input[^'"]*['"]\s*\)/,
        msg: "Queries inputs with this.template.querySelectorAll",
        file: "membershipForm.js"
      },
      {
        re: /reportValidity\(\)/,
        msg: "Calls reportValidity on each field",
        file: "membershipForm.js"
      },
      {
        re: /checkValidity\(\)/,
        msg: "Uses checkValidity to decide",
        file: "membershipForm.js"
      },
      {
        re: /new\s+CustomEvent\(\s*['"]submit['"]/,
        msg: "Dispatches the submit event",
        file: "membershipForm.js"
      }
    ],
    forbid: [
      {
        re: /document\.querySelector/,
        msg: "Use this.template, not document"
      },
      {
        re: /\.every\(\s*\(?\s*\w+\s*\)?\s*=>\s*\w+\.reportValidity\(\)\s*\)/,
        msg: "every() stops at the first invalid field — report all of them"
      }
    ],
    hints: [
      "querySelectorAll returns a NodeList — spread it into an array.",
      "Use reduce or forEach so every field reports, then combine results."
    ],
    ai: "Verify every field calls reportValidity (no short-circuit), invalid forms do not dispatch, and values are keyed by field name."
  },
  {
    id: "LW082",
    track: "lwc",
    level: "Hard",
    topic: "Lifecycle & DOM",
    title: "Signature pad with canvas and @api clear",
    task: "Kingsbridge Couriers captures proof-of-delivery signatures. Build `signaturePad`.\n- A `<canvas lwc:ref=\"pad\">`; initialise the 2D context once in `renderedCallback` (guard)\n- Draw with pointer events: `onpointerdown`, `onpointermove`, `onpointerup` (and `onpointerleave` stops drawing); use `offsetX/offsetY`\n- Expose `@api clear()` that clears the canvas and resets `isEmpty`\n- Expose `@api getSignature()` that returns `null` when empty, otherwise `canvas.toDataURL('image/png')`",
    starter: {
      "signaturePad.js": "import { LightningElement, api } from 'lwc';\n\nexport default class SignaturePad extends LightningElement {\n    isEmpty = true;\n    // TODO\n}\n",
      "signaturePad.html": "<template>\n    <!-- TODO: canvas with pointer handlers -->\n</template>\n",
      "signaturePad.css": "canvas {\n    border: 1px solid var(--slds-g-color-border-base-1, #c9c9c9);\n    touch-action: none;\n    width: 100%;\n    height: 200px;\n}\n"
    },
    solution: {
      "signaturePad.js": "import { LightningElement, api } from 'lwc';\n\nexport default class SignaturePad extends LightningElement {\n    isEmpty = true;\n    ctx;\n    drawing = false;\n\n    renderedCallback() {\n        if (this.ctx) return;\n        const canvas = this.refs.pad;\n        canvas.width = canvas.offsetWidth;\n        canvas.height = canvas.offsetHeight;\n        this.ctx = canvas.getContext('2d');\n        this.ctx.lineWidth = 2;\n        this.ctx.lineCap = 'round';\n    }\n\n    handlePointerDown(event) {\n        this.drawing = true;\n        this.ctx.beginPath();\n        this.ctx.moveTo(event.offsetX, event.offsetY);\n    }\n\n    handlePointerMove(event) {\n        if (!this.drawing) return;\n        this.ctx.lineTo(event.offsetX, event.offsetY);\n        this.ctx.stroke();\n        this.isEmpty = false;\n    }\n\n    handlePointerUp() {\n        this.drawing = false;\n    }\n\n    @api\n    clear() {\n        const canvas = this.refs.pad;\n        this.ctx.clearRect(0, 0, canvas.width, canvas.height);\n        this.isEmpty = true;\n    }\n\n    @api\n    getSignature() {\n        return this.isEmpty ? null : this.refs.pad.toDataURL('image/png');\n    }\n}\n",
      "signaturePad.html": "<template>\n    <canvas lwc:ref=\"pad\"\n        onpointerdown={handlePointerDown}\n        onpointermove={handlePointerMove}\n        onpointerup={handlePointerUp}\n        onpointerleave={handlePointerUp}></canvas>\n</template>\n",
      "signaturePad.css": "canvas {\n    border: 1px solid var(--slds-g-color-border-base-1, #c9c9c9);\n    touch-action: none;\n    width: 100%;\n    height: 200px;\n}\n"
    },
    checks: [
      {
        re: /<canvas[^>]*lwc:ref=["']pad["']/i,
        msg: "Canvas has lwc:ref=\"pad\"",
        file: "signaturePad.html"
      },
      {
        re: /onpointerdown=[\s\S]*onpointermove=[\s\S]*onpointerup=/i,
        msg: "Handles pointer down/move/up",
        file: "signaturePad.html"
      },
      {
        re: /renderedCallback\s*\(\s*\)\s*\{\s*if\s*\(/,
        msg: "Guards initialisation in renderedCallback",
        file: "signaturePad.js"
      },
      {
        re: /@api\s+clear\s*\(\s*\)/,
        msg: "Exposes @api clear()",
        file: "signaturePad.js"
      },
      {
        re: /@api\s+getSignature\s*\(\s*\)/,
        msg: "Exposes @api getSignature()",
        file: "signaturePad.js"
      },
      {
        re: /toDataURL\(\s*['"]image\/png['"]\s*\)/,
        msg: "Returns a PNG data URL",
        file: "signaturePad.js"
      }
    ],
    forbid: [
      {
        re: /document\.(querySelector|getElementById)/,
        msg: "Use lwc:ref instead of global DOM queries"
      }
    ],
    hints: [
      "Only call getContext once — keep it on the component and early-return if it exists.",
      "Track a drawing flag between pointerdown and pointerup."
    ],
    ai: "Verify the context is initialised once, drawing only happens between down and up/leave, clear resets isEmpty, and getSignature returns null for an empty pad."
  },
  {
    id: "LW083",
    track: "lwc",
    level: "Medium",
    topic: "Lifecycle & DOM",
    title: "Auto-scroll an Agentforce chat transcript",
    task: "Sefton Mobile embeds an Agentforce conversation transcript. `agentTranscript` receives `@api messages` (array of { id, author, text }).\n- After render, scroll the container (`lwc:ref=\"scroller\"`) to the bottom **only when the number of messages has increased** since the last render\n- Track the last rendered count in a field; compare in `renderedCallback`\n- Render messages with `for:each` and plain text bindings (no HTML injection)",
    starter: {
      "agentTranscript.js": "import { LightningElement, api } from 'lwc';\n\nexport default class AgentTranscript extends LightningElement {\n    @api messages = [];\n    // TODO\n}\n",
      "agentTranscript.html": "<template>\n    <div class=\"transcript\">\n        <!-- TODO -->\n    </div>\n</template>\n"
    },
    solution: {
      "agentTranscript.js": "import { LightningElement, api } from 'lwc';\n\nexport default class AgentTranscript extends LightningElement {\n    @api messages = [];\n    lastCount = 0;\n\n    renderedCallback() {\n        const count = this.messages ? this.messages.length : 0;\n        if (count > this.lastCount && this.refs.scroller) {\n            const el = this.refs.scroller;\n            el.scrollTop = el.scrollHeight;\n        }\n        this.lastCount = count;\n    }\n}\n",
      "agentTranscript.html": "<template>\n    <div class=\"transcript slds-scrollable_y\" style=\"max-height: 24rem\" lwc:ref=\"scroller\">\n        <template for:each={messages} for:item=\"msg\">\n            <div key={msg.id} class=\"slds-m-bottom_x-small\">\n                <p class=\"slds-text-title_bold\">{msg.author}</p>\n                <p>{msg.text}</p>\n            </div>\n        </template>\n    </div>\n</template>\n"
    },
    checks: [
      {
        re: /lwc:ref=["']scroller["']/,
        msg: "Container has lwc:ref=\"scroller\"",
        file: "agentTranscript.html"
      },
      {
        re: /renderedCallback\s*\(\s*\)\s*\{[\s\S]*>\s*this\.\w+/,
        msg: "Compares the message count with the last rendered count",
        file: "agentTranscript.js"
      },
      {
        re: /scrollTop\s*=\s*\w+\.scrollHeight|scrollTo\(|scrollIntoView\(/,
        msg: "Scrolls to the bottom",
        file: "agentTranscript.js"
      },
      {
        re: /for:each=\{\s*messages\s*\}/,
        msg: "Iterates messages",
        file: "agentTranscript.html"
      }
    ],
    forbid: [
      {
        re: /innerHTML|lwc:dom=["']manual["']/i,
        msg: "Render text with bindings, not injected HTML"
      }
    ],
    hints: [
      "renderedCallback fires on every re-render — compare against a stored count.",
      "Remember to update the stored count after checking."
    ],
    ai: "Verify scrolling only happens when messages increase (not on unrelated re-renders), the stored count updates every render, and message text is rendered via bindings."
  },
  {
    id: "LW084",
    track: "lwc",
    level: "Easy",
    topic: "Performance & UX",
    title: "Spinner around an imperative Apex call",
    task: "Ferndale Garden Centres loads stock levels on demand. Build `stockChecker`.\n- A \"Check stock\" button calls `StockController.getStockLevels({ sku })` imperatively (sku from a lightning-input)\n- Set `isLoading = true` before the call and reset it in `finally`\n- Show `lightning-spinner` while loading; render results in a list; show the error message on failure\n- Disable the button when `sku` is blank or while loading",
    starter: {
      "stockChecker.js": "import { LightningElement } from 'lwc';\nimport getStockLevels from '@salesforce/apex/StockController.getStockLevels';\n\nexport default class StockChecker extends LightningElement {\n    sku = '';\n    levels = [];\n    error;\n    isLoading = false;\n\n    handleSku(event) {\n        this.sku = event.target.value;\n    }\n\n    async handleCheck() {\n        // TODO\n    }\n}\n",
      "stockChecker.html": "<template>\n    <lightning-input label=\"SKU\" value={sku} onchange={handleSku}></lightning-input>\n    <!-- TODO: button, spinner, results, error -->\n</template>\n"
    },
    solution: {
      "stockChecker.js": "import { LightningElement } from 'lwc';\nimport getStockLevels from '@salesforce/apex/StockController.getStockLevels';\n\nexport default class StockChecker extends LightningElement {\n    sku = '';\n    levels = [];\n    error;\n    isLoading = false;\n\n    handleSku(event) {\n        this.sku = event.target.value;\n    }\n\n    get checkDisabled() {\n        return this.isLoading || !this.sku || !this.sku.trim();\n    }\n\n    async handleCheck() {\n        this.isLoading = true;\n        this.error = undefined;\n        try {\n            this.levels = await getStockLevels({ sku: this.sku.trim() });\n        } catch (e) {\n            this.levels = [];\n            this.error = e.body?.message || 'Unknown error';\n        } finally {\n            this.isLoading = false;\n        }\n    }\n}\n",
      "stockChecker.html": "<template>\n    <div class=\"slds-is-relative\">\n        <lightning-input label=\"SKU\" value={sku} onchange={handleSku}></lightning-input>\n        <lightning-button label=\"Check stock\" disabled={checkDisabled} onclick={handleCheck}></lightning-button>\n        <template lwc:if={isLoading}>\n            <lightning-spinner alternative-text=\"Checking stock\" size=\"small\"></lightning-spinner>\n        </template>\n        <template lwc:if={error}>\n            <p class=\"slds-text-color_error\">{error}</p>\n        </template>\n        <ul class=\"slds-list_dotted\">\n            <template for:each={levels} for:item=\"level\">\n                <li key={level.Id}>{level.Name}: {level.Quantity__c}</li>\n            </template>\n        </ul>\n    </div>\n</template>\n"
    },
    checks: [
      {
        re: /isLoading\s*=\s*true/,
        msg: "Sets isLoading before the call",
        file: "stockChecker.js"
      },
      {
        re: /finally\s*\{[\s\S]*isLoading\s*=\s*false/,
        msg: "Resets isLoading in finally",
        file: "stockChecker.js"
      },
      {
        re: /getStockLevels\(\s*\{\s*sku\s*:/,
        msg: "Calls Apex with { sku }",
        file: "stockChecker.js"
      },
      {
        re: /<lightning-spinner/i,
        msg: "Shows a spinner",
        file: "stockChecker.html"
      },
      {
        re: /disabled=\{\s*\w+\s*\}/i,
        msg: "Disables the button via a getter/property",
        file: "stockChecker.html"
      }
    ],
    forbid: [
      {
        re: /@wire\(\s*getStockLevels/,
        msg: "This is an on-demand imperative call"
      }
    ],
    hints: [
      "try/catch/finally keeps the spinner logic in one place.",
      "A getter can combine the blank-sku and loading conditions."
    ],
    ai: "Verify the spinner always clears, the previous error is reset before a new call, and the button is disabled for whitespace-only SKUs."
  },
  {
    id: "LW085",
    track: "lwc",
    level: "Easy",
    topic: "Performance & UX",
    title: "reduceErrors utility for error panels",
    task: "Ingleby Housing wants consistent error messages. Build `errorPanel` with an exported helper.\n- In `errorPanel.js` export `function reduceErrors(errors)` that accepts one error or an array and returns an array of strings\n- Handle: UI API errors `body.message`, Apex/DML page errors `body.pageErrors[].message`, field errors `body.fieldErrors` (object of arrays), JS errors `message`, and arrays in `body`\n- Remove empty values\n- The component takes `@api errors` and renders each message in a list",
    starter: {
      "errorPanel.js": "import { LightningElement, api } from 'lwc';\n\nexport function reduceErrors(errors) {\n    // TODO\n    return [];\n}\n\nexport default class ErrorPanel extends LightningElement {\n    @api errors;\n    // TODO: messages getter\n}\n",
      "errorPanel.html": "<template>\n    <!-- TODO -->\n</template>\n"
    },
    solution: {
      "errorPanel.js": "import { LightningElement, api } from 'lwc';\n\nexport function reduceErrors(errors) {\n    if (!errors) return [];\n    const list = Array.isArray(errors) ? errors : [errors];\n    return list\n        .filter((error) => !!error)\n        .flatMap((error) => {\n            if (Array.isArray(error.body)) {\n                return error.body.map((e) => e.message);\n            }\n            if (error.body?.pageErrors?.length) {\n                return error.body.pageErrors.map((e) => e.message);\n            }\n            if (error.body?.fieldErrors && Object.keys(error.body.fieldErrors).length) {\n                return Object.values(error.body.fieldErrors).flat().map((e) => e.message);\n            }\n            if (typeof error.body?.message === 'string') {\n                return [error.body.message];\n            }\n            if (typeof error.message === 'string') {\n                return [error.message];\n            }\n            return [error.statusText];\n        })\n        .filter((message) => !!message);\n}\n\nexport default class ErrorPanel extends LightningElement {\n    @api errors;\n\n    get messages() {\n        return reduceErrors(this.errors);\n    }\n}\n",
      "errorPanel.html": "<template>\n    <template lwc:if={messages.length}>\n        <div class=\"slds-text-color_error\" role=\"alert\">\n            <ul>\n                <template for:each={messages} for:item=\"message\">\n                    <li key={message}>{message}</li>\n                </template>\n            </ul>\n        </div>\n    </template>\n</template>\n"
    },
    checks: [
      {
        re: /export\s+function\s+reduceErrors\s*\(\s*\w+\s*\)/,
        msg: "Exports reduceErrors(errors)",
        file: "errorPanel.js"
      },
      {
        re: /Array\.isArray\(/,
        msg: "Normalises single errors and arrays",
        file: "errorPanel.js"
      },
      {
        re: /pageErrors/,
        msg: "Handles body.pageErrors",
        file: "errorPanel.js"
      },
      {
        re: /fieldErrors/,
        msg: "Handles body.fieldErrors",
        file: "errorPanel.js"
      },
      {
        re: /body\??\.message/,
        msg: "Handles body.message",
        file: "errorPanel.js"
      },
      {
        re: /for:each=\{\s*messages\s*\}/,
        msg: "Renders each message",
        file: "errorPanel.html"
      }
    ],
    forbid: [
      {
        re: /innerHTML/i,
        msg: "Render messages as text"
      }
    ],
    hints: [
      "Wrap a single error in an array first, then flatMap each error to its messages.",
      "fieldErrors is { FieldName: [ { message } ] } — Object.values(...).flat()."
    ],
    ai: "Verify every documented error shape is handled, falsy inputs return [], empty messages are filtered, and the component re-derives messages via a getter."
  },
  {
    id: "LW086",
    track: "lwc",
    level: "Medium",
    topic: "Performance & UX",
    title: "Debounced account search",
    task: "Rochford Wholesale's reps search 2 million accounts. Build `accountSearch`.\n- On each keystroke store the term and debounce the Apex call by 300 ms using `setTimeout`/`clearTimeout`\n- Only search when the trimmed term has at least 2 characters; otherwise clear results\n- Call `AccountSearchController.search({ term })` imperatively and store `accounts`\n- Clear any pending timer in `disconnectedCallback`",
    starter: {
      "accountSearch.js": "import { LightningElement } from 'lwc';\nimport search from '@salesforce/apex/AccountSearchController.search';\n\nconst DELAY = 300;\n\nexport default class AccountSearch extends LightningElement {\n    term = '';\n    accounts = [];\n    error;\n\n    handleKeyChange(event) {\n        // TODO\n    }\n}\n",
      "accountSearch.html": "<template>\n    <lightning-input type=\"search\" label=\"Search accounts\" onchange={handleKeyChange}></lightning-input>\n    <template for:each={accounts} for:item=\"acc\">\n        <p key={acc.Id}>{acc.Name}</p>\n    </template>\n</template>\n"
    },
    solution: {
      "accountSearch.js": "import { LightningElement } from 'lwc';\nimport search from '@salesforce/apex/AccountSearchController.search';\n\nconst DELAY = 300;\n\nexport default class AccountSearch extends LightningElement {\n    term = '';\n    accounts = [];\n    error;\n    delayTimeout;\n\n    handleKeyChange(event) {\n        this.term = event.target.value;\n        clearTimeout(this.delayTimeout);\n        // eslint-disable-next-line @lwc/lwc/no-async-operation\n        this.delayTimeout = setTimeout(() => this.runSearch(), DELAY);\n    }\n\n    async runSearch() {\n        const term = (this.term || '').trim();\n        if (term.length < 2) {\n            this.accounts = [];\n            return;\n        }\n        try {\n            this.accounts = await search({ term });\n            this.error = undefined;\n        } catch (e) {\n            this.accounts = [];\n            this.error = e;\n        }\n    }\n\n    disconnectedCallback() {\n        clearTimeout(this.delayTimeout);\n    }\n}\n",
      "accountSearch.html": "<template>\n    <lightning-input type=\"search\" label=\"Search accounts\" onchange={handleKeyChange}></lightning-input>\n    <template for:each={accounts} for:item=\"acc\">\n        <p key={acc.Id}>{acc.Name}</p>\n    </template>\n</template>\n"
    },
    checks: [
      {
        re: /clearTimeout\(\s*this\.\w+\s*\)/,
        msg: "Clears the previous timer",
        file: "accountSearch.js"
      },
      {
        re: /this\.\w+\s*=\s*setTimeout\(/,
        msg: "Stores the new timer id",
        file: "accountSearch.js"
      },
      {
        re: /DELAY|300/,
        msg: "Uses a 300 ms delay",
        file: "accountSearch.js"
      },
      {
        re: /length\s*<\s*2|length\s*>=\s*2/,
        msg: "Enforces the 2-character minimum",
        file: "accountSearch.js"
      },
      {
        re: /disconnectedCallback\s*\(\s*\)\s*\{[\s\S]*clearTimeout/,
        msg: "Clears the timer on disconnect",
        file: "accountSearch.js"
      }
    ],
    forbid: [
      {
        re: /handleKeyChange\s*\([^)]*\)\s*\{[^}]*await\s+search\(/,
        msg: "Don't call Apex directly on every keystroke"
      }
    ],
    hints: [
      "Cancel the previous timeout before scheduling a new one.",
      "Do the length check when the timer fires, using the latest term."
    ],
    ai: "Verify only one Apex call happens after typing stops, short terms clear results without calling Apex, and the timer is cleared on disconnect."
  },
  {
    id: "LW087",
    track: "lwc",
    level: "Medium",
    topic: "Performance & UX",
    title: "Client-side pagination with getters",
    task: "Calderbrook Hotels shows guest feedback (`@api records`, up to 500 rows) 10 per page. Build `feedbackPager`.\n- Track `pageNumber` (starting at 1); `pageSize` = 10\n- Getters: `totalPages` (at least 1), `pageRecords` (slice of records), `isFirst`, `isLast`, `pageLabel` (\"Page X of Y\")\n- Previous/Next buttons disabled on the first/last page\n- If `records` changes and the current page no longer exists, clamp to the last page in the getter logic",
    starter: {
      "feedbackPager.js": "import { LightningElement, api } from 'lwc';\n\nconst PAGE_SIZE = 10;\n\nexport default class FeedbackPager extends LightningElement {\n    @api records = [];\n    pageNumber = 1;\n    // TODO\n}\n",
      "feedbackPager.html": "<template>\n    <!-- TODO -->\n</template>\n"
    },
    solution: {
      "feedbackPager.js": "import { LightningElement, api } from 'lwc';\n\nconst PAGE_SIZE = 10;\n\nexport default class FeedbackPager extends LightningElement {\n    @api records = [];\n    pageNumber = 1;\n\n    get totalPages() {\n        return Math.max(1, Math.ceil((this.records?.length || 0) / PAGE_SIZE));\n    }\n\n    get currentPage() {\n        return Math.min(this.pageNumber, this.totalPages);\n    }\n\n    get pageRecords() {\n        const start = (this.currentPage - 1) * PAGE_SIZE;\n        return (this.records || []).slice(start, start + PAGE_SIZE);\n    }\n\n    get isFirst() {\n        return this.currentPage <= 1;\n    }\n\n    get isLast() {\n        return this.currentPage >= this.totalPages;\n    }\n\n    get pageLabel() {\n        return `Page ${this.currentPage} of ${this.totalPages}`;\n    }\n\n    handlePrevious() {\n        this.pageNumber = Math.max(1, this.currentPage - 1);\n    }\n\n    handleNext() {\n        this.pageNumber = Math.min(this.totalPages, this.currentPage + 1);\n    }\n}\n",
      "feedbackPager.html": "<template>\n    <template for:each={pageRecords} for:item=\"rec\">\n        <p key={rec.Id}>{rec.Comment__c}</p>\n    </template>\n    <div class=\"slds-grid slds-grid_align-spread slds-m-top_small\">\n        <lightning-button label=\"Previous\" disabled={isFirst} onclick={handlePrevious}></lightning-button>\n        <span>{pageLabel}</span>\n        <lightning-button label=\"Next\" disabled={isLast} onclick={handleNext}></lightning-button>\n    </div>\n</template>\n"
    },
    checks: [
      {
        re: /get\s+totalPages\s*\(\s*\)[\s\S]*Math\.ceil/,
        msg: "Computes totalPages with Math.ceil",
        file: "feedbackPager.js"
      },
      {
        re: /get\s+pageRecords\s*\(\s*\)[\s\S]*\.slice\(/,
        msg: "Slices the records for the page",
        file: "feedbackPager.js"
      },
      {
        re: /Math\.max\(\s*1/,
        msg: "totalPages / page number never drops below 1",
        file: "feedbackPager.js"
      },
      {
        re: /disabled=\{\s*isFirst\s*\}/,
        msg: "Previous disabled on the first page",
        file: "feedbackPager.html"
      },
      {
        re: /disabled=\{\s*isLast\s*\}/,
        msg: "Next disabled on the last page",
        file: "feedbackPager.html"
      }
    ],
    forbid: [
      {
        re: /this\.records\.splice\(/,
        msg: "Don't mutate the @api array"
      }
    ],
    hints: [
      "Derive everything from pageNumber and records with getters.",
      "Clamp with Math.min(pageNumber, totalPages) so a shrinking list stays valid."
    ],
    ai: "Verify empty records give \"Page 1 of 1\" with both buttons disabled, slicing boundaries are correct, and shrinking the list clamps the page."
  },
  {
    id: "LW088",
    track: "lwc",
    level: "Medium",
    topic: "Performance & UX",
    title: "Lazy-load heavy tabs on first activation",
    task: "Westerby Energy's customer 360 page has three tabs (Overview, Billing, Data 360 Insights). Billing and Insights call expensive Apex. Build `customerTabs`.\n- Use `lightning-tabset` with `lightning-tab` and `onactive` handlers\n- Render `<c-billing-history>` and `<c-insights-panel>` only after their tab has been opened at least once (track `loadedTabs` as a Set or object; keep them rendered afterwards)\n- Pass `record-id={recordId}` to each child",
    starter: {
      "customerTabs.js": "import { LightningElement, api } from 'lwc';\n\nexport default class CustomerTabs extends LightningElement {\n    @api recordId;\n    // TODO\n}\n",
      "customerTabs.html": "<template>\n    <!-- TODO -->\n</template>\n"
    },
    solution: {
      "customerTabs.js": "import { LightningElement, api } from 'lwc';\n\nexport default class CustomerTabs extends LightningElement {\n    @api recordId;\n    loadedTabs = { overview: true };\n\n    handleActive(event) {\n        const tab = event.target.value;\n        if (!this.loadedTabs[tab]) {\n            this.loadedTabs = { ...this.loadedTabs, [tab]: true };\n        }\n    }\n\n    get showBilling() {\n        return !!this.loadedTabs.billing;\n    }\n\n    get showInsights() {\n        return !!this.loadedTabs.insights;\n    }\n}\n",
      "customerTabs.html": "<template>\n    <lightning-tabset>\n        <lightning-tab label=\"Overview\" value=\"overview\" onactive={handleActive}>\n            <c-customer-overview record-id={recordId}></c-customer-overview>\n        </lightning-tab>\n        <lightning-tab label=\"Billing\" value=\"billing\" onactive={handleActive}>\n            <template lwc:if={showBilling}>\n                <c-billing-history record-id={recordId}></c-billing-history>\n            </template>\n        </lightning-tab>\n        <lightning-tab label=\"Data 360 Insights\" value=\"insights\" onactive={handleActive}>\n            <template lwc:if={showInsights}>\n                <c-insights-panel record-id={recordId}></c-insights-panel>\n            </template>\n        </lightning-tab>\n    </lightning-tabset>\n</template>\n"
    },
    checks: [
      {
        re: /<lightning-tab[^>]*onactive=\{\s*\w+\s*\}/i,
        msg: "Handles onactive on tabs",
        file: "customerTabs.html"
      },
      {
        re: /lwc:if=\{\s*\w+\s*\}[\s\S]*<c-billing-history/i,
        msg: "Billing child is conditionally rendered",
        file: "customerTabs.html"
      },
      {
        re: /lwc:if=\{\s*\w+\s*\}[\s\S]*<c-insights-panel/i,
        msg: "Insights child is conditionally rendered",
        file: "customerTabs.html"
      },
      {
        re: /event\.target\.value|event\.detail/,
        msg: "Identifies which tab was activated",
        file: "customerTabs.js"
      },
      {
        re: /record-id=\{\s*recordId\s*\}/i,
        msg: "Passes recordId to children",
        file: "customerTabs.html"
      }
    ],
    forbid: [
      {
        re: /this\.loadedTabs\.add\(|this\.loadedTabs\[\w+\]\s*=(?!=)/,
        msg: "Reassign a new object/Set so the change is reactive"
      }
    ],
    hints: [
      "lightning-tab fires active when selected; its value tells you which one.",
      "Mutating a Set/object in place is not tracked — reassign a copy."
    ],
    ai: "Verify heavy children are not rendered until first activation, stay rendered afterwards (no re-fetch on every switch), and state changes are reactive."
  },
  {
    id: "LW089",
    track: "lwc",
    level: "Hard",
    topic: "Performance & UX",
    title: "Infinite scroll datatable with Apex paging",
    task: "Ashby Freight lists 50,000 shipment events. Build `shipmentLog` with Apex `ShipmentLogController`.\n- Apex: `@AuraEnabled(cacheable=true) public static List<Shipment_Event__c> getEvents(Integer pageSize, Datetime beforeTime)` — newest first; when beforeTime is non-null return only events with `Event_Time__c < :beforeTime` (keyset paging, not OFFSET); `WITH USER_MODE`\n- LWC: load the first 50 in `connectedCallback`; `enable-infinite-loading` and `onloadmore`\n- In loadmore set `event.target.isLoading`, append rows, and turn infinite loading off when a page returns fewer than 50 rows\n- Ignore loadmore while a request is in flight",
    starter: {
      "shipmentLog.js": "import { LightningElement } from 'lwc';\nimport getEvents from '@salesforce/apex/ShipmentLogController.getEvents';\n\nconst PAGE_SIZE = 50;\n\nexport default class ShipmentLog extends LightningElement {\n    columns = [\n        { label: 'Time', fieldName: 'Event_Time__c', type: 'date' },\n        { label: 'Shipment', fieldName: 'Shipment_Ref__c' },\n        { label: 'Status', fieldName: 'Status__c' }\n    ];\n    rows = [];\n    // TODO\n}\n",
      "shipmentLog.html": "<template>\n    <div style=\"height: 30rem\">\n        <lightning-datatable key-field=\"Id\" data={rows} columns={columns} hide-checkbox-column></lightning-datatable>\n    </div>\n</template>\n",
      "ShipmentLogController.cls": "public with sharing class ShipmentLogController {\n    // TODO: getEvents\n}\n"
    },
    solution: {
      "shipmentLog.js": "import { LightningElement } from 'lwc';\nimport getEvents from '@salesforce/apex/ShipmentLogController.getEvents';\n\nconst PAGE_SIZE = 50;\n\nexport default class ShipmentLog extends LightningElement {\n    columns = [\n        { label: 'Time', fieldName: 'Event_Time__c', type: 'date' },\n        { label: 'Shipment', fieldName: 'Shipment_Ref__c' },\n        { label: 'Status', fieldName: 'Status__c' }\n    ];\n    rows = [];\n    hasMore = true;\n    loading = false;\n    error;\n\n    connectedCallback() {\n        this.fetchPage();\n    }\n\n    async fetchPage() {\n        if (this.loading || !this.hasMore) return;\n        this.loading = true;\n        try {\n            const last = this.rows[this.rows.length - 1];\n            const page = await getEvents({ pageSize: PAGE_SIZE, beforeTime: last ? last.Event_Time__c : null });\n            this.rows = [...this.rows, ...page];\n            if (page.length < PAGE_SIZE) {\n                this.hasMore = false;\n            }\n        } catch (e) {\n            this.error = e;\n            this.hasMore = false;\n        } finally {\n            this.loading = false;\n        }\n    }\n\n    async handleLoadMore(event) {\n        const table = event.target;\n        if (this.loading) return;\n        table.isLoading = true;\n        await this.fetchPage();\n        table.isLoading = false;\n    }\n}\n",
      "shipmentLog.html": "<template>\n    <div style=\"height: 30rem\">\n        <lightning-datatable key-field=\"Id\" data={rows} columns={columns} hide-checkbox-column\n            enable-infinite-loading={hasMore} load-more-offset=\"20\" onloadmore={handleLoadMore}></lightning-datatable>\n    </div>\n</template>\n",
      "ShipmentLogController.cls": "public with sharing class ShipmentLogController {\n    @AuraEnabled(cacheable=true)\n    public static List<Shipment_Event__c> getEvents(Integer pageSize, Datetime beforeTime) {\n        Integer lim = (pageSize == null || pageSize <= 0 || pageSize > 200) ? 50 : pageSize;\n        if (beforeTime == null) {\n            return [\n                SELECT Id, Event_Time__c, Shipment_Ref__c, Status__c\n                FROM Shipment_Event__c\n                WITH USER_MODE\n                ORDER BY Event_Time__c DESC\n                LIMIT :lim\n            ];\n        }\n        return [\n            SELECT Id, Event_Time__c, Shipment_Ref__c, Status__c\n            FROM Shipment_Event__c\n            WHERE Event_Time__c < :beforeTime\n            WITH USER_MODE\n            ORDER BY Event_Time__c DESC\n            LIMIT :lim\n        ];\n    }\n}\n"
    },
    checks: [
      {
        re: /enable-infinite-loading/i,
        msg: "Enables infinite loading",
        file: "shipmentLog.html"
      },
      {
        re: /onloadmore=\{\s*\w+\s*\}/i,
        msg: "Handles onloadmore",
        file: "shipmentLog.html"
      },
      {
        re: /isLoading\s*=\s*true/,
        msg: "Sets the datatable isLoading flag",
        file: "shipmentLog.js"
      },
      {
        re: /\[\s*\.\.\.\s*this\.rows\s*,|this\.rows\.concat\(/,
        msg: "Appends rows immutably",
        file: "shipmentLog.js"
      },
      {
        re: /Event_Time__c\s*<\s*:\s*\w+/i,
        msg: "Keyset paging on Event_Time__c",
        file: "ShipmentLogController.cls"
      },
      {
        re: /ORDER\s+BY\s+Event_Time__c\s+DESC/i,
        msg: "Orders newest first",
        file: "ShipmentLogController.cls"
      }
    ],
    forbid: [
      {
        re: /\bOFFSET\b/i,
        msg: "Use keyset paging rather than OFFSET (2,000 row limit)",
        file: "ShipmentLogController.cls"
      }
    ],
    hints: [
      "Pass the last row's Event_Time__c to get the next page.",
      "Bind enable-infinite-loading to a property you switch off when the data runs out."
    ],
    ai: "Verify keyset paging (no OFFSET), WITH USER_MODE, concurrent loadmore calls are ignored, infinite loading turns off on a short page, and isLoading is reset. Note ties on Event_Time__c are an acceptable limitation if mentioned."
  },
  {
    id: "LW090",
    track: "lwc",
    level: "Hard",
    topic: "Performance & UX",
    title: "Search that ignores stale responses",
    task: "Lowther Legal's matter search is debounced, but slow responses for older terms sometimes arrive after newer ones and overwrite results. Fix `matterSearch`.\n- Debounce 250 ms with setTimeout/clearTimeout\n- Give each request an incrementing `requestId`; when a response returns, apply it only if its id matches the latest request\n- Show a spinner while the latest request is pending; ignore errors from stale requests too\n- Cache results per lower-cased term in a `Map` so repeat searches return instantly without Apex",
    starter: {
      "matterSearch.js": "import { LightningElement } from 'lwc';\nimport searchMatters from '@salesforce/apex/MatterController.searchMatters';\n\nexport default class MatterSearch extends LightningElement {\n    results = [];\n    isLoading = false;\n    error;\n\n    handleInput(event) {\n        // TODO\n    }\n}\n",
      "matterSearch.html": "<template>\n    <lightning-input type=\"search\" label=\"Find a matter\" onchange={handleInput}></lightning-input>\n    <!-- TODO: spinner, results -->\n</template>\n"
    },
    solution: {
      "matterSearch.js": "import { LightningElement } from 'lwc';\nimport searchMatters from '@salesforce/apex/MatterController.searchMatters';\n\nconst DELAY = 250;\n\nexport default class MatterSearch extends LightningElement {\n    results = [];\n    isLoading = false;\n    error;\n    timer;\n    latestRequestId = 0;\n    cache = new Map();\n\n    handleInput(event) {\n        const term = (event.target.value || '').trim().toLowerCase();\n        clearTimeout(this.timer);\n        // eslint-disable-next-line @lwc/lwc/no-async-operation\n        this.timer = setTimeout(() => this.runSearch(term), DELAY);\n    }\n\n    async runSearch(term) {\n        const requestId = ++this.latestRequestId;\n        if (!term) {\n            this.results = [];\n            this.isLoading = false;\n            return;\n        }\n        if (this.cache.has(term)) {\n            this.results = this.cache.get(term);\n            this.isLoading = false;\n            return;\n        }\n        this.isLoading = true;\n        try {\n            const data = await searchMatters({ term });\n            this.cache.set(term, data);\n            if (requestId !== this.latestRequestId) return;\n            this.results = data;\n            this.error = undefined;\n        } catch (e) {\n            if (requestId !== this.latestRequestId) return;\n            this.results = [];\n            this.error = e.body?.message;\n        } finally {\n            if (requestId === this.latestRequestId) this.isLoading = false;\n        }\n    }\n\n    disconnectedCallback() {\n        clearTimeout(this.timer);\n    }\n}\n",
      "matterSearch.html": "<template>\n    <div class=\"slds-is-relative\">\n        <lightning-input type=\"search\" label=\"Find a matter\" onchange={handleInput}></lightning-input>\n        <template lwc:if={isLoading}>\n            <lightning-spinner alternative-text=\"Searching\" size=\"small\"></lightning-spinner>\n        </template>\n        <template lwc:if={error}>\n            <p class=\"slds-text-color_error\">{error}</p>\n        </template>\n        <template for:each={results} for:item=\"m\">\n            <p key={m.Id}>{m.Name}</p>\n        </template>\n    </div>\n</template>\n"
    },
    checks: [
      {
        re: /clearTimeout\([\s\S]*setTimeout\(/,
        msg: "Debounces with clearTimeout/setTimeout",
        file: "matterSearch.js"
      },
      {
        re: /\+\+\s*this\.\w+|this\.\w+\s*\+\+|this\.\w+\s*\+=\s*1/,
        msg: "Increments a request counter",
        file: "matterSearch.js"
      },
      {
        re: /(!==|===)\s*this\.\w+/,
        msg: "Compares the response id with the latest request",
        file: "matterSearch.js"
      },
      {
        re: /new\s+Map\(\s*\)/,
        msg: "Caches results in a Map",
        file: "matterSearch.js"
      },
      {
        re: /toLowerCase\(\)/,
        msg: "Normalises the cache key",
        file: "matterSearch.js"
      },
      {
        re: /<lightning-spinner/i,
        msg: "Shows a spinner",
        file: "matterSearch.html"
      }
    ],
    forbid: [
      {
        re: /@wire\(\s*searchMatters/,
        msg: "This exercise needs explicit control over requests — use imperative Apex"
      }
    ],
    hints: [
      "Capture the request id in a local const before awaiting.",
      "After the await, compare it with this.latestRequestId and bail out if different."
    ],
    ai: "Verify stale responses and stale errors are ignored, the spinner is only cleared by the latest request, cache hits avoid Apex, and the timer is cleared on disconnect."
  },
  {
    id: "LW091",
    track: "lwc",
    level: "Easy",
    topic: "Flow & actions",
    title: "Flow screen component with output",
    task: "Pemberton Vets uses a screen flow to book appointments. Build `petSizePicker` for a flow screen.\n- `@api petName` (input) and `@api size` (input/output)\n- Show radio options Small / Medium / Large with `lightning-radio-group`\n- On change, dispatch `new FlowAttributeChangeEvent('size', value)` so the flow receives the output\n- The `.js-meta.xml` already exposes the properties to `lightning__FlowScreen`",
    starter: {
      "petSizePicker.js": "import { LightningElement, api } from 'lwc';\n\nexport default class PetSizePicker extends LightningElement {\n    // TODO\n}\n",
      "petSizePicker.html": "<template>\n    <!-- TODO -->\n</template>\n"
    },
    solution: {
      "petSizePicker.js": "import { LightningElement, api } from 'lwc';\nimport { FlowAttributeChangeEvent } from 'lightning/flowSupport';\n\nexport default class PetSizePicker extends LightningElement {\n    @api petName;\n    @api size;\n\n    options = [\n        { label: 'Small', value: 'Small' },\n        { label: 'Medium', value: 'Medium' },\n        { label: 'Large', value: 'Large' }\n    ];\n\n    get label() {\n        return `How big is ${this.petName || 'your pet'}?`;\n    }\n\n    handleChange(event) {\n        this.dispatchEvent(new FlowAttributeChangeEvent('size', event.detail.value));\n    }\n}\n",
      "petSizePicker.html": "<template>\n    <lightning-radio-group name=\"size\" label={label} options={options} value={size} onchange={handleChange}></lightning-radio-group>\n</template>\n"
    },
    checks: [
      {
        re: /import\s*\{[^}]*FlowAttributeChangeEvent[^}]*\}\s*from\s*['"]lightning\/flowSupport['"]/,
        msg: "Imports FlowAttributeChangeEvent",
        file: "petSizePicker.js"
      },
      {
        re: /@api\s+size/,
        msg: "Exposes @api size",
        file: "petSizePicker.js"
      },
      {
        re: /@api\s+petName/,
        msg: "Exposes @api petName",
        file: "petSizePicker.js"
      },
      {
        re: /new\s+FlowAttributeChangeEvent\(\s*['"]size['"]\s*,/,
        msg: "Dispatches FlowAttributeChangeEvent for size",
        file: "petSizePicker.js"
      },
      {
        re: /<lightning-radio-group[^>]*onchange=/i,
        msg: "Uses a radio group with onchange",
        file: "petSizePicker.html"
      }
    ],
    forbid: [
      {
        re: /this\.size\s*=(?!=)/,
        msg: "Let the flow set size — dispatch FlowAttributeChangeEvent instead of assigning the @api property"
      }
    ],
    hints: [
      "FlowAttributeChangeEvent(propertyName, newValue) updates the flow variable and the @api property.",
      "Radio group values arrive in event.detail.value."
    ],
    ai: "Verify the output goes through FlowAttributeChangeEvent with the exact property name, and the component does not assign to its own @api size."
  },
  {
    id: "LW092",
    track: "lwc",
    level: "Medium",
    topic: "Flow & actions",
    title: "Flow screen validation with @api validate()",
    task: "Aldridge Building Society's mortgage flow collects a UK postcode in an LWC. Build `postcodeInput`.\n- `@api postcode` (input/output) and `@api required` (Boolean)\n- On change dispatch `FlowAttributeChangeEvent('postcode', value)` with the value upper-cased and trimmed\n- Implement `@api validate()` returning `{ isValid: true }` or `{ isValid: false, errorMessage }`\n- Invalid when required and blank, or when non-blank and not matching a UK postcode pattern like `/^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$/`",
    starter: {
      "postcodeInput.js": "import { LightningElement, api } from 'lwc';\nimport { FlowAttributeChangeEvent } from 'lightning/flowSupport';\n\nexport default class PostcodeInput extends LightningElement {\n    @api postcode;\n    @api required = false;\n\n    handleChange(event) {\n        // TODO\n    }\n\n    // TODO: @api validate()\n}\n",
      "postcodeInput.html": "<template>\n    <lightning-input label=\"Postcode\" value={postcode} onchange={handleChange}></lightning-input>\n</template>\n"
    },
    solution: {
      "postcodeInput.js": "import { LightningElement, api } from 'lwc';\nimport { FlowAttributeChangeEvent } from 'lightning/flowSupport';\n\nconst POSTCODE = /^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$/;\n\nexport default class PostcodeInput extends LightningElement {\n    @api postcode;\n    @api required = false;\n\n    handleChange(event) {\n        const value = (event.target.value || '').trim().toUpperCase();\n        this.dispatchEvent(new FlowAttributeChangeEvent('postcode', value));\n    }\n\n    @api\n    validate() {\n        const value = (this.postcode || '').trim().toUpperCase();\n        if (!value) {\n            return this.required\n                ? { isValid: false, errorMessage: 'Enter a postcode.' }\n                : { isValid: true };\n        }\n        if (!POSTCODE.test(value)) {\n            return { isValid: false, errorMessage: 'Enter a valid UK postcode, e.g. SW1A 1AA.' };\n        }\n        return { isValid: true };\n    }\n}\n",
      "postcodeInput.html": "<template>\n    <lightning-input label=\"Postcode\" value={postcode} onchange={handleChange}></lightning-input>\n</template>\n"
    },
    checks: [
      {
        re: /@api\s+validate\s*\(\s*\)/,
        msg: "Implements @api validate()",
        file: "postcodeInput.js"
      },
      {
        re: /isValid\s*:\s*false\s*,\s*errorMessage/,
        msg: "Returns isValid false with an errorMessage",
        file: "postcodeInput.js"
      },
      {
        re: /isValid\s*:\s*true/,
        msg: "Returns isValid true when valid",
        file: "postcodeInput.js"
      },
      {
        re: /new\s+FlowAttributeChangeEvent\(\s*['"]postcode['"]/,
        msg: "Pushes the value back to the flow",
        file: "postcodeInput.js"
      },
      {
        re: /toUpperCase\(\)/,
        msg: "Normalises to upper case",
        file: "postcodeInput.js"
      },
      {
        re: /\.test\(/,
        msg: "Tests the postcode pattern",
        file: "postcodeInput.js"
      }
    ],
    forbid: [
      {
        re: /FlowNavigationNextEvent/,
        msg: "Validation should block navigation via validate(), not by navigating yourself"
      }
    ],
    hints: [
      "The flow runtime calls validate() when the user clicks Next.",
      "Treat blank as valid unless required is true."
    ],
    ai: "Verify blank+not required passes, blank+required fails, malformed postcodes fail with a helpful message, and the value is normalised before being sent to the flow."
  },
  {
    id: "LW093",
    track: "lwc",
    level: "Medium",
    topic: "Flow & actions",
    title: "Auto-advance a flow after selection",
    task: "Tollgate Broadband's fault triage flow shows big tiles (\"No signal\", \"Slow speed\", \"Dropping out\"). Build `faultTiles`.\n- `@api availableActions = []` and `@api selectedFault` (output)\n- Clicking a tile dispatches `FlowAttributeChangeEvent('selectedFault', value)` and then, **only if** `availableActions` includes `NEXT`, dispatches `new FlowNavigationNextEvent()`\n- If NEXT isn't available but FINISH is, dispatch `FlowNavigationFinishEvent` instead",
    starter: {
      "faultTiles.js": "import { LightningElement, api } from 'lwc';\n\nexport default class FaultTiles extends LightningElement {\n    faults = ['No signal', 'Slow speed', 'Dropping out'];\n\n    handleSelect(event) {\n        // TODO\n    }\n}\n",
      "faultTiles.html": "<template>\n    <template for:each={faults} for:item=\"fault\">\n        <button key={fault} class=\"slds-button slds-button_neutral slds-m-around_x-small\" data-value={fault} onclick={handleSelect}>{fault}</button>\n    </template>\n</template>\n"
    },
    solution: {
      "faultTiles.js": "import { LightningElement, api } from 'lwc';\nimport { FlowAttributeChangeEvent, FlowNavigationNextEvent, FlowNavigationFinishEvent } from 'lightning/flowSupport';\n\nexport default class FaultTiles extends LightningElement {\n    @api availableActions = [];\n    @api selectedFault;\n    faults = ['No signal', 'Slow speed', 'Dropping out'];\n\n    handleSelect(event) {\n        const value = event.currentTarget.dataset.value;\n        this.dispatchEvent(new FlowAttributeChangeEvent('selectedFault', value));\n        if (this.availableActions.includes('NEXT')) {\n            this.dispatchEvent(new FlowNavigationNextEvent());\n        } else if (this.availableActions.includes('FINISH')) {\n            this.dispatchEvent(new FlowNavigationFinishEvent());\n        }\n    }\n}\n",
      "faultTiles.html": "<template>\n    <template for:each={faults} for:item=\"fault\">\n        <button key={fault} class=\"slds-button slds-button_neutral slds-m-around_x-small\" data-value={fault} onclick={handleSelect}>{fault}</button>\n    </template>\n</template>\n"
    },
    checks: [
      {
        re: /@api\s+availableActions/,
        msg: "Exposes @api availableActions",
        file: "faultTiles.js"
      },
      {
        re: /new\s+FlowAttributeChangeEvent\(\s*['"]selectedFault['"]/,
        msg: "Sets selectedFault on the flow",
        file: "faultTiles.js"
      },
      {
        re: /availableActions\.(includes|indexOf|find|some)\([^)]*NEXT/,
        msg: "Checks NEXT is available",
        file: "faultTiles.js"
      },
      {
        re: /new\s+FlowNavigationNextEvent\(\s*\)/,
        msg: "Dispatches FlowNavigationNextEvent",
        file: "faultTiles.js"
      },
      {
        re: /FlowNavigationFinishEvent/,
        msg: "Falls back to FINISH",
        file: "faultTiles.js"
      }
    ],
    forbid: [

    ],
    hints: [
      "Dispatch the attribute change before navigating so the value is saved.",
      "availableActions is an array like ['BACK', 'NEXT']."
    ],
    ai: "Verify the attribute change precedes navigation, NEXT is only fired when available, and FINISH is the fallback."
  },
  {
    id: "LW094",
    track: "lwc",
    level: "Easy",
    topic: "Flow & actions",
    title: "Screen quick action that closes itself",
    task: "Moorfield Estates wants a \"Log viewing\" quick action on Opportunity. Build `logViewingAction` (screen action, `lightning__RecordAction` with `actionType` ScreenAction).\n- Use `lightning-quick-action-panel` with header \"Log viewing\"\n- A Cancel button and a Save button in the footer slot\n- Cancel dispatches `new CloseActionScreenEvent()`\n- Save is a stub that toasts \"Viewing logged\" and then closes the action the same way",
    starter: {
      "logViewingAction.js": "import { LightningElement, api } from 'lwc';\n\nexport default class LogViewingAction extends LightningElement {\n    @api recordId;\n    // TODO\n}\n",
      "logViewingAction.html": "<template>\n    <!-- TODO -->\n</template>\n"
    },
    solution: {
      "logViewingAction.js": "import { LightningElement, api } from 'lwc';\nimport { CloseActionScreenEvent } from 'lightning/actions';\nimport { ShowToastEvent } from 'lightning/platformShowToastEvent';\n\nexport default class LogViewingAction extends LightningElement {\n    @api recordId;\n\n    handleCancel() {\n        this.dispatchEvent(new CloseActionScreenEvent());\n    }\n\n    handleSave() {\n        this.dispatchEvent(new ShowToastEvent({ title: 'Viewing logged', variant: 'success' }));\n        this.dispatchEvent(new CloseActionScreenEvent());\n    }\n}\n",
      "logViewingAction.html": "<template>\n    <lightning-quick-action-panel header=\"Log viewing\">\n        <lightning-textarea label=\"Notes\"></lightning-textarea>\n        <div slot=\"footer\">\n            <lightning-button label=\"Cancel\" onclick={handleCancel}></lightning-button>\n            <lightning-button class=\"slds-m-left_x-small\" label=\"Save\" variant=\"brand\" onclick={handleSave}></lightning-button>\n        </div>\n    </lightning-quick-action-panel>\n</template>\n"
    },
    checks: [
      {
        re: /import\s*\{\s*CloseActionScreenEvent\s*\}\s*from\s*['"]lightning\/actions['"]/,
        msg: "Imports CloseActionScreenEvent",
        file: "logViewingAction.js"
      },
      {
        re: /dispatchEvent\(\s*new\s+CloseActionScreenEvent\(\s*\)\s*\)/,
        msg: "Dispatches CloseActionScreenEvent",
        file: "logViewingAction.js"
      },
      {
        re: /<lightning-quick-action-panel[^>]*header=/i,
        msg: "Uses lightning-quick-action-panel with a header",
        file: "logViewingAction.html"
      },
      {
        re: /slot=["']footer["']/i,
        msg: "Puts buttons in the footer slot",
        file: "logViewingAction.html"
      }
    ],
    forbid: [
      {
        re: /force:closeQuickAction/i,
        msg: "That is the Aura event — use CloseActionScreenEvent"
      }
    ],
    hints: [
      "CloseActionScreenEvent lives in lightning/actions.",
      "lightning-quick-action-panel gives you the modal header and footer."
    ],
    ai: "Verify both buttons close the action via CloseActionScreenEvent and the panel uses the footer slot."
  },
  {
    id: "LW095",
    track: "lwc",
    level: "Medium",
    topic: "Flow & actions",
    title: "Headless quick action with @api invoke",
    task: "Glenrothes Fibre wants a headless \"Resend welcome email\" action on Contact. Build `resendWelcome` (actionType `Action`, no UI).\n- Implement `@api async invoke()` — the platform calls it when the action is clicked\n- Guard against double clicks with an `isExecuting` flag\n- Call `WelcomeEmailController.resend({ contactId: this.recordId })`; toast success or the error message\n- The template is empty (`<template></template>`)",
    starter: {
      "resendWelcome.js": "import { LightningElement, api } from 'lwc';\n\nexport default class ResendWelcome extends LightningElement {\n    @api recordId;\n    // TODO: @api invoke()\n}\n",
      "resendWelcome.html": "<template>\n    <!-- TODO -->\n</template>\n"
    },
    solution: {
      "resendWelcome.js": "import { LightningElement, api } from 'lwc';\nimport { ShowToastEvent } from 'lightning/platformShowToastEvent';\nimport resend from '@salesforce/apex/WelcomeEmailController.resend';\n\nexport default class ResendWelcome extends LightningElement {\n    @api recordId;\n    isExecuting = false;\n\n    @api\n    async invoke() {\n        if (this.isExecuting) return;\n        this.isExecuting = true;\n        try {\n            await resend({ contactId: this.recordId });\n            this.dispatchEvent(new ShowToastEvent({ title: 'Welcome email sent', variant: 'success' }));\n        } catch (error) {\n            this.dispatchEvent(new ShowToastEvent({ title: 'Could not send email', message: error.body?.message, variant: 'error' }));\n        } finally {\n            this.isExecuting = false;\n        }\n    }\n}\n",
      "resendWelcome.html": "<template></template>\n"
    },
    checks: [
      {
        re: /@api\s+async\s+invoke\s*\(\s*\)|@api\s+invoke\s*\(\s*\)/,
        msg: "Implements @api invoke()",
        file: "resendWelcome.js"
      },
      {
        re: /if\s*\(\s*this\.isExecuting\s*\)/,
        msg: "Guards with isExecuting",
        file: "resendWelcome.js"
      },
      {
        re: /resend\(\s*\{\s*contactId\s*:\s*this\.recordId\s*\}\s*\)/,
        msg: "Calls Apex with contactId",
        file: "resendWelcome.js"
      },
      {
        re: /finally\s*\{[\s\S]*isExecuting\s*=\s*false/,
        msg: "Resets the flag in finally",
        file: "resendWelcome.js"
      }
    ],
    forbid: [
      {
        re: /CloseActionScreenEvent/,
        msg: "Headless actions have no screen to close"
      },
      {
        re: /<lightning-/i,
        msg: "Headless actions render no UI",
        file: "resendWelcome.html"
      }
    ],
    hints: [
      "Headless actions expose @api invoke() instead of rendering markup.",
      "Return early if a previous invocation is still running."
    ],
    ai: "Verify the re-entrancy guard, the finally reset, toasts in both paths, and that no UI is rendered."
  },
  {
    id: "LW096",
    track: "lwc",
    level: "Hard",
    topic: "Flow & actions",
    title: "Screen action: reschedule a work order",
    task: "Brightwater Field Service needs a \"Reschedule\" screen quick action on WorkOrder. Build `rescheduleAction`.\n- `@api recordId` is not available in `connectedCallback` for screen actions, so wire `getRecord` with `'$recordId'` to prefill StartDate\n- A `lightning-input type=\"datetime\"` and a required reason textarea; Save validates both with `reportValidity`\n- Save calls `WorkOrderController.reschedule({ workOrderId, newStart, reason })` (Apex also inserts a history record), then `notifyRecordUpdateAvailable`, toasts, and closes with `CloseActionScreenEvent`\n- New start must be in the future; show an inline error otherwise",
    starter: {
      "rescheduleAction.js": "import { LightningElement, api, wire } from 'lwc';\nimport START from '@salesforce/schema/WorkOrder.StartDate';\n\nexport default class RescheduleAction extends LightningElement {\n    @api recordId;\n    // TODO\n}\n",
      "rescheduleAction.html": "<template>\n    <lightning-quick-action-panel header=\"Reschedule work order\">\n        <!-- TODO -->\n    </lightning-quick-action-panel>\n</template>\n"
    },
    solution: {
      "rescheduleAction.js": "import { LightningElement, api, wire } from 'lwc';\nimport { getRecord, getFieldValue, notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';\nimport { CloseActionScreenEvent } from 'lightning/actions';\nimport { ShowToastEvent } from 'lightning/platformShowToastEvent';\nimport reschedule from '@salesforce/apex/WorkOrderController.reschedule';\nimport START from '@salesforce/schema/WorkOrder.StartDate';\n\nexport default class RescheduleAction extends LightningElement {\n    @api recordId;\n    newStart;\n    reason = '';\n    isSaving = false;\n\n    @wire(getRecord, { recordId: '$recordId', fields: [START] })\n    wiredWorkOrder({ data }) {\n        if (data && !this.newStart) {\n            this.newStart = getFieldValue(data, START);\n        }\n    }\n\n    handleStart(event) {\n        this.newStart = event.target.value;\n        event.target.setCustomValidity('');\n    }\n\n    handleReason(event) {\n        this.reason = event.target.value;\n    }\n\n    handleCancel() {\n        this.dispatchEvent(new CloseActionScreenEvent());\n    }\n\n    async handleSave() {\n        const startInput = this.refs.start;\n        const isFuture = this.newStart && new Date(this.newStart).getTime() > Date.now();\n        startInput.setCustomValidity(isFuture ? '' : 'Choose a time in the future.');\n        const inputs = [...this.template.querySelectorAll('lightning-input, lightning-textarea')];\n        const valid = inputs.reduce((ok, input) => input.reportValidity() && ok, true);\n        if (!valid) return;\n\n        this.isSaving = true;\n        try {\n            await reschedule({ workOrderId: this.recordId, newStart: this.newStart, reason: this.reason });\n            await notifyRecordUpdateAvailable([{ recordId: this.recordId }]);\n            this.dispatchEvent(new ShowToastEvent({ title: 'Work order rescheduled', variant: 'success' }));\n            this.dispatchEvent(new CloseActionScreenEvent());\n        } catch (error) {\n            this.dispatchEvent(new ShowToastEvent({ title: 'Reschedule failed', message: error.body?.message, variant: 'error' }));\n        } finally {\n            this.isSaving = false;\n        }\n    }\n}\n",
      "rescheduleAction.html": "<template>\n    <lightning-quick-action-panel header=\"Reschedule work order\">\n        <lightning-input lwc:ref=\"start\" type=\"datetime\" label=\"New start\" required value={newStart} onchange={handleStart}></lightning-input>\n        <lightning-textarea label=\"Reason\" required value={reason} onchange={handleReason}></lightning-textarea>\n        <div slot=\"footer\">\n            <lightning-button label=\"Cancel\" onclick={handleCancel}></lightning-button>\n            <lightning-button class=\"slds-m-left_x-small\" label=\"Save\" variant=\"brand\" disabled={isSaving} onclick={handleSave}></lightning-button>\n        </div>\n    </lightning-quick-action-panel>\n</template>\n"
    },
    checks: [
      {
        re: /@wire\(\s*getRecord\s*,\s*\{[^}]*['"]\$recordId['"]/,
        msg: "Wires getRecord with $recordId",
        file: "rescheduleAction.js"
      },
      {
        re: /reportValidity\(\)/,
        msg: "Validates inputs with reportValidity",
        file: "rescheduleAction.js"
      },
      {
        re: /Date\.now\(\)|new\s+Date\(\s*\)/,
        msg: "Checks the new start is in the future",
        file: "rescheduleAction.js"
      },
      {
        re: /reschedule\(\s*\{[^}]*workOrderId/,
        msg: "Calls the Apex reschedule method",
        file: "rescheduleAction.js"
      },
      {
        re: /notifyRecordUpdateAvailable\(/,
        msg: "Refreshes LDS after Apex",
        file: "rescheduleAction.js"
      },
      {
        re: /new\s+CloseActionScreenEvent\(\s*\)/,
        msg: "Closes the action",
        file: "rescheduleAction.js"
      }
    ],
    forbid: [
      {
        re: /connectedCallback\s*\(\s*\)\s*\{[^}]*this\.recordId/,
        msg: "recordId isn't set yet in connectedCallback for screen actions"
      }
    ],
    hints: [
      "setCustomValidity on the datetime input lets reportValidity show your future-date message.",
      "Close only after the Apex call and LDS notification succeed."
    ],
    ai: "Verify recordId is used reactively (not in connectedCallback), both fields are validated with all errors shown, past dates are rejected, and the action closes only on success."
  },
  {
    id: "LW097",
    track: "lwc",
    level: "Hard",
    topic: "Flow & actions",
    title: "Embed and react to a flow from LWC",
    task: "Ridgeway Insurance launches the `Claim_Intake` screen flow inside an LWC on the Account page. Build `claimIntakeHost`.\n- Render `<lightning-flow>` only after \"Start claim\" is clicked, passing `flow-api-name=\"Claim_Intake\"` and `flow-input-variables` with `{ name: 'accountId', type: 'String', value: this.recordId }`\n- Handle `onstatuschange`: when `event.detail.status === 'FINISHED'`, read output variable `claimId` from `event.detail.outputVariables`, hide the flow, toast, and navigate to the new Claim record\n- If status is `ERROR`, show an inline error",
    starter: {
      "claimIntakeHost.js": "import { LightningElement, api } from 'lwc';\n\nexport default class ClaimIntakeHost extends LightningElement {\n    @api recordId;\n    showFlow = false;\n    // TODO\n}\n",
      "claimIntakeHost.html": "<template>\n    <lightning-card title=\"Claims\">\n        <!-- TODO -->\n    </lightning-card>\n</template>\n"
    },
    solution: {
      "claimIntakeHost.js": "import { LightningElement, api } from 'lwc';\nimport { NavigationMixin } from 'lightning/navigation';\nimport { ShowToastEvent } from 'lightning/platformShowToastEvent';\n\nexport default class ClaimIntakeHost extends NavigationMixin(LightningElement) {\n    @api recordId;\n    showFlow = false;\n    errorMessage;\n\n    get inputVariables() {\n        return [{ name: 'accountId', type: 'String', value: this.recordId }];\n    }\n\n    handleStart() {\n        this.errorMessage = undefined;\n        this.showFlow = true;\n    }\n\n    handleStatusChange(event) {\n        const { status, outputVariables } = event.detail;\n        if (status === 'FINISHED' || status === 'FINISHED_SCREEN') {\n            const claimVar = (outputVariables || []).find((v) => v.name === 'claimId');\n            this.showFlow = false;\n            this.dispatchEvent(new ShowToastEvent({ title: 'Claim created', variant: 'success' }));\n            if (claimVar && claimVar.value) {\n                this[NavigationMixin.Navigate]({\n                    type: 'standard__recordPage',\n                    attributes: { recordId: claimVar.value, actionName: 'view' }\n                });\n            }\n        } else if (status === 'ERROR') {\n            this.errorMessage = 'The claim flow hit an error. Please try again.';\n            this.showFlow = false;\n        }\n    }\n}\n",
      "claimIntakeHost.html": "<template>\n    <lightning-card title=\"Claims\">\n        <div class=\"slds-p-around_small\">\n            <template lwc:if={showFlow}>\n                <lightning-flow flow-api-name=\"Claim_Intake\" flow-input-variables={inputVariables}\n                    onstatuschange={handleStatusChange}></lightning-flow>\n            </template>\n            <template lwc:else>\n                <lightning-button label=\"Start claim\" variant=\"brand\" onclick={handleStart}></lightning-button>\n            </template>\n            <template lwc:if={errorMessage}>\n                <p class=\"slds-text-color_error\">{errorMessage}</p>\n            </template>\n        </div>\n    </lightning-card>\n</template>\n"
    },
    checks: [
      {
        re: /<lightning-flow[^>]*flow-api-name=["']Claim_Intake["']/i,
        msg: "Renders lightning-flow for Claim_Intake",
        file: "claimIntakeHost.html"
      },
      {
        re: /flow-input-variables=\{\s*\w+\s*\}/i,
        msg: "Passes input variables",
        file: "claimIntakeHost.html"
      },
      {
        re: /onstatuschange=\{\s*\w+\s*\}/i,
        msg: "Handles onstatuschange",
        file: "claimIntakeHost.html"
      },
      {
        re: /name\s*:\s*['"]accountId['"][\s\S]*type\s*:\s*['"]String['"]/,
        msg: "Builds the accountId input variable",
        file: "claimIntakeHost.js"
      },
      {
        re: /['"]FINISHED['"]/,
        msg: "Detects the FINISHED status",
        file: "claimIntakeHost.js"
      },
      {
        re: /outputVariables[\s\S]*claimId/,
        msg: "Reads the claimId output variable",
        file: "claimIntakeHost.js"
      }
    ],
    forbid: [
      {
        re: /window\.location/,
        msg: "Navigate with NavigationMixin"
      }
    ],
    hints: [
      "outputVariables is an array of { name, type, value }.",
      "Toggle a flag with lwc:if to mount the flow only on demand."
    ],
    ai: "Verify the flow mounts only after the click, outputs are read by name, ERROR shows an inline message, and navigation happens only when a claimId exists."
  },
  {
    id: "LW098",
    track: "lwc",
    level: "Easy",
    topic: "Jest testing",
    title: "First Jest test: render an @api value",
    task: "Sandown Leisure is adding Jest tests to its org. `welcomeBanner` (provided) renders \"Welcome, {name}\" in a `<h1>`. Write `welcomeBanner.test.js`.\n- Use `createElement('c-welcome-banner', { is: WelcomeBanner })`\n- Set `element.name = 'Priya'`, append it to `document.body`\n- Assert the `h1` in `element.shadowRoot` has text `Welcome, Priya`\n- In `afterEach`, remove every child of `document.body` so tests don't leak DOM",
    starter: {
      "welcomeBanner.js": "import { LightningElement, api } from 'lwc';\n\nexport default class WelcomeBanner extends LightningElement {\n    @api name;\n\n    get greeting() {\n        return `Welcome, ${this.name}`;\n    }\n}\n",
      "welcomeBanner.html": "<template>\n    <h1>{greeting}</h1>\n</template>\n",
      "welcomeBanner.test.js": "import { createElement } from 'lwc';\nimport WelcomeBanner from 'c/welcomeBanner';\n\ndescribe('c-welcome-banner', () => {\n    // TODO: afterEach cleanup and a test\n});\n"
    },
    solution: {
      "welcomeBanner.js": "import { LightningElement, api } from 'lwc';\n\nexport default class WelcomeBanner extends LightningElement {\n    @api name;\n\n    get greeting() {\n        return `Welcome, ${this.name}`;\n    }\n}\n",
      "welcomeBanner.html": "<template>\n    <h1>{greeting}</h1>\n</template>\n",
      "welcomeBanner.test.js": "import { createElement } from 'lwc';\nimport WelcomeBanner from 'c/welcomeBanner';\n\ndescribe('c-welcome-banner', () => {\n    afterEach(() => {\n        while (document.body.firstChild) {\n            document.body.removeChild(document.body.firstChild);\n        }\n    });\n\n    it('greets the user by name', () => {\n        const element = createElement('c-welcome-banner', { is: WelcomeBanner });\n        element.name = 'Priya';\n        document.body.appendChild(element);\n\n        const heading = element.shadowRoot.querySelector('h1');\n        expect(heading.textContent).toBe('Welcome, Priya');\n    });\n});\n"
    },
    checks: [
      {
        re: /createElement\(\s*['"]c-welcome-banner['"]\s*,\s*\{\s*is\s*:\s*WelcomeBanner\s*\}\s*\)/,
        msg: "Creates the element with createElement",
        file: "welcomeBanner.test.js"
      },
      {
        re: /document\.body\.appendChild\(/,
        msg: "Appends to document.body",
        file: "welcomeBanner.test.js"
      },
      {
        re: /afterEach\(/,
        msg: "Cleans up in afterEach",
        file: "welcomeBanner.test.js"
      },
      {
        re: /shadowRoot\.querySelector\(/,
        msg: "Queries the shadow root",
        file: "welcomeBanner.test.js"
      },
      {
        re: /expect\([\s\S]*\)\.(toBe|toEqual|toContain)\(\s*['"]Welcome, Priya['"]/,
        msg: "Asserts the greeting text",
        file: "welcomeBanner.test.js"
      }
    ],
    forbid: [

    ],
    hints: [
      "Set @api properties before appending — the first render happens on append.",
      "removeChild in a while loop over document.body.firstChild clears the DOM."
    ],
    ai: "Verify the test sets the property before append, asserts against shadowRoot content, and afterEach removes all children."
  },
  {
    id: "LW099",
    track: "lwc",
    level: "Easy",
    topic: "Jest testing",
    title: "Jest: click a button and await re-render",
    task: "Wolverton Print's `jobCounter` (provided) shows a count and an \"Add job\" `lightning-button`. Write `jobCounter.test.js`.\n- Create and append the component\n- Click the button via `dispatchEvent(new CustomEvent('click'))` (base components are stubs in Jest)\n- Wait for re-render with `await Promise.resolve()`\n- Assert the `.count` element shows `1`\n- Clean up in `afterEach`",
    starter: {
      "jobCounter.js": "import { LightningElement } from 'lwc';\n\nexport default class JobCounter extends LightningElement {\n    count = 0;\n\n    handleAdd() {\n        this.count += 1;\n    }\n}\n",
      "jobCounter.html": "<template>\n    <p class=\"count\">{count}</p>\n    <lightning-button label=\"Add job\" onclick={handleAdd}></lightning-button>\n</template>\n",
      "jobCounter.test.js": "import { createElement } from 'lwc';\nimport JobCounter from 'c/jobCounter';\n\ndescribe('c-job-counter', () => {\n    // TODO\n});\n"
    },
    solution: {
      "jobCounter.js": "import { LightningElement } from 'lwc';\n\nexport default class JobCounter extends LightningElement {\n    count = 0;\n\n    handleAdd() {\n        this.count += 1;\n    }\n}\n",
      "jobCounter.html": "<template>\n    <p class=\"count\">{count}</p>\n    <lightning-button label=\"Add job\" onclick={handleAdd}></lightning-button>\n</template>\n",
      "jobCounter.test.js": "import { createElement } from 'lwc';\nimport JobCounter from 'c/jobCounter';\n\ndescribe('c-job-counter', () => {\n    afterEach(() => {\n        while (document.body.firstChild) {\n            document.body.removeChild(document.body.firstChild);\n        }\n    });\n\n    it('increments the count when Add job is clicked', async () => {\n        const element = createElement('c-job-counter', { is: JobCounter });\n        document.body.appendChild(element);\n\n        const button = element.shadowRoot.querySelector('lightning-button');\n        button.dispatchEvent(new CustomEvent('click'));\n        await Promise.resolve();\n\n        expect(element.shadowRoot.querySelector('.count').textContent).toBe('1');\n    });\n});\n"
    },
    checks: [
      {
        re: /createElement\(\s*['"]c-job-counter['"]/,
        msg: "Creates c-job-counter",
        file: "jobCounter.test.js"
      },
      {
        re: /querySelector\(\s*['"]lightning-button['"]\s*\)/,
        msg: "Finds the lightning-button",
        file: "jobCounter.test.js"
      },
      {
        re: /dispatchEvent\(\s*new\s+CustomEvent\(\s*['"]click['"]|\.click\(\s*\)/,
        msg: "Simulates the click",
        file: "jobCounter.test.js"
      },
      {
        re: /await\s+(Promise\.resolve\(\)|flushPromises\(\))/,
        msg: "Awaits the re-render",
        file: "jobCounter.test.js"
      },
      {
        re: /toBe\(\s*['"]1['"]\s*\)|toBe\(\s*1\s*\)/,
        msg: "Asserts the count is 1",
        file: "jobCounter.test.js"
      }
    ],
    forbid: [
      {
        re: /setTimeout\([^)]*,\s*[1-9]\d*/,
        msg: "Don't rely on arbitrary timeouts"
      }
    ],
    hints: [
      "DOM updates are async — await a microtask before asserting.",
      "The test function must be async to use await."
    ],
    ai: "Verify the test is async, awaits a microtask after the click, asserts the rendered text, and cleans up the DOM."
  },
  {
    id: "LW100",
    track: "lwc",
    level: "Medium",
    topic: "Jest testing",
    title: "Jest: emit data from the getRecord wire",
    task: "Halesworth Pharmacy's `contactCard` (provided) wires `getRecord` and shows the contact's Name in `.name`. Write `contactCard.test.js`.\n- Import `getRecord` from `lightning/uiRecordApi` (sfdx-lwc-jest provides it as a test wire adapter)\n- Define a mock record `{ fields: { Name: { value: 'Ola Adeyemi' } } }`\n- Create the element with `recordId = '003000000000001AAA'`, append, then `getRecord.emit(mockRecord)`\n- Await re-render and assert the name renders\n- Add a second test asserting `.name` is absent before any data is emitted",
    starter: {
      "contactCard.js": "import { LightningElement, api, wire } from 'lwc';\nimport { getRecord, getFieldValue } from 'lightning/uiRecordApi';\nimport NAME from '@salesforce/schema/Contact.Name';\n\nexport default class ContactCard extends LightningElement {\n    @api recordId;\n\n    @wire(getRecord, { recordId: '$recordId', fields: [NAME] })\n    contact;\n\n    get name() {\n        return getFieldValue(this.contact.data, NAME);\n    }\n}\n",
      "contactCard.html": "<template>\n    <template lwc:if={contact.data}>\n        <p class=\"name\">{name}</p>\n    </template>\n</template>\n",
      "contactCard.test.js": "import { createElement } from 'lwc';\nimport ContactCard from 'c/contactCard';\n\ndescribe('c-contact-card', () => {\n    // TODO\n});\n"
    },
    solution: {
      "contactCard.js": "import { LightningElement, api, wire } from 'lwc';\nimport { getRecord, getFieldValue } from 'lightning/uiRecordApi';\nimport NAME from '@salesforce/schema/Contact.Name';\n\nexport default class ContactCard extends LightningElement {\n    @api recordId;\n\n    @wire(getRecord, { recordId: '$recordId', fields: [NAME] })\n    contact;\n\n    get name() {\n        return getFieldValue(this.contact.data, NAME);\n    }\n}\n",
      "contactCard.html": "<template>\n    <template lwc:if={contact.data}>\n        <p class=\"name\">{name}</p>\n    </template>\n</template>\n",
      "contactCard.test.js": "import { createElement } from 'lwc';\nimport ContactCard from 'c/contactCard';\nimport { getRecord } from 'lightning/uiRecordApi';\n\nconst mockRecord = { fields: { Name: { value: 'Ola Adeyemi' } } };\n\ndescribe('c-contact-card', () => {\n    afterEach(() => {\n        while (document.body.firstChild) {\n            document.body.removeChild(document.body.firstChild);\n        }\n        jest.clearAllMocks();\n    });\n\n    function createComponent() {\n        const element = createElement('c-contact-card', { is: ContactCard });\n        element.recordId = '003000000000001AAA';\n        document.body.appendChild(element);\n        return element;\n    }\n\n    it('renders nothing before data arrives', () => {\n        const element = createComponent();\n        expect(element.shadowRoot.querySelector('.name')).toBeNull();\n    });\n\n    it('renders the contact name from the wire', async () => {\n        const element = createComponent();\n        getRecord.emit(mockRecord);\n        await Promise.resolve();\n\n        expect(element.shadowRoot.querySelector('.name').textContent).toBe('Ola Adeyemi');\n    });\n});\n"
    },
    checks: [
      {
        re: /import\s*\{\s*getRecord\s*\}\s*from\s*['"]lightning\/uiRecordApi['"]/,
        msg: "Imports the getRecord adapter",
        file: "contactCard.test.js"
      },
      {
        re: /getRecord\.emit\(/,
        msg: "Emits mock data through the adapter",
        file: "contactCard.test.js"
      },
      {
        re: /Name\s*:\s*\{\s*value\s*:/,
        msg: "Mock record uses the UI API shape",
        file: "contactCard.test.js"
      },
      {
        re: /toBeNull\(\)|toBeFalsy\(\)|not\.toBeTruthy|toHaveLength\(\s*0\s*\)/,
        msg: "Asserts nothing renders before data",
        file: "contactCard.test.js"
      },
      {
        re: /await\s+(Promise\.resolve\(\)|flushPromises\(\))/,
        msg: "Awaits re-render after emit",
        file: "contactCard.test.js"
      }
    ],
    forbid: [
      {
        re: /jest\.mock\(\s*['"]lightning\/uiRecordApi['"]/,
        msg: "sfdx-lwc-jest already provides getRecord as a test wire adapter"
      }
    ],
    hints: [
      "Emit after appending the element so the wire is connected.",
      "Field values live at record.fields.Name.value."
    ],
    ai: "Verify both tests exist, data is emitted after connecting, the mock matches UI API record shape, and cleanup runs after each test."
  },
  {
    id: "LW101",
    track: "lwc",
    level: "Medium",
    topic: "Jest testing",
    title: "Jest: mock an imperative Apex call",
    task: "Kirkby Kitchens' `quoteTotal` (provided) calls `QuoteController.getQuoteTotal({ quoteId })` when \"Calculate\" is clicked and renders `.total`. Write `quoteTotal.test.js`.\n- `jest.mock` the Apex module with `{ default: jest.fn() }` and `{ virtual: true }`\n- `getQuoteTotal.mockResolvedValue(1250)`\n- Click the button, then `await flushPromises()` (define it as `() => new Promise(process.nextTick)` or similar)\n- Assert the Apex was called with `{ quoteId: 'a0Q000000000001AAA' }` and `.total` contains `1250`",
    starter: {
      "quoteTotal.js": "import { LightningElement, api } from 'lwc';\nimport getQuoteTotal from '@salesforce/apex/QuoteController.getQuoteTotal';\n\nexport default class QuoteTotal extends LightningElement {\n    @api quoteId;\n    total;\n\n    async handleCalculate() {\n        this.total = await getQuoteTotal({ quoteId: this.quoteId });\n    }\n}\n",
      "quoteTotal.html": "<template>\n    <lightning-button label=\"Calculate\" onclick={handleCalculate}></lightning-button>\n    <p class=\"total\">{total}</p>\n</template>\n",
      "quoteTotal.test.js": "import { createElement } from 'lwc';\nimport QuoteTotal from 'c/quoteTotal';\n\ndescribe('c-quote-total', () => {\n    // TODO\n});\n"
    },
    solution: {
      "quoteTotal.js": "import { LightningElement, api } from 'lwc';\nimport getQuoteTotal from '@salesforce/apex/QuoteController.getQuoteTotal';\n\nexport default class QuoteTotal extends LightningElement {\n    @api quoteId;\n    total;\n\n    async handleCalculate() {\n        this.total = await getQuoteTotal({ quoteId: this.quoteId });\n    }\n}\n",
      "quoteTotal.html": "<template>\n    <lightning-button label=\"Calculate\" onclick={handleCalculate}></lightning-button>\n    <p class=\"total\">{total}</p>\n</template>\n",
      "quoteTotal.test.js": "import { createElement } from 'lwc';\nimport QuoteTotal from 'c/quoteTotal';\nimport getQuoteTotal from '@salesforce/apex/QuoteController.getQuoteTotal';\n\njest.mock(\n    '@salesforce/apex/QuoteController.getQuoteTotal',\n    () => ({ default: jest.fn() }),\n    { virtual: true }\n);\n\nconst flushPromises = () => new Promise((resolve) => process.nextTick(resolve));\n\ndescribe('c-quote-total', () => {\n    afterEach(() => {\n        while (document.body.firstChild) {\n            document.body.removeChild(document.body.firstChild);\n        }\n        jest.clearAllMocks();\n    });\n\n    it('calls Apex with the quote id and renders the total', async () => {\n        getQuoteTotal.mockResolvedValue(1250);\n        const element = createElement('c-quote-total', { is: QuoteTotal });\n        element.quoteId = 'a0Q000000000001AAA';\n        document.body.appendChild(element);\n\n        element.shadowRoot.querySelector('lightning-button').dispatchEvent(new CustomEvent('click'));\n        await flushPromises();\n\n        expect(getQuoteTotal).toHaveBeenCalledWith({ quoteId: 'a0Q000000000001AAA' });\n        expect(element.shadowRoot.querySelector('.total').textContent).toBe('1250');\n    });\n});\n"
    },
    checks: [
      {
        re: /jest\.mock\(\s*['"]@salesforce\/apex\/QuoteController\.getQuoteTotal['"]/,
        msg: "Mocks the Apex module",
        file: "quoteTotal.test.js"
      },
      {
        re: /virtual\s*:\s*true/,
        msg: "Uses { virtual: true }",
        file: "quoteTotal.test.js"
      },
      {
        re: /mockResolvedValue\(\s*1250\s*\)/,
        msg: "Resolves the mock with 1250",
        file: "quoteTotal.test.js"
      },
      {
        re: /await\s+flushPromises\(\)/,
        msg: "Flushes promises",
        file: "quoteTotal.test.js"
      },
      {
        re: /toHaveBeenCalledWith\(\s*\{\s*quoteId\s*:/,
        msg: "Asserts the Apex parameters",
        file: "quoteTotal.test.js"
      },
      {
        re: /1250['"]?\s*\)/,
        msg: "Asserts the rendered total",
        file: "quoteTotal.test.js"
      }
    ],
    forbid: [

    ],
    hints: [
      "Apex modules don't exist on disk in Jest, hence virtual: true.",
      "Awaiting a single microtask may not be enough — flush the queue."
    ],
    ai: "Verify the mock factory returns { default: jest.fn() }, mocks are cleared between tests, the call parameters are asserted, and the DOM is checked after flushing promises."
  },
  {
    id: "LW102",
    track: "lwc",
    level: "Easy",
    topic: "Jest testing",
    title: "Jest: assert a custom event payload",
    task: "Brookmere Gyms' `planSelector` (provided) dispatches `planselect` with `detail: { plan }` when a plan button is clicked. Write `planSelector.test.js`.\n- Create and append the component\n- Register `const handler = jest.fn()` with `element.addEventListener('planselect', handler)`\n- Click the button with `data-plan=\"premium\"`\n- Assert the handler was called once and `handler.mock.calls[0][0].detail` equals `{ plan: 'premium' }`",
    starter: {
      "planSelector.js": "import { LightningElement } from 'lwc';\n\nexport default class PlanSelector extends LightningElement {\n    handleClick(event) {\n        const plan = event.currentTarget.dataset.plan;\n        this.dispatchEvent(new CustomEvent('planselect', { detail: { plan } }));\n    }\n}\n",
      "planSelector.html": "<template>\n    <button data-plan=\"standard\" onclick={handleClick}>Standard</button>\n    <button data-plan=\"premium\" onclick={handleClick}>Premium</button>\n</template>\n",
      "planSelector.test.js": "import { createElement } from 'lwc';\nimport PlanSelector from 'c/planSelector';\n\ndescribe('c-plan-selector', () => {\n    // TODO\n});\n"
    },
    solution: {
      "planSelector.js": "import { LightningElement } from 'lwc';\n\nexport default class PlanSelector extends LightningElement {\n    handleClick(event) {\n        const plan = event.currentTarget.dataset.plan;\n        this.dispatchEvent(new CustomEvent('planselect', { detail: { plan } }));\n    }\n}\n",
      "planSelector.html": "<template>\n    <button data-plan=\"standard\" onclick={handleClick}>Standard</button>\n    <button data-plan=\"premium\" onclick={handleClick}>Premium</button>\n</template>\n",
      "planSelector.test.js": "import { createElement } from 'lwc';\nimport PlanSelector from 'c/planSelector';\n\ndescribe('c-plan-selector', () => {\n    afterEach(() => {\n        while (document.body.firstChild) {\n            document.body.removeChild(document.body.firstChild);\n        }\n    });\n\n    it('fires planselect with the chosen plan', () => {\n        const element = createElement('c-plan-selector', { is: PlanSelector });\n        document.body.appendChild(element);\n        const handler = jest.fn();\n        element.addEventListener('planselect', handler);\n\n        element.shadowRoot.querySelector('button[data-plan=\"premium\"]').click();\n\n        expect(handler).toHaveBeenCalledTimes(1);\n        expect(handler.mock.calls[0][0].detail).toEqual({ plan: 'premium' });\n    });\n});\n"
    },
    checks: [
      {
        re: /jest\.fn\(\)/,
        msg: "Uses a jest.fn() handler",
        file: "planSelector.test.js"
      },
      {
        re: /addEventListener\(\s*['"]planselect['"]/,
        msg: "Listens for planselect",
        file: "planSelector.test.js"
      },
      {
        re: /data-plan=\\?["']?premium/,
        msg: "Clicks the premium button",
        file: "planSelector.test.js"
      },
      {
        re: /toHaveBeenCalledTimes\(\s*1\s*\)|toHaveBeenCalled\(\)/,
        msg: "Asserts the handler was called",
        file: "planSelector.test.js"
      },
      {
        re: /mock\.calls\[\s*0\s*\]\[\s*0\s*\]\.detail/,
        msg: "Inspects the event detail",
        file: "planSelector.test.js"
      }
    ],
    forbid: [

    ],
    hints: [
      "A native button in the shadow root can be clicked with .click().",
      "handler.mock.calls[0][0] is the event object."
    ],
    ai: "Verify the listener is attached to the host element, the correct button is targeted, and the detail is compared with toEqual (deep equality)."
  },
  {
    id: "LW103",
    track: "lwc",
    level: "Hard",
    topic: "Jest testing",
    title: "Jest: wired Apex data and error paths",
    task: "Pickering Utilities' `invoiceList` (provided) wires `InvoiceController.getInvoices` and renders `li` rows, or `c-error-panel` on error. Write `invoiceList.test.js`.\n- Mock the wired Apex with `createApexTestWireAdapter` from `@salesforce/sfdx-lwc-jest` inside `jest.mock(..., { virtual: true })`\n- Test 1: `getInvoices.emit(mockInvoices)` (2 rows) → 2 `li` elements, first contains its invoice number\n- Test 2: `getInvoices.error()` → `c-error-panel` is rendered and no `li`\n- Clean up DOM and mocks after each test",
    starter: {
      "invoiceList.js": "import { LightningElement, wire } from 'lwc';\nimport getInvoices from '@salesforce/apex/InvoiceController.getInvoices';\n\nexport default class InvoiceList extends LightningElement {\n    @wire(getInvoices)\n    invoices;\n}\n",
      "invoiceList.html": "<template>\n    <template lwc:if={invoices.data}>\n        <ul>\n            <template for:each={invoices.data} for:item=\"inv\">\n                <li key={inv.Id}>{inv.Name}</li>\n            </template>\n        </ul>\n    </template>\n    <template lwc:elseif={invoices.error}>\n        <c-error-panel errors={invoices.error}></c-error-panel>\n    </template>\n</template>\n",
      "invoiceList.test.js": "import { createElement } from 'lwc';\nimport InvoiceList from 'c/invoiceList';\n\ndescribe('c-invoice-list', () => {\n    // TODO\n});\n"
    },
    solution: {
      "invoiceList.js": "import { LightningElement, wire } from 'lwc';\nimport getInvoices from '@salesforce/apex/InvoiceController.getInvoices';\n\nexport default class InvoiceList extends LightningElement {\n    @wire(getInvoices)\n    invoices;\n}\n",
      "invoiceList.html": "<template>\n    <template lwc:if={invoices.data}>\n        <ul>\n            <template for:each={invoices.data} for:item=\"inv\">\n                <li key={inv.Id}>{inv.Name}</li>\n            </template>\n        </ul>\n    </template>\n    <template lwc:elseif={invoices.error}>\n        <c-error-panel errors={invoices.error}></c-error-panel>\n    </template>\n</template>\n",
      "invoiceList.test.js": "import { createElement } from 'lwc';\nimport InvoiceList from 'c/invoiceList';\nimport getInvoices from '@salesforce/apex/InvoiceController.getInvoices';\n\njest.mock(\n    '@salesforce/apex/InvoiceController.getInvoices',\n    () => {\n        const { createApexTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');\n        return { default: createApexTestWireAdapter(jest.fn()) };\n    },\n    { virtual: true }\n);\n\nconst mockInvoices = [\n    { Id: 'a01000000000001AAA', Name: 'INV-1001' },\n    { Id: 'a01000000000002AAA', Name: 'INV-1002' }\n];\n\nconst flushPromises = () => new Promise((resolve) => process.nextTick(resolve));\n\ndescribe('c-invoice-list', () => {\n    afterEach(() => {\n        while (document.body.firstChild) {\n            document.body.removeChild(document.body.firstChild);\n        }\n        jest.clearAllMocks();\n    });\n\n    function createComponent() {\n        const element = createElement('c-invoice-list', { is: InvoiceList });\n        document.body.appendChild(element);\n        return element;\n    }\n\n    it('renders a row per invoice', async () => {\n        const element = createComponent();\n        getInvoices.emit(mockInvoices);\n        await flushPromises();\n\n        const rows = element.shadowRoot.querySelectorAll('li');\n        expect(rows.length).toBe(2);\n        expect(rows[0].textContent).toBe('INV-1001');\n    });\n\n    it('renders the error panel when the wire fails', async () => {\n        const element = createComponent();\n        getInvoices.error();\n        await flushPromises();\n\n        expect(element.shadowRoot.querySelector('c-error-panel')).not.toBeNull();\n        expect(element.shadowRoot.querySelectorAll('li').length).toBe(0);\n    });\n});\n"
    },
    checks: [
      {
        re: /createApexTestWireAdapter\(/,
        msg: "Uses createApexTestWireAdapter",
        file: "invoiceList.test.js"
      },
      {
        re: /jest\.mock\(\s*['"]@salesforce\/apex\/InvoiceController\.getInvoices['"][\s\S]*virtual\s*:\s*true/,
        msg: "Mocks the Apex wire module virtually",
        file: "invoiceList.test.js"
      },
      {
        re: /getInvoices\.emit\(/,
        msg: "Emits data",
        file: "invoiceList.test.js"
      },
      {
        re: /getInvoices\.error\(/,
        msg: "Emits an error",
        file: "invoiceList.test.js"
      },
      {
        re: /querySelector\(\s*['"]c-error-panel['"]\s*\)/,
        msg: "Asserts the error panel",
        file: "invoiceList.test.js"
      },
      {
        re: /(length\)?\.toBe\(\s*2\s*\)|toHaveLength\(\s*2\s*\))/,
        msg: "Asserts two rows",
        file: "invoiceList.test.js"
      }
    ],
    forbid: [
      {
        re: /mockResolvedValue/,
        msg: "Wired Apex isn't a promise — use the wire adapter emit/error API"
      }
    ],
    hints: [
      "require() the helper inside the jest.mock factory — factories are hoisted above imports.",
      "Wire adapters expose emit(data) and error()."
    ],
    ai: "Verify both data and error tests, correct hoisting-safe mock factory, assertions on rendered DOM, and cleanup of DOM and mocks."
  },
  {
    id: "LW104",
    track: "lwc",
    level: "Hard",
    topic: "Jest testing",
    title: "Jest: assert LMS publish calls",
    task: "Tarnside Logistics' `regionFilter` (provided) publishes `{ region }` on `RegionChanged__c` when the combobox changes, and publishes nothing for an empty value. Write `regionFilter.test.js`.\n- Import `publish` from `lightning/messageService` (a jest.fn in sfdx-lwc-jest) and the channel from `@salesforce/messageChannel/RegionChanged__c`\n- Test 1: dispatch `change` with `detail: { value: 'North' }` on the combobox → `publish` called once; 2nd arg is the channel, 3rd arg equals `{ region: 'North' }`\n- Test 2: empty value → `publish` not called\n- Reset mocks in `afterEach`",
    starter: {
      "regionFilter.js": "import { LightningElement, wire } from 'lwc';\nimport { publish, MessageContext } from 'lightning/messageService';\nimport REGION_CHANGED from '@salesforce/messageChannel/RegionChanged__c';\n\nexport default class RegionFilter extends LightningElement {\n    options = [\n        { label: 'North', value: 'North' },\n        { label: 'South', value: 'South' }\n    ];\n\n    @wire(MessageContext)\n    messageContext;\n\n    handleChange(event) {\n        const region = event.detail.value;\n        if (!region) return;\n        publish(this.messageContext, REGION_CHANGED, { region });\n    }\n}\n",
      "regionFilter.html": "<template>\n    <lightning-combobox label=\"Region\" options={options} onchange={handleChange}></lightning-combobox>\n</template>\n",
      "regionFilter.test.js": "import { createElement } from 'lwc';\nimport RegionFilter from 'c/regionFilter';\n\ndescribe('c-region-filter', () => {\n    // TODO\n});\n"
    },
    solution: {
      "regionFilter.js": "import { LightningElement, wire } from 'lwc';\nimport { publish, MessageContext } from 'lightning/messageService';\nimport REGION_CHANGED from '@salesforce/messageChannel/RegionChanged__c';\n\nexport default class RegionFilter extends LightningElement {\n    options = [\n        { label: 'North', value: 'North' },\n        { label: 'South', value: 'South' }\n    ];\n\n    @wire(MessageContext)\n    messageContext;\n\n    handleChange(event) {\n        const region = event.detail.value;\n        if (!region) return;\n        publish(this.messageContext, REGION_CHANGED, { region });\n    }\n}\n",
      "regionFilter.html": "<template>\n    <lightning-combobox label=\"Region\" options={options} onchange={handleChange}></lightning-combobox>\n</template>\n",
      "regionFilter.test.js": "import { createElement } from 'lwc';\nimport RegionFilter from 'c/regionFilter';\nimport { publish } from 'lightning/messageService';\nimport REGION_CHANGED from '@salesforce/messageChannel/RegionChanged__c';\n\ndescribe('c-region-filter', () => {\n    afterEach(() => {\n        while (document.body.firstChild) {\n            document.body.removeChild(document.body.firstChild);\n        }\n        jest.clearAllMocks();\n    });\n\n    function changeRegion(value) {\n        const element = createElement('c-region-filter', { is: RegionFilter });\n        document.body.appendChild(element);\n        const combobox = element.shadowRoot.querySelector('lightning-combobox');\n        combobox.dispatchEvent(new CustomEvent('change', { detail: { value } }));\n        return element;\n    }\n\n    it('publishes the selected region', () => {\n        changeRegion('North');\n\n        expect(publish).toHaveBeenCalledTimes(1);\n        const [, channel, payload] = publish.mock.calls[0];\n        expect(channel).toBe(REGION_CHANGED);\n        expect(payload).toEqual({ region: 'North' });\n    });\n\n    it('does not publish for an empty selection', () => {\n        changeRegion('');\n\n        expect(publish).not.toHaveBeenCalled();\n    });\n});\n"
    },
    checks: [
      {
        re: /import\s*\{\s*publish\s*\}\s*from\s*['"]lightning\/messageService['"]/,
        msg: "Imports the mocked publish",
        file: "regionFilter.test.js"
      },
      {
        re: /from\s*['"]@salesforce\/messageChannel\/RegionChanged__c['"]/,
        msg: "Imports the channel to compare",
        file: "regionFilter.test.js"
      },
      {
        re: /new\s+CustomEvent\(\s*['"]change['"]\s*,\s*\{\s*detail\s*:/,
        msg: "Dispatches a change event with detail",
        file: "regionFilter.test.js"
      },
      {
        re: /publish\.mock\.calls|toHaveBeenCalledWith\(/,
        msg: "Inspects publish arguments",
        file: "regionFilter.test.js"
      },
      {
        re: /not\.toHaveBeenCalled\(\)/,
        msg: "Asserts no publish for empty value",
        file: "regionFilter.test.js"
      },
      {
        re: /jest\.(clearAllMocks|resetAllMocks)\(\)|mockClear\(\)/,
        msg: "Resets mocks between tests",
        file: "regionFilter.test.js"
      }
    ],
    forbid: [
      {
        re: /jest\.mock\(\s*['"]lightning\/messageService['"]\s*\)/,
        msg: "sfdx-lwc-jest already mocks lightning/messageService"
      }
    ],
    hints: [
      "publish is already a jest.fn — just import it.",
      "Without clearing mocks, the first test's call leaks into the second."
    ],
    ai: "Verify both positive and negative tests, argument assertions on channel and payload, and mock reset between tests so the negative test is meaningful."
  },
  {
    id: "LW105",
    track: "lwc",
    level: "Easy",
    topic: "Security & modern",
    title: "Read URL state with CurrentPageReference",
    task: "Bramwell Telecom emails customers links like `/lightning/n/Case_Lookup?c__caseNumber=00012345`. Build `caseDeepLink`.\n- `@wire(CurrentPageReference)` as a setter-style handler or property\n- Read `state.c__caseNumber`; accept only 8 digits (otherwise treat as missing)\n- Show \"Looking up case 00012345\" or \"No case number supplied\"\n- Never render raw URL parameters other than the validated value",
    starter: {
      "caseDeepLink.js": "import { LightningElement } from 'lwc';\n\nexport default class CaseDeepLink extends LightningElement {\n    caseNumber;\n    // TODO\n}\n",
      "caseDeepLink.html": "<template>\n    <!-- TODO -->\n</template>\n"
    },
    solution: {
      "caseDeepLink.js": "import { LightningElement, wire } from 'lwc';\nimport { CurrentPageReference } from 'lightning/navigation';\n\nconst CASE_NUMBER = /^\\d{8}$/;\n\nexport default class CaseDeepLink extends LightningElement {\n    caseNumber;\n\n    @wire(CurrentPageReference)\n    handlePageRef(pageRef) {\n        const raw = pageRef?.state?.c__caseNumber;\n        this.caseNumber = raw && CASE_NUMBER.test(raw) ? raw : undefined;\n    }\n\n    get message() {\n        return this.caseNumber ? `Looking up case ${this.caseNumber}` : 'No case number supplied';\n    }\n}\n",
      "caseDeepLink.html": "<template>\n    <p>{message}</p>\n</template>\n"
    },
    checks: [
      {
        re: /import\s*\{\s*CurrentPageReference\s*\}\s*from\s*['"]lightning\/navigation['"]/,
        msg: "Imports CurrentPageReference",
        file: "caseDeepLink.js"
      },
      {
        re: /@wire\(\s*CurrentPageReference\s*\)/,
        msg: "Wires CurrentPageReference",
        file: "caseDeepLink.js"
      },
      {
        re: /state\??\.c__caseNumber/,
        msg: "Reads state.c__caseNumber",
        file: "caseDeepLink.js"
      },
      {
        re: /\\d\{8\}|\[0-9\]\{8\}/,
        msg: "Validates 8 digits",
        file: "caseDeepLink.js"
      }
    ],
    forbid: [
      {
        re: /window\.location|URLSearchParams/,
        msg: "Use CurrentPageReference rather than parsing the URL yourself"
      },
      {
        re: /innerHTML/i,
        msg: "No innerHTML"
      }
    ],
    hints: [
      "Custom URL parameters must be namespaced with c__.",
      "A wired function receives the page reference whenever it changes."
    ],
    ai: "Verify undefined page references don't throw, invalid values are rejected, and state changes update the message reactively."
  },
  {
    id: "LW106",
    track: "lwc",
    level: "Easy",
    topic: "Security & modern",
    title: "Render customer-entered text safely",
    task: "Hollybrook Care's family portal shows notes typed by relatives, which may contain `<script>` tags or links. Build `familyNote`.\n- `@api note` (string, may be null)\n- Render it with `lightning-formatted-text` and `linkify` so URLs become safe links and HTML is shown as text\n- Getter `preview` trims to 280 characters and appends \"…\" when longer\n- Never use innerHTML, `lwc:dom=\"manual\"`, `eval` or `new Function`",
    starter: {
      "familyNote.js": "import { LightningElement, api } from 'lwc';\n\nexport default class FamilyNote extends LightningElement {\n    @api note;\n    // TODO\n}\n",
      "familyNote.html": "<template>\n    <!-- TODO -->\n</template>\n"
    },
    solution: {
      "familyNote.js": "import { LightningElement, api } from 'lwc';\n\nconst MAX = 280;\n\nexport default class FamilyNote extends LightningElement {\n    @api note;\n\n    get preview() {\n        const text = (this.note || '').trim();\n        return text.length > MAX ? text.slice(0, MAX) + '…' : text;\n    }\n}\n",
      "familyNote.html": "<template>\n    <lightning-formatted-text value={preview} linkify></lightning-formatted-text>\n</template>\n"
    },
    checks: [
      {
        re: /<lightning-formatted-text[^>]*linkify/i,
        msg: "Uses lightning-formatted-text with linkify",
        file: "familyNote.html"
      },
      {
        re: /get\s+preview\s*\(\s*\)/,
        msg: "Adds a preview getter",
        file: "familyNote.js"
      },
      {
        re: /280|MAX/,
        msg: "Truncates at 280 characters",
        file: "familyNote.js"
      },
      {
        re: /(slice|substring|substr)\(\s*0/,
        msg: "Cuts the text",
        file: "familyNote.js"
      }
    ],
    forbid: [
      {
        re: /innerHTML|lwc:dom=["']manual["']/i,
        msg: "Don't inject HTML"
      },
      {
        re: /\beval\s*\(|new\s+Function\s*\(/,
        msg: "No eval or new Function"
      }
    ],
    hints: [
      "Template bindings and base components escape HTML for you.",
      "Handle null with (this.note || '')."
    ],
    ai: "Verify null notes are handled, the 280-character boundary is correct (no ellipsis at exactly 280), and no HTML injection APIs are used."
  },
  {
    id: "LW107",
    track: "lwc",
    level: "Medium",
    topic: "Security & modern",
    title: "GraphQL wire for open opportunities",
    task: "Calderwood Capital wants a light pipeline widget without Apex. Build `bigDeals` using `lightning/uiGraphQLApi`.\n- Wire `graphql` with a `gql` tagged query and `variables: '$variables'`\n- Query open Opportunities (`IsClosed eq false`) with `Amount gte $minAmount`, ordered by Amount DESC, first 10; select Id, Name, Amount\n- `@api minAmount = 100000`; `get variables()` returns `{ minAmount: this.minAmount }`\n- Map `data.uiapi.query.Opportunity.edges` to `{ id, name, amount }` (values are under `.value`); show errors",
    starter: {
      "bigDeals.js": "import { LightningElement, api, wire } from 'lwc';\n\nexport default class BigDeals extends LightningElement {\n    @api minAmount = 100000;\n    deals = [];\n    errors;\n    // TODO\n}\n",
      "bigDeals.html": "<template>\n    <!-- TODO -->\n</template>\n"
    },
    solution: {
      "bigDeals.js": "import { LightningElement, api, wire } from 'lwc';\nimport { gql, graphql } from 'lightning/uiGraphQLApi';\n\nexport default class BigDeals extends LightningElement {\n    @api minAmount = 100000;\n    deals = [];\n    errors;\n\n    @wire(graphql, {\n        query: gql`\n            query bigDeals($minAmount: Currency) {\n                uiapi {\n                    query {\n                        Opportunity(\n                            where: { and: [{ IsClosed: { eq: false } }, { Amount: { gte: $minAmount } }] }\n                            orderBy: { Amount: { order: DESC } }\n                            first: 10\n                        ) {\n                            edges {\n                                node {\n                                    Id\n                                    Name { value }\n                                    Amount { value }\n                                }\n                            }\n                        }\n                    }\n                }\n            }\n        `,\n        variables: '$variables'\n    })\n    handleResult({ data, errors }) {\n        if (data) {\n            this.deals = data.uiapi.query.Opportunity.edges.map(({ node }) => ({\n                id: node.Id,\n                name: node.Name.value,\n                amount: node.Amount.value\n            }));\n        }\n        this.errors = errors;\n    }\n\n    get variables() {\n        return { minAmount: this.minAmount };\n    }\n}\n",
      "bigDeals.html": "<template>\n    <lightning-card title=\"Big deals\">\n        <template lwc:if={errors}>\n            <p class=\"slds-p-around_small slds-text-color_error\">Could not load deals.</p>\n        </template>\n        <ul class=\"slds-p-around_small\">\n            <template for:each={deals} for:item=\"deal\">\n                <li key={deal.id}>\n                    {deal.name} —\n                    <lightning-formatted-number value={deal.amount} format-style=\"currency\" currency-code=\"GBP\"></lightning-formatted-number>\n                </li>\n            </template>\n        </ul>\n    </lightning-card>\n</template>\n"
    },
    checks: [
      {
        re: /import\s*\{[^}]*\bgql\b[^}]*\}\s*from\s*['"]lightning\/uiGraphQLApi['"]/,
        msg: "Imports gql and graphql from lightning/uiGraphQLApi",
        file: "bigDeals.js"
      },
      {
        re: /@wire\(\s*graphql\s*,\s*\{[\s\S]*query\s*:\s*gql`/,
        msg: "Wires graphql with a gql query",
        file: "bigDeals.js"
      },
      {
        re: /variables\s*:\s*['"]\$variables['"]/,
        msg: "Passes reactive $variables",
        file: "bigDeals.js"
      },
      {
        re: /get\s+variables\s*\(\s*\)/,
        msg: "Defines a variables getter",
        file: "bigDeals.js"
      },
      {
        re: /IsClosed\s*:\s*\{\s*eq\s*:\s*false\s*\}/,
        msg: "Filters open opportunities",
        file: "bigDeals.js"
      },
      {
        re: /edges[\s\S]*node[\s\S]*\.value/,
        msg: "Maps edges/node values",
        file: "bigDeals.js"
      }
    ],
    forbid: [
      {
        re: /@salesforce\/apex\//,
        msg: "Use the GraphQL wire adapter instead of Apex"
      }
    ],
    hints: [
      "GraphQL variables are declared in the query signature: query name($minAmount: Currency).",
      "Each field comes back as { value }."
    ],
    ai: "Verify the query is syntactically valid UI API GraphQL, variables are reactive via a getter, data maps .value fields, and errors are surfaced."
  },
  {
    id: "LW108",
    track: "lwc",
    level: "Medium",
    topic: "Security & modern",
    title: "Discount approval with LightningModal",
    task: "Oakhurst Office Furniture requires a reason for quote discounts over 15%. Build `discountReasonModal` (extends `LightningModal`) and use it from `quoteHeader.js`.\n- Modal: `@api discount`; `lightning-modal-header`, `-body` with a required textarea, `-footer` with Cancel and Confirm\n- Cancel → `this.close()` (undefined); Confirm → validate the textarea and `this.close({ reason })`\n- `quoteHeader.handleApplyDiscount()` opens it with `await DiscountReasonModal.open({ size: 'small', label: 'Discount reason', discount: this.discount })` only when discount > 15, and stores `result.reason` if a result came back",
    starter: {
      "discountReasonModal.js": "import { api } from 'lwc';\nimport LightningModal from 'lightning/modal';\n\nexport default class DiscountReasonModal extends LightningModal {\n    // TODO\n}\n",
      "discountReasonModal.html": "<template>\n    <!-- TODO -->\n</template>\n",
      "quoteHeader.js": "import { LightningElement } from 'lwc';\nimport DiscountReasonModal from 'c/discountReasonModal';\n\nexport default class QuoteHeader extends LightningElement {\n    discount = 20;\n    discountReason;\n\n    async handleApplyDiscount() {\n        // TODO\n    }\n}\n"
    },
    solution: {
      "discountReasonModal.js": "import { api } from 'lwc';\nimport LightningModal from 'lightning/modal';\n\nexport default class DiscountReasonModal extends LightningModal {\n    @api discount;\n    reason = '';\n\n    handleReason(event) {\n        this.reason = event.target.value;\n    }\n\n    handleCancel() {\n        this.close();\n    }\n\n    handleConfirm() {\n        const textarea = this.refs.reason;\n        if (!textarea.reportValidity()) return;\n        this.close({ reason: this.reason.trim() });\n    }\n}\n",
      "discountReasonModal.html": "<template>\n    <lightning-modal-header label=\"Discount reason\"></lightning-modal-header>\n    <lightning-modal-body>\n        <p class=\"slds-m-bottom_small\">A {discount}% discount needs a reason.</p>\n        <lightning-textarea lwc:ref=\"reason\" label=\"Reason\" required value={reason} onchange={handleReason}></lightning-textarea>\n    </lightning-modal-body>\n    <lightning-modal-footer>\n        <lightning-button label=\"Cancel\" onclick={handleCancel}></lightning-button>\n        <lightning-button class=\"slds-m-left_x-small\" label=\"Confirm\" variant=\"brand\" onclick={handleConfirm}></lightning-button>\n    </lightning-modal-footer>\n</template>\n",
      "quoteHeader.js": "import { LightningElement } from 'lwc';\nimport DiscountReasonModal from 'c/discountReasonModal';\n\nexport default class QuoteHeader extends LightningElement {\n    discount = 20;\n    discountReason;\n\n    async handleApplyDiscount() {\n        if (this.discount <= 15) return;\n        const result = await DiscountReasonModal.open({\n            size: 'small',\n            label: 'Discount reason',\n            discount: this.discount\n        });\n        if (result) {\n            this.discountReason = result.reason;\n        }\n    }\n}\n"
    },
    checks: [
      {
        re: /extends\s+LightningModal/,
        msg: "Extends LightningModal",
        file: "discountReasonModal.js"
      },
      {
        re: /this\.close\(\s*\{\s*reason/,
        msg: "Closes with { reason }",
        file: "discountReasonModal.js"
      },
      {
        re: /<lightning-modal-header[\s\S]*<lightning-modal-body[\s\S]*<lightning-modal-footer/i,
        msg: "Uses modal header, body and footer",
        file: "discountReasonModal.html"
      },
      {
        re: /await\s+DiscountReasonModal\.open\(\s*\{[\s\S]*discount\s*:/,
        msg: "Opens the modal and passes discount",
        file: "quoteHeader.js"
      },
      {
        re: /15/,
        msg: "Only asks above 15%",
        file: "quoteHeader.js"
      },
      {
        re: /if\s*\(\s*\w+\s*\)|\?\./,
        msg: "Handles a dismissed modal (undefined result)",
        file: "quoteHeader.js"
      }
    ],
    forbid: [
      {
        re: /<section[^>]*slds-modal/i,
        msg: "Use LightningModal rather than hand-built SLDS modal markup"
      }
    ],
    hints: [
      "LightningModal.open() resolves with whatever you pass to close().",
      "Closing via the X or Esc resolves with undefined."
    ],
    ai: "Verify the modal validates before closing with a result, Cancel/dismiss produces undefined and is handled, and the opener checks the 15% threshold."
  },
  {
    id: "LW109",
    track: "lwc",
    level: "Hard",
    topic: "Security & modern",
    title: "Cursor pagination with the GraphQL wire",
    task: "Ellery Water's Service Cloud console lists open cases via GraphQL with \"Load more\". Build `caseFeed`.\n- Query `Case` with `first: $first, after: $after`, `IsClosed eq false`, ordered by CreatedDate DESC; select Id, CaseNumber, Subject and `pageInfo { hasNextPage endCursor }`\n- `get variables()` returns `{ first: 25, after: this.after }` (after starts null)\n- In the wire handler append new nodes to `cases`, skipping Ids already present; store `hasNextPage` and `endCursor`\n- \"Load more\" sets `after = endCursor`; hide it when there are no more pages; surface `errors`",
    starter: {
      "caseFeed.js": "import { LightningElement, wire } from 'lwc';\n\nexport default class CaseFeed extends LightningElement {\n    cases = [];\n    after = null;\n    endCursor;\n    hasNextPage = false;\n    errors;\n    // TODO\n}\n",
      "caseFeed.html": "<template>\n    <!-- TODO -->\n</template>\n"
    },
    solution: {
      "caseFeed.js": "import { LightningElement, wire } from 'lwc';\nimport { gql, graphql } from 'lightning/uiGraphQLApi';\n\nconst PAGE_SIZE = 25;\n\nexport default class CaseFeed extends LightningElement {\n    cases = [];\n    after = null;\n    endCursor;\n    hasNextPage = false;\n    errors;\n\n    @wire(graphql, {\n        query: gql`\n            query caseFeed($first: Int, $after: String) {\n                uiapi {\n                    query {\n                        Case(\n                            first: $first\n                            after: $after\n                            where: { IsClosed: { eq: false } }\n                            orderBy: { CreatedDate: { order: DESC } }\n                        ) {\n                            edges {\n                                node {\n                                    Id\n                                    CaseNumber { value }\n                                    Subject { value }\n                                }\n                            }\n                            pageInfo {\n                                hasNextPage\n                                endCursor\n                            }\n                        }\n                    }\n                }\n            }\n        `,\n        variables: '$variables'\n    })\n    handlePage({ data, errors }) {\n        this.errors = errors;\n        if (!data) return;\n        const connection = data.uiapi.query.Case;\n        const seen = new Set(this.cases.map((c) => c.id));\n        const fresh = connection.edges\n            .map(({ node }) => ({ id: node.Id, caseNumber: node.CaseNumber.value, subject: node.Subject.value }))\n            .filter((c) => !seen.has(c.id));\n        this.cases = [...this.cases, ...fresh];\n        this.hasNextPage = connection.pageInfo.hasNextPage;\n        this.endCursor = connection.pageInfo.endCursor;\n    }\n\n    get variables() {\n        return { first: PAGE_SIZE, after: this.after };\n    }\n\n    handleLoadMore() {\n        if (this.hasNextPage) {\n            this.after = this.endCursor;\n        }\n    }\n}\n",
      "caseFeed.html": "<template>\n    <lightning-card title=\"Open cases\">\n        <template lwc:if={errors}>\n            <p class=\"slds-p-around_small slds-text-color_error\">Could not load cases.</p>\n        </template>\n        <ul class=\"slds-p-around_small\">\n            <template for:each={cases} for:item=\"item\">\n                <li key={item.id}>{item.caseNumber} — {item.subject}</li>\n            </template>\n        </ul>\n        <template lwc:if={hasNextPage}>\n            <lightning-button slot=\"footer\" label=\"Load more\" onclick={handleLoadMore}></lightning-button>\n        </template>\n    </lightning-card>\n</template>\n"
    },
    checks: [
      {
        re: /@wire\(\s*graphql\s*,\s*\{[\s\S]*query\s*:\s*gql`/,
        msg: "Wires graphql with gql",
        file: "caseFeed.js"
      },
      {
        re: /after\s*:\s*\$after/,
        msg: "Passes the cursor into the query",
        file: "caseFeed.js"
      },
      {
        re: /pageInfo\s*\{[\s\S]*endCursor/,
        msg: "Selects pageInfo endCursor",
        file: "caseFeed.js"
      },
      {
        re: /hasNextPage/,
        msg: "Tracks hasNextPage",
        file: "caseFeed.js"
      },
      {
        re: /this\.after\s*=\s*this\.endCursor/,
        msg: "Load more advances the cursor",
        file: "caseFeed.js"
      },
      {
        re: /\[\s*\.\.\.\s*this\.cases\s*,|this\.cases\.concat\(/,
        msg: "Appends pages immutably",
        file: "caseFeed.js"
      }
    ],
    forbid: [
      {
        re: /\boffset\s*:/i,
        msg: "Use cursor pagination (after), not offsets"
      }
    ],
    hints: [
      "Changing this.after changes the variables getter, which re-runs the wire.",
      "A Set of existing Ids makes de-duplication easy."
    ],
    ai: "Verify the GraphQL query is valid with Int/String variable types, pages append without duplicates, Load more only advances when hasNextPage, and errors are shown."
  },
  {
    id: "LW110",
    track: "lwc",
    level: "Hard",
    topic: "Security & modern",
    title: "Light DOM citation list with safe links",
    task: "Northwold Bank's Agentforce answers include source citations from an external knowledge base, and the bank's global CSS must style them, so `agentCitations` uses light DOM.\n- `static renderMode = 'light'` and `<template lwc:render-mode=\"light\">`\n- `@api citations` (array of `{ title, url }`, untrusted)\n- Getter `safeCitations`: keep only items whose URL parses with `new URL()` and whose protocol is `https:`; drop others (e.g. `javascript:`); trim titles and fall back to the hostname\n- Render links with `target=\"_blank\"` and `rel=\"noopener noreferrer\"`; use `this.querySelector` (not `this.template`) if you need DOM access",
    starter: {
      "agentCitations.js": "import { LightningElement, api } from 'lwc';\n\nexport default class AgentCitations extends LightningElement {\n    @api citations = [];\n    // TODO\n}\n",
      "agentCitations.html": "<template>\n    <!-- TODO -->\n</template>\n"
    },
    solution: {
      "agentCitations.js": "import { LightningElement, api } from 'lwc';\n\nexport default class AgentCitations extends LightningElement {\n    static renderMode = 'light';\n\n    @api citations = [];\n\n    get safeCitations() {\n        return (this.citations || []).reduce((acc, item, index) => {\n            let parsed;\n            try {\n                parsed = new URL(item?.url);\n            } catch (e) {\n                return acc;\n            }\n            if (parsed.protocol !== 'https:') return acc;\n            const title = (item.title || '').trim() || parsed.hostname;\n            acc.push({ key: `${index}-${parsed.href}`, href: parsed.href, title });\n            return acc;\n        }, []);\n    }\n\n    get hasCitations() {\n        return this.safeCitations.length > 0;\n    }\n}\n",
      "agentCitations.html": "<template lwc:render-mode=\"light\">\n    <template lwc:if={hasCitations}>\n        <ol class=\"agent-citations\">\n            <template for:each={safeCitations} for:item=\"cite\">\n                <li key={cite.key}>\n                    <a href={cite.href} target=\"_blank\" rel=\"noopener noreferrer\">{cite.title}</a>\n                </li>\n            </template>\n        </ol>\n    </template>\n</template>\n"
    },
    checks: [
      {
        re: /static\s+renderMode\s*=\s*['"]light['"]/,
        msg: "Declares static renderMode = 'light'",
        file: "agentCitations.js"
      },
      {
        re: /<template\s+lwc:render-mode=["']light["']/,
        msg: "Root template uses lwc:render-mode=\"light\"",
        file: "agentCitations.html"
      },
      {
        re: /new\s+URL\(/,
        msg: "Parses URLs with new URL()",
        file: "agentCitations.js"
      },
      {
        re: /protocol\s*(!==|===|==|!=)\s*['"]https:['"]/,
        msg: "Allows only https:",
        file: "agentCitations.js"
      },
      {
        re: /rel=["'][^"']*noopener[^"']*["']/i,
        msg: "Adds rel=\"noopener noreferrer\"",
        file: "agentCitations.html"
      },
      {
        re: /catch\s*\(/,
        msg: "Handles unparsable URLs",
        file: "agentCitations.js"
      }
    ],
    forbid: [
      {
        re: /innerHTML|lwc:dom=["']manual["']/i,
        msg: "Don't inject HTML"
      },
      {
        re: /this\.template\./,
        msg: "Light DOM components use this.querySelector, not this.template"
      }
    ],
    hints: [
      "new URL() throws on invalid input — wrap it in try/catch.",
      "Compare parsed.protocol to 'https:' (with the colon)."
    ],
    ai: "Verify both light DOM declarations, only https links survive (javascript:, http:, malformed dropped), titles fall back to hostname, and links open safely in a new tab."
  }
);
