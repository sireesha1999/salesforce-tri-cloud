# Coding practice scenarios

330 live-coding scenarios used by the portal's **Code Practice** section:

| Track | Files | Scenarios |
|---|---|---|
| Apex | `apex_a.js`, `apex_b.js` | 110 (AP001–AP110) |
| Triggers | `triggers_a.js`, `triggers_b.js` | 110 (TR001–TR110) |
| LWC | `lwc_a.js`, `lwc_b.js` | 110 (LW001–LW110) |

Each scenario has a business task, starter code, a reference solution, hints, structural checks (regular expressions every correct answer must match, plus anti-patterns such as SOQL or DML inside loops) and a rubric for the AI reviewer.

`practice_engine.js` runs the checks (it strips comments first). `validate.js` checks every scenario: the reference solution must pass, and the starter code must fail.

```bash
node validate.js *_a.js *_b.js
```

Checks only look at structure; code isn't executed. Deploy a solution to a scratch org to run it.
