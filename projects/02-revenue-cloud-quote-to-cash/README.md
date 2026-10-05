# Project 2 · Revenue Cloud Quote-to-Cash & Product Architecture

**Scenario:** Nimbus Fleet sells GPS trackers (one-off), per-vehicle subscriptions (annual or monthly), add-ons and onboarding. Reps quoted from spreadsheets, discounts leaked, orders were re-keyed and mid-term changes were mis-prorated.

**Solution:** A Revenue Cloud (RLM) catalog with a Telematics Device classification (Connectivity, Mount Type attributes), three product selling models (One Time, Annual Term, Monthly Evergreen) and a Fleet Starter Kit bundle; a cloned pricing procedure (list → 5G uplift → volume tiers → partner discount via decision table on an extended context definition → manual discount); Flow approvals above 20%; quote → order → assets with co-termed, prorated amendments.

See [`architecture.txt`](architecture.txt).

## Pricing test oracle

[`pricing_test_oracle.csv`](pricing_test_oracle.csv) holds hand-calculated expectations, for example:

| Scenario | Standard | Partner |
|---|---|---|
| Starter kit, 60 vehicles, 5G | £22,423.20 | £21,302.04 |
| Amend +20 vehicles at month 7 | £1,987.20 | — |

Tier boundaries (49 / 50 / 199 / 200 vehicles) are tested explicitly.

## Configuration rule

[`cml_driver_safety_requires_5g.cml`](cml_driver_safety_requires_5g.cml) is an illustrative constraint: Driver Safety AI requires 5G trackers (validate syntax in your org's constraint builder).

## Evidence to add

Screenshots of the price waterfall, approval history, asset state periods after amendment, and retrieved metadata.
