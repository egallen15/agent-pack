# SECURITY

This file defines practical, durable security expectations for the project.
Use it to guide planning and implementation decisions, not as a compliance checklist theater.

Keep controls right-sized to the project. Prefer explicit tradeoffs over vague statements.

---

## Security posture and scope

- Security objective:
- Risk tolerance:
- In-scope systems:
- Out-of-scope systems:

---

## Data classification and handling

Define classes used in this project and required handling rules.

| Class | Examples | Storage rules | Access rules | Retention / deletion |
| --- | --- | --- | --- | --- |
| Public | <example> | <rules> | <rules> | <rules> |
| Internal | <example> | <rules> | <rules> | <rules> |
| Sensitive | <example> | <rules> | <rules> | <rules> |

If legal/compliance constraints exist, link them here.

---

## Auth and authorization model

- Identity provider / auth method:
- Session/token strategy:
- Authorization approach (RBAC/ABAC/etc.):
- Privileged access rules:
- Account lifecycle expectations:

---

## Secret management baseline

- Where secrets are stored:
- Local development secret handling:
- Rotation expectations:
- Leak response expectations:
- Forbidden practices (for example, hardcoded secrets in repo):

---

## Threat model summary

### Key assets

- <asset>
- <asset>

### Trust boundaries

- <boundary>
- <boundary>

### Likely threats

- <threat> -- affected asset(s) -- mitigation status
- <threat> -- affected asset(s) -- mitigation status

---

## Minimum controls checklist

- [ ] Security-relevant events are logged and reviewable.
- [ ] Dependencies are tracked and updated on a regular cadence.
- [ ] Inputs are validated at trust boundaries.
- [ ] Backups and restore procedures are defined for critical data.
- [ ] Least-privilege principles are applied to service and user access.

Add or remove controls only with rationale.

---

## Incident response owner and process

- Security owner:
- Escalation path:
- Incident response process/document pointer:
- Post-incident review expectations:

---

## Open risks and deferred controls

- Risk: <risk> -- impact -- mitigation plan -- target date
- Deferred control: <control> -- reason deferred -- trigger to revisit

Deferred items should be revisited during planning when related scope changes.

---

## Last updated

 -
