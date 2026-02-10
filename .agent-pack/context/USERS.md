# USERS

This file captures user context that should stay stable across planning cycles.
Use it to keep plans, tasks, and checks tied to real user outcomes.

Keep this focused on decisions that materially change what we build.
If something is temporary or speculative, mark it as an assumption.

---

## Purpose and usage

- Define who the product is for and why they use it.
- Capture JTBD (job statements) that anchor planning decisions.
- Clarify what success looks like for each user segment.
- Support `/ap:init` and `/ap:plan` with concrete user context.
- Avoid using this file for feature ideas or implementation details.

---

## Primary user segments

| Segment ID | User type / role | Primary job-to-be-done | Priority | Notes |
| --- | --- | --- | --- | --- |
| U001 | <role> | <job> | <high / medium / low> | <notes> |
| U002 | <role> | <job> | <high / medium / low> | <notes> |

Add segments only when they change planning decisions.

---

## JTBD list

Use this list for cross-segment JTBD that drive planning priorities.

| JTBD ID | Job statement | Primary segments | Priority | Notes |
| --- | --- | --- | --- | --- |
| J001 | When <situation>, I want to <motivation>, so that I can <expected outcome>, without <pain point>. | U001 | <high / medium / low> | <notes> |
| J002 | When <situation>, I want to <motivation>, so that I can <expected outcome>, without <pain point>. | U002 | <high / medium / low> | <notes> |

---

## Segment details

Use one block per segment from the table above.

### U001 - <user type / role>

- JTBD:
  - Primary: When <situation>, I want to <motivation>, so that I can <expected outcome>, without <pain point>.
  - Secondary: When <situation>, I want to <motivation>, so that I can <expected outcome>, without <pain point>.
- Goals:
- Pain points:
- Critical flows:
- Success signals (observable):

### U002 - <user type / role>

- JTBD:
  - Primary: When <situation>, I want to <motivation>, so that I can <expected outcome>, without <pain point>.
  - Secondary: When <situation>, I want to <motivation>, so that I can <expected outcome>, without <pain point>.
- Goals:
- Pain points:
- Critical flows:
- Success signals (observable):

---

## Non-users / out of scope personas

List personas that may look relevant but are intentionally out of scope.

- <persona> -- reason out of scope
- <persona> -- reason out of scope

---

## Assumptions and unknowns

Capture open user-context questions that affect planning quality.

- Assumption: <assumption>
- Unknown: <question>

When an unknown is resolved and durable, update this file and any linked decisions.

---

## Last updated

-
