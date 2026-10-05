# S1 · Sales Cloud design: lead routing and conversion

**Level:** Medium · **Time:** 25 min

## Brief

Leads arrive from the website and events. Route UK logistics leads to a regional team round-robin, others to an inside-sales queue; on conversion, copy fleet size and source to the opportunity and create a discovery task.

## Answer

- Web-to-lead or API; duplicate and matching rules on email and company.
- **Lead assignment rules**: UK + Industry = Logistics → regional queue; else inside sales.
- Round-robin: Omni-Channel routing for leads, or a Flow that assigns by a counter in custom metadata.
- **Lead field mapping**: Fleet_Size__c and Lead Source mapped to Account and Opportunity fields.
- After-save flow on Opportunity created from conversion → create Discovery task.
- Path on Lead and Opportunity with guidance; Einstein lead scoring if licensed.

## Talk track

Standard features first (assignment rules, field mapping), automation only for gaps.

## Likely follow-ups

- How do you report conversion rates by source?
