PRACTICE.push(
  {
    id: "LW001",
    track: "lwc",
    level: "Easy",
    topic: "Reactivity & getters",
    title: "Order line total with a getter",
    task: "Harrow Garden Supplies wants a quick quote line on the order screen.\nBuild `orderLine`:\n- Two `lightning-input` fields (type number): Quantity (default 1) and Unit price (default 12.50)\n- A getter `lineTotal` returning quantity × unit price (treat blank as 0)\n- Show the total with `lightning-formatted-number` as GBP currency\n- The total must update whenever either input changes",
    starter: { "orderLine.js": "import { LightningElement } from 'lwc';\n\nexport default class OrderLine extends LightningElement {\n    // TODO\n}\n", "orderLine.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "orderLine.js": "import { LightningElement } from 'lwc';\n\nexport default class OrderLine extends LightningElement {\n    quantity = 1;\n    unitPrice = 12.5;\n\n    handleQuantityChange(event) {\n        this.quantity = Number(event.target.value) || 0;\n    }\n\n    handlePriceChange(event) {\n        this.unitPrice = Number(event.target.value) || 0;\n    }\n\n    get lineTotal() {\n        return this.quantity * this.unitPrice;\n    }\n}\n", "orderLine.html": "<template>\n    <lightning-input type=\"number\" label=\"Quantity\" value={quantity} onchange={handleQuantityChange}></lightning-input>\n    <lightning-input type=\"number\" label=\"Unit price\" step=\"0.01\" value={unitPrice} onchange={handlePriceChange}></lightning-input>\n    <p>Total:\n        <lightning-formatted-number value={lineTotal} format-style=\"currency\" currency-code=\"GBP\"></lightning-formatted-number>\n    </p>\n</template>\n" },
    checks: [
      { re: /get\s+lineTotal\s*\(\s*\)\s*\{/, msg: "Defines a lineTotal getter", file: "orderLine.js" },
      { re: /<lightning-input[^>]*on(change|input|commit)=\{\s*\w+\s*\}/i, msg: "Handles lightning-input changes", file: "orderLine.html" },
      { re: /<lightning-formatted-number[^>]*value=\{\s*lineTotal\s*\}/i, msg: "Displays lineTotal in lightning-formatted-number", file: "orderLine.html" },
      { re: /currency-code\s*=\s*["']GBP["']/i, msg: "Formats the total as GBP", file: "orderLine.html" }
    ],
    forbid: [
      { re: /innerHTML/i, msg: "Don't touch innerHTML" }
    ],
    hints: ["Keep quantity and unitPrice as plain class fields — LWC fields are reactive.", "Convert input values with Number(...) because inputs return strings."],
    ai: "Verify both inputs update fields, blank/invalid values fall back to 0, the total is computed in a getter (not stored and manually synced) and is shown as GBP currency."
  },
  {
    id: "LW002",
    track: "lwc",
    level: "Easy",
    topic: "Reactivity & getters",
    title: "Loyalty tier badge",
    task: "Bramley Coffee Co. shows a loyalty badge on its customer console.\nBuild `loyaltyBadge` with a field `points` (default 0) and a number input to change it.\n- Getter `tier`: \"Gold\" for 1000+ points, \"Silver\" for 500–999, otherwise \"Bronze\"\n- Show the tier in a `lightning-badge` (label = tier)\n- Getter `pointsToNext` returns points needed for the next tier (0 when Gold)",
    starter: { "loyaltyBadge.js": "import { LightningElement } from 'lwc';\n\nexport default class LoyaltyBadge extends LightningElement {\n    // TODO\n}\n", "loyaltyBadge.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "loyaltyBadge.js": "import { LightningElement } from 'lwc';\n\nexport default class LoyaltyBadge extends LightningElement {\n    points = 0;\n\n    handlePointsChange(event) {\n        this.points = Number(event.target.value) || 0;\n    }\n\n    get tier() {\n        if (this.points >= 1000) return 'Gold';\n        if (this.points >= 500) return 'Silver';\n        return 'Bronze';\n    }\n\n    get pointsToNext() {\n        if (this.points >= 1000) return 0;\n        return (this.points >= 500 ? 1000 : 500) - this.points;\n    }\n}\n", "loyaltyBadge.html": "<template>\n    <lightning-input type=\"number\" label=\"Points\" value={points} onchange={handlePointsChange}></lightning-input>\n    <lightning-badge label={tier}></lightning-badge>\n    <p>Points to next tier: {pointsToNext}</p>\n</template>\n" },
    checks: [
      { re: /get\s+tier\s*\(\s*\)\s*\{/, msg: "Defines a tier getter", file: "loyaltyBadge.js" },
      { re: /get\s+pointsToNext\s*\(\s*\)\s*\{/, msg: "Defines a pointsToNext getter", file: "loyaltyBadge.js" },
      { re: /1000/, msg: "Uses the 1000-point Gold threshold", file: "loyaltyBadge.js" },
      { re: /<lightning-badge[^>]*label=\{\s*tier\s*\}/i, msg: "Shows the tier in lightning-badge", file: "loyaltyBadge.html" }
    ],
    forbid: [
      { re: /innerHTML/i, msg: "Don't touch innerHTML" }
    ],
    hints: ["Check the highest threshold first.", "pointsToNext is the next threshold (500 or 1000) minus the current points."],
    ai: "Check the boundaries: 499 → Bronze (1 to next), 500 → Silver, 999 → Silver, 1000 → Gold with 0 to next. Tier and remaining points must be derived via getters."
  },
  {
    id: "LW003",
    track: "lwc",
    level: "Medium",
    topic: "Reactivity & getters",
    title: "Add tasks to a list immutably",
    task: "Kestrel Facilities logs snag items during site visits.\nBuild `snagList`:\n- A `tasks` field (array of `{ id, name }`) starting empty\n- An input and an \"Add\" button; clicking Add appends a new task with a unique id\n- Ignore blank/whitespace-only names and clear the input afterwards\n- Update the array immutably (create a new array, do not `push` onto `this.tasks`)\n- Render tasks with `for:each` and a proper `key`",
    starter: { "snagList.js": "import { LightningElement } from 'lwc';\n\nexport default class SnagList extends LightningElement {\n    // TODO\n}\n", "snagList.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "snagList.js": "import { LightningElement } from 'lwc';\n\nexport default class SnagList extends LightningElement {\n    tasks = [];\n    newName = '';\n    nextId = 1;\n\n    handleNameChange(event) {\n        this.newName = event.target.value;\n    }\n\n    handleAdd() {\n        const name = (this.newName || '').trim();\n        if (!name) return;\n        this.tasks = [...this.tasks, { id: this.nextId++, name }];\n        this.newName = '';\n    }\n}\n", "snagList.html": "<template>\n    <lightning-input label=\"Snag\" value={newName} onchange={handleNameChange}></lightning-input>\n    <lightning-button label=\"Add\" onclick={handleAdd}></lightning-button>\n    <ul>\n        <template for:each={tasks} for:item=\"task\">\n            <li key={task.id}>{task.name}</li>\n        </template>\n    </ul>\n</template>\n" },
    checks: [
      { re: /\[\s*\.\.\.this\.tasks|this\.tasks\.concat\(/, msg: "Builds a new array from this.tasks", file: "snagList.js" },
      { re: /\.trim\(\)/, msg: "Ignores whitespace-only names", file: "snagList.js" },
      { re: /for:each=\{\s*tasks\s*\}/i, msg: "Iterates tasks with for:each", file: "snagList.html" },
      { re: /key=\{\s*\w+\.id\s*\}/i, msg: "Uses the task id as key", file: "snagList.html" }
    ],
    forbid: [
      { re: /this\.tasks\.push\s*\(/, msg: "Do not mutate this.tasks with push" },
      { re: /innerHTML/i, msg: "Don't touch innerHTML" }
    ],
    hints: ["Spread the existing array into a new one: [...this.tasks, newItem].", "Keep a counter field (or Date.now()) for unique ids."],
    ai: "Verify blank names are ignored, the input is cleared after adding, ids are unique, and the array is replaced rather than mutated."
  },
  {
    id: "LW004",
    track: "lwc",
    level: "Medium",
    topic: "Reactivity & getters",
    title: "Toggle checklist items immutably",
    task: "Northgate Lettings uses a move-in checklist.\nBuild `moveInChecklist` with a field `items` pre-filled with 4 items `{ id, label, done:false }`.\n- Render each item as a `lightning-input type=\"checkbox\"` with `data-id`\n- On change, produce a NEW array where only the matching item is a new object with `done` updated\n- Getter `completedCount` and getter `progress` (percentage, whole number) shown as \"2 of 4 done (50%)\"",
    starter: { "moveInChecklist.js": "import { LightningElement } from 'lwc';\n\nexport default class MoveInChecklist extends LightningElement {\n    // TODO\n}\n", "moveInChecklist.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "moveInChecklist.js": "import { LightningElement } from 'lwc';\n\nexport default class MoveInChecklist extends LightningElement {\n    items = [\n        { id: 'keys', label: 'Keys handed over', done: false },\n        { id: 'meter', label: 'Meter readings taken', done: false },\n        { id: 'inventory', label: 'Inventory signed', done: false },\n        { id: 'deposit', label: 'Deposit protected', done: false }\n    ];\n\n    handleToggle(event) {\n        const id = event.target.dataset.id;\n        const checked = event.target.checked;\n        this.items = this.items.map(item => (item.id === id ? { ...item, done: checked } : item));\n    }\n\n    get completedCount() {\n        return this.items.filter(item => item.done).length;\n    }\n\n    get progress() {\n        return this.items.length ? Math.round((this.completedCount / this.items.length) * 100) : 0;\n    }\n\n    get summary() {\n        return this.completedCount + ' of ' + this.items.length + ' done (' + this.progress + '%)';\n    }\n}\n", "moveInChecklist.html": "<template>\n    <template for:each={items} for:item=\"item\">\n        <lightning-input key={item.id} type=\"checkbox\" label={item.label} checked={item.done} data-id={item.id} onchange={handleToggle}></lightning-input>\n    </template>\n    <p>{summary}</p>\n</template>\n" },
    checks: [
      { re: /this\.items\.map\s*\(/, msg: "Maps items into a new array", file: "moveInChecklist.js" },
      { re: /\.\.\.\s*\w+/, msg: "Copies the changed item with spread", file: "moveInChecklist.js" },
      { re: /dataset\.id/, msg: "Reads the item id from data-id", file: "moveInChecklist.js" },
      { re: /get\s+completedCount\s*\(\s*\)/, msg: "Defines completedCount getter", file: "moveInChecklist.js" },
      { re: /get\s+progress\s*\(\s*\)/, msg: "Defines progress getter", file: "moveInChecklist.js" }
    ],
    forbid: [
      { re: /\.done\s*=(?!=)/, msg: "Do not mutate item.done in place" },
      { re: /innerHTML/i, msg: "Don't touch innerHTML" }
    ],
    hints: ["event.target.dataset.id gives you the data-id value.", "items.map(i => i.id === id ? { ...i, done: checked } : i)"],
    ai: "Verify only the toggled item changes, the array and changed object are new references, progress rounds correctly and handles an empty list, and the template contains no expressions."
  },
  {
    id: "LW005",
    track: "lwc",
    level: "Medium",
    topic: "Reactivity & getters",
    title: "Update a nested address object",
    task: "Ashdown Removals captures a collection address.\nBuild `collectionAddress` with field `address = { street:\"\", city:\"\", postcode:\"\" }`.\n- Three `lightning-input`s each with `data-field` set to the property name, sharing ONE change handler\n- The handler must replace `this.address` with a new object (no direct property mutation)\n- Postcode is stored upper-cased\n- Getter `oneLine` returns the non-empty parts joined with \", \"",
    starter: { "collectionAddress.js": "import { LightningElement } from 'lwc';\n\nexport default class CollectionAddress extends LightningElement {\n    // TODO\n}\n", "collectionAddress.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "collectionAddress.js": "import { LightningElement } from 'lwc';\n\nexport default class CollectionAddress extends LightningElement {\n    address = { street: '', city: '', postcode: '' };\n\n    handleChange(event) {\n        const field = event.target.dataset.field;\n        let value = event.target.value || '';\n        if (field === 'postcode') value = value.toUpperCase();\n        this.address = { ...this.address, [field]: value };\n    }\n\n    get oneLine() {\n        const { street, city, postcode } = this.address;\n        return [street, city, postcode].filter(part => part && part.trim()).join(', ');\n    }\n}\n", "collectionAddress.html": "<template>\n    <lightning-input label=\"Street\" data-field=\"street\" value={address.street} onchange={handleChange}></lightning-input>\n    <lightning-input label=\"City\" data-field=\"city\" value={address.city} onchange={handleChange}></lightning-input>\n    <lightning-input label=\"Postcode\" data-field=\"postcode\" value={address.postcode} onchange={handleChange}></lightning-input>\n    <p>{oneLine}</p>\n</template>\n" },
    checks: [
      { re: /\.\.\.\s*this\.address/, msg: "Copies the existing address with spread", file: "collectionAddress.js" },
      { re: /\[\s*\w+\s*\]\s*:/, msg: "Uses a computed property key for the field", file: "collectionAddress.js" },
      { re: /toUpperCase\s*\(/, msg: "Upper-cases the postcode", file: "collectionAddress.js" },
      { re: /get\s+oneLine\s*\(\s*\)/, msg: "Defines oneLine getter", file: "collectionAddress.js" },
      { re: /data-field\s*=/i, msg: "Inputs carry data-field", file: "collectionAddress.html" }
    ],
    forbid: [
      { re: /this\.address\.\w+\s*=(?!=)/, msg: "Do not mutate this.address properties directly" },
      { re: /innerHTML/i, msg: "Don't touch innerHTML" }
    ],
    hints: ["One handler: read event.target.dataset.field.", "{ ...this.address, [field]: value } creates a new object."],
    ai: "Verify a single handler serves all inputs, the address object is replaced not mutated, the postcode is upper-cased, and oneLine skips empty parts."
  },
  {
    id: "LW006",
    track: "lwc",
    level: "Hard",
    topic: "Reactivity & getters",
    title: "Sortable invoice table via getter",
    task: "Pennine Wholesale wants a sortable invoice table.\nBuild `invoiceTable` with a field `invoices` (array of `{ id, customer, amount, dueDate }`, pre-filled with 4 rows) and fields `sortBy` and `sortDirection` (\"asc\"/\"desc\").\n- Clicking a column header button (`data-field`) sorts by that field; clicking the same header again flips direction\n- Getter `sortedInvoices` returns a sorted COPY; never sort `this.invoices` in place\n- Strings compare with `localeCompare`, numbers numerically\n- Getter `sortIcon` returns \"utility:arrowup\"/\"utility:arrowdown\"",
    starter: { "invoiceTable.js": "import { LightningElement } from 'lwc';\n\nexport default class InvoiceTable extends LightningElement {\n    // TODO\n}\n", "invoiceTable.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "invoiceTable.js": "import { LightningElement } from 'lwc';\n\nexport default class InvoiceTable extends LightningElement {\n    invoices = [\n        { id: 'INV-101', customer: 'Calder Foods', amount: 1250, dueDate: '2026-11-01' },\n        { id: 'INV-102', customer: 'Aire Builders', amount: 480, dueDate: '2026-10-20' },\n        { id: 'INV-103', customer: 'Wharfe Dairy', amount: 3100, dueDate: '2026-12-05' },\n        { id: 'INV-104', customer: 'Brontë Books', amount: 95, dueDate: '2026-10-12' }\n    ];\n    sortBy = 'customer';\n    sortDirection = 'asc';\n\n    handleSort(event) {\n        const field = event.currentTarget.dataset.field;\n        if (field === this.sortBy) {\n            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';\n        } else {\n            this.sortBy = field;\n            this.sortDirection = 'asc';\n        }\n    }\n\n    get sortedInvoices() {\n        const dir = this.sortDirection === 'asc' ? 1 : -1;\n        const field = this.sortBy;\n        return [...this.invoices].sort((a, b) => {\n            const x = a[field];\n            const y = b[field];\n            const result = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));\n            return result * dir;\n        });\n    }\n\n    get sortIcon() {\n        return this.sortDirection === 'asc' ? 'utility:arrowup' : 'utility:arrowdown';\n    }\n}\n", "invoiceTable.html": "<template>\n    <p>Sorted by {sortBy} <lightning-icon icon-name={sortIcon} size=\"xx-small\"></lightning-icon></p>\n    <table class=\"slds-table slds-table_bordered\">\n        <thead>\n            <tr>\n                <th><lightning-button variant=\"base\" label=\"Customer\" data-field=\"customer\" onclick={handleSort}></lightning-button></th>\n                <th><lightning-button variant=\"base\" label=\"Amount\" data-field=\"amount\" onclick={handleSort}></lightning-button></th>\n                <th><lightning-button variant=\"base\" label=\"Due\" data-field=\"dueDate\" onclick={handleSort}></lightning-button></th>\n            </tr>\n        </thead>\n        <tbody>\n            <template for:each={sortedInvoices} for:item=\"inv\">\n                <tr key={inv.id}>\n                    <td>{inv.customer}</td>\n                    <td>{inv.amount}</td>\n                    <td>{inv.dueDate}</td>\n                </tr>\n            </template>\n        </tbody>\n    </table>\n</template>\n" },
    checks: [
      { re: /get\s+sortedInvoices\s*\(\s*\)/, msg: "Defines sortedInvoices getter", file: "invoiceTable.js" },
      { re: /\[\s*\.\.\.this\.invoices\s*\]\s*\.sort|this\.invoices\.slice\(\s*\)\s*\.sort|toSorted\s*\(/, msg: "Sorts a copy of the array", file: "invoiceTable.js" },
      { re: /localeCompare/, msg: "Uses localeCompare for strings", file: "invoiceTable.js" },
      { re: /get\s+sortIcon\s*\(\s*\)/, msg: "Defines sortIcon getter", file: "invoiceTable.js" },
      { re: /for:each=\{\s*sortedInvoices\s*\}/i, msg: "Renders the sorted getter", file: "invoiceTable.html" }
    ],
    forbid: [
      { re: /this\.invoices\.sort\s*\(/, msg: "Never sort this.invoices in place" },
      { re: /innerHTML/i, msg: "Don't touch innerHTML" }
    ],
    hints: ["Store only sortBy and sortDirection; derive the rows in a getter.", "Multiply the comparator result by 1 or -1 for direction.", "Use [...this.invoices].sort(...) so the source stays untouched."],
    ai: "Verify clicking the same header toggles direction, a new header resets to ascending, numbers sort numerically (95 before 480), strings use localeCompare, and the source array is never mutated."
  },
  {
    id: "LW007",
    track: "lwc",
    level: "Hard",
    topic: "Reactivity & getters",
    title: "Filtered pipeline with totals",
    task: "Severn Energy wants a pipeline mini-view.\nBuild `pipelineSummary` with field `deals` (array of `{ id, name, stage, amount }`, 5 rows), a search input and a stage `lightning-combobox` (All / Prospecting / Negotiation / Closed Won).\n- Getter `filteredDeals`: case-insensitive name match AND stage match (\"All\" = no stage filter)\n- Getter `totalAmount`: sum of filtered amounts using `reduce`\n- Getter `hasDeals`; show \"No deals match\" with `lwc:if`/`lwc:else` when empty\n- No state duplication: do not store the filtered list in a field",
    starter: { "pipelineSummary.js": "import { LightningElement } from 'lwc';\n\nexport default class PipelineSummary extends LightningElement {\n    // TODO\n}\n", "pipelineSummary.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "pipelineSummary.js": "import { LightningElement } from 'lwc';\n\nexport default class PipelineSummary extends LightningElement {\n    deals = [\n        { id: 'd1', name: 'Bristol Depot Solar', stage: 'Prospecting', amount: 42000 },\n        { id: 'd2', name: 'Gloucester Heat Pumps', stage: 'Negotiation', amount: 18500 },\n        { id: 'd3', name: 'Cardiff Fleet Charging', stage: 'Closed Won', amount: 66000 },\n        { id: 'd4', name: 'Bath Spa Retrofit', stage: 'Negotiation', amount: 9800 },\n        { id: 'd5', name: 'Swindon Warehouse LED', stage: 'Prospecting', amount: 12750 }\n    ];\n    searchTerm = '';\n    stage = 'All';\n\n    get stageOptions() {\n        return ['All', 'Prospecting', 'Negotiation', 'Closed Won'].map(s => ({ label: s, value: s }));\n    }\n\n    handleSearch(event) {\n        this.searchTerm = event.target.value || '';\n    }\n\n    handleStage(event) {\n        this.stage = event.detail.value;\n    }\n\n    get filteredDeals() {\n        const term = this.searchTerm.trim().toLowerCase();\n        return this.deals.filter(d =>\n            d.name.toLowerCase().includes(term) && (this.stage === 'All' || d.stage === this.stage)\n        );\n    }\n\n    get totalAmount() {\n        return this.filteredDeals.reduce((sum, d) => sum + d.amount, 0);\n    }\n\n    get hasDeals() {\n        return this.filteredDeals.length > 0;\n    }\n}\n", "pipelineSummary.html": "<template>\n    <lightning-input type=\"search\" label=\"Search deals\" value={searchTerm} onchange={handleSearch}></lightning-input>\n    <lightning-combobox label=\"Stage\" value={stage} options={stageOptions} onchange={handleStage}></lightning-combobox>\n    <template lwc:if={hasDeals}>\n        <ul>\n            <template for:each={filteredDeals} for:item=\"deal\">\n                <li key={deal.id}>{deal.name} ({deal.stage})</li>\n            </template>\n        </ul>\n        <p>Total: <lightning-formatted-number value={totalAmount} format-style=\"currency\" currency-code=\"GBP\"></lightning-formatted-number></p>\n    </template>\n    <template lwc:else>\n        <p>No deals match</p>\n    </template>\n</template>\n" },
    checks: [
      { re: /get\s+filteredDeals\s*\(\s*\)[\s\S]*\.filter\s*\(/, msg: "filteredDeals getter uses filter", file: "pipelineSummary.js" },
      { re: /\.reduce\s*\(/, msg: "Sums with reduce", file: "pipelineSummary.js" },
      { re: /toLowerCase\s*\(|toUpperCase\s*\(/, msg: "Matches case-insensitively", file: "pipelineSummary.js" },
      { re: /lwc:if=\{\s*\w+\s*\}/i, msg: "Uses lwc:if for the empty state", file: "pipelineSummary.html" },
      { re: /lwc:else/i, msg: "Uses lwc:else", file: "pipelineSummary.html" },
      { re: /<lightning-combobox[^>]*options=\{/i, msg: "Stage combobox with options", file: "pipelineSummary.html" }
    ],
    forbid: [
      { re: /if:(true|false)\s*=/i, msg: "Use lwc:if / lwc:else, not the legacy if:true / if:false" },
      { re: /innerHTML/i, msg: "Don't touch innerHTML" }
    ],
    hints: ["Keep only searchTerm and stage as state.", "totalAmount can build on filteredDeals.", "lightning-combobox gives the value in event.detail.value."],
    ai: "Verify filters combine (AND), \"All\" disables the stage filter, matching is case-insensitive, the total reflects only filtered rows, and the filtered list is derived in a getter rather than stored."
  },
  {
    id: "LW008",
    track: "lwc",
    level: "Easy",
    topic: "Template directives",
    title: "Stock level message with lwc:elseif",
    task: "Tamar Outdoor shows stock levels on product records.\nBuild `stockLevel` with a number input bound to field `quantity` (default 0).\n- 0 → \"Out of stock\" (red)\n- 1–9 → \"Low stock: only N left\"\n- 10+ → \"In stock\"\n- Use `lwc:if`, `lwc:elseif` and `lwc:else` with getters `isOutOfStock` and `isLowStock` (templates cannot compare values)",
    starter: { "stockLevel.js": "import { LightningElement } from 'lwc';\n\nexport default class StockLevel extends LightningElement {\n    // TODO\n}\n", "stockLevel.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "stockLevel.js": "import { LightningElement } from 'lwc';\n\nexport default class StockLevel extends LightningElement {\n    quantity = 0;\n\n    handleChange(event) {\n        this.quantity = Number(event.target.value) || 0;\n    }\n\n    get isOutOfStock() {\n        return this.quantity <= 0;\n    }\n\n    get isLowStock() {\n        return this.quantity > 0 && this.quantity < 10;\n    }\n}\n", "stockLevel.html": "<template>\n    <lightning-input type=\"number\" label=\"Quantity\" value={quantity} onchange={handleChange}></lightning-input>\n    <template lwc:if={isOutOfStock}>\n        <p class=\"slds-text-color_error\">Out of stock</p>\n    </template>\n    <template lwc:elseif={isLowStock}>\n        <p>Low stock: only {quantity} left</p>\n    </template>\n    <template lwc:else>\n        <p>In stock</p>\n    </template>\n</template>\n" },
    checks: [
      { re: /lwc:if=\{\s*isOutOfStock\s*\}/i, msg: "lwc:if on isOutOfStock", file: "stockLevel.html" },
      { re: /lwc:elseif=\{\s*isLowStock\s*\}/i, msg: "lwc:elseif on isLowStock", file: "stockLevel.html" },
      { re: /lwc:else\b/i, msg: "lwc:else for the default", file: "stockLevel.html" },
      { re: /get\s+isLowStock\s*\(\s*\)/, msg: "Defines isLowStock getter", file: "stockLevel.js" }
    ],
    forbid: [
      { re: /if:(true|false)\s*=/i, msg: "Use lwc:if / lwc:else, not the legacy if:true / if:false" }
    ],
    hints: ["Each branch is a sibling <template> directly after the previous one.", "Compute the booleans in getters."],
    ai: "Verify boundaries 0, 1, 9 and 10 render the right branch, branches are adjacent siblings, and no legacy if:true is used."
  },
  {
    id: "LW009",
    track: "lwc",
    level: "Easy",
    topic: "Template directives",
    title: "Supplier list with for:each",
    task: "Calder Valley Brewery lists its approved suppliers.\nBuild `supplierList` with a field `suppliers` (array of `{ id, name, city, rating }`, 4 rows).\n- Render a `<ul>` with one `<li>` per supplier using `for:each` / `for:item`\n- Each `<li>` must have `key={supplier.id}` (not the index)\n- Show \"name — city (rating★)\"",
    starter: { "supplierList.js": "import { LightningElement } from 'lwc';\n\nexport default class SupplierList extends LightningElement {\n    // TODO\n}\n", "supplierList.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "supplierList.js": "import { LightningElement } from 'lwc';\n\nexport default class SupplierList extends LightningElement {\n    suppliers = [\n        { id: 'S-01', name: 'Hebden Hops', city: 'Hebden Bridge', rating: 5 },\n        { id: 'S-02', name: 'Pennine Malt', city: 'Halifax', rating: 4 },\n        { id: 'S-03', name: 'Todmorden Glass', city: 'Todmorden', rating: 3 },\n        { id: 'S-04', name: 'Ryburn Casks', city: 'Sowerby Bridge', rating: 4 }\n    ];\n}\n", "supplierList.html": "<template>\n    <ul class=\"slds-list_dotted\">\n        <template for:each={suppliers} for:item=\"supplier\">\n            <li key={supplier.id}>{supplier.name} — {supplier.city} ({supplier.rating}★)</li>\n        </template>\n    </ul>\n</template>\n" },
    checks: [
      { re: /for:each=\{\s*suppliers\s*\}/i, msg: "Iterates suppliers with for:each", file: "supplierList.html" },
      { re: /for:item=["']\w+["']/i, msg: "Declares for:item", file: "supplierList.html" },
      { re: /<li[^>]*key=\{\s*\w+\.id\s*\}/i, msg: "Each <li> has key={item.id}", file: "supplierList.html" }
    ],
    forbid: [
      { re: /key=\{\s*\w*index\w*\s*\}/i, msg: "Do not use the index as key" },
      { re: /innerHTML/i, msg: "Don't touch innerHTML" }
    ],
    hints: ["for:each goes on a <template>; key goes on the first element inside it."],
    ai: "Verify the key is a stable unique id on the direct child of the iteration template and the output format matches the brief."
  },
  {
    id: "LW010",
    track: "lwc",
    level: "Easy",
    topic: "Template directives",
    title: "Case queue with empty state",
    task: "Mersey Broadband's support team wants a mini case queue.\nBuild `caseQueue` with a field `cases` (array of `{ id, subject, priority }`) and a \"Clear all\" button that empties it.\n- Getter `hasCases`\n- When there are cases, list them with `for:each`; otherwise show \"No open cases 🎉\"\n- Use `lwc:if` / `lwc:else`",
    starter: { "caseQueue.js": "import { LightningElement } from 'lwc';\n\nexport default class CaseQueue extends LightningElement {\n    // TODO\n}\n", "caseQueue.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "caseQueue.js": "import { LightningElement } from 'lwc';\n\nexport default class CaseQueue extends LightningElement {\n    cases = [\n        { id: 'C-1001', subject: 'Router offline', priority: 'High' },\n        { id: 'C-1002', subject: 'Slow speeds evenings', priority: 'Medium' },\n        { id: 'C-1003', subject: 'Billing address change', priority: 'Low' }\n    ];\n\n    get hasCases() {\n        return this.cases.length > 0;\n    }\n\n    handleClear() {\n        this.cases = [];\n    }\n}\n", "caseQueue.html": "<template>\n    <template lwc:if={hasCases}>\n        <ul>\n            <template for:each={cases} for:item=\"item\">\n                <li key={item.id}>{item.subject} — {item.priority}</li>\n            </template>\n        </ul>\n        <lightning-button label=\"Clear all\" onclick={handleClear}></lightning-button>\n    </template>\n    <template lwc:else>\n        <p>No open cases 🎉</p>\n    </template>\n</template>\n" },
    checks: [
      { re: /get\s+hasCases\s*\(\s*\)/, msg: "Defines hasCases getter", file: "caseQueue.js" },
      { re: /lwc:if=\{\s*hasCases\s*\}/i, msg: "lwc:if on hasCases", file: "caseQueue.html" },
      { re: /lwc:else/i, msg: "lwc:else for the empty state", file: "caseQueue.html" },
      { re: /for:each=\{\s*cases\s*\}/i, msg: "Lists cases with for:each", file: "caseQueue.html" }
    ],
    forbid: [
      { re: /if:(true|false)\s*=/i, msg: "Use lwc:if / lwc:else, not the legacy if:true / if:false" }
    ],
    hints: ["Reassign this.cases = [] to clear — the template re-renders."],
    ai: "Verify clearing re-renders to the empty state, keys are unique ids, and lwc:if/lwc:else are used correctly as siblings."
  },
  {
    id: "LW011",
    track: "lwc",
    level: "Medium",
    topic: "Template directives",
    title: "Delivery timeline with iterator",
    task: "Solent Couriers shows a parcel's journey.\nBuild `deliveryTimeline` with field `steps` (array of `{ id, label, time }`, 4 rows).\n- Use `iterator:step={steps}` (not for:each)\n- Show a \"Collected\" `lightning-badge` on the FIRST step and a \"Delivered\" badge on the LAST step\n- Key each row with the underlying item id",
    starter: { "deliveryTimeline.js": "import { LightningElement } from 'lwc';\n\nexport default class DeliveryTimeline extends LightningElement {\n    // TODO\n}\n", "deliveryTimeline.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "deliveryTimeline.js": "import { LightningElement } from 'lwc';\n\nexport default class DeliveryTimeline extends LightningElement {\n    steps = [\n        { id: 'st1', label: 'Collected from Portsmouth depot', time: '08:10' },\n        { id: 'st2', label: 'Arrived at Southampton hub', time: '09:45' },\n        { id: 'st3', label: 'Out for delivery', time: '11:20' },\n        { id: 'st4', label: 'Delivered to reception', time: '13:05' }\n    ];\n}\n", "deliveryTimeline.html": "<template>\n    <ol class=\"slds-list_ordered\">\n        <template iterator:step={steps}>\n            <li key={step.value.id}>\n                <template lwc:if={step.first}>\n                    <lightning-badge label=\"Collected\"></lightning-badge>\n                </template>\n                {step.value.time} — {step.value.label}\n                <template lwc:if={step.last}>\n                    <lightning-badge label=\"Delivered\"></lightning-badge>\n                </template>\n            </li>\n        </template>\n    </ol>\n</template>\n" },
    checks: [
      { re: /iterator:\w+=\{\s*steps\s*\}/i, msg: "Uses iterator over steps", file: "deliveryTimeline.html" },
      { re: /key=\{\s*\w+\.value\.id\s*\}/i, msg: "Keys rows with value.id", file: "deliveryTimeline.html" },
      { re: /lwc:if=\{\s*\w+\.first\s*\}/i, msg: "Uses .first for the first step", file: "deliveryTimeline.html" },
      { re: /lwc:if=\{\s*\w+\.last\s*\}/i, msg: "Uses .last for the last step", file: "deliveryTimeline.html" }
    ],
    forbid: [
      { re: /if:(true|false)\s*=/i, msg: "Use lwc:if / lwc:else, not the legacy if:true / if:false" },
      { re: /for:each/i, msg: "Use iterator, not for:each, for this task" }
    ],
    hints: ["With iterator:it the item is it.value; it.first / it.last are booleans."],
    ai: "Verify the iterator variable is used correctly (value.id for key, first/last for badges) and that a single-step list would show both badges."
  },
  {
    id: "LW012",
    track: "lwc",
    level: "Medium",
    topic: "Template directives",
    title: "Overdue invoices with row decoration",
    task: "Lune Accountancy flags overdue invoices.\nBuild `overdueInvoices` with field `invoices` (array of `{ id, number, dueDate, paid }`) and field `today` (ISO date string).\n- Templates can't evaluate expressions, so add a getter `rows` that maps each invoice to a new object with `isOverdue` (unpaid AND dueDate < today) and `rowClass` (\"slds-text-color_error\" when overdue)\n- Render `rows` with `for:each`, apply `class={row.rowClass}` and show an \"Overdue\" badge with `lwc:if={row.isOverdue}`",
    starter: { "overdueInvoices.js": "import { LightningElement } from 'lwc';\n\nexport default class OverdueInvoices extends LightningElement {\n    // TODO\n}\n", "overdueInvoices.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "overdueInvoices.js": "import { LightningElement } from 'lwc';\n\nexport default class OverdueInvoices extends LightningElement {\n    today = new Date().toISOString().slice(0, 10);\n    invoices = [\n        { id: 'i1', number: 'LA-2041', dueDate: '2026-08-31', paid: false },\n        { id: 'i2', number: 'LA-2042', dueDate: '2026-09-15', paid: true },\n        { id: 'i3', number: 'LA-2043', dueDate: '2027-01-10', paid: false }\n    ];\n\n    get rows() {\n        return this.invoices.map(inv => {\n            const isOverdue = !inv.paid && inv.dueDate < this.today;\n            return { ...inv, isOverdue, rowClass: isOverdue ? 'slds-text-color_error' : '' };\n        });\n    }\n}\n", "overdueInvoices.html": "<template>\n    <ul>\n        <template for:each={rows} for:item=\"row\">\n            <li key={row.id} class={row.rowClass}>\n                {row.number} due {row.dueDate}\n                <template lwc:if={row.isOverdue}>\n                    <lightning-badge label=\"Overdue\"></lightning-badge>\n                </template>\n            </li>\n        </template>\n    </ul>\n</template>\n" },
    checks: [
      { re: /get\s+rows\s*\(\s*\)[\s\S]*\.map\s*\(/, msg: "rows getter maps the invoices", file: "overdueInvoices.js" },
      { re: /isOverdue/, msg: "Computes isOverdue", file: "overdueInvoices.js" },
      { re: /class=\{\s*\w+\.rowClass\s*\}/i, msg: "Binds class to row.rowClass", file: "overdueInvoices.html" },
      { re: /lwc:if=\{\s*\w+\.isOverdue\s*\}/i, msg: "Shows the badge with lwc:if on isOverdue", file: "overdueInvoices.html" }
    ],
    forbid: [
      { re: /if:(true|false)\s*=/i, msg: "Use lwc:if / lwc:else, not the legacy if:true / if:false" },
      { re: /\{\s*!|\{[^}]*(&&|\|\||<|>|===?)[^}]*\}/, msg: "No expressions inside template bindings", file: "overdueInvoices.html" }
    ],
    hints: ["ISO date strings (YYYY-MM-DD) compare correctly as strings.", "Return { ...inv, isOverdue, rowClass } from map."],
    ai: "Verify paid invoices are never overdue, source objects are not mutated, and all logic lives in JS rather than the template."
  },
  {
    id: "LW013",
    track: "lwc",
    level: "Medium",
    topic: "Template directives",
    title: "Opportunities grouped by stage",
    task: "Cheviot Software groups its opportunities by stage.\nBuild `stageGroups` with field `opportunities` (array of `{ id, name, stage }`, 6 rows across 3 stages).\n- Getter `groups` returns `[{ stage, count, items: [...] }]` in first-seen stage order\n- Render with NESTED `for:each` loops: a heading per group \"Stage (count)\", then a list of its opportunities\n- Both loops need correct keys",
    starter: { "stageGroups.js": "import { LightningElement } from 'lwc';\n\nexport default class StageGroups extends LightningElement {\n    // TODO\n}\n", "stageGroups.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "stageGroups.js": "import { LightningElement } from 'lwc';\n\nexport default class StageGroups extends LightningElement {\n    opportunities = [\n        { id: 'o1', name: 'Alnwick Library CRM', stage: 'Qualification' },\n        { id: 'o2', name: 'Berwick Port Portal', stage: 'Proposal' },\n        { id: 'o3', name: 'Hexham Clinic App', stage: 'Qualification' },\n        { id: 'o4', name: 'Morpeth Schools MIS', stage: 'Negotiation' },\n        { id: 'o5', name: 'Kielder Lodges Booking', stage: 'Proposal' },\n        { id: 'o6', name: 'Rothbury Estates ERP', stage: 'Qualification' }\n    ];\n\n    get groups() {\n        const byStage = new Map();\n        for (const opp of this.opportunities) {\n            if (!byStage.has(opp.stage)) byStage.set(opp.stage, []);\n            byStage.get(opp.stage).push(opp);\n        }\n        return Array.from(byStage, ([stage, items]) => ({ stage, count: items.length, items }));\n    }\n}\n", "stageGroups.html": "<template>\n    <template for:each={groups} for:item=\"group\">\n        <section key={group.stage}>\n            <h3 class=\"slds-text-heading_small\">{group.stage} ({group.count})</h3>\n            <ul>\n                <template for:each={group.items} for:item=\"opp\">\n                    <li key={opp.id}>{opp.name}</li>\n                </template>\n            </ul>\n        </section>\n    </template>\n</template>\n" },
    checks: [
      { re: /get\s+groups\s*\(\s*\)/, msg: "Defines groups getter", file: "stageGroups.js" },
      { re: /for:each=\{\s*groups\s*\}[\s\S]*for:each=\{\s*\w+\.items\s*\}/i, msg: "Nested for:each over group items", file: "stageGroups.html" },
      { re: /key=\{\s*\w+\.stage\s*\}/i, msg: "Outer loop keyed by stage", file: "stageGroups.html" },
      { re: /key=\{\s*\w+\.id\s*\}/i, msg: "Inner loop keyed by id", file: "stageGroups.html" }
    ],
    forbid: [
      { re: /innerHTML/i, msg: "Don't touch innerHTML" }
    ],
    hints: ["A Map preserves insertion order, giving first-seen stage order.", "Each group object needs its own key — the stage name is unique."],
    ai: "Verify grouping preserves first-seen order, counts are correct, the source array is not mutated, and both loops have unique keys."
  },
  {
    id: "LW014",
    track: "lwc",
    level: "Hard",
    topic: "Template directives",
    title: "Client-side pagination",
    task: "Fenland Farms needs to page through 23 delivery records.\nBuild `deliveryPager` with field `records` (generate 23 rows in the constructor or field initialiser), `pageSize = 5`, `currentPage = 1`.\n- Getters: `totalPages` (Math.ceil), `pageRecords` (slice of the current page), `isFirstPage`, `isLastPage`, `pageLabel` (\"Page 2 of 5\")\n- Previous/Next `lightning-button`s disabled at the bounds\n- If `records` is empty, show \"No deliveries\" via `lwc:if`/`lwc:else` and treat totalPages as 1",
    starter: { "deliveryPager.js": "import { LightningElement } from 'lwc';\n\nexport default class DeliveryPager extends LightningElement {\n    // TODO\n}\n", "deliveryPager.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "deliveryPager.js": "import { LightningElement } from 'lwc';\n\nexport default class DeliveryPager extends LightningElement {\n    pageSize = 5;\n    currentPage = 1;\n    records = Array.from({ length: 23 }, (_, i) => ({ id: 'DEL-' + (i + 1), label: 'Delivery #' + (i + 1) }));\n\n    get totalPages() {\n        return Math.max(1, Math.ceil(this.records.length / this.pageSize));\n    }\n\n    get pageRecords() {\n        const start = (this.currentPage - 1) * this.pageSize;\n        return this.records.slice(start, start + this.pageSize);\n    }\n\n    get hasRecords() {\n        return this.records.length > 0;\n    }\n\n    get isFirstPage() {\n        return this.currentPage <= 1;\n    }\n\n    get isLastPage() {\n        return this.currentPage >= this.totalPages;\n    }\n\n    get pageLabel() {\n        return 'Page ' + this.currentPage + ' of ' + this.totalPages;\n    }\n\n    handlePrevious() {\n        if (!this.isFirstPage) this.currentPage -= 1;\n    }\n\n    handleNext() {\n        if (!this.isLastPage) this.currentPage += 1;\n    }\n}\n", "deliveryPager.html": "<template>\n    <template lwc:if={hasRecords}>\n        <ul>\n            <template for:each={pageRecords} for:item=\"rec\">\n                <li key={rec.id}>{rec.label}</li>\n            </template>\n        </ul>\n    </template>\n    <template lwc:else>\n        <p>No deliveries</p>\n    </template>\n    <div class=\"slds-m-top_small\">\n        <lightning-button label=\"Previous\" onclick={handlePrevious} disabled={isFirstPage}></lightning-button>\n        <span class=\"slds-m-horizontal_small\">{pageLabel}</span>\n        <lightning-button label=\"Next\" onclick={handleNext} disabled={isLastPage}></lightning-button>\n    </div>\n</template>\n" },
    checks: [
      { re: /Math\.ceil\s*\(/, msg: "Uses Math.ceil for totalPages", file: "deliveryPager.js" },
      { re: /\.slice\s*\(/, msg: "Slices the current page", file: "deliveryPager.js" },
      { re: /get\s+isLastPage\s*\(\s*\)/, msg: "Defines isLastPage getter", file: "deliveryPager.js" },
      { re: /disabled=\{\s*isFirstPage\s*\}/i, msg: "Previous disabled on first page", file: "deliveryPager.html" },
      { re: /disabled=\{\s*isLastPage\s*\}/i, msg: "Next disabled on last page", file: "deliveryPager.html" },
      { re: /lwc:else/i, msg: "Empty state with lwc:else", file: "deliveryPager.html" }
    ],
    forbid: [
      { re: /if:(true|false)\s*=/i, msg: "Use lwc:if / lwc:else, not the legacy if:true / if:false" }
    ],
    hints: ["Last page of 23 rows at 5 per page has 3 rows.", "Guard totalPages with Math.max(1, ...) for the empty case."],
    ai: "Verify 23 rows give 5 pages with 3 rows on the last, buttons disable correctly at both ends, handlers also guard bounds, and the empty list shows \"No deliveries\" with \"Page 1 of 1\"."
  },
  {
    id: "LW015",
    track: "lwc",
    level: "Easy",
    topic: "Events & forms",
    title: "Search box that fires a search event",
    task: "Wessex Hardware needs a reusable product search box.\nBuild `productSearchBox`:\n- A `lightning-input type=\"search\"`\n- When the user presses Enter, dispatch a `CustomEvent` named `search` with `detail: { term }` (trimmed)\n- Do not dispatch when the term is empty\n- Event name must be lowercase with no hyphens",
    starter: { "productSearchBox.js": "import { LightningElement } from 'lwc';\n\nexport default class ProductSearchBox extends LightningElement {\n    // TODO\n}\n", "productSearchBox.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "productSearchBox.js": "import { LightningElement } from 'lwc';\n\nexport default class ProductSearchBox extends LightningElement {\n    term = '';\n\n    handleChange(event) {\n        this.term = event.target.value || '';\n    }\n\n    handleKeyUp(event) {\n        if (event.key !== 'Enter') return;\n        const term = event.target.value ? event.target.value.trim() : '';\n        if (!term) return;\n        this.dispatchEvent(new CustomEvent('search', { detail: { term } }));\n    }\n}\n", "productSearchBox.html": "<template>\n    <div onkeyup={handleKeyUp}>\n        <lightning-input type=\"search\" label=\"Search products\" value={term} onchange={handleChange}></lightning-input>\n    </div>\n</template>\n" },
    checks: [
      { re: /new\s+CustomEvent\s*\(\s*['"]search['"]/, msg: "Creates CustomEvent('search')", file: "productSearchBox.js" },
      { re: /detail\s*:/, msg: "Passes the term in detail", file: "productSearchBox.js" },
      { re: /this\.dispatchEvent\s*\(/, msg: "Dispatches the event", file: "productSearchBox.js" },
      { re: /['"]Enter['"]|keyCode\s*===?\s*13|which\s*===?\s*13/, msg: "Detects the Enter key", file: "productSearchBox.js" },
      { re: /onkey(up|down|press)=\{/i, msg: "Listens for key events", file: "productSearchBox.html" }
    ],
    forbid: [
      { re: /innerHTML/i, msg: "Don't touch innerHTML" }
    ],
    hints: ["Wrap the input in a div with onkeyup, or put onkeyup on the lightning-input.", "this.dispatchEvent(new CustomEvent('search', { detail: { term } }))"],
    ai: "Verify the event only fires on Enter with a non-empty trimmed term, the event name is lowercase, and the term is sent as a primitive in detail."
  },
  {
    id: "LW016",
    track: "lwc",
    level: "Easy",
    topic: "Events & forms",
    title: "Validate a contact form before saving",
    task: "Ribble Physio's reception captures quick contact details.\nBuild `quickContactForm` with `lightning-input`s: Full name (required), Email (type email, required), Phone (type tel, optional).\n- A Save button validates ALL inputs and shows their error messages (`reportValidity`)\n- If every input is valid, set a field `saved = true` and show \"Details saved\" using `lwc:if`\n- Use `this.template.querySelectorAll`",
    starter: { "quickContactForm.js": "import { LightningElement } from 'lwc';\n\nexport default class QuickContactForm extends LightningElement {\n    // TODO\n}\n", "quickContactForm.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "quickContactForm.js": "import { LightningElement } from 'lwc';\n\nexport default class QuickContactForm extends LightningElement {\n    saved = false;\n\n    handleSave() {\n        const inputs = [...this.template.querySelectorAll('lightning-input')];\n        const allValid = inputs.reduce((valid, input) => {\n            input.reportValidity();\n            return valid && input.checkValidity();\n        }, true);\n        this.saved = allValid;\n    }\n}\n", "quickContactForm.html": "<template>\n    <lightning-input label=\"Full name\" name=\"fullName\" required></lightning-input>\n    <lightning-input label=\"Email\" name=\"email\" type=\"email\" required></lightning-input>\n    <lightning-input label=\"Phone\" name=\"phone\" type=\"tel\"></lightning-input>\n    <lightning-button variant=\"brand\" label=\"Save\" onclick={handleSave}></lightning-button>\n    <template lwc:if={saved}>\n        <p class=\"slds-text-color_success\">Details saved</p>\n    </template>\n</template>\n" },
    checks: [
      { re: /this\.template\.querySelectorAll\s*\(\s*['"]lightning-input['"]\s*\)/, msg: "Queries all lightning-input elements", file: "quickContactForm.js" },
      { re: /reportValidity\s*\(\s*\)/, msg: "Calls reportValidity", file: "quickContactForm.js" },
      { re: /<lightning-input[^>]*required/i, msg: "Marks required inputs", file: "quickContactForm.html" },
      { re: /type=["']email["']/i, msg: "Email input uses type=\"email\"", file: "quickContactForm.html" },
      { re: /lwc:if=\{\s*saved\s*\}/i, msg: "Shows the confirmation with lwc:if", file: "quickContactForm.html" }
    ],
    forbid: [
      { re: /if:(true|false)\s*=/i, msg: "Use lwc:if / lwc:else, not the legacy if:true / if:false" }
    ],
    hints: ["Spread the NodeList into an array to use reduce.", "Call reportValidity on every input — do not stop at the first invalid one."],
    ai: "Verify every input reports its error (no short-circuit that skips later inputs) and saved is only true when all inputs are valid."
  },
  {
    id: "LW017",
    track: "lwc",
    level: "Medium",
    topic: "Events & forms",
    title: "UK postcode custom validity",
    task: "Thames Valley Plumbing books visits by postcode.\nBuild `postcodeInput`:\n- A `lightning-input` labelled Postcode\n- On change, test the value against a UK postcode regex (e.g. `^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$`, case-insensitive)\n- Invalid → `setCustomValidity(\"Enter a valid UK postcode\")`; valid or empty → `setCustomValidity(\"\")`\n- Then call `reportValidity()`\n- Expose the normalised (upper-case, trimmed) value in a field `postcode`",
    starter: { "postcodeInput.js": "import { LightningElement } from 'lwc';\n\nexport default class PostcodeInput extends LightningElement {\n    // TODO\n}\n", "postcodeInput.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "postcodeInput.js": "import { LightningElement } from 'lwc';\n\nconst UK_POSTCODE = /^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$/i;\n\nexport default class PostcodeInput extends LightningElement {\n    postcode = '';\n\n    handleChange(event) {\n        const input = event.target;\n        const value = (input.value || '').trim().toUpperCase();\n        this.postcode = value;\n        if (value && !UK_POSTCODE.test(value)) {\n            input.setCustomValidity('Enter a valid UK postcode');\n        } else {\n            input.setCustomValidity('');\n        }\n        input.reportValidity();\n    }\n}\n", "postcodeInput.html": "<template>\n    <lightning-input label=\"Postcode\" value={postcode} onchange={handleChange}></lightning-input>\n</template>\n" },
    checks: [
      { re: /setCustomValidity\s*\(\s*['"][^'"]+['"]\s*\)/, msg: "Sets a custom error message", file: "postcodeInput.js" },
      { re: /setCustomValidity\s*\(\s*['"]{2}\s*\)/, msg: "Clears the custom error when valid", file: "postcodeInput.js" },
      { re: /reportValidity\s*\(\s*\)/, msg: "Calls reportValidity", file: "postcodeInput.js" },
      { re: /\.test\s*\(|\.match\s*\(/, msg: "Tests the value against a regex", file: "postcodeInput.js" },
      { re: /toUpperCase\s*\(/, msg: "Normalises to upper case", file: "postcodeInput.js" }
    ],
    forbid: [
      { re: /innerHTML/i, msg: "Don't touch innerHTML" }
    ],
    hints: ["setCustomValidity(\"\") clears the error — otherwise the input stays invalid forever.", "Define the regex once as a module constant."],
    ai: "Verify the error is cleared for valid or empty values, reportValidity is called after setting validity, and values like \"sw1a 1aa\" and \"M1 1AE\" are accepted."
  },
  {
    id: "LW018",
    track: "lwc",
    level: "Medium",
    topic: "Events & forms",
    title: "Star rating that notifies its parent",
    task: "Cotswold Holiday Lets collects guest ratings.\nBuild `starRating`:\n- `@api value` (0–5, default 0)\n- Render 5 `lightning-button-icon`s (icon \"utility:favorite\") via `for:each`, each with `data-value` 1–5; filled stars use variant \"brand\", others \"border\"\n- Clicking a star dispatches `CustomEvent(\"ratingchange\", { detail: { value } })` with a NUMBER\n- The component must not mutate its own `@api value` — the parent owns it",
    starter: { "starRating.js": "import { LightningElement, api } from 'lwc';\n\nexport default class StarRating extends LightningElement {\n    // TODO\n}\n", "starRating.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "starRating.js": "import { LightningElement, api } from 'lwc';\n\nexport default class StarRating extends LightningElement {\n    @api value = 0;\n\n    get stars() {\n        return [1, 2, 3, 4, 5].map(n => ({\n            n,\n            variant: n <= this.value ? 'brand' : 'border',\n            title: n + ' star' + (n > 1 ? 's' : '')\n        }));\n    }\n\n    handleClick(event) {\n        const value = Number(event.currentTarget.dataset.value);\n        this.dispatchEvent(new CustomEvent('ratingchange', { detail: { value } }));\n    }\n}\n", "starRating.html": "<template>\n    <template for:each={stars} for:item=\"star\">\n        <lightning-button-icon key={star.n} icon-name=\"utility:favorite\" variant={star.variant}\n            alternative-text={star.title} data-value={star.n} onclick={handleClick}></lightning-button-icon>\n    </template>\n</template>\n" },
    checks: [
      { re: /@api\s+value/, msg: "Exposes @api value", file: "starRating.js" },
      { re: /new\s+CustomEvent\s*\(\s*['"]ratingchange['"]/, msg: "Dispatches CustomEvent('ratingchange')", file: "starRating.js" },
      { re: /Number\s*\(|parseInt\s*\(|\+\s*event\.\w+\.dataset/, msg: "Converts data-value to a number", file: "starRating.js" },
      { re: /data-value=\{/i, msg: "Buttons carry data-value", file: "starRating.html" },
      { re: /for:each=\{/i, msg: "Renders the stars with for:each", file: "starRating.html" }
    ],
    forbid: [
      { re: /this\.value\s*=(?!=)/, msg: "Do not reassign the @api value inside the child" }
    ],
    hints: ["dataset values are strings — convert with Number().", "Build a stars getter returning objects with a variant per star."],
    ai: "Verify the event detail carries a numeric value, the child never writes to its @api property, and filled/unfilled variants reflect value."
  },
  {
    id: "LW019",
    track: "lwc",
    level: "Medium",
    topic: "Events & forms",
    title: "Debounced account lookup input",
    task: "Humber Logistics' account lookup calls the server on every keystroke — too many calls.\nBuild `debouncedLookup`:\n- A `lightning-input type=\"search\"`\n- Debounce changes by 300 ms: each keystroke cancels the pending timer (`clearTimeout`) and starts a new one\n- When the timer fires, dispatch `CustomEvent(\"searchchange\", { detail: { term } })`\n- Only dispatch when the term has at least 2 characters or is empty (to reset)\n- Clear any pending timer in `disconnectedCallback`",
    starter: { "debouncedLookup.js": "import { LightningElement } from 'lwc';\n\nexport default class DebouncedLookup extends LightningElement {\n    // TODO\n}\n", "debouncedLookup.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "debouncedLookup.js": "import { LightningElement } from 'lwc';\n\nconst DELAY = 300;\n\nexport default class DebouncedLookup extends LightningElement {\n    timer;\n\n    handleInput(event) {\n        const term = (event.target.value || '').trim();\n        clearTimeout(this.timer);\n        // eslint-disable-next-line @lwc/lwc/no-async-operation\n        this.timer = setTimeout(() => {\n            if (term.length === 0 || term.length >= 2) {\n                this.dispatchEvent(new CustomEvent('searchchange', { detail: { term } }));\n            }\n        }, DELAY);\n    }\n\n    disconnectedCallback() {\n        clearTimeout(this.timer);\n    }\n}\n", "debouncedLookup.html": "<template>\n    <lightning-input type=\"search\" label=\"Find account\" onchange={handleInput}></lightning-input>\n</template>\n" },
    checks: [
      { re: /clearTimeout\s*\(/, msg: "Cancels the pending timer", file: "debouncedLookup.js" },
      { re: /setTimeout\s*\(/, msg: "Uses setTimeout to debounce", file: "debouncedLookup.js" },
      { re: /300/, msg: "Uses a 300 ms delay", file: "debouncedLookup.js" },
      { re: /new\s+CustomEvent\s*\(\s*['"]searchchange['"]/, msg: "Dispatches CustomEvent('searchchange')", file: "debouncedLookup.js" },
      { re: /disconnectedCallback\s*\(\s*\)\s*\{[^}]*clearTimeout/, msg: "Clears the timer in disconnectedCallback", file: "debouncedLookup.js" }
    ],
    forbid: [
      { re: /innerHTML/i, msg: "Don't touch innerHTML" }
    ],
    hints: ["Store the timer id in a field so the next keystroke can cancel it.", "Capture the term before setTimeout — event objects should not be read later."],
    ai: "Verify only one event fires after typing stops, the 2-character rule is applied, the term is captured synchronously, and the timer is cleared on disconnect."
  },
  {
    id: "LW020",
    track: "lwc",
    level: "Hard",
    topic: "Events & forms",
    title: "Three-step onboarding wizard",
    task: "Kennet Payroll onboards new employers in three steps.\nBuild `employerWizard` with `currentStep` (1–3):\n- Step 1: Company name, Companies House number (8 chars, `pattern` attribute)\n- Step 2: Contact email (type email), phone\n- Step 3: Summary of entered values and a Finish button\n- Show one step at a time with `lwc:if` / `lwc:elseif` / `lwc:else`\n- Next validates only the CURRENT step's inputs (mark them with `data-step`) and blocks if invalid; Back never validates\n- Keep entered values in a single `formData` object updated immutably\n- Finish dispatches `CustomEvent(\"complete\", { detail: { ...formData } })`",
    starter: { "employerWizard.js": "import { LightningElement } from 'lwc';\n\nexport default class EmployerWizard extends LightningElement {\n    // TODO\n}\n", "employerWizard.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "employerWizard.js": "import { LightningElement } from 'lwc';\n\nexport default class EmployerWizard extends LightningElement {\n    currentStep = 1;\n    formData = { companyName: '', companyNumber: '', email: '', phone: '' };\n\n    get isStepOne() {\n        return this.currentStep === 1;\n    }\n\n    get isStepTwo() {\n        return this.currentStep === 2;\n    }\n\n    get isFirstStep() {\n        return this.currentStep === 1;\n    }\n\n    handleChange(event) {\n        const { name, value } = event.target;\n        this.formData = { ...this.formData, [name]: value };\n    }\n\n    validateCurrentStep() {\n        const selector = 'lightning-input[data-step=\"' + this.currentStep + '\"]';\n        return [...this.template.querySelectorAll(selector)].reduce((ok, input) => {\n            input.reportValidity();\n            return ok && input.checkValidity();\n        }, true);\n    }\n\n    handleNext() {\n        if (!this.validateCurrentStep()) return;\n        this.currentStep = Math.min(3, this.currentStep + 1);\n    }\n\n    handleBack() {\n        this.currentStep = Math.max(1, this.currentStep - 1);\n    }\n\n    handleFinish() {\n        this.dispatchEvent(new CustomEvent('complete', { detail: { ...this.formData } }));\n    }\n}\n", "employerWizard.html": "<template>\n    <lightning-progress-indicator current-step={currentStep} type=\"path\">\n        <lightning-progress-step label=\"Company\" value=\"1\"></lightning-progress-step>\n        <lightning-progress-step label=\"Contact\" value=\"2\"></lightning-progress-step>\n        <lightning-progress-step label=\"Review\" value=\"3\"></lightning-progress-step>\n    </lightning-progress-indicator>\n    <template lwc:if={isStepOne}>\n        <lightning-input data-step=\"1\" name=\"companyName\" label=\"Company name\" value={formData.companyName} required onchange={handleChange}></lightning-input>\n        <lightning-input data-step=\"1\" name=\"companyNumber\" label=\"Companies House number\" value={formData.companyNumber} required pattern=\"[A-Za-z0-9]{8}\" message-when-pattern-mismatch=\"Must be 8 characters\" onchange={handleChange}></lightning-input>\n        <lightning-button label=\"Next\" onclick={handleNext}></lightning-button>\n    </template>\n    <template lwc:elseif={isStepTwo}>\n        <lightning-input data-step=\"2\" name=\"email\" type=\"email\" label=\"Contact email\" value={formData.email} required onchange={handleChange}></lightning-input>\n        <lightning-input data-step=\"2\" name=\"phone\" type=\"tel\" label=\"Phone\" value={formData.phone} onchange={handleChange}></lightning-input>\n        <lightning-button label=\"Back\" onclick={handleBack}></lightning-button>\n        <lightning-button label=\"Next\" onclick={handleNext}></lightning-button>\n    </template>\n    <template lwc:else>\n        <p>{formData.companyName} ({formData.companyNumber})</p>\n        <p>{formData.email} {formData.phone}</p>\n        <lightning-button label=\"Back\" onclick={handleBack}></lightning-button>\n        <lightning-button variant=\"brand\" label=\"Finish\" onclick={handleFinish}></lightning-button>\n    </template>\n</template>\n" },
    checks: [
      { re: /reportValidity\s*\(/, msg: "Reports validity on the current step", file: "employerWizard.js" },
      { re: /data-step/, msg: "Selects inputs of the current step via data-step", file: "employerWizard.js" },
      { re: /\.\.\.\s*this\.formData/, msg: "Updates formData immutably", file: "employerWizard.js" },
      { re: /new\s+CustomEvent\s*\(\s*['"]complete['"]/, msg: "Dispatches CustomEvent('complete')", file: "employerWizard.js" },
      { re: /lwc:if=[\s\S]*lwc:elseif=[\s\S]*lwc:else/i, msg: "Uses lwc:if / lwc:elseif / lwc:else for steps", file: "employerWizard.html" },
      { re: /pattern=/i, msg: "Companies House number uses a pattern", file: "employerWizard.html" }
    ],
    forbid: [
      { re: /if:(true|false)\s*=/i, msg: "Use lwc:if / lwc:else, not the legacy if:true / if:false" },
      { re: /this\.formData\.\w+\s*=(?!=)/, msg: "Do not mutate formData properties directly" }
    ],
    hints: ["Query lightning-input[data-step=\"N\"] to validate only the visible step.", "Inputs in hidden lwc:if branches are not in the DOM — values must live in formData.", "Spread formData into the event detail so the parent gets a copy."],
    ai: "Verify Next blocks on invalid current-step inputs only, Back skips validation, values survive navigating back and forth, and the complete event carries a copy of the data."
  },
  {
    id: "LW021",
    track: "lwc",
    level: "Hard",
    topic: "Events & forms",
    title: "Booking form with cross-field validation",
    task: "Lakeland Kayak Hire takes bookings online.\nBuild `bookingForm` using a native `<form onsubmit={handleSubmit}>`:\n- Inputs: Start date, End date (type date, required), Kayaks (number, min 1, max 6, required)\n- On submit: `preventDefault()`; end date must be AFTER start date, otherwise set a custom validity message on the End date input; clear it when fixed\n- Report validity on all inputs; if all valid dispatch `CustomEvent(\"bookingsubmit\", { detail: { startDate, endDate, kayaks, nights } })` where nights is the whole-day difference\n- Use a `lightning-button type=\"submit\"`",
    starter: { "bookingForm.js": "import { LightningElement } from 'lwc';\n\nexport default class BookingForm extends LightningElement {\n    // TODO\n}\n", "bookingForm.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "bookingForm.js": "import { LightningElement } from 'lwc';\n\nconst DAY_MS = 24 * 60 * 60 * 1000;\n\nexport default class BookingForm extends LightningElement {\n    startDate;\n    endDate;\n    kayaks = 1;\n\n    handleChange(event) {\n        const { name, value } = event.target;\n        this[name] = value;\n    }\n\n    handleSubmit(event) {\n        event.preventDefault();\n        const endInput = this.template.querySelector('lightning-input[data-id=\"endDate\"]');\n        if (this.startDate && this.endDate && this.endDate <= this.startDate) {\n            endInput.setCustomValidity('End date must be after the start date');\n        } else {\n            endInput.setCustomValidity('');\n        }\n        const allValid = [...this.template.querySelectorAll('lightning-input')].reduce((ok, input) => {\n            input.reportValidity();\n            return ok && input.checkValidity();\n        }, true);\n        if (!allValid) return;\n        const nights = Math.round((new Date(this.endDate) - new Date(this.startDate)) / DAY_MS);\n        this.dispatchEvent(new CustomEvent('bookingsubmit', {\n            detail: { startDate: this.startDate, endDate: this.endDate, kayaks: Number(this.kayaks), nights }\n        }));\n    }\n}\n", "bookingForm.html": "<template>\n    <form onsubmit={handleSubmit}>\n        <lightning-input type=\"date\" name=\"startDate\" label=\"Start date\" value={startDate} required onchange={handleChange}></lightning-input>\n        <lightning-input type=\"date\" name=\"endDate\" data-id=\"endDate\" label=\"End date\" value={endDate} required onchange={handleChange}></lightning-input>\n        <lightning-input type=\"number\" name=\"kayaks\" label=\"Kayaks\" value={kayaks} min=\"1\" max=\"6\" required onchange={handleChange}></lightning-input>\n        <lightning-button type=\"submit\" variant=\"brand\" label=\"Book\"></lightning-button>\n    </form>\n</template>\n" },
    checks: [
      { re: /preventDefault\s*\(\s*\)/, msg: "Prevents the native form submit", file: "bookingForm.js" },
      { re: /setCustomValidity\s*\(/, msg: "Uses setCustomValidity for the date rule", file: "bookingForm.js" },
      { re: /reportValidity\s*\(/, msg: "Reports validity", file: "bookingForm.js" },
      { re: /new\s+CustomEvent\s*\(\s*['"]bookingsubmit['"]/, msg: "Dispatches CustomEvent('bookingsubmit')", file: "bookingForm.js" },
      { re: /<form[^>]*onsubmit=\{/i, msg: "Uses <form onsubmit>", file: "bookingForm.html" },
      { re: /type=["']submit["']/i, msg: "Has a submit button", file: "bookingForm.html" }
    ],
    forbid: [
      { re: /innerHTML/i, msg: "Don't touch innerHTML" }
    ],
    hints: ["Always reset setCustomValidity(\"\") when the rule passes.", "ISO date strings compare correctly; for nights subtract Date objects and divide by 86,400,000."],
    ai: "Verify the custom error is cleared once dates are fixed, equal dates are rejected, kayaks min/max is enforced, nights is computed correctly and the event fires only when everything is valid."
  },
  {
    id: "LW022",
    track: "lwc",
    level: "Easy",
    topic: "Public API",
    title: "Reusable KPI tile",
    task: "Solway Telecom builds dashboards from a reusable tile.\nBuild `kpiTile` with public properties `label`, `value` and `trend` (\"up\" | \"down\" | \"flat\", default \"flat\").\n- Getter `iconName`: \"utility:arrowup\", \"utility:arrowdown\" or \"utility:dash\"\n- Getter `trendClass`: \"slds-text-color_success\" for up, \"slds-text-color_error\" for down, \"\" otherwise\n- Render label, value and a `lightning-icon`",
    starter: { "kpiTile.js": "import { LightningElement } from 'lwc';\n\nexport default class KpiTile extends LightningElement {\n    // TODO\n}\n", "kpiTile.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "kpiTile.js": "import { LightningElement, api } from 'lwc';\n\nconst ICONS = { up: 'utility:arrowup', down: 'utility:arrowdown', flat: 'utility:dash' };\n\nexport default class KpiTile extends LightningElement {\n    @api label;\n    @api value;\n    @api trend = 'flat';\n\n    get iconName() {\n        return ICONS[this.trend] || ICONS.flat;\n    }\n\n    get trendClass() {\n        if (this.trend === 'up') return 'slds-text-color_success';\n        if (this.trend === 'down') return 'slds-text-color_error';\n        return '';\n    }\n}\n", "kpiTile.html": "<template>\n    <div class=\"slds-box\">\n        <p class=\"slds-text-title\">{label}</p>\n        <p class={trendClass}>\n            <span class=\"slds-text-heading_large\">{value}</span>\n            <lightning-icon icon-name={iconName} size=\"x-small\" alternative-text={trend}></lightning-icon>\n        </p>\n    </div>\n</template>\n" },
    checks: [
      { re: /@api\s+label/, msg: "Exposes @api label", file: "kpiTile.js" },
      { re: /@api\s+value/, msg: "Exposes @api value", file: "kpiTile.js" },
      { re: /@api\s+trend/, msg: "Exposes @api trend", file: "kpiTile.js" },
      { re: /get\s+iconName\s*\(\s*\)/, msg: "Defines iconName getter", file: "kpiTile.js" },
      { re: /icon-name=\{\s*iconName\s*\}/i, msg: "Binds lightning-icon to iconName", file: "kpiTile.html" }
    ],
    forbid: [
      { re: /import\s*\{[^}]*\btrack\b/, msg: "@track is not needed for primitives" }
    ],
    hints: ["Import api: import { LightningElement, api } from 'lwc';", "A lookup object keeps the icon mapping tidy."],
    ai: "Verify unknown trend values fall back to the flat icon and the component never writes to its own @api properties."
  },
  {
    id: "LW023",
    track: "lwc",
    level: "Easy",
    topic: "Public API",
    title: "Record context on a record page",
    task: "Avon Estates wants a small banner on every record page.\nBuild `recordContextBanner`:\n- Receive the record context from the Lightning record page with `@api recordId` and `@api objectApiName`\n- Show \"You are viewing a {objectApiName} record ({recordId})\"\n- When there is no recordId (e.g. placed on a Home page), show \"No record in context\" using `lwc:if` / `lwc:else`",
    starter: { "recordContextBanner.js": "import { LightningElement } from 'lwc';\n\nexport default class RecordContextBanner extends LightningElement {\n    // TODO\n}\n", "recordContextBanner.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "recordContextBanner.js": "import { LightningElement, api } from 'lwc';\n\nexport default class RecordContextBanner extends LightningElement {\n    @api recordId;\n    @api objectApiName;\n\n    get hasRecord() {\n        return !!this.recordId;\n    }\n}\n", "recordContextBanner.html": "<template>\n    <div class=\"slds-box slds-theme_shade\">\n        <template lwc:if={hasRecord}>\n            <p>You are viewing a {objectApiName} record ({recordId})</p>\n        </template>\n        <template lwc:else>\n            <p>No record in context</p>\n        </template>\n    </div>\n</template>\n" },
    checks: [
      { re: /@api\s+recordId/, msg: "Declares @api recordId", file: "recordContextBanner.js" },
      { re: /@api\s+objectApiName/, msg: "Declares @api objectApiName", file: "recordContextBanner.js" },
      { re: /lwc:if=\{/i, msg: "Uses lwc:if", file: "recordContextBanner.html" },
      { re: /lwc:else/i, msg: "Uses lwc:else", file: "recordContextBanner.html" }
    ],
    forbid: [
      { re: /if:(true|false)\s*=/i, msg: "Use lwc:if / lwc:else, not the legacy if:true / if:false" },
      { re: /'(001|003|006|500|a0[0-9A-Za-z])[A-Za-z0-9]{12,15}'/, msg: "No hard-coded record Ids" }
    ],
    hints: ["The property names must be exactly recordId and objectApiName for the page to populate them."],
    ai: "Verify the exact property names recordId/objectApiName are public, the empty state works, and nothing is hard-coded."
  },
  {
    id: "LW024",
    track: "lwc",
    level: "Medium",
    topic: "Public API",
    title: "Tag list with a normalising @api setter",
    task: "Dorset Antiques tags items with keywords from several sources.\nBuild `tagPills` with a public `tags` property using a getter/setter pair:\n- The setter accepts either an array of strings or a comma-separated string\n- Normalise: trim, drop empties, lower-case, remove duplicates; store in a private field\n- The getter returns the normalised array\n- Render each tag as a `lightning-pill`; clicking the remove icon dispatches `CustomEvent(\"tagremove\", { detail: { tag } })`",
    starter: { "tagPills.js": "import { LightningElement, api } from 'lwc';\n\nexport default class TagPills extends LightningElement {\n    // TODO\n}\n", "tagPills.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "tagPills.js": "import { LightningElement, api } from 'lwc';\n\nexport default class TagPills extends LightningElement {\n    _tags = [];\n\n    @api\n    get tags() {\n        return this._tags;\n    }\n    set tags(value) {\n        const list = Array.isArray(value) ? value : String(value || '').split(',');\n        const cleaned = list.map(t => String(t).trim().toLowerCase()).filter(t => t.length > 0);\n        this._tags = [...new Set(cleaned)];\n    }\n\n    handleRemove(event) {\n        const tag = event.target.name;\n        this.dispatchEvent(new CustomEvent('tagremove', { detail: { tag } }));\n    }\n}\n", "tagPills.html": "<template>\n    <template for:each={tags} for:item=\"tag\">\n        <lightning-pill key={tag} name={tag} label={tag} onremove={handleRemove}></lightning-pill>\n    </template>\n</template>\n" },
    checks: [
      { re: /@api\s+(get|set)\s+tags\s*\(/, msg: "Decorates the tags accessor with @api", file: "tagPills.js" },
      { re: /set\s+tags\s*\(\s*\w+\s*\)/, msg: "Defines a tags setter", file: "tagPills.js" },
      { re: /get\s+tags\s*\(\s*\)/, msg: "Defines a tags getter", file: "tagPills.js" },
      { re: /new\s+Set\s*\(|indexOf|includes\s*\(/, msg: "Removes duplicates", file: "tagPills.js" },
      { re: /new\s+CustomEvent\s*\(\s*['"]tagremove['"]/, msg: "Dispatches CustomEvent('tagremove')", file: "tagPills.js" }
    ],
    forbid: [
      { re: /innerHTML/i, msg: "Don't touch innerHTML" }
    ],
    hints: ["Put @api on the getter (or setter) only — not both.", "A Set removes duplicates; spread it back into an array."],
    ai: "Verify both input shapes work, empty strings and duplicates are removed, the private field holds normalised data, and the child does not remove the tag itself."
  },
  {
    id: "LW025",
    track: "lwc",
    level: "Medium",
    topic: "Public API",
    title: "Countdown timer with public methods",
    task: "Brecon Escape Rooms needs a game timer the parent page can control.\nBuild `gameTimer`:\n- `@api minutes` (default 60)\n- Public methods `start()`, `pause()` and `reset()`\n- Use `setInterval` (1 s) to count down `remainingSeconds`; at 0 stop and dispatch `CustomEvent(\"timeup\")`\n- Getter `display` returns \"MM:SS\"\n- Clear the interval in `disconnectedCallback`; calling start() twice must not create two intervals",
    starter: { "gameTimer.js": "import { LightningElement, api } from 'lwc';\n\nexport default class GameTimer extends LightningElement {\n    // TODO\n}\n", "gameTimer.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "gameTimer.js": "import { LightningElement, api } from 'lwc';\n\nexport default class GameTimer extends LightningElement {\n    @api minutes = 60;\n    remainingSeconds;\n    intervalId;\n\n    connectedCallback() {\n        this.remainingSeconds = this.minutes * 60;\n    }\n\n    @api\n    start() {\n        if (this.intervalId || this.remainingSeconds <= 0) return;\n        // eslint-disable-next-line @lwc/lwc/no-async-operation\n        this.intervalId = setInterval(() => {\n            this.remainingSeconds -= 1;\n            if (this.remainingSeconds <= 0) {\n                this.pause();\n                this.dispatchEvent(new CustomEvent('timeup'));\n            }\n        }, 1000);\n    }\n\n    @api\n    pause() {\n        clearInterval(this.intervalId);\n        this.intervalId = null;\n    }\n\n    @api\n    reset() {\n        this.pause();\n        this.remainingSeconds = this.minutes * 60;\n    }\n\n    get display() {\n        const secs = Math.max(0, this.remainingSeconds || 0);\n        const mm = String(Math.floor(secs / 60)).padStart(2, '0');\n        const ss = String(secs % 60).padStart(2, '0');\n        return mm + ':' + ss;\n    }\n\n    disconnectedCallback() {\n        this.pause();\n    }\n}\n", "gameTimer.html": "<template>\n    <p class=\"slds-text-heading_large\">{display}</p>\n</template>\n" },
    checks: [
      { re: /@api\s+start\s*\(\s*\)/, msg: "Public start() method", file: "gameTimer.js" },
      { re: /@api\s+pause\s*\(\s*\)/, msg: "Public pause() method", file: "gameTimer.js" },
      { re: /@api\s+reset\s*\(\s*\)/, msg: "Public reset() method", file: "gameTimer.js" },
      { re: /setInterval\s*\(/, msg: "Uses setInterval", file: "gameTimer.js" },
      { re: /disconnectedCallback\s*\(\s*\)/, msg: "Cleans up in disconnectedCallback", file: "gameTimer.js" },
      { re: /new\s+CustomEvent\s*\(\s*['"]timeup['"]/, msg: "Dispatches CustomEvent('timeup')", file: "gameTimer.js" }
    ],
    forbid: [
      { re: /innerHTML/i, msg: "Don't touch innerHTML" }
    ],
    hints: ["Store the interval id; return early from start() when it is already set.", "padStart(2, '0') gives the MM:SS format."],
    ai: "Verify double start() is guarded, the interval is always cleared (pause, reset, time up, disconnect), timeup fires once, and display formats correctly."
  },
  {
    id: "LW026",
    track: "lwc",
    level: "Medium",
    topic: "Public API",
    title: "Parent calls a child validate() method",
    task: "Mendip Building Supplies has an invoice editor with a child `c-line-items` component that exposes `@api validate()` returning a boolean.\nBuild the PARENT `invoiceEditor`:\n- Render `<c-line-items>` and give it `lwc:ref=\"lines\"`\n- A Submit button calls the child's `validate()`; if false show an error \"Fix the highlighted lines\" via `lwc:if`; if true dispatch `CustomEvent(\"submitinvoice\")`\n- Use `this.refs` (or `this.template.querySelector`) — do not reach into the child's DOM",
    starter: { "invoiceEditor.js": "import { LightningElement } from 'lwc';\n\nexport default class InvoiceEditor extends LightningElement {\n    // TODO\n}\n", "invoiceEditor.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "invoiceEditor.js": "import { LightningElement } from 'lwc';\n\nexport default class InvoiceEditor extends LightningElement {\n    showError = false;\n\n    handleSubmit() {\n        const isValid = this.refs.lines.validate();\n        this.showError = !isValid;\n        if (isValid) {\n            this.dispatchEvent(new CustomEvent('submitinvoice'));\n        }\n    }\n}\n", "invoiceEditor.html": "<template>\n    <c-line-items lwc:ref=\"lines\"></c-line-items>\n    <template lwc:if={showError}>\n        <p class=\"slds-text-color_error\">Fix the highlighted lines</p>\n    </template>\n    <lightning-button variant=\"brand\" label=\"Submit\" onclick={handleSubmit}></lightning-button>\n</template>\n" },
    checks: [
      { re: /<c-line-items[^>]*>/i, msg: "Renders c-line-items", file: "invoiceEditor.html" },
      { re: /this\.refs\.\w+\.validate\s*\(|querySelector\s*\(\s*['"]c-line-items['"]\s*\)\s*\.validate\s*\(/, msg: "Calls the child's validate()", file: "invoiceEditor.js" },
      { re: /new\s+CustomEvent\s*\(\s*['"]submitinvoice['"]/, msg: "Dispatches CustomEvent('submitinvoice')", file: "invoiceEditor.js" },
      { re: /lwc:if=\{/i, msg: "Shows the error with lwc:if", file: "invoiceEditor.html" }
    ],
    forbid: [
      { re: /shadowRoot|querySelector\s*\(\s*['"]c-line-items\s+\w/i, msg: "Don't reach into the child's internal DOM" },
      { re: /if:(true|false)\s*=/i, msg: "Use lwc:if / lwc:else, not the legacy if:true / if:false" }
    ],
    hints: ["Add lwc:ref=\"lines\" in the template, then use this.refs.lines in JS.", "Public methods on a child are called like normal methods on the element."],
    ai: "Verify the parent only uses the child public API, the error state resets after a successful submit, and the event is dispatched only when valid."
  },
  {
    id: "LW027",
    track: "lwc",
    level: "Hard",
    topic: "Public API",
    title: "Risk gauge with clamping setter",
    task: "Cairngorm Insurance shows an underwriting risk gauge.\nBuild `riskGauge` with a public `score` property implemented as getter/setter:\n- The setter accepts numbers or numeric strings; non-numeric → 0; clamp to 0–100; round to an integer\n- Getter `band`: \"Low\" (<40), \"Medium\" (40–69), \"High\" (70+)\n- Getter `barStyle` returns `width: N%` for the bar and getter `barClass` returns an SLDS class per band\n- When the band changes as a result of a new score, dispatch `CustomEvent(\"bandchange\", { detail: { band } })` — but not on the very first value set",
    starter: { "riskGauge.js": "import { LightningElement, api } from 'lwc';\n\nexport default class RiskGauge extends LightningElement {\n    // TODO\n}\n", "riskGauge.html": "<template>\n    <!-- TODO -->\n</template>\n", "riskGauge.css": ".gauge-track {\n    /* TODO */\n}\n" },
    solution: { "riskGauge.js": "import { LightningElement, api } from 'lwc';\n\nexport default class RiskGauge extends LightningElement {\n    _score = 0;\n    _initialised = false;\n\n    @api\n    get score() {\n        return this._score;\n    }\n    set score(value) {\n        const previousBand = this.band;\n        const parsed = Number(value);\n        const safe = Number.isFinite(parsed) ? parsed : 0;\n        this._score = Math.round(Math.min(100, Math.max(0, safe)));\n        const newBand = this.band;\n        if (this._initialised && newBand !== previousBand) {\n            this.dispatchEvent(new CustomEvent('bandchange', { detail: { band: newBand } }));\n        }\n        this._initialised = true;\n    }\n\n    get band() {\n        if (this._score >= 70) return 'High';\n        if (this._score >= 40) return 'Medium';\n        return 'Low';\n    }\n\n    get barStyle() {\n        return 'width: ' + this._score + '%';\n    }\n\n    get barClass() {\n        const map = { Low: 'slds-theme_success', Medium: 'slds-theme_warning', High: 'slds-theme_error' };\n        return 'gauge-bar ' + map[this.band];\n    }\n}\n", "riskGauge.html": "<template>\n    <div class=\"gauge-track\">\n        <div class={barClass} style={barStyle}></div>\n    </div>\n    <p>{score} — {band} risk</p>\n</template>\n", "riskGauge.css": ".gauge-track {\n    height: 0.75rem;\n    background: #e5e5e5;\n    border-radius: 0.375rem;\n    overflow: hidden;\n}\n.gauge-bar {\n    height: 100%;\n}\n" },
    checks: [
      { re: /@api\s+(get|set)\s+score\s*\(/, msg: "Decorates the score accessor with @api", file: "riskGauge.js" },
      { re: /set\s+score\s*\(\s*\w+\s*\)/, msg: "Defines a score setter", file: "riskGauge.js" },
      { re: /Math\.min\s*\(|Math\.max\s*\(/, msg: "Clamps the score to 0–100", file: "riskGauge.js" },
      { re: /get\s+barStyle\s*\(\s*\)/, msg: "Defines barStyle getter", file: "riskGauge.js" },
      { re: /new\s+CustomEvent\s*\(\s*['"]bandchange['"]/, msg: "Dispatches CustomEvent('bandchange')", file: "riskGauge.js" },
      { re: /style=\{\s*barStyle\s*\}/i, msg: "Binds the bar style", file: "riskGauge.html" }
    ],
    forbid: [
      { re: /innerHTML/i, msg: "Don't touch innerHTML" }
    ],
    hints: ["Compute the old band before updating the private field.", "Number(\"abc\") is NaN — Number.isFinite catches that.", "Use a flag to skip the event on the first set."],
    ai: "Verify clamping (-5→0, 150→100), string input (\"55\"→55), NaN→0, the event fires only when the band actually changes and never on the first assignment."
  },
  {
    id: "LW028",
    track: "lwc",
    level: "Hard",
    topic: "Public API",
    title: "Address input with value API and validate()",
    task: "Pembroke Couriers reuses an address input in many forms.\nBuild `addressInput`:\n- Public `value` getter/setter holding `{ line1, town, postcode }`; the setter copies the object (never keeps the parent's reference) and fills missing keys with \"\"\n- On any field change, update the internal copy immutably and dispatch `CustomEvent(\"change\", { detail: { value: {...} } })`\n- Public method `validate()` reports validity on all inner inputs and returns true only if all are valid\n- Public method `focus()` focuses the first input\n- `@api required` makes all three inputs required",
    starter: { "addressInput.js": "import { LightningElement, api } from 'lwc';\n\nexport default class AddressInput extends LightningElement {\n    // TODO\n}\n", "addressInput.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "addressInput.js": "import { LightningElement, api } from 'lwc';\n\nconst EMPTY = { line1: '', town: '', postcode: '' };\n\nexport default class AddressInput extends LightningElement {\n    @api required = false;\n    _value = { ...EMPTY };\n\n    @api\n    get value() {\n        return this._value;\n    }\n    set value(val) {\n        this._value = { ...EMPTY, ...(val || {}) };\n    }\n\n    handleFieldChange(event) {\n        const field = event.target.name;\n        this._value = { ...this._value, [field]: event.target.value };\n        this.dispatchEvent(new CustomEvent('change', { detail: { value: { ...this._value } } }));\n    }\n\n    @api\n    validate() {\n        return [...this.template.querySelectorAll('lightning-input')].reduce((ok, input) => {\n            input.reportValidity();\n            return ok && input.checkValidity();\n        }, true);\n    }\n\n    @api\n    focus() {\n        const first = this.template.querySelector('lightning-input');\n        if (first) first.focus();\n    }\n}\n", "addressInput.html": "<template>\n    <lightning-input name=\"line1\" label=\"Address line 1\" value={value.line1} required={required} onchange={handleFieldChange}></lightning-input>\n    <lightning-input name=\"town\" label=\"Town\" value={value.town} required={required} onchange={handleFieldChange}></lightning-input>\n    <lightning-input name=\"postcode\" label=\"Postcode\" value={value.postcode} required={required} onchange={handleFieldChange}></lightning-input>\n</template>\n" },
    checks: [
      { re: /@api\s+(get|set)\s+value\s*\(/, msg: "Decorates the value accessor with @api", file: "addressInput.js" },
      { re: /@api\s+validate\s*\(\s*\)/, msg: "Public validate() method", file: "addressInput.js" },
      { re: /@api\s+focus\s*\(\s*\)/, msg: "Public focus() method", file: "addressInput.js" },
      { re: /reportValidity\s*\(/, msg: "validate() reports validity", file: "addressInput.js" },
      { re: /new\s+CustomEvent\s*\(\s*['"]change['"]/, msg: "Dispatches CustomEvent('change')", file: "addressInput.js" },
      { re: /required=\{\s*required\s*\}/i, msg: "Passes required to inner inputs", file: "addressInput.html" }
    ],
    forbid: [
      { re: /this\.value\.\w+\s*=(?!=)|this\._value\.\w+\s*=(?!=)/, msg: "Do not mutate the value object in place" }
    ],
    hints: ["Spread into a new object in the setter so the parent's object stays read-only.", "Send a copy of the value in the event detail.", "validate() should call reportValidity on every input, not stop at the first failure."],
    ai: "Verify the setter copies and defaults the object, events carry a copy, validate() reports on all inputs and returns a boolean, and required propagates."
  },
  {
    id: "LW029",
    track: "lwc",
    level: "Easy",
    topic: "Wire adapters",
    title: "Account header with getRecord",
    task: "Wealden Builders wants a compact header on Account pages.\nBuild `accountHeader` for an Account record page:\n- `@api recordId`\n- Import `Account.Name`, `Account.Industry` and `Account.AnnualRevenue` from `@salesforce/schema`\n- `@wire(getRecord, { recordId: \"$recordId\", fields: [...] })`\n- Getters using `getFieldValue` for each field\n- Show the revenue as GBP currency; show an error message if the wire returns an error",
    starter: { "accountHeader.js": "import { LightningElement, api, wire } from 'lwc';\n\nexport default class AccountHeader extends LightningElement {\n    @api recordId;\n\n    // TODO\n}\n", "accountHeader.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "accountHeader.js": "import { LightningElement, api, wire } from 'lwc';\nimport { getRecord, getFieldValue } from 'lightning/uiRecordApi';\nimport NAME_FIELD from '@salesforce/schema/Account.Name';\nimport INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';\nimport REVENUE_FIELD from '@salesforce/schema/Account.AnnualRevenue';\n\nconst FIELDS = [NAME_FIELD, INDUSTRY_FIELD, REVENUE_FIELD];\n\nexport default class AccountHeader extends LightningElement {\n    @api recordId;\n\n    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })\n    account;\n\n    get name() {\n        return getFieldValue(this.account.data, NAME_FIELD);\n    }\n\n    get industry() {\n        return getFieldValue(this.account.data, INDUSTRY_FIELD);\n    }\n\n    get revenue() {\n        return getFieldValue(this.account.data, REVENUE_FIELD);\n    }\n\n    get errorMessage() {\n        const error = this.account.error;\n        return error && error.body ? error.body.message : 'Unable to load account';\n    }\n}\n", "accountHeader.html": "<template>\n    <template lwc:if={account.data}>\n        <h2 class=\"slds-text-heading_medium\">{name}</h2>\n        <p>{industry}</p>\n        <lightning-formatted-number value={revenue} format-style=\"currency\" currency-code=\"GBP\"></lightning-formatted-number>\n    </template>\n    <template lwc:elseif={account.error}>\n        <p class=\"slds-text-color_error\">{errorMessage}</p>\n    </template>\n</template>\n" },
    checks: [
      { re: /import\s*\{[^}]*getRecord[^}]*\}\s*from\s*['"]lightning\/uiRecordApi['"]/, msg: "Imports getRecord from lightning/uiRecordApi", file: "accountHeader.js" },
      { re: /@salesforce\/schema\/Account\.Name/, msg: "Imports the Account.Name schema field", file: "accountHeader.js" },
      { re: /@wire\s*\(\s*getRecord\s*,\s*\{[^}]*['"]\$recordId['"]/, msg: "Wires getRecord with '$recordId'", file: "accountHeader.js" },
      { re: /getFieldValue\s*\(/, msg: "Reads values with getFieldValue", file: "accountHeader.js" },
      { re: /\.error/, msg: "Handles the wire error", file: "accountHeader.html" }
    ],
    forbid: [
      { re: /if:(true|false)\s*=/i, msg: "Use lwc:if / lwc:else, not the legacy if:true / if:false" },
      { re: /'(001|003|006|500|00T|00Q)[A-Za-z0-9]{12,15}'/, msg: "No hard-coded record Ids" }
    ],
    hints: ["Prefix reactive wire params with '$'.", "getFieldValue(this.account.data, FIELD) is safe when data is undefined."],
    ai: "Verify schema imports are used (not string field names), the wire is reactive on recordId, and both data and error states are rendered."
  },
  {
    id: "LW030",
    track: "lwc",
    level: "Easy",
    topic: "Wire adapters",
    title: "Wired Apex contact list",
    task: "Medway Dental Group lists practice contacts on the Account page.\n- Apex `ContactListController.getContacts(Id accountId)`: `@AuraEnabled(cacheable=true)`, returns Id, Name, Title, Email of the account's contacts ordered by Name, `WITH USER_MODE`, limit 50\n- LWC `practiceContacts`: `@api recordId`, `@wire(getContacts, { accountId: \"$recordId\" }) contacts`\n- Render the list with `for:each`; show the error message when `contacts.error` is set",
    starter: { "practiceContacts.js": "import { LightningElement, api, wire } from 'lwc';\n\nexport default class PracticeContacts extends LightningElement {\n    @api recordId;\n\n    // TODO\n}\n", "practiceContacts.html": "<template>\n    <!-- TODO -->\n</template>\n", "ContactListController.cls": "public with sharing class ContactListController {\n    // TODO: getContacts(Id accountId)\n}\n" },
    solution: { "practiceContacts.js": "import { LightningElement, api, wire } from 'lwc';\nimport getContacts from '@salesforce/apex/ContactListController.getContacts';\n\nexport default class PracticeContacts extends LightningElement {\n    @api recordId;\n\n    @wire(getContacts, { accountId: '$recordId' })\n    contacts;\n\n    get errorMessage() {\n        const error = this.contacts.error;\n        return error && error.body ? error.body.message : 'Could not load contacts';\n    }\n}\n", "practiceContacts.html": "<template>\n    <lightning-card title=\"Practice contacts\" icon-name=\"standard:contact\">\n        <template lwc:if={contacts.data}>\n            <ul class=\"slds-p-horizontal_medium\">\n                <template for:each={contacts.data} for:item=\"con\">\n                    <li key={con.Id}>{con.Name} — {con.Title} ({con.Email})</li>\n                </template>\n            </ul>\n        </template>\n        <template lwc:elseif={contacts.error}>\n            <p class=\"slds-text-color_error slds-p-horizontal_medium\">{errorMessage}</p>\n        </template>\n    </lightning-card>\n</template>\n", "ContactListController.cls": "public with sharing class ContactListController {\n    @AuraEnabled(cacheable=true)\n    public static List<Contact> getContacts(Id accountId) {\n        return [\n            SELECT Id, Name, Title, Email\n            FROM Contact\n            WHERE AccountId = :accountId\n            WITH USER_MODE\n            ORDER BY Name\n            LIMIT 50\n        ];\n    }\n}\n" },
    checks: [
      { re: /@AuraEnabled\s*\(\s*cacheable\s*=\s*true\s*\)/i, msg: "Apex method is @AuraEnabled(cacheable=true)", file: "ContactListController.cls" },
      { re: /public\s+static\s+List\s*<\s*Contact\s*>\s+getContacts\s*\(\s*Id\s+accountId\s*\)/i, msg: "Keeps the required Apex signature", file: "ContactListController.cls" },
      { re: /WITH\s+USER_MODE/i, msg: "Query runs WITH USER_MODE", file: "ContactListController.cls" },
      { re: /import\s+getContacts\s+from\s+['"]@salesforce\/apex\/ContactListController\.getContacts['"]/, msg: "Imports the Apex method", file: "practiceContacts.js" },
      { re: /@wire\s*\(\s*getContacts\s*,\s*\{\s*accountId\s*:\s*['"]\$recordId['"]/, msg: "Wires getContacts with accountId: '$recordId'", file: "practiceContacts.js" }
    ],
    forbid: [
      { re: /if:(true|false)\s*=/i, msg: "Use lwc:if / lwc:else, not the legacy if:true / if:false" },
      { re: /'(001|003|006|500|00T|00Q)[A-Za-z0-9]{12,15}'/, msg: "No hard-coded record Ids" }
    ],
    hints: ["Wired Apex must be cacheable=true.", "The wire parameter names must match the Apex parameter names."],
    ai: "Verify the Apex is cacheable, secure (with sharing / USER_MODE), parameter names match, and the component renders both data and error states."
  },
  {
    id: "LW031",
    track: "lwc",
    level: "Medium",
    topic: "Wire adapters",
    title: "Object info and record types",
    task: "Ouse Valley Housing needs to show which Case record types a user can create.\nBuild `caseRecordTypes`:\n- Import `CASE_OBJECT` from `@salesforce/schema/Case`\n- `@wire(getObjectInfo, { objectApiName: CASE_OBJECT })` as a function handler `wiredInfo({ error, data })`\n- From data, show the object `label`, the default record type id, and a list of AVAILABLE record types (`recordTypeInfos`, filter `available` and exclude the master record type)\n- Show an error message on error",
    starter: { "caseRecordTypes.js": "import { LightningElement, wire } from 'lwc';\n\nexport default class CaseRecordTypes extends LightningElement {\n    // TODO\n}\n", "caseRecordTypes.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "caseRecordTypes.js": "import { LightningElement, wire } from 'lwc';\nimport { getObjectInfo } from 'lightning/uiObjectInfoApi';\nimport CASE_OBJECT from '@salesforce/schema/Case';\n\nexport default class CaseRecordTypes extends LightningElement {\n    objectLabel;\n    defaultRecordTypeId;\n    recordTypes = [];\n    error;\n\n    @wire(getObjectInfo, { objectApiName: CASE_OBJECT })\n    wiredInfo({ error, data }) {\n        if (data) {\n            this.objectLabel = data.label;\n            this.defaultRecordTypeId = data.defaultRecordTypeId;\n            this.recordTypes = Object.values(data.recordTypeInfos)\n                .filter(rt => rt.available && !rt.master)\n                .map(rt => ({ id: rt.recordTypeId, name: rt.name }));\n            this.error = undefined;\n        } else if (error) {\n            this.error = error.body ? error.body.message : 'Unable to load object info';\n            this.recordTypes = [];\n        }\n    }\n}\n", "caseRecordTypes.html": "<template>\n    <template lwc:if={error}>\n        <p class=\"slds-text-color_error\">{error}</p>\n    </template>\n    <template lwc:else>\n        <h3>{objectLabel} record types (default: {defaultRecordTypeId})</h3>\n        <ul>\n            <template for:each={recordTypes} for:item=\"rt\">\n                <li key={rt.id}>{rt.name}</li>\n            </template>\n        </ul>\n    </template>\n</template>\n" },
    checks: [
      { re: /import\s*\{[^}]*getObjectInfo[^}]*\}\s*from\s*['"]lightning\/uiObjectInfoApi['"]/, msg: "Imports getObjectInfo from lightning/uiObjectInfoApi", file: "caseRecordTypes.js" },
      { re: /@salesforce\/schema\/Case['"]/, msg: "Imports the Case object schema", file: "caseRecordTypes.js" },
      { re: /@wire\s*\(\s*getObjectInfo\s*,\s*\{\s*objectApiName\s*:/, msg: "Wires getObjectInfo with objectApiName", file: "caseRecordTypes.js" },
      { re: /recordTypeInfos/, msg: "Reads recordTypeInfos", file: "caseRecordTypes.js" },
      { re: /\.available/, msg: "Filters to available record types", file: "caseRecordTypes.js" },
      { re: /\w+\s*\(\s*\{\s*(error\s*,\s*data|data\s*,\s*error)\s*\}\s*\)\s*\{/, msg: "Uses a wired function with { error, data }", file: "caseRecordTypes.js" }
    ],
    forbid: [
      { re: /if:(true|false)\s*=/i, msg: "Use lwc:if / lwc:else, not the legacy if:true / if:false" }
    ],
    hints: ["recordTypeInfos is an object keyed by id — use Object.values().", "The master record type has master: true."],
    ai: "Verify the master record type is excluded, only available ones are listed, and error/data branches each reset the other state."
  },
  {
    id: "LW032",
    track: "lwc",
    level: "Medium",
    topic: "Wire adapters",
    title: "Picklist values for a combobox",
    task: "Clyde Leisure Centres lets staff pick a Case Origin in a custom panel.\nBuild `caseOriginPicker`:\n- Wire `getObjectInfo` for Case to get `defaultRecordTypeId`\n- Wire `getPicklistValues` with `recordTypeId: \"$objectInfo.data.defaultRecordTypeId\"` and `fieldApiName` = `Case.Origin` imported from schema\n- Feed the values into a `lightning-combobox` (options = `{ label, value }`)\n- On change dispatch `CustomEvent(\"originchange\", { detail: { value } })`",
    starter: { "caseOriginPicker.js": "import { LightningElement, wire } from 'lwc';\n\nexport default class CaseOriginPicker extends LightningElement {\n    // TODO\n}\n", "caseOriginPicker.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "caseOriginPicker.js": "import { LightningElement, wire } from 'lwc';\nimport { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';\nimport CASE_OBJECT from '@salesforce/schema/Case';\nimport ORIGIN_FIELD from '@salesforce/schema/Case.Origin';\n\nexport default class CaseOriginPicker extends LightningElement {\n    value;\n\n    @wire(getObjectInfo, { objectApiName: CASE_OBJECT })\n    objectInfo;\n\n    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: ORIGIN_FIELD })\n    originValues;\n\n    get options() {\n        const data = this.originValues && this.originValues.data;\n        return data ? data.values.map(v => ({ label: v.label, value: v.value })) : [];\n    }\n\n    handleChange(event) {\n        this.value = event.detail.value;\n        this.dispatchEvent(new CustomEvent('originchange', { detail: { value: this.value } }));\n    }\n}\n", "caseOriginPicker.html": "<template>\n    <lightning-combobox label=\"Case origin\" value={value} options={options} placeholder=\"Select an origin\" onchange={handleChange}></lightning-combobox>\n</template>\n" },
    checks: [
      { re: /import\s*\{[^}]*getPicklistValues[^}]*\}\s*from\s*['"]lightning\/uiObjectInfoApi['"]/, msg: "Imports getPicklistValues", file: "caseOriginPicker.js" },
      { re: /@wire\s*\(\s*getObjectInfo/, msg: "Wires getObjectInfo", file: "caseOriginPicker.js" },
      { re: /recordTypeId\s*:\s*['"]\$\w+\.data\.defaultRecordTypeId['"]/, msg: "Chains recordTypeId from objectInfo.data.defaultRecordTypeId", file: "caseOriginPicker.js" },
      { re: /@salesforce\/schema\/Case\.Origin/, msg: "Imports Case.Origin from schema", file: "caseOriginPicker.js" },
      { re: /<lightning-combobox[^>]*options=\{/i, msg: "Feeds options to lightning-combobox", file: "caseOriginPicker.html" }
    ],
    forbid: [
      { re: /innerHTML/i, msg: "Don't touch innerHTML" }
    ],
    hints: ["A reactive param can point to a nested property: \"$objectInfo.data.defaultRecordTypeId\".", "The second wire waits until that value is defined."],
    ai: "Verify the wires are chained correctly, options are empty until data arrives, and the change event sends the selected value."
  },
  {
    id: "LW033",
    track: "lwc",
    level: "Medium",
    topic: "Wire adapters",
    title: "Wired Apex function with error state",
    task: "Tyne Marine Engineering shows open opportunities on Account pages.\n- Apex `OpenOppsController.getOpenOpportunities(Id accountId)`: cacheable, returns Id, Name, StageName, Amount, CloseDate where `IsClosed = false`, ordered by CloseDate, `WITH USER_MODE`\n- LWC `openOpportunities`: wire it as a FUNCTION `wiredOpps({ error, data })` storing `opportunities` and `error` fields (error text from `error.body.message`)\n- Three states: error, empty (\"No open opportunities\"), list",
    starter: { "openOpportunities.js": "import { LightningElement, api, wire } from 'lwc';\n\nexport default class OpenOpportunities extends LightningElement {\n    @api recordId;\n\n    // TODO\n}\n", "openOpportunities.html": "<template>\n    <!-- TODO -->\n</template>\n", "OpenOppsController.cls": "public with sharing class OpenOppsController {\n    // TODO: getOpenOpportunities(Id accountId)\n}\n" },
    solution: { "openOpportunities.js": "import { LightningElement, api, wire } from 'lwc';\nimport getOpenOpportunities from '@salesforce/apex/OpenOppsController.getOpenOpportunities';\n\nexport default class OpenOpportunities extends LightningElement {\n    @api recordId;\n    opportunities = [];\n    error;\n\n    @wire(getOpenOpportunities, { accountId: '$recordId' })\n    wiredOpps({ error, data }) {\n        if (data) {\n            this.opportunities = data;\n            this.error = undefined;\n        } else if (error) {\n            this.opportunities = [];\n            this.error = error.body ? error.body.message : 'Unknown error';\n        }\n    }\n\n    get isEmpty() {\n        return !this.error && this.opportunities.length === 0;\n    }\n}\n", "openOpportunities.html": "<template>\n    <template lwc:if={error}>\n        <p class=\"slds-text-color_error\">{error}</p>\n    </template>\n    <template lwc:elseif={isEmpty}>\n        <p>No open opportunities</p>\n    </template>\n    <template lwc:else>\n        <ul>\n            <template for:each={opportunities} for:item=\"opp\">\n                <li key={opp.Id}>{opp.Name} — {opp.StageName} — {opp.CloseDate}</li>\n            </template>\n        </ul>\n    </template>\n</template>\n", "OpenOppsController.cls": "public with sharing class OpenOppsController {\n    @AuraEnabled(cacheable=true)\n    public static List<Opportunity> getOpenOpportunities(Id accountId) {\n        return [\n            SELECT Id, Name, StageName, Amount, CloseDate\n            FROM Opportunity\n            WHERE AccountId = :accountId AND IsClosed = false\n            WITH USER_MODE\n            ORDER BY CloseDate\n        ];\n    }\n}\n" },
    checks: [
      { re: /@AuraEnabled\s*\(\s*cacheable\s*=\s*true\s*\)/i, msg: "Apex is cacheable", file: "OpenOppsController.cls" },
      { re: /IsClosed\s*=\s*false/i, msg: "Filters to open opportunities", file: "OpenOppsController.cls" },
      { re: /@salesforce\/apex\/OpenOppsController\.getOpenOpportunities/, msg: "Imports the Apex method", file: "openOpportunities.js" },
      { re: /@wire\s*\(\s*getOpenOpportunities[^)]*\)\s*\w+\s*\(\s*\{\s*(error\s*,\s*data|data\s*,\s*error)\s*\}\s*\)/, msg: "Wires to a function receiving { error, data }", file: "openOpportunities.js" },
      { re: /error\.body/, msg: "Reads the message from error.body", file: "openOpportunities.js" },
      { re: /lwc:elseif/i, msg: "Uses lwc:elseif for the three states", file: "openOpportunities.html" }
    ],
    forbid: [
      { re: /if:(true|false)\s*=/i, msg: "Use lwc:if / lwc:else, not the legacy if:true / if:false" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" }
    ],
    hints: ["A wired function is called with { error, data } every time the wire provisions.", "Clear the other field in each branch so stale data never shows."],
    ai: "Verify the Apex is cacheable and secure, the wired function handles both branches and clears stale state, and the three UI states are mutually exclusive."
  },
  {
    id: "LW034",
    track: "lwc",
    level: "Hard",
    topic: "Wire adapters",
    title: "Mark tasks complete and refreshApex",
    task: "Exe Estuary Lettings shows open Tasks for a Property record.\n- Apex `PropertyTaskController.getOpenTasks(Id whatId)`: cacheable, returns Id, Subject, ActivityDate of non-closed Tasks, `WITH USER_MODE`\n- LWC `propertyTasks`: wire `getOpenTasks` with `\"$recordId\"` and KEEP the provisioned result so it can be refreshed\n- Each row has a \"Complete\" button (`data-id`) that calls `updateRecord({ fields: { Id, Status: \"Completed\" } })` from `lightning/uiRecordApi`\n- After success, call `refreshApex` on the stored wire result and show a success toast; on failure show an error toast",
    starter: { "propertyTasks.js": "import { LightningElement, api, wire } from 'lwc';\n\nexport default class PropertyTasks extends LightningElement {\n    @api recordId;\n\n    // TODO\n}\n", "propertyTasks.html": "<template>\n    <!-- TODO -->\n</template>\n", "PropertyTaskController.cls": "public with sharing class PropertyTaskController {\n    // TODO: getOpenTasks(Id whatId)\n}\n" },
    solution: { "propertyTasks.js": "import { LightningElement, api, wire } from 'lwc';\nimport { refreshApex } from '@salesforce/apex';\nimport { updateRecord } from 'lightning/uiRecordApi';\nimport { ShowToastEvent } from 'lightning/platformShowToastEvent';\nimport getOpenTasks from '@salesforce/apex/PropertyTaskController.getOpenTasks';\n\nexport default class PropertyTasks extends LightningElement {\n    @api recordId;\n    wiredTasksResult;\n    tasks = [];\n\n    @wire(getOpenTasks, { whatId: '$recordId' })\n    wiredTasks(result) {\n        this.wiredTasksResult = result;\n        if (result.data) {\n            this.tasks = result.data;\n        } else if (result.error) {\n            this.tasks = [];\n        }\n    }\n\n    async handleComplete(event) {\n        const taskId = event.currentTarget.dataset.id;\n        try {\n            await updateRecord({ fields: { Id: taskId, Status: 'Completed' } });\n            await refreshApex(this.wiredTasksResult);\n            this.dispatchEvent(new ShowToastEvent({ title: 'Task completed', message: 'Nice work', variant: 'success' }));\n        } catch (error) {\n            const message = error && error.body ? error.body.message : 'Could not update the task';\n            this.dispatchEvent(new ShowToastEvent({ title: 'Error', message, variant: 'error' }));\n        }\n    }\n}\n", "propertyTasks.html": "<template>\n    <lightning-card title=\"Open tasks\" icon-name=\"standard:task\">\n        <ul class=\"slds-p-horizontal_medium\">\n            <template for:each={tasks} for:item=\"task\">\n                <li key={task.Id} class=\"slds-m-bottom_x-small\">\n                    {task.Subject} — {task.ActivityDate}\n                    <lightning-button label=\"Complete\" data-id={task.Id} onclick={handleComplete} class=\"slds-m-left_small\"></lightning-button>\n                </li>\n            </template>\n        </ul>\n    </lightning-card>\n</template>\n", "PropertyTaskController.cls": "public with sharing class PropertyTaskController {\n    @AuraEnabled(cacheable=true)\n    public static List<Task> getOpenTasks(Id whatId) {\n        return [\n            SELECT Id, Subject, ActivityDate\n            FROM Task\n            WHERE WhatId = :whatId AND IsClosed = false\n            WITH USER_MODE\n            ORDER BY ActivityDate\n        ];\n    }\n}\n" },
    checks: [
      { re: /import\s*\{\s*refreshApex\s*\}\s*from\s*['"]@salesforce\/apex['"]/, msg: "Imports refreshApex from '@salesforce/apex'", file: "propertyTasks.js" },
      { re: /updateRecord\s*\(/, msg: "Updates the task with updateRecord", file: "propertyTasks.js" },
      { re: /refreshApex\s*\(\s*this\.\w+\s*\)/, msg: "Refreshes the stored wire result", file: "propertyTasks.js" },
      { re: /new\s+ShowToastEvent\s*\(/, msg: "Shows a toast", file: "propertyTasks.js" },
      { re: /@AuraEnabled\s*\(\s*cacheable\s*=\s*true\s*\)/i, msg: "Apex is cacheable", file: "PropertyTaskController.cls" },
      { re: /IsClosed\s*=\s*false/i, msg: "Returns only open tasks", file: "PropertyTaskController.cls" }
    ],
    forbid: [
      { re: /refreshApex\s*\(\s*this\.tasks\s*\)/, msg: "refreshApex needs the full wire result, not the data array" },
      { re: /'(001|003|006|500|00T|00Q)[A-Za-z0-9]{12,15}'/, msg: "No hard-coded record Ids" }
    ],
    hints: ["Store the whole provisioned value (result), not just result.data.", "Await updateRecord, then await refreshApex(this.wiredTasksResult).", "Wrap both in try/catch to show an error toast."],
    ai: "Verify the full wire result is stored and passed to refreshApex, the update uses the clicked row id, and both success and error toasts are handled."
  },
  {
    id: "LW035",
    track: "lwc",
    level: "Hard",
    topic: "Wire adapters",
    title: "Chained wires: contact → account cases",
    task: "Wirral Home Care shows a contact's ACCOUNT-level recent cases on the Contact page.\n- Wire `getRecord` for the contact with `Contact.AccountId`\n- Apex `AccountCaseController.getRecentCases(Id accountId)`: cacheable, last 5 cases by CreatedDate DESC, `WITH USER_MODE`; return an empty list for a null id\n- Wire the Apex with a reactive parameter driven by the account id from the first wire (it must not run until the id is known)\n- Show \"Contact has no account\" when AccountId is blank",
    starter: { "contactAccountCases.js": "import { LightningElement, api, wire } from 'lwc';\n\nexport default class ContactAccountCases extends LightningElement {\n    @api recordId;\n\n    // TODO\n}\n", "contactAccountCases.html": "<template>\n    <!-- TODO -->\n</template>\n", "AccountCaseController.cls": "public with sharing class AccountCaseController {\n    // TODO: getRecentCases(Id accountId)\n}\n" },
    solution: { "contactAccountCases.js": "import { LightningElement, api, wire } from 'lwc';\nimport { getRecord, getFieldValue } from 'lightning/uiRecordApi';\nimport ACCOUNT_ID_FIELD from '@salesforce/schema/Contact.AccountId';\nimport getRecentCases from '@salesforce/apex/AccountCaseController.getRecentCases';\n\nexport default class ContactAccountCases extends LightningElement {\n    @api recordId;\n    accountId;\n    contactLoaded = false;\n\n    @wire(getRecord, { recordId: '$recordId', fields: [ACCOUNT_ID_FIELD] })\n    wiredContact({ data }) {\n        if (data) {\n            this.accountId = getFieldValue(data, ACCOUNT_ID_FIELD);\n            this.contactLoaded = true;\n        }\n    }\n\n    @wire(getRecentCases, { accountId: '$accountId' })\n    cases;\n\n    get noAccount() {\n        return this.contactLoaded && !this.accountId;\n    }\n}\n", "contactAccountCases.html": "<template>\n    <template lwc:if={noAccount}>\n        <p>Contact has no account</p>\n    </template>\n    <template lwc:elseif={cases.data}>\n        <ul>\n            <template for:each={cases.data} for:item=\"cs\">\n                <li key={cs.Id}>{cs.CaseNumber} — {cs.Subject} ({cs.Status})</li>\n            </template>\n        </ul>\n    </template>\n</template>\n", "AccountCaseController.cls": "public with sharing class AccountCaseController {\n    @AuraEnabled(cacheable=true)\n    public static List<Case> getRecentCases(Id accountId) {\n        if (accountId == null) {\n            return new List<Case>();\n        }\n        return [\n            SELECT Id, CaseNumber, Subject, Status, CreatedDate\n            FROM Case\n            WHERE AccountId = :accountId\n            WITH USER_MODE\n            ORDER BY CreatedDate DESC\n            LIMIT 5\n        ];\n    }\n}\n" },
    checks: [
      { re: /@wire\s*\(\s*getRecord\s*,/, msg: "Wires getRecord for the contact", file: "contactAccountCases.js" },
      { re: /@salesforce\/schema\/Contact\.AccountId/, msg: "Imports Contact.AccountId", file: "contactAccountCases.js" },
      { re: /@wire\s*\(\s*getRecentCases\s*,\s*\{\s*accountId\s*:\s*['"]\$\w+/, msg: "Wires the Apex with a reactive account id", file: "contactAccountCases.js" },
      { re: /LIMIT\s+5/i, msg: "Returns at most 5 cases", file: "AccountCaseController.cls" },
      { re: /accountId\s*==\s*null/i, msg: "Handles a null account id", file: "AccountCaseController.cls" },
      { re: /cacheable\s*=\s*true/i, msg: "Apex is cacheable", file: "AccountCaseController.cls" }
    ],
    forbid: [
      { re: /connectedCallback\s*\(\s*\)\s*\{[^}]*getRecentCases\s*\(/, msg: "Use a reactive wire, not an imperative call in connectedCallback" },
      { re: /if:(true|false)\s*=/i, msg: "Use lwc:if / lwc:else, not the legacy if:true / if:false" }
    ],
    hints: ["A wire with an undefined reactive parameter does not run.", "Set this.accountId in the getRecord handler and reference it as '$accountId'."],
    ai: "Verify the Apex wire only runs once the account id is known, the no-account case is handled, and the Apex is secure, cacheable and limited to 5 rows."
  },
  {
    id: "LW036",
    track: "lwc",
    level: "Easy",
    topic: "Imperative Apex",
    title: "Run a credit check on click",
    task: "Kingsway Finance runs credit checks from the Account page.\n- Apex `CreditCheckController.runCheck(Id accountId)` (`@AuraEnabled`, NOT cacheable) returns a String result like \"PASS\" or \"REFER\" (stub: \"PASS\" if AnnualRevenue > 1,000,000 else \"REFER\")\n- LWC `creditCheckButton`: `@api recordId`, a \"Run credit check\" button that calls the method imperatively and shows the result; show the error message if it fails",
    starter: { "creditCheckButton.js": "import { LightningElement, api } from 'lwc';\n\nexport default class CreditCheckButton extends LightningElement {\n    @api recordId;\n\n    // TODO\n}\n", "creditCheckButton.html": "<template>\n    <!-- TODO -->\n</template>\n", "CreditCheckController.cls": "public with sharing class CreditCheckController {\n    // TODO: runCheck(Id accountId)\n}\n" },
    solution: { "creditCheckButton.js": "import { LightningElement, api } from 'lwc';\nimport runCheck from '@salesforce/apex/CreditCheckController.runCheck';\n\nexport default class CreditCheckButton extends LightningElement {\n    @api recordId;\n    result;\n    error;\n\n    async handleRun() {\n        this.error = undefined;\n        try {\n            this.result = await runCheck({ accountId: this.recordId });\n        } catch (e) {\n            this.result = undefined;\n            this.error = e && e.body ? e.body.message : 'Credit check failed';\n        }\n    }\n}\n", "creditCheckButton.html": "<template>\n    <lightning-button label=\"Run credit check\" onclick={handleRun}></lightning-button>\n    <template lwc:if={result}>\n        <p>Result: {result}</p>\n    </template>\n    <template lwc:if={error}>\n        <p class=\"slds-text-color_error\">{error}</p>\n    </template>\n</template>\n", "CreditCheckController.cls": "public with sharing class CreditCheckController {\n    @AuraEnabled\n    public static String runCheck(Id accountId) {\n        Account acc = [SELECT AnnualRevenue FROM Account WHERE Id = :accountId WITH USER_MODE LIMIT 1];\n        return (acc.AnnualRevenue != null && acc.AnnualRevenue > 1000000) ? 'PASS' : 'REFER';\n    }\n}\n" },
    checks: [
      { re: /import\s+runCheck\s+from\s+['"]@salesforce\/apex\/CreditCheckController\.runCheck['"]/, msg: "Imports the Apex method", file: "creditCheckButton.js" },
      { re: /runCheck\s*\(\s*\{\s*accountId\s*:/, msg: "Calls runCheck with { accountId }", file: "creditCheckButton.js" },
      { re: /await\s+runCheck|runCheck\s*\([^)]*\)\s*\.then/, msg: "Handles the returned promise", file: "creditCheckButton.js" },
      { re: /catch\s*\(/, msg: "Handles errors", file: "creditCheckButton.js" },
      { re: /@AuraEnabled(?!\s*\(\s*cacheable\s*=\s*true)/i, msg: "Apex method is @AuraEnabled (not cacheable)", file: "CreditCheckController.cls" }
    ],
    forbid: [
      { re: /@wire\s*\(\s*runCheck/, msg: "Call it imperatively on click, not via @wire" },
      { re: /'(001|003|006|500|00T|00Q)[A-Za-z0-9]{12,15}'/, msg: "No hard-coded record Ids" }
    ],
    hints: ["Imperative Apex returns a Promise — use async/await or .then().", "Parameters are passed as an object whose keys match the Apex parameter names."],
    ai: "Verify the call is imperative on click, parameter names match, errors are caught and displayed, and the Apex handles null revenue."
  },
  {
    id: "LW037",
    track: "lwc",
    level: "Easy",
    topic: "Imperative Apex",
    title: "Spinner while loading exchange rates",
    task: "Albion Travel Money loads rates on demand.\n- Apex `RateController.getRates()` (`@AuraEnabled`) returns `List<Exchange_Rate__c>` (Currency__c, Rate__c) — already written\n- LWC `exchangeRates`: a \"Load rates\" button calls it imperatively\n- Field `isLoading`: true before the call, false afterwards in a `finally` block\n- Show `lightning-spinner` (alternative-text \"Loading\") with `lwc:if={isLoading}`; disable the button while loading\n- Show rates in a list; on error show the message",
    starter: { "exchangeRates.js": "import { LightningElement } from 'lwc';\n\nexport default class ExchangeRates extends LightningElement {\n    // TODO\n}\n", "exchangeRates.html": "<template>\n    <!-- TODO -->\n</template>\n", "RateController.cls": "public with sharing class RateController {\n    @AuraEnabled\n    public static List<Exchange_Rate__c> getRates() {\n        return [SELECT Id, Currency__c, Rate__c FROM Exchange_Rate__c WITH USER_MODE ORDER BY Currency__c];\n    }\n}\n" },
    solution: { "exchangeRates.js": "import { LightningElement } from 'lwc';\nimport getRates from '@salesforce/apex/RateController.getRates';\n\nexport default class ExchangeRates extends LightningElement {\n    rates = [];\n    isLoading = false;\n    error;\n\n    async handleLoad() {\n        this.isLoading = true;\n        this.error = undefined;\n        try {\n            this.rates = await getRates();\n        } catch (e) {\n            this.error = e && e.body ? e.body.message : 'Could not load rates';\n        } finally {\n            this.isLoading = false;\n        }\n    }\n}\n", "exchangeRates.html": "<template>\n    <div class=\"slds-is-relative\">\n        <template lwc:if={isLoading}>\n            <lightning-spinner alternative-text=\"Loading\" size=\"small\"></lightning-spinner>\n        </template>\n        <lightning-button label=\"Load rates\" onclick={handleLoad} disabled={isLoading}></lightning-button>\n        <template lwc:if={error}>\n            <p class=\"slds-text-color_error\">{error}</p>\n        </template>\n        <ul>\n            <template for:each={rates} for:item=\"rate\">\n                <li key={rate.Id}>{rate.Currency__c}: {rate.Rate__c}</li>\n            </template>\n        </ul>\n    </div>\n</template>\n", "RateController.cls": "public with sharing class RateController {\n    @AuraEnabled\n    public static List<Exchange_Rate__c> getRates() {\n        return [SELECT Id, Currency__c, Rate__c FROM Exchange_Rate__c WITH USER_MODE ORDER BY Currency__c];\n    }\n}\n" },
    checks: [
      { re: /@salesforce\/apex\/RateController\.getRates/, msg: "Imports getRates", file: "exchangeRates.js" },
      { re: /finally\s*\{[^}]*isLoading\s*=\s*false|\.finally\s*\(/, msg: "Resets isLoading in finally", file: "exchangeRates.js" },
      { re: /isLoading\s*=\s*true/, msg: "Sets isLoading before the call", file: "exchangeRates.js" },
      { re: /<lightning-spinner/i, msg: "Shows a lightning-spinner", file: "exchangeRates.html" },
      { re: /lwc:if=\{\s*isLoading\s*\}/i, msg: "Spinner controlled by lwc:if={isLoading}", file: "exchangeRates.html" },
      { re: /disabled=\{\s*isLoading\s*\}/i, msg: "Disables the button while loading", file: "exchangeRates.html" }
    ],
    forbid: [
      { re: /if:(true|false)\s*=/i, msg: "Use lwc:if / lwc:else, not the legacy if:true / if:false" }
    ],
    hints: ["try { ... } catch { ... } finally { this.isLoading = false; }", "Wrap the spinner in a container with slds-is-relative."],
    ai: "Verify the spinner always disappears (finally), errors are shown, and the button cannot trigger parallel loads."
  },
  {
    id: "LW038",
    track: "lwc",
    level: "Medium",
    topic: "Imperative Apex",
    title: "Close a case with toast feedback",
    task: "Pentland Water's agents close cases from a custom panel.\n- Apex `CaseCloseController.closeCase(Id caseId, String resolution)`: `@AuraEnabled`; blank resolution → throw `AuraHandledException`; otherwise set Status = \"Closed\" and Description = resolution, update with `Database.update(record, AccessLevel.USER_MODE)` or `update as user`\n- LWC `closeCasePanel`: textarea for the resolution, \"Close case\" button; call Apex in try/catch; success → `ShowToastEvent` variant success; error → variant error with `error.body.message`\n- After success dispatch `CustomEvent(\"caseclosed\")`",
    starter: { "closeCasePanel.js": "import { LightningElement, api } from 'lwc';\n\nexport default class CloseCasePanel extends LightningElement {\n    @api recordId;\n\n    // TODO\n}\n", "closeCasePanel.html": "<template>\n    <!-- TODO -->\n</template>\n", "CaseCloseController.cls": "public with sharing class CaseCloseController {\n    // TODO: closeCase(Id caseId, String resolution)\n}\n" },
    solution: { "closeCasePanel.js": "import { LightningElement, api } from 'lwc';\nimport { ShowToastEvent } from 'lightning/platformShowToastEvent';\nimport closeCase from '@salesforce/apex/CaseCloseController.closeCase';\n\nexport default class CloseCasePanel extends LightningElement {\n    @api recordId;\n    resolution = '';\n\n    handleResolution(event) {\n        this.resolution = event.target.value;\n    }\n\n    async handleClose() {\n        try {\n            await closeCase({ caseId: this.recordId, resolution: this.resolution });\n            this.dispatchEvent(new ShowToastEvent({ title: 'Case closed', message: 'The case has been closed.', variant: 'success' }));\n            this.dispatchEvent(new CustomEvent('caseclosed'));\n        } catch (error) {\n            this.dispatchEvent(new ShowToastEvent({\n                title: 'Could not close case',\n                message: error && error.body ? error.body.message : 'Unknown error',\n                variant: 'error'\n            }));\n        }\n    }\n}\n", "closeCasePanel.html": "<template>\n    <lightning-textarea label=\"Resolution\" value={resolution} onchange={handleResolution}></lightning-textarea>\n    <lightning-button variant=\"brand\" label=\"Close case\" onclick={handleClose}></lightning-button>\n</template>\n", "CaseCloseController.cls": "public with sharing class CaseCloseController {\n    @AuraEnabled\n    public static void closeCase(Id caseId, String resolution) {\n        if (String.isBlank(resolution)) {\n            throw new AuraHandledException('Please enter a resolution before closing the case.');\n        }\n        Case record = new Case(Id = caseId, Status = 'Closed', Description = resolution);\n        try {\n            update as user record;\n        } catch (DmlException e) {\n            throw new AuraHandledException(e.getDmlMessage(0));\n        }\n    }\n}\n" },
    checks: [
      { re: /import\s*\{\s*ShowToastEvent\s*\}\s*from\s*['"]lightning\/platformShowToastEvent['"]/, msg: "Imports ShowToastEvent", file: "closeCasePanel.js" },
      { re: /variant\s*:\s*['"]success['"]/, msg: "Shows a success toast", file: "closeCasePanel.js" },
      { re: /variant\s*:\s*['"]error['"]/, msg: "Shows an error toast", file: "closeCasePanel.js" },
      { re: /catch\s*\(/, msg: "Catches Apex errors", file: "closeCasePanel.js" },
      { re: /throw\s+new\s+AuraHandledException\s*\(/, msg: "Throws AuraHandledException for invalid input", file: "CaseCloseController.cls" },
      { re: /String\.isBlank\s*\(|\.trim\(\)\s*==\s*''|==\s*null/i, msg: "Validates the resolution", file: "CaseCloseController.cls" }
    ],
    forbid: [
      { re: /'(001|003|006|500|00T|00Q)[A-Za-z0-9]{12,15}'/, msg: "No hard-coded record Ids" }
    ],
    hints: ["AuraHandledException messages reach the client in error.body.message.", "Dispatch ShowToastEvent from this, like any other event."],
    ai: "Verify blank resolutions are rejected server-side, DML runs in user mode, both toast variants are used correctly, and caseclosed only fires on success."
  },
  {
    id: "LW039",
    track: "lwc",
    level: "Medium",
    topic: "Imperative Apex",
    title: "Product search with safe SOQL",
    task: "Ironbridge Tools needs a product finder.\n- Apex `ProductFinderController.searchProducts(String term)`: `@AuraEnabled(cacheable=true)`; terms shorter than 2 chars (after trim) return an empty list; otherwise return up to 20 active `Product2` (Id, Name, ProductCode) whose Name LIKE the term, using a bind variable, `WITH USER_MODE`\n- LWC `productFinder`: input + \"Search\" button calling the method imperatively; show results or \"No products found\" after a search",
    starter: { "productFinder.js": "import { LightningElement } from 'lwc';\n\nexport default class ProductFinder extends LightningElement {\n    // TODO\n}\n", "productFinder.html": "<template>\n    <!-- TODO -->\n</template>\n", "ProductFinderController.cls": "public with sharing class ProductFinderController {\n    // TODO: searchProducts(String term)\n}\n" },
    solution: { "productFinder.js": "import { LightningElement } from 'lwc';\nimport searchProducts from '@salesforce/apex/ProductFinderController.searchProducts';\n\nexport default class ProductFinder extends LightningElement {\n    term = '';\n    products = [];\n    searched = false;\n    error;\n\n    handleTerm(event) {\n        this.term = event.target.value;\n    }\n\n    async handleSearch() {\n        this.error = undefined;\n        try {\n            this.products = await searchProducts({ term: this.term });\n        } catch (e) {\n            this.products = [];\n            this.error = e && e.body ? e.body.message : 'Search failed';\n        }\n        this.searched = true;\n    }\n\n    get noResults() {\n        return this.searched && !this.error && this.products.length === 0;\n    }\n}\n", "productFinder.html": "<template>\n    <lightning-input type=\"search\" label=\"Product name\" value={term} onchange={handleTerm}></lightning-input>\n    <lightning-button label=\"Search\" onclick={handleSearch}></lightning-button>\n    <template lwc:if={error}>\n        <p class=\"slds-text-color_error\">{error}</p>\n    </template>\n    <template lwc:elseif={noResults}>\n        <p>No products found</p>\n    </template>\n    <template lwc:else>\n        <ul>\n            <template for:each={products} for:item=\"p\">\n                <li key={p.Id}>{p.Name} ({p.ProductCode})</li>\n            </template>\n        </ul>\n    </template>\n</template>\n", "ProductFinderController.cls": "public with sharing class ProductFinderController {\n    @AuraEnabled(cacheable=true)\n    public static List<Product2> searchProducts(String term) {\n        String cleaned = term == null ? '' : term.trim();\n        if (cleaned.length() < 2) {\n            return new List<Product2>();\n        }\n        String pattern = '%' + cleaned + '%';\n        return [\n            SELECT Id, Name, ProductCode\n            FROM Product2\n            WHERE IsActive = true AND Name LIKE :pattern\n            WITH USER_MODE\n            ORDER BY Name\n            LIMIT 20\n        ];\n    }\n}\n" },
    checks: [
      { re: /LIKE\s*:\s*\w+/i, msg: "Uses a bind variable with LIKE", file: "ProductFinderController.cls" },
      { re: /LIMIT\s+20/i, msg: "Limits to 20 rows", file: "ProductFinderController.cls" },
      { re: /length\s*\(\s*\)\s*<\s*2|<\s*2/, msg: "Rejects terms shorter than 2 characters", file: "ProductFinderController.cls" },
      { re: /IsActive\s*=\s*true/i, msg: "Returns only active products", file: "ProductFinderController.cls" },
      { re: /searchProducts\s*\(\s*\{\s*term\s*:/, msg: "Calls searchProducts imperatively with { term }", file: "productFinder.js" }
    ],
    forbid: [
      { re: /Database\.query\s*\(/i, msg: "Use static SOQL with a bind variable, not dynamic SOQL" }
    ],
    hints: ["Build the pattern in Apex: '%' + term + '%' and bind it with :pattern.", "Cacheable methods can still be called imperatively."],
    ai: "Verify the query is injection-safe (bind variable), null/short terms return an empty list, results are limited and active-only, and the UI distinguishes \"not searched yet\" from \"no results\"."
  },
  {
    id: "LW040",
    track: "lwc",
    level: "Medium",
    topic: "Imperative Apex",
    title: "Save inline edits from a datatable",
    task: "Hambleton Wines edits account ratings inline.\n- Apex `AccountRatingController.saveAccounts(List<Account> accounts)`: `@AuraEnabled`, updates only Id and Rating in ONE DML (`Database.update(list, false, AccessLevel.USER_MODE)` or `update as user`), throws `AuraHandledException` listing failures\n- LWC `accountRatingTable`: `@api accounts`, a `lightning-datatable` (key-field Id) with Rating editable; `onsave` handler sends `event.detail.draftValues` to Apex, shows a success toast, clears `draftValues` and dispatches `CustomEvent(\"refresh\")`",
    starter: { "accountRatingTable.js": "import { LightningElement, api } from 'lwc';\n\nexport default class AccountRatingTable extends LightningElement {\n    @api accounts = [];\n\n    // TODO\n}\n", "accountRatingTable.html": "<template>\n    <!-- TODO -->\n</template>\n", "AccountRatingController.cls": "public with sharing class AccountRatingController {\n    // TODO: saveAccounts(List<Account> accounts)\n}\n" },
    solution: { "accountRatingTable.js": "import { LightningElement, api } from 'lwc';\nimport { ShowToastEvent } from 'lightning/platformShowToastEvent';\nimport saveAccounts from '@salesforce/apex/AccountRatingController.saveAccounts';\n\nconst COLUMNS = [\n    { label: 'Account', fieldName: 'Name' },\n    { label: 'Rating', fieldName: 'Rating', editable: true }\n];\n\nexport default class AccountRatingTable extends LightningElement {\n    @api accounts = [];\n    columns = COLUMNS;\n    draftValues = [];\n\n    async handleSave(event) {\n        const updates = event.detail.draftValues.map(d => ({ Id: d.Id, Rating: d.Rating }));\n        try {\n            await saveAccounts({ accounts: updates });\n            this.draftValues = [];\n            this.dispatchEvent(new ShowToastEvent({ title: 'Saved', message: updates.length + ' account(s) updated', variant: 'success' }));\n            this.dispatchEvent(new CustomEvent('refresh'));\n        } catch (error) {\n            this.dispatchEvent(new ShowToastEvent({\n                title: 'Save failed',\n                message: error && error.body ? error.body.message : 'Unknown error',\n                variant: 'error'\n            }));\n        }\n    }\n}\n", "accountRatingTable.html": "<template>\n    <lightning-datatable key-field=\"Id\" data={accounts} columns={columns} draft-values={draftValues}\n        onsave={handleSave} hide-checkbox-column></lightning-datatable>\n</template>\n", "AccountRatingController.cls": "public with sharing class AccountRatingController {\n    @AuraEnabled\n    public static void saveAccounts(List<Account> accounts) {\n        List<Account> toUpdate = new List<Account>();\n        for (Account a : accounts) {\n            toUpdate.add(new Account(Id = a.Id, Rating = a.Rating));\n        }\n        List<Database.SaveResult> results = Database.update(toUpdate, false, AccessLevel.USER_MODE);\n        List<String> errors = new List<String>();\n        for (Integer i = 0; i < results.size(); i++) {\n            if (!results[i].isSuccess()) {\n                errors.add(toUpdate[i].Id + ': ' + results[i].getErrors()[0].getMessage());\n            }\n        }\n        if (!errors.isEmpty()) {\n            throw new AuraHandledException(String.join(errors, '; '));\n        }\n    }\n}\n" },
    checks: [
      { re: /onsave=\{\s*\w+\s*\}/i, msg: "Handles the datatable onsave event", file: "accountRatingTable.html" },
      { re: /draft-values=\{\s*\w+\s*\}/i, msg: "Binds draft-values", file: "accountRatingTable.html" },
      { re: /event\.detail\.draftValues/, msg: "Reads event.detail.draftValues", file: "accountRatingTable.js" },
      { re: /this\.draftValues\s*=\s*\[\s*\]/, msg: "Clears draftValues after save", file: "accountRatingTable.js" },
      { re: /editable\s*:\s*true/, msg: "Rating column is editable", file: "accountRatingTable.js" },
      { re: /Database\.update\s*\(|update\s+as\s+user/i, msg: "Performs one bulk update", file: "AccountRatingController.cls" }
    ],
    forbid: [
      { re: /for\s*\([^)]*\)\s*\{[^}]*\b(update|Database\.update)\b/i, msg: "No DML inside a loop" }
    ],
    hints: ["draftValues only contain the key field and changed fields.", "Partial success: Database.update(list, false, AccessLevel.USER_MODE) returns SaveResults."],
    ai: "Verify only Id and Rating are updated, DML is a single bulk call in user mode, failures are reported, and draft values are cleared only on success."
  },
  {
    id: "LW041",
    track: "lwc",
    level: "Hard",
    topic: "Imperative Apex",
    title: "Quote request with double-submit guard",
    task: "Ravensbourne Print creates quotes from Opportunities.\n- Apex `QuoteRequestController.createQuote(Id opportunityId, Decimal discountPercent)`: `@AuraEnabled`; discount must be 0–20 else throw `AuraHandledException`; insert a `Quote` (Name \"Quote – \" + Opportunity Name, OpportunityId) in user mode and return its Id\n- LWC `quoteRequest`: number input for discount, \"Create quote\" button\n- While saving: `isSaving = true`, button disabled, and re-entrant clicks ignored (`if (this.isSaving) return;`)\n- Show the server error inline (not a toast) and dispatch `CustomEvent(\"quotecreated\", { detail: { quoteId } })` on success",
    starter: { "quoteRequest.js": "import { LightningElement, api } from 'lwc';\n\nexport default class QuoteRequest extends LightningElement {\n    @api recordId;\n\n    // TODO\n}\n", "quoteRequest.html": "<template>\n    <!-- TODO -->\n</template>\n", "QuoteRequestController.cls": "public with sharing class QuoteRequestController {\n    // TODO: createQuote(Id opportunityId, Decimal discountPercent)\n}\n" },
    solution: { "quoteRequest.js": "import { LightningElement, api } from 'lwc';\nimport createQuote from '@salesforce/apex/QuoteRequestController.createQuote';\n\nexport default class QuoteRequest extends LightningElement {\n    @api recordId;\n    discount = 0;\n    isSaving = false;\n    errorMessage;\n\n    handleDiscount(event) {\n        this.discount = event.target.value;\n    }\n\n    async handleCreate() {\n        if (this.isSaving) return;\n        this.isSaving = true;\n        this.errorMessage = undefined;\n        try {\n            const quoteId = await createQuote({ opportunityId: this.recordId, discountPercent: Number(this.discount) });\n            this.dispatchEvent(new CustomEvent('quotecreated', { detail: { quoteId } }));\n        } catch (error) {\n            this.errorMessage = error && error.body ? error.body.message : 'Could not create the quote';\n        } finally {\n            this.isSaving = false;\n        }\n    }\n}\n", "quoteRequest.html": "<template>\n    <lightning-input type=\"number\" label=\"Discount %\" min=\"0\" max=\"20\" value={discount} onchange={handleDiscount}></lightning-input>\n    <template lwc:if={errorMessage}>\n        <p class=\"slds-text-color_error\">{errorMessage}</p>\n    </template>\n    <lightning-button variant=\"brand\" label=\"Create quote\" onclick={handleCreate} disabled={isSaving}></lightning-button>\n</template>\n", "QuoteRequestController.cls": "public with sharing class QuoteRequestController {\n    @AuraEnabled\n    public static Id createQuote(Id opportunityId, Decimal discountPercent) {\n        if (discountPercent == null || discountPercent < 0 || discountPercent > 20) {\n            throw new AuraHandledException('Discount must be between 0 and 20%.');\n        }\n        Opportunity opp = [SELECT Id, Name FROM Opportunity WHERE Id = :opportunityId WITH USER_MODE LIMIT 1];\n        Quote q = new Quote(Name = 'Quote – ' + opp.Name, OpportunityId = opp.Id);\n        try {\n            insert as user q;\n        } catch (DmlException e) {\n            throw new AuraHandledException(e.getDmlMessage(0));\n        }\n        return q.Id;\n    }\n}\n" },
    checks: [
      { re: /if\s*\(\s*this\.isSaving\s*\)\s*(return|\{\s*return)/, msg: "Ignores clicks while saving", file: "quoteRequest.js" },
      { re: /finally/, msg: "Resets isSaving in finally", file: "quoteRequest.js" },
      { re: /disabled=\{\s*isSaving\s*\}/i, msg: "Disables the button while saving", file: "quoteRequest.html" },
      { re: /new\s+CustomEvent\s*\(\s*['"]quotecreated['"]/, msg: "Dispatches CustomEvent('quotecreated')", file: "quoteRequest.js" },
      { re: /throw\s+new\s+AuraHandledException/, msg: "Throws AuraHandledException on bad discount", file: "QuoteRequestController.cls" },
      { re: />\s*20/, msg: "Enforces the 20% maximum", file: "QuoteRequestController.cls" }
    ],
    forbid: [
      { re: /ShowToastEvent/, msg: "Show the error inline, not as a toast", file: "quoteRequest.js" },
      { re: /'(001|003|006|500|00T|00Q)[A-Za-z0-9]{12,15}'/, msg: "No hard-coded record Ids" }
    ],
    hints: ["Check and set isSaving synchronously before the first await.", "Validate on the server even though the input has min/max."],
    ai: "Verify server-side validation (null, <0, >20), user-mode DML, the re-entrancy guard is set before awaiting, the error shows inline, and isSaving always resets."
  },
  {
    id: "LW042",
    track: "lwc",
    level: "Hard",
    topic: "Imperative Apex",
    title: "Account health with parallel Apex calls",
    task: "Saltire Utilities shows an account health card.\n- Apex `AccountHealthController` with two cacheable methods: `getOpenCaseCount(Id accountId)` returning Integer and `getPipelineTotal(Id accountId)` returning Decimal (sum of open Opportunity Amount, 0 when none), both `WITH USER_MODE`\n- LWC `accountHealth`: in `connectedCallback`, load BOTH in parallel with `Promise.all`, show a spinner while loading, then show both figures; if either fails show one error message\n- Getter `healthLabel`: \"At risk\" when open cases > 5, else \"Healthy\"",
    starter: { "accountHealth.js": "import { LightningElement, api } from 'lwc';\n\nexport default class AccountHealth extends LightningElement {\n    @api recordId;\n\n    // TODO\n}\n", "accountHealth.html": "<template>\n    <!-- TODO -->\n</template>\n", "AccountHealthController.cls": "public with sharing class AccountHealthController {\n    // TODO: getOpenCaseCount(Id accountId), getPipelineTotal(Id accountId)\n}\n" },
    solution: { "accountHealth.js": "import { LightningElement, api } from 'lwc';\nimport getOpenCaseCount from '@salesforce/apex/AccountHealthController.getOpenCaseCount';\nimport getPipelineTotal from '@salesforce/apex/AccountHealthController.getPipelineTotal';\n\nexport default class AccountHealth extends LightningElement {\n    @api recordId;\n    openCases;\n    pipeline;\n    isLoading = false;\n    error;\n\n    connectedCallback() {\n        this.loadHealth();\n    }\n\n    async loadHealth() {\n        this.isLoading = true;\n        try {\n            const [cases, pipeline] = await Promise.all([\n                getOpenCaseCount({ accountId: this.recordId }),\n                getPipelineTotal({ accountId: this.recordId })\n            ]);\n            this.openCases = cases;\n            this.pipeline = pipeline;\n            this.error = undefined;\n        } catch (e) {\n            this.error = e && e.body ? e.body.message : 'Could not load account health';\n        } finally {\n            this.isLoading = false;\n        }\n    }\n\n    get healthLabel() {\n        return this.openCases > 5 ? 'At risk' : 'Healthy';\n    }\n}\n", "accountHealth.html": "<template>\n    <lightning-card title=\"Account health\">\n        <div class=\"slds-p-horizontal_medium slds-is-relative\">\n            <template lwc:if={isLoading}>\n                <lightning-spinner alternative-text=\"Loading\"></lightning-spinner>\n            </template>\n            <template lwc:elseif={error}>\n                <p class=\"slds-text-color_error\">{error}</p>\n            </template>\n            <template lwc:else>\n                <p>Status: {healthLabel}</p>\n                <p>Open cases: {openCases}</p>\n                <p>Pipeline: <lightning-formatted-number value={pipeline} format-style=\"currency\" currency-code=\"GBP\"></lightning-formatted-number></p>\n            </template>\n        </div>\n    </lightning-card>\n</template>\n", "AccountHealthController.cls": "public with sharing class AccountHealthController {\n    @AuraEnabled(cacheable=true)\n    public static Integer getOpenCaseCount(Id accountId) {\n        return [SELECT COUNT() FROM Case WHERE AccountId = :accountId AND IsClosed = false WITH USER_MODE];\n    }\n\n    @AuraEnabled(cacheable=true)\n    public static Decimal getPipelineTotal(Id accountId) {\n        AggregateResult[] rows = [\n            SELECT SUM(Amount) total\n            FROM Opportunity\n            WHERE AccountId = :accountId AND IsClosed = false\n            WITH USER_MODE\n        ];\n        Decimal total = (Decimal) rows[0].get('total');\n        return total == null ? 0 : total;\n    }\n}\n" },
    checks: [
      { re: /Promise\.all\s*\(/, msg: "Loads both calls with Promise.all", file: "accountHealth.js" },
      { re: /connectedCallback\s*\(\s*\)/, msg: "Loads in connectedCallback", file: "accountHealth.js" },
      { re: /@salesforce\/apex\/AccountHealthController\.getOpenCaseCount/, msg: "Imports getOpenCaseCount", file: "accountHealth.js" },
      { re: /@salesforce\/apex\/AccountHealthController\.getPipelineTotal/, msg: "Imports getPipelineTotal", file: "accountHealth.js" },
      { re: /SUM\s*\(\s*Amount\s*\)/i, msg: "Sums Amount with an aggregate query", file: "AccountHealthController.cls" },
      { re: /COUNT\s*\(\s*\)/i, msg: "Counts cases with COUNT()", file: "AccountHealthController.cls" }
    ],
    forbid: [
      { re: /await\s+getOpenCaseCount[\s\S]*await\s+getPipelineTotal|await\s+getPipelineTotal[\s\S]*await\s+getOpenCaseCount/, msg: "Run the calls in parallel, not sequentially", file: "accountHealth.js" },
      { re: /for\s*\([^)]*\)\s*\{[^}]*\[\s*SELECT/i, msg: "No SOQL inside a loop" }
    ],
    hints: ["const [a, b] = await Promise.all([callA(...), callB(...)]);", "SUM() returns null when there are no rows — default to 0."],
    ai: "Verify the two calls run in parallel, a failure in either shows one error, the spinner always clears, the Apex uses aggregates (no looping over records) and null sums return 0."
  },
  {
    id: "LW043",
    track: "lwc",
    level: "Easy",
    topic: "Base components",
    title: "Supplier card with actions and footer",
    task: "Dales Dairy shows a supplier summary card.\nBuild `supplierCard` with `@api supplierName` and `@api lastDelivery`:\n- Use `lightning-card` with `title={supplierName}` and `icon-name=\"standard:account\"`\n- An \"Order\" `lightning-button` in the `actions` slot that dispatches `CustomEvent(\"order\")`\n- Body shows \"Last delivery: {lastDelivery}\"\n- A `footer` slot with the text \"Approved supplier\"",
    starter: { "supplierCard.js": "import { LightningElement, api } from 'lwc';\n\nexport default class SupplierCard extends LightningElement {\n    // TODO\n}\n", "supplierCard.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "supplierCard.js": "import { LightningElement, api } from 'lwc';\n\nexport default class SupplierCard extends LightningElement {\n    @api supplierName;\n    @api lastDelivery;\n\n    handleOrder() {\n        this.dispatchEvent(new CustomEvent('order'));\n    }\n}\n", "supplierCard.html": "<template>\n    <lightning-card title={supplierName} icon-name=\"standard:account\">\n        <lightning-button label=\"Order\" slot=\"actions\" onclick={handleOrder}></lightning-button>\n        <p class=\"slds-p-horizontal_small\">Last delivery: {lastDelivery}</p>\n        <p slot=\"footer\">Approved supplier</p>\n    </lightning-card>\n</template>\n" },
    checks: [
      { re: /<lightning-card[^>]*title=\{\s*supplierName\s*\}/i, msg: "lightning-card titled with supplierName", file: "supplierCard.html" },
      { re: /icon-name=["']standard:account["']/i, msg: "Uses the standard:account icon", file: "supplierCard.html" },
      { re: /slot=["']actions["']/i, msg: "Places the button in the actions slot", file: "supplierCard.html" },
      { re: /slot=["']footer["']/i, msg: "Uses the footer slot", file: "supplierCard.html" },
      { re: /new\s+CustomEvent\s*\(\s*['"]order['"]/, msg: "Dispatches CustomEvent('order')", file: "supplierCard.js" }
    ],
    forbid: [
      { re: /innerHTML/i, msg: "Don't touch innerHTML" }
    ],
    hints: ["Named slots: slot=\"actions\" and slot=\"footer\" on direct children of lightning-card."],
    ai: "Verify the slots are used on direct children of lightning-card, @api properties are exposed and the order event fires on click."
  },
  {
    id: "LW044",
    track: "lwc",
    level: "Easy",
    topic: "Base components",
    title: "Account summary with lightning-record-form",
    task: "Cumbria Outdoor Gear wants a read-only account summary on Account pages.\nBuild `accountSummaryForm`:\n- `@api recordId` and `@api objectApiName`\n- Use `lightning-record-form` in `mode=\"view\"` with 2 columns\n- Fields: Name, Phone, Website, Industry — imported from `@salesforce/schema` into a `fields` array (no string field names)",
    starter: { "accountSummaryForm.js": "import { LightningElement, api } from 'lwc';\n\nexport default class AccountSummaryForm extends LightningElement {\n    // TODO\n}\n", "accountSummaryForm.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "accountSummaryForm.js": "import { LightningElement, api } from 'lwc';\nimport NAME_FIELD from '@salesforce/schema/Account.Name';\nimport PHONE_FIELD from '@salesforce/schema/Account.Phone';\nimport WEBSITE_FIELD from '@salesforce/schema/Account.Website';\nimport INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';\n\nexport default class AccountSummaryForm extends LightningElement {\n    @api recordId;\n    @api objectApiName;\n    fields = [NAME_FIELD, PHONE_FIELD, WEBSITE_FIELD, INDUSTRY_FIELD];\n}\n", "accountSummaryForm.html": "<template>\n    <lightning-record-form record-id={recordId} object-api-name={objectApiName}\n        fields={fields} columns=\"2\" mode=\"view\"></lightning-record-form>\n</template>\n" },
    checks: [
      { re: /<lightning-record-form/i, msg: "Uses lightning-record-form", file: "accountSummaryForm.html" },
      { re: /record-id=\{\s*recordId\s*\}/i, msg: "Passes record-id", file: "accountSummaryForm.html" },
      { re: /mode=["']view["']/i, msg: "Uses view mode", file: "accountSummaryForm.html" },
      { re: /columns=["']2["']/i, msg: "Uses 2 columns", file: "accountSummaryForm.html" },
      { re: /@salesforce\/schema\/Account\.\w+/, msg: "Imports fields from @salesforce/schema", file: "accountSummaryForm.js" }
    ],
    forbid: [
      { re: /fields\s*=\s*\[\s*['"]/, msg: "Import schema fields instead of using strings", file: "accountSummaryForm.js" },
      { re: /'(001|003|006|500|00T|00Q)[A-Za-z0-9]{12,15}'/, msg: "No hard-coded record Ids" }
    ],
    hints: ["lightning-record-form needs record-id, object-api-name and fields (or layout-type)."],
    ai: "Verify schema imports are used for all four fields, the form is view mode with 2 columns, and the record context comes from @api properties."
  },
  {
    id: "LW045",
    track: "lwc",
    level: "Easy",
    topic: "Base components",
    title: "Delivery slot picker with combobox",
    task: "Greenwich Grocers lets customers choose a delivery slot.\nBuild `deliverySlotPicker`:\n- `lightning-combobox` labelled \"Delivery slot\" with options from a getter `slotOptions`: Morning (08:00–12:00), Afternoon (12:00–17:00), Evening (17:00–21:00) — values \"AM\", \"PM\", \"EVE\"\n- Store the selected value from `event.detail.value`\n- Getter `selectedLabel` shows the chosen option's label, or \"No slot chosen\"",
    starter: { "deliverySlotPicker.js": "import { LightningElement } from 'lwc';\n\nexport default class DeliverySlotPicker extends LightningElement {\n    // TODO\n}\n", "deliverySlotPicker.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "deliverySlotPicker.js": "import { LightningElement } from 'lwc';\n\nconst SLOTS = [\n    { label: 'Morning (08:00–12:00)', value: 'AM' },\n    { label: 'Afternoon (12:00–17:00)', value: 'PM' },\n    { label: 'Evening (17:00–21:00)', value: 'EVE' }\n];\n\nexport default class DeliverySlotPicker extends LightningElement {\n    value;\n\n    get slotOptions() {\n        return SLOTS;\n    }\n\n    handleChange(event) {\n        this.value = event.detail.value;\n    }\n\n    get selectedLabel() {\n        const slot = SLOTS.find(s => s.value === this.value);\n        return slot ? slot.label : 'No slot chosen';\n    }\n}\n", "deliverySlotPicker.html": "<template>\n    <lightning-combobox name=\"slot\" label=\"Delivery slot\" value={value} placeholder=\"Choose a slot\"\n        options={slotOptions} onchange={handleChange}></lightning-combobox>\n    <p>{selectedLabel}</p>\n</template>\n" },
    checks: [
      { re: /<lightning-combobox[^>]*options=\{\s*slotOptions\s*\}/i, msg: "Combobox uses slotOptions", file: "deliverySlotPicker.html" },
      { re: /event\.detail\.value/, msg: "Reads event.detail.value", file: "deliverySlotPicker.js" },
      { re: /get\s+selectedLabel\s*\(\s*\)/, msg: "Defines selectedLabel getter", file: "deliverySlotPicker.js" },
      { re: /['"]EVE['"]/, msg: "Includes the EVE option", file: "deliverySlotPicker.js" }
    ],
    forbid: [
      { re: /innerHTML/i, msg: "Don't touch innerHTML" }
    ],
    hints: ["Options are an array of { label, value }.", "Use Array.find to look up the label."],
    ai: "Verify options have the specified labels/values, the selection is stored from event.detail.value, and the fallback label shows before any choice."
  },
  {
    id: "LW046",
    track: "lwc",
    level: "Medium",
    topic: "Base components",
    title: "New contact with lightning-record-edit-form",
    task: "Trent Valley Vets adds contacts from the Account page.\nBuild `newContactForm` with `@api accountId`:\n- `lightning-record-edit-form` for Contact with `lightning-input-field`s FirstName, LastName, Email and AccountId (AccountId pre-filled with `value={accountId}`)\n- `lightning-messages` for errors and a submit `lightning-button`\n- `onsuccess`: show a success toast including the new id (`event.detail.id`) and dispatch `CustomEvent(\"contactcreated\", { detail: { id } })`",
    starter: { "newContactForm.js": "import { LightningElement, api } from 'lwc';\n\nexport default class NewContactForm extends LightningElement {\n    // TODO\n}\n", "newContactForm.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "newContactForm.js": "import { LightningElement, api } from 'lwc';\nimport { ShowToastEvent } from 'lightning/platformShowToastEvent';\nimport CONTACT_OBJECT from '@salesforce/schema/Contact';\nimport FIRSTNAME_FIELD from '@salesforce/schema/Contact.FirstName';\nimport LASTNAME_FIELD from '@salesforce/schema/Contact.LastName';\nimport EMAIL_FIELD from '@salesforce/schema/Contact.Email';\nimport ACCOUNT_FIELD from '@salesforce/schema/Contact.AccountId';\n\nexport default class NewContactForm extends LightningElement {\n    @api accountId;\n    contactObject = CONTACT_OBJECT;\n    firstNameField = FIRSTNAME_FIELD;\n    lastNameField = LASTNAME_FIELD;\n    emailField = EMAIL_FIELD;\n    accountField = ACCOUNT_FIELD;\n\n    handleSuccess(event) {\n        const id = event.detail.id;\n        this.dispatchEvent(new ShowToastEvent({ title: 'Contact created', message: 'Record ' + id + ' saved', variant: 'success' }));\n        this.dispatchEvent(new CustomEvent('contactcreated', { detail: { id } }));\n    }\n}\n", "newContactForm.html": "<template>\n    <lightning-record-edit-form object-api-name={contactObject} onsuccess={handleSuccess}>\n        <lightning-messages></lightning-messages>\n        <lightning-input-field field-name={firstNameField}></lightning-input-field>\n        <lightning-input-field field-name={lastNameField} required></lightning-input-field>\n        <lightning-input-field field-name={emailField}></lightning-input-field>\n        <lightning-input-field field-name={accountField} value={accountId}></lightning-input-field>\n        <lightning-button type=\"submit\" variant=\"brand\" label=\"Create contact\"></lightning-button>\n    </lightning-record-edit-form>\n</template>\n" },
    checks: [
      { re: /<lightning-record-edit-form[^>]*object-api-name=/i, msg: "Uses lightning-record-edit-form with object-api-name", file: "newContactForm.html" },
      { re: /<lightning-input-field[^>]*field-name=/i, msg: "Uses lightning-input-field", file: "newContactForm.html" },
      { re: /value=\{\s*accountId\s*\}/i, msg: "Pre-fills AccountId from accountId", file: "newContactForm.html" },
      { re: /onsuccess=\{\s*\w+\s*\}/i, msg: "Handles onsuccess", file: "newContactForm.html" },
      { re: /event\.detail\.id/, msg: "Reads the new id from event.detail.id", file: "newContactForm.js" },
      { re: /new\s+CustomEvent\s*\(\s*['"]contactcreated['"]/, msg: "Dispatches CustomEvent('contactcreated')", file: "newContactForm.js" }
    ],
    forbid: [
      { re: /'(001|003|006|500|00T|00Q)[A-Za-z0-9]{12,15}'/, msg: "No hard-coded record Ids" }
    ],
    hints: ["A lightning-button with type=\"submit\" inside the form submits it.", "The onsuccess event carries the saved record; its id is event.detail.id."],
    ai: "Verify the form creates (no record-id), AccountId is pre-filled, errors surface via lightning-messages, and both the toast and contactcreated event use the new id."
  },
  {
    id: "LW047",
    track: "lwc",
    level: "Medium",
    topic: "Base components",
    title: "Escalate a case by modifying fields on submit",
    task: "Moray Rail's escalation form must always set extra fields.\nBuild `caseEscalationForm` with `@api recordId`:\n- `lightning-record-edit-form` for Case (record-id bound) with fields Subject, Description, Reason\n- `onsubmit`: call `event.preventDefault()`, take `event.detail.fields`, force `Priority = \"High\"` and `Status = \"Escalated\"`, then submit with `this.template.querySelector(\"lightning-record-edit-form\").submit(fields)`\n- `onsuccess`: show a success toast",
    starter: { "caseEscalationForm.js": "import { LightningElement, api } from 'lwc';\n\nexport default class CaseEscalationForm extends LightningElement {\n    @api recordId;\n\n    // TODO\n}\n", "caseEscalationForm.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "caseEscalationForm.js": "import { LightningElement, api } from 'lwc';\nimport { ShowToastEvent } from 'lightning/platformShowToastEvent';\n\nexport default class CaseEscalationForm extends LightningElement {\n    @api recordId;\n\n    handleSubmit(event) {\n        event.preventDefault();\n        const fields = { ...event.detail.fields, Priority: 'High', Status: 'Escalated' };\n        this.template.querySelector('lightning-record-edit-form').submit(fields);\n    }\n\n    handleSuccess() {\n        this.dispatchEvent(new ShowToastEvent({ title: 'Case escalated', message: 'Priority set to High', variant: 'success' }));\n    }\n}\n", "caseEscalationForm.html": "<template>\n    <lightning-record-edit-form record-id={recordId} object-api-name=\"Case\" onsubmit={handleSubmit} onsuccess={handleSuccess}>\n        <lightning-messages></lightning-messages>\n        <lightning-input-field field-name=\"Subject\"></lightning-input-field>\n        <lightning-input-field field-name=\"Description\"></lightning-input-field>\n        <lightning-input-field field-name=\"Reason\"></lightning-input-field>\n        <lightning-button type=\"submit\" variant=\"destructive\" label=\"Escalate\"></lightning-button>\n    </lightning-record-edit-form>\n</template>\n" },
    checks: [
      { re: /onsubmit=\{\s*\w+\s*\}/i, msg: "Handles onsubmit", file: "caseEscalationForm.html" },
      { re: /preventDefault\s*\(\s*\)/, msg: "Prevents the default submit", file: "caseEscalationForm.js" },
      { re: /event\.detail\.fields/, msg: "Reads event.detail.fields", file: "caseEscalationForm.js" },
      { re: /Priority\s*[:=]\s*['"]High['"]/, msg: "Forces Priority to High", file: "caseEscalationForm.js" },
      { re: /\.submit\s*\(\s*\w+\s*\)/, msg: "Re-submits the modified fields", file: "caseEscalationForm.js" }
    ],
    forbid: [
      { re: /updateRecord\s*\(/, msg: "Use the form submit, not a separate updateRecord call" },
      { re: /'(001|003|006|500|00T|00Q)[A-Za-z0-9]{12,15}'/, msg: "No hard-coded record Ids" }
    ],
    hints: ["preventDefault stops the original save so you can change the fields.", "this.template.querySelector('lightning-record-edit-form').submit(fields)"],
    ai: "Verify the default submit is prevented, both forced fields are added, the modified fields are submitted via the form, and success shows a toast."
  },
  {
    id: "LW048",
    track: "lwc",
    level: "Hard",
    topic: "Base components",
    title: "Datatable with view and delete row actions",
    task: "Lothian Lettings manages tenancy contacts in a table.\nBuild `tenantTable` with a public `contacts` property (getter/setter storing a private COPY):\n- `lightning-datatable` key-field Id, columns Name, Email, Phone and a `type: \"action\"` column with row actions View and Delete\n- `onrowaction`: \"view\" sets `selectedContact` and shows its details below; \"delete\" calls `deleteRecord(row.Id)` from `lightning/uiRecordApi`, removes the row immutably, shows a success toast; on error an error toast",
    starter: { "tenantTable.js": "import { LightningElement, api } from 'lwc';\n\nexport default class TenantTable extends LightningElement {\n    // TODO\n}\n", "tenantTable.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "tenantTable.js": "import { LightningElement, api } from 'lwc';\nimport { deleteRecord } from 'lightning/uiRecordApi';\nimport { ShowToastEvent } from 'lightning/platformShowToastEvent';\n\nconst ACTIONS = [\n    { label: 'View', name: 'view' },\n    { label: 'Delete', name: 'delete' }\n];\n\nconst COLUMNS = [\n    { label: 'Name', fieldName: 'Name' },\n    { label: 'Email', fieldName: 'Email', type: 'email' },\n    { label: 'Phone', fieldName: 'Phone', type: 'phone' },\n    { type: 'action', typeAttributes: { rowActions: ACTIONS } }\n];\n\nexport default class TenantTable extends LightningElement {\n    columns = COLUMNS;\n    rows = [];\n    selectedContact;\n\n    @api\n    get contacts() {\n        return this.rows;\n    }\n    set contacts(value) {\n        this.rows = value ? [...value] : [];\n    }\n\n    handleRowAction(event) {\n        const actionName = event.detail.action.name;\n        const row = event.detail.row;\n        switch (actionName) {\n            case 'view':\n                this.selectedContact = row;\n                break;\n            case 'delete':\n                this.deleteRow(row);\n                break;\n            default:\n        }\n    }\n\n    async deleteRow(row) {\n        try {\n            await deleteRecord(row.Id);\n            this.rows = this.rows.filter(r => r.Id !== row.Id);\n            if (this.selectedContact && this.selectedContact.Id === row.Id) this.selectedContact = undefined;\n            this.dispatchEvent(new ShowToastEvent({ title: 'Deleted', message: row.Name + ' was deleted', variant: 'success' }));\n        } catch (error) {\n            this.dispatchEvent(new ShowToastEvent({\n                title: 'Delete failed',\n                message: error && error.body ? error.body.message : 'Unknown error',\n                variant: 'error'\n            }));\n        }\n    }\n}\n", "tenantTable.html": "<template>\n    <lightning-datatable key-field=\"Id\" data={rows} columns={columns}\n        onrowaction={handleRowAction} hide-checkbox-column></lightning-datatable>\n    <template lwc:if={selectedContact}>\n        <div class=\"slds-box slds-m-top_small\">\n            <p>{selectedContact.Name}</p>\n            <p>{selectedContact.Email}</p>\n            <p>{selectedContact.Phone}</p>\n        </div>\n    </template>\n</template>\n" },
    checks: [
      { re: /type\s*:\s*['"]action['"]/, msg: "Adds an action column", file: "tenantTable.js" },
      { re: /rowActions/, msg: "Defines rowActions", file: "tenantTable.js" },
      { re: /event\.detail\.action\.name/, msg: "Reads event.detail.action.name", file: "tenantTable.js" },
      { re: /import\s*\{[^}]*deleteRecord[^}]*\}\s*from\s*['"]lightning\/uiRecordApi['"]/, msg: "Imports deleteRecord", file: "tenantTable.js" },
      { re: /\.filter\s*\(/, msg: "Removes the row immutably with filter", file: "tenantTable.js" },
      { re: /onrowaction=\{\s*\w+\s*\}/i, msg: "Handles onrowaction", file: "tenantTable.html" }
    ],
    forbid: [
      { re: /\.splice\s*\(/, msg: "Remove rows immutably, not with splice" },
      { re: /if:(true|false)\s*=/i, msg: "Use lwc:if / lwc:else, not the legacy if:true / if:false" }
    ],
    hints: ["Row action columns: { type: \"action\", typeAttributes: { rowActions } }.", "event.detail gives you both action and row.", "Only remove the row after deleteRecord resolves."],
    ai: "Verify the public setter copies the data, the row is only removed after a successful delete, selection clears when its row is deleted, and errors show a toast."
  },
  {
    id: "LW049",
    track: "lwc",
    level: "Hard",
    topic: "Base components",
    title: "Claim form with error handling and reset",
    task: "Hardwick Insurance logs claims on a custom object `Claim__c`.\nBuild `claimEntryForm` with `@api policyId`:\n- `lightning-record-edit-form` for `Claim__c` with input fields Policy__c (pre-filled from policyId), Incident_Date__c, Amount__c, Description__c\n- `lightning-messages`; a spinner while saving (`isSaving` set in `onsubmit`, cleared in `onsuccess`/`onerror`)\n- `onerror`: show an error toast with `event.detail.message`\n- `onsuccess`: success toast, then reset every `lightning-input-field` via `.reset()` (Policy keeps its value)\n- A Cancel button also resets the fields",
    starter: { "claimEntryForm.js": "import { LightningElement, api } from 'lwc';\n\nexport default class ClaimEntryForm extends LightningElement {\n    @api policyId;\n\n    // TODO\n}\n", "claimEntryForm.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "claimEntryForm.js": "import { LightningElement, api } from 'lwc';\nimport { ShowToastEvent } from 'lightning/platformShowToastEvent';\n\nexport default class ClaimEntryForm extends LightningElement {\n    @api policyId;\n    isSaving = false;\n\n    handleSubmit() {\n        this.isSaving = true;\n    }\n\n    handleSuccess(event) {\n        this.isSaving = false;\n        this.dispatchEvent(new ShowToastEvent({ title: 'Claim logged', message: 'Claim ' + event.detail.id + ' created', variant: 'success' }));\n        this.resetFields();\n    }\n\n    handleError(event) {\n        this.isSaving = false;\n        this.dispatchEvent(new ShowToastEvent({ title: 'Could not save claim', message: event.detail.message, variant: 'error' }));\n    }\n\n    handleCancel() {\n        this.resetFields();\n    }\n\n    resetFields() {\n        this.template.querySelectorAll('lightning-input-field').forEach(field => field.reset());\n    }\n}\n", "claimEntryForm.html": "<template>\n    <lightning-record-edit-form object-api-name=\"Claim__c\" onsubmit={handleSubmit} onsuccess={handleSuccess} onerror={handleError}>\n        <template lwc:if={isSaving}>\n            <lightning-spinner alternative-text=\"Saving\"></lightning-spinner>\n        </template>\n        <lightning-messages></lightning-messages>\n        <lightning-input-field field-name=\"Policy__c\" value={policyId}></lightning-input-field>\n        <lightning-input-field field-name=\"Incident_Date__c\" required></lightning-input-field>\n        <lightning-input-field field-name=\"Amount__c\" required></lightning-input-field>\n        <lightning-input-field field-name=\"Description__c\"></lightning-input-field>\n        <lightning-button label=\"Cancel\" onclick={handleCancel}></lightning-button>\n        <lightning-button type=\"submit\" variant=\"brand\" label=\"Save claim\" disabled={isSaving}></lightning-button>\n    </lightning-record-edit-form>\n</template>\n" },
    checks: [
      { re: /<lightning-messages/i, msg: "Includes lightning-messages", file: "claimEntryForm.html" },
      { re: /onerror=\{\s*\w+\s*\}/i, msg: "Handles onerror", file: "claimEntryForm.html" },
      { re: /onsuccess=\{\s*\w+\s*\}/i, msg: "Handles onsuccess", file: "claimEntryForm.html" },
      { re: /querySelectorAll\s*\(\s*['"]lightning-input-field['"]\s*\)/, msg: "Selects all lightning-input-field elements", file: "claimEntryForm.js" },
      { re: /\.reset\s*\(\s*\)/, msg: "Resets the fields", file: "claimEntryForm.js" },
      { re: /event\.detail\.message/, msg: "Shows event.detail.message on error", file: "claimEntryForm.js" }
    ],
    forbid: [
      { re: /if:(true|false)\s*=/i, msg: "Use lwc:if / lwc:else, not the legacy if:true / if:false" },
      { re: /'(001|003|006|500|00T|00Q)[A-Za-z0-9]{12,15}'/, msg: "No hard-coded record Ids" }
    ],
    hints: ["reset() restores each field to its initial value — Policy keeps policyId.", "Clear isSaving in both onsuccess and onerror."],
    ai: "Verify the spinner state is cleared on both success and error, all input fields reset on success and Cancel, and the error toast uses event.detail.message."
  },
  {
    id: "LW050",
    track: "lwc",
    level: "Easy",
    topic: "Navigation",
    title: "Navigate to an account record page",
    task: "Lindisfarne Travel shows a \"View account\" button on booking cards.\nBuild `viewAccountButton` with `@api accountId`:\n- Extend `NavigationMixin(LightningElement)`\n- On click, navigate with `this[NavigationMixin.Navigate]` to a `standard__recordPage` for the account with `actionName: \"view\"`\n- Disable the button when accountId is blank",
    starter: { "viewAccountButton.js": "import { LightningElement, api } from 'lwc';\n\nexport default class ViewAccountButton extends LightningElement {\n    @api accountId;\n\n    // TODO\n}\n", "viewAccountButton.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "viewAccountButton.js": "import { LightningElement, api } from 'lwc';\nimport { NavigationMixin } from 'lightning/navigation';\n\nexport default class ViewAccountButton extends NavigationMixin(LightningElement) {\n    @api accountId;\n\n    get isDisabled() {\n        return !this.accountId;\n    }\n\n    handleClick() {\n        this[NavigationMixin.Navigate]({\n            type: 'standard__recordPage',\n            attributes: {\n                recordId: this.accountId,\n                objectApiName: 'Account',\n                actionName: 'view'\n            }\n        });\n    }\n}\n", "viewAccountButton.html": "<template>\n    <lightning-button label=\"View account\" onclick={handleClick} disabled={isDisabled}></lightning-button>\n</template>\n" },
    checks: [
      { re: /import\s*\{\s*NavigationMixin\s*\}\s*from\s*['"]lightning\/navigation['"]/, msg: "Imports NavigationMixin from lightning/navigation" },
      { re: /extends\s+NavigationMixin\s*\(\s*LightningElement\s*\)/, msg: "Extends NavigationMixin(LightningElement)" },
      { re: /this\s*\[\s*NavigationMixin\.Navigate\s*\]\s*\(/, msg: "Calls this[NavigationMixin.Navigate]", file: "viewAccountButton.js" },
      { re: /['"]standard__recordPage['"]/, msg: "Uses a standard__recordPage reference", file: "viewAccountButton.js" },
      { re: /actionName\s*:\s*['"]view['"]/, msg: "Uses actionName 'view'", file: "viewAccountButton.js" }
    ],
    forbid: [
      { re: /window\.location|window\.open\s*\(/, msg: "Use NavigationMixin, not window.location / window.open" },
      { re: /'(001|003|006|500|00T|00Q)[A-Za-z0-9]{12,15}'/, msg: "No hard-coded record Ids" }
    ],
    hints: ["class X extends NavigationMixin(LightningElement)", "Page reference: { type, attributes: { recordId, objectApiName, actionName } }"],
    ai: "Verify the mixin is applied, the page reference is a correct standard__recordPage, and the button is disabled without an id."
  },
  {
    id: "LW051",
    track: "lwc",
    level: "Easy",
    topic: "Navigation",
    title: "Open a filtered list view",
    task: "Shetland Seafood's home page needs a \"My open cases\" link.\nBuild `openCasesLink`:\n- A `lightning-button` labelled \"My open cases\"\n- Navigate to the Case object page with `type: \"standard__objectPage\"`, `actionName: \"list\"` and `state: { filterName: \"My_Open_Cases\" }`\n- Use NavigationMixin (no hard-coded URLs)",
    starter: { "openCasesLink.js": "import { LightningElement } from 'lwc';\n\nexport default class OpenCasesLink extends LightningElement {\n    // TODO\n}\n", "openCasesLink.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "openCasesLink.js": "import { LightningElement } from 'lwc';\nimport { NavigationMixin } from 'lightning/navigation';\n\nexport default class OpenCasesLink extends NavigationMixin(LightningElement) {\n    handleClick() {\n        this[NavigationMixin.Navigate]({\n            type: 'standard__objectPage',\n            attributes: {\n                objectApiName: 'Case',\n                actionName: 'list'\n            },\n            state: {\n                filterName: 'My_Open_Cases'\n            }\n        });\n    }\n}\n", "openCasesLink.html": "<template>\n    <lightning-button label=\"My open cases\" onclick={handleClick}></lightning-button>\n</template>\n" },
    checks: [
      { re: /extends\s+NavigationMixin\s*\(\s*LightningElement\s*\)/, msg: "Extends NavigationMixin(LightningElement)" },
      { re: /['"]standard__objectPage['"]/, msg: "Uses standard__objectPage", file: "openCasesLink.js" },
      { re: /actionName\s*:\s*['"]list['"]/, msg: "Uses actionName 'list'", file: "openCasesLink.js" },
      { re: /filterName\s*:\s*['"]My_Open_Cases['"]/, msg: "Sets filterName in state", file: "openCasesLink.js" },
      { re: /NavigationMixin\.Navigate/, msg: "Navigates with NavigationMixin.Navigate", file: "openCasesLink.js" }
    ],
    forbid: [
      { re: /window\.location|window\.open\s*\(/, msg: "Use NavigationMixin, not window.location / window.open" },
      { re: /\/lightning\/o\//, msg: "No hard-coded Lightning URLs" }
    ],
    hints: ["List view filters go in the state object, not attributes."],
    ai: "Verify the page reference type, actionName and state.filterName are correct and no URL strings are built manually."
  },
  {
    id: "LW052",
    track: "lwc",
    level: "Easy",
    topic: "Navigation",
    title: "Named page and custom tab navigation",
    task: "Orkney Broadband's utility bar has two shortcuts.\nBuild `quickLinks` with two buttons:\n- \"Home\" → `type: \"standard__namedPage\"`, `pageName: \"home\"`\n- \"Support Centre\" → `type: \"standard__navItemPage\"`, `apiName: \"Support_Centre\"` (a custom Lightning tab)\n- Use ONE helper method `navigate(pageReference)` that calls `this[NavigationMixin.Navigate]`",
    starter: { "quickLinks.js": "import { LightningElement } from 'lwc';\n\nexport default class QuickLinks extends LightningElement {\n    // TODO\n}\n", "quickLinks.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "quickLinks.js": "import { LightningElement } from 'lwc';\nimport { NavigationMixin } from 'lightning/navigation';\n\nexport default class QuickLinks extends NavigationMixin(LightningElement) {\n    navigate(pageReference) {\n        this[NavigationMixin.Navigate](pageReference);\n    }\n\n    handleHome() {\n        this.navigate({ type: 'standard__namedPage', attributes: { pageName: 'home' } });\n    }\n\n    handleSupport() {\n        this.navigate({ type: 'standard__navItemPage', attributes: { apiName: 'Support_Centre' } });\n    }\n}\n", "quickLinks.html": "<template>\n    <lightning-button label=\"Home\" onclick={handleHome}></lightning-button>\n    <lightning-button label=\"Support Centre\" onclick={handleSupport}></lightning-button>\n</template>\n" },
    checks: [
      { re: /extends\s+NavigationMixin\s*\(\s*LightningElement\s*\)/, msg: "Extends NavigationMixin(LightningElement)" },
      { re: /['"]standard__namedPage['"]/, msg: "Uses standard__namedPage", file: "quickLinks.js" },
      { re: /pageName\s*:\s*['"]home['"]/, msg: "Uses pageName 'home'", file: "quickLinks.js" },
      { re: /['"]standard__navItemPage['"]/, msg: "Uses standard__navItemPage", file: "quickLinks.js" },
      { re: /apiName\s*:\s*['"]Support_Centre['"]/, msg: "Targets apiName 'Support_Centre'", file: "quickLinks.js" }
    ],
    forbid: [
      { re: /window\.location|window\.open\s*\(/, msg: "Use NavigationMixin, not window.location / window.open" }
    ],
    hints: ["Both page types put their key value inside attributes."],
    ai: "Verify both page references are correctly shaped (attributes.pageName / attributes.apiName) and navigation goes through a single helper."
  },
  {
    id: "LW053",
    track: "lwc",
    level: "Medium",
    topic: "Navigation",
    title: "New record page with default values",
    task: "Brecklands Farm Supplies creates Opportunities from an Account page with sensible defaults.\nBuild `newOpportunityButton` with `@api recordId` (the Account):\n- Navigate to `standard__objectPage` for Opportunity with `actionName: \"new\"`\n- Pre-fill AccountId = recordId, StageName = \"Prospecting\", CloseDate = today + 30 days (YYYY-MM-DD) using `encodeDefaultFieldValues` from `lightning/pageReferenceUtils` in `state.defaultFieldValues`",
    starter: { "newOpportunityButton.js": "import { LightningElement, api } from 'lwc';\n\nexport default class NewOpportunityButton extends LightningElement {\n    @api recordId;\n\n    // TODO\n}\n", "newOpportunityButton.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "newOpportunityButton.js": "import { LightningElement, api } from 'lwc';\nimport { NavigationMixin } from 'lightning/navigation';\nimport { encodeDefaultFieldValues } from 'lightning/pageReferenceUtils';\n\nexport default class NewOpportunityButton extends NavigationMixin(LightningElement) {\n    @api recordId;\n\n    get closeDate() {\n        const d = new Date();\n        d.setDate(d.getDate() + 30);\n        return d.toISOString().slice(0, 10);\n    }\n\n    handleNew() {\n        const defaultValues = encodeDefaultFieldValues({\n            AccountId: this.recordId,\n            StageName: 'Prospecting',\n            CloseDate: this.closeDate\n        });\n        this[NavigationMixin.Navigate]({\n            type: 'standard__objectPage',\n            attributes: {\n                objectApiName: 'Opportunity',\n                actionName: 'new'\n            },\n            state: {\n                defaultFieldValues: defaultValues\n            }\n        });\n    }\n}\n", "newOpportunityButton.html": "<template>\n    <lightning-button variant=\"brand\" label=\"New opportunity\" onclick={handleNew}></lightning-button>\n</template>\n" },
    checks: [
      { re: /extends\s+NavigationMixin\s*\(\s*LightningElement\s*\)/, msg: "Extends NavigationMixin(LightningElement)" },
      { re: /import\s*\{\s*encodeDefaultFieldValues\s*\}\s*from\s*['"]lightning\/pageReferenceUtils['"]/, msg: "Imports encodeDefaultFieldValues", file: "newOpportunityButton.js" },
      { re: /actionName\s*:\s*['"]new['"]/, msg: "Uses actionName 'new'", file: "newOpportunityButton.js" },
      { re: /defaultFieldValues\s*:/, msg: "Passes state.defaultFieldValues", file: "newOpportunityButton.js" },
      { re: /AccountId\s*:\s*this\.recordId/, msg: "Defaults AccountId to recordId", file: "newOpportunityButton.js" },
      { re: /\+\s*30/, msg: "Close date is 30 days out", file: "newOpportunityButton.js" }
    ],
    forbid: [
      { re: /window\.location|window\.open\s*\(/, msg: "Use NavigationMixin, not window.location / window.open" },
      { re: /'(001|003|006|500|00T|00Q)[A-Za-z0-9]{12,15}'/, msg: "No hard-coded record Ids" }
    ],
    hints: ["encodeDefaultFieldValues turns an object into the encoded string the page expects.", "Date: setDate(getDate() + 30) then toISOString().slice(0, 10)."],
    ai: "Verify the page reference is a standard__objectPage new action with encoded defaults including AccountId, StageName and a correctly formatted close date."
  },
  {
    id: "LW054",
    track: "lwc",
    level: "Medium",
    topic: "Navigation",
    title: "Generate a real href with GenerateUrl",
    task: "Pevensey Property wants record links that support right-click → open in new tab.\nBuild `propertyLink` with `@api propertyId` and `@api label`:\n- In `connectedCallback`, build a `standard__recordPage` reference (objectApiName `Property__c`, actionName `view`) and call `this[NavigationMixin.GenerateUrl](pageRef)` to set an `url` field\n- Render `<a href={url} onclick={handleClick}>{label}</a>`\n- `handleClick`: `preventDefault()` and navigate with `NavigationMixin.Navigate` (so normal clicks stay in the SPA)",
    starter: { "propertyLink.js": "import { LightningElement, api } from 'lwc';\n\nexport default class PropertyLink extends LightningElement {\n    @api propertyId;\n    @api label;\n\n    // TODO\n}\n", "propertyLink.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "propertyLink.js": "import { LightningElement, api } from 'lwc';\nimport { NavigationMixin } from 'lightning/navigation';\n\nexport default class PropertyLink extends NavigationMixin(LightningElement) {\n    @api propertyId;\n    @api label;\n    url;\n    pageRef;\n\n    connectedCallback() {\n        this.pageRef = {\n            type: 'standard__recordPage',\n            attributes: {\n                recordId: this.propertyId,\n                objectApiName: 'Property__c',\n                actionName: 'view'\n            }\n        };\n        this[NavigationMixin.GenerateUrl](this.pageRef).then(url => {\n            this.url = url;\n        });\n    }\n\n    handleClick(event) {\n        event.preventDefault();\n        event.stopPropagation();\n        this[NavigationMixin.Navigate](this.pageRef);\n    }\n}\n", "propertyLink.html": "<template>\n    <a href={url} onclick={handleClick}>{label}</a>\n</template>\n" },
    checks: [
      { re: /extends\s+NavigationMixin\s*\(\s*LightningElement\s*\)/, msg: "Extends NavigationMixin(LightningElement)" },
      { re: /this\s*\[\s*NavigationMixin\.GenerateUrl\s*\]\s*\(/, msg: "Calls NavigationMixin.GenerateUrl", file: "propertyLink.js" },
      { re: /connectedCallback\s*\(\s*\)/, msg: "Generates the URL in connectedCallback", file: "propertyLink.js" },
      { re: /preventDefault\s*\(\s*\)/, msg: "Prevents the default link click", file: "propertyLink.js" },
      { re: /<a[^>]*href=\{\s*\w+\s*\}/i, msg: "Binds href to the generated URL", file: "propertyLink.html" }
    ],
    forbid: [
      { re: /window\.location|window\.open\s*\(/, msg: "Use NavigationMixin, not window.location / window.open" },
      { re: /href=["']\/lightning/i, msg: "Do not hard-code Lightning URLs" }
    ],
    hints: ["GenerateUrl returns a Promise resolving to the URL string.", "Keep the page reference in a field so the click handler can reuse it."],
    ai: "Verify GenerateUrl is used for the href, the click handler prevents default and navigates with the same page reference, and no URLs are built by hand."
  },
  {
    id: "LW055",
    track: "lwc",
    level: "Hard",
    topic: "Navigation",
    title: "Create a record then navigate to it",
    task: "Grampian Distillers logs cask sales as Opportunities.\nBuild `quickOpportunity` with `@api recordId` (Account):\n- Inputs: Name (required) and Amount (number, min 0)\n- On Save: validate inputs; call `createRecord({ apiName, fields })` from `lightning/uiRecordApi` using schema imports (Opportunity object and Name, Amount, StageName, CloseDate, AccountId fields); StageName \"Qualification\", CloseDate today + 14 days\n- On success navigate to the new record's page (`standard__recordPage`, view) using the returned `id`\n- On error show an error toast; prevent double clicks with `isSaving`",
    starter: { "quickOpportunity.js": "import { LightningElement, api } from 'lwc';\n\nexport default class QuickOpportunity extends LightningElement {\n    @api recordId;\n\n    // TODO\n}\n", "quickOpportunity.html": "<template>\n    <!-- TODO -->\n</template>\n" },
    solution: { "quickOpportunity.js": "import { LightningElement, api } from 'lwc';\nimport { NavigationMixin } from 'lightning/navigation';\nimport { createRecord } from 'lightning/uiRecordApi';\nimport { ShowToastEvent } from 'lightning/platformShowToastEvent';\nimport OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity';\nimport NAME_FIELD from '@salesforce/schema/Opportunity.Name';\nimport AMOUNT_FIELD from '@salesforce/schema/Opportunity.Amount';\nimport STAGE_FIELD from '@salesforce/schema/Opportunity.StageName';\nimport CLOSE_DATE_FIELD from '@salesforce/schema/Opportunity.CloseDate';\nimport ACCOUNT_FIELD from '@salesforce/schema/Opportunity.AccountId';\n\nexport default class QuickOpportunity extends NavigationMixin(LightningElement) {\n    @api recordId;\n    name = '';\n    amount;\n    isSaving = false;\n\n    handleName(event) {\n        this.name = event.target.value;\n    }\n\n    handleAmount(event) {\n        this.amount = event.target.value;\n    }\n\n    get closeDate() {\n        const d = new Date();\n        d.setDate(d.getDate() + 14);\n        return d.toISOString().slice(0, 10);\n    }\n\n    async handleSave() {\n        if (this.isSaving) return;\n        const allValid = [...this.template.querySelectorAll('lightning-input')].reduce((ok, input) => {\n            input.reportValidity();\n            return ok && input.checkValidity();\n        }, true);\n        if (!allValid) return;\n\n        const fields = {\n            [NAME_FIELD.fieldApiName]: this.name,\n            [AMOUNT_FIELD.fieldApiName]: this.amount ? Number(this.amount) : null,\n            [STAGE_FIELD.fieldApiName]: 'Qualification',\n            [CLOSE_DATE_FIELD.fieldApiName]: this.closeDate,\n            [ACCOUNT_FIELD.fieldApiName]: this.recordId\n        };\n\n        this.isSaving = true;\n        try {\n            const record = await createRecord({ apiName: OPPORTUNITY_OBJECT.objectApiName, fields });\n            this[NavigationMixin.Navigate]({\n                type: 'standard__recordPage',\n                attributes: { recordId: record.id, objectApiName: 'Opportunity', actionName: 'view' }\n            });\n        } catch (error) {\n            this.dispatchEvent(new ShowToastEvent({\n                title: 'Could not create opportunity',\n                message: error && error.body ? error.body.message : 'Unknown error',\n                variant: 'error'\n            }));\n        } finally {\n            this.isSaving = false;\n        }\n    }\n}\n", "quickOpportunity.html": "<template>\n    <lightning-input label=\"Name\" value={name} required onchange={handleName}></lightning-input>\n    <lightning-input type=\"number\" label=\"Amount\" min=\"0\" step=\"0.01\" value={amount} onchange={handleAmount}></lightning-input>\n    <lightning-button variant=\"brand\" label=\"Save\" onclick={handleSave} disabled={isSaving}></lightning-button>\n</template>\n" },
    checks: [
      { re: /import\s*\{[^}]*createRecord[^}]*\}\s*from\s*['"]lightning\/uiRecordApi['"]/, msg: "Imports createRecord", file: "quickOpportunity.js" },
      { re: /createRecord\s*\(\s*\{\s*apiName\s*:/, msg: "Calls createRecord({ apiName, fields })", file: "quickOpportunity.js" },
      { re: /@salesforce\/schema\/Opportunity['"]/, msg: "Imports the Opportunity object schema", file: "quickOpportunity.js" },
      { re: /extends\s+NavigationMixin\s*\(\s*LightningElement\s*\)/, msg: "Extends NavigationMixin(LightningElement)" },
      { re: /recordId\s*:\s*\w+\.id/, msg: "Navigates to the created record id", file: "quickOpportunity.js" },
      { re: /reportValidity\s*\(/, msg: "Validates inputs before saving", file: "quickOpportunity.js" }
    ],
    forbid: [
      { re: /window\.location|window\.open\s*\(/, msg: "Use NavigationMixin, not window.location / window.open" },
      { re: /'(001|003|006|500|00T|00Q)[A-Za-z0-9]{12,15}'/, msg: "No hard-coded record Ids" }
    ],
    hints: ["Use FIELD.fieldApiName as computed keys in the fields object.", "createRecord resolves with the new record; its id is record.id.", "Navigate only after the promise resolves."],
    ai: "Verify inputs are validated, fields use schema imports, navigation happens only after a successful create with the returned id, errors show a toast, and double submits are blocked."
  }
);
