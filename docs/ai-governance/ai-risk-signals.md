# Eagle Pass — AI Build Risk Signals v1.0

## Purpose

Defines known high-risk AI code generation patterns that trigger operator or overseer intervention.

---

## Security Risks

- Unscoped Firestore read queries (`.where()` or `.get()` without UID filter).
- Direct client write to Firestore bypassing Cloud Functions.
- Firestore document updates without transaction safety.

---

## Transaction Integrity Risks

- Missing Firestore transaction blocks for writes modifying multiple documents.
- Idempotency logic missing on pass creation.
- Use of client-generated document IDs.

---

## Validation Risks

- Absence of input schema validation.
- Input trust assumptions without server-side checks.

---

## State Machine Risks

- Permitting OUT ➔ OUT transitions.
- Skipping INVALID_TRANSITION event logs.
- Missing EMERGENCY_ACTIVATED event logs.

---

## Observability Risks

- Missing error logging on function failure.
- Silent catch blocks without retry logging.

---

## Performance Risks

- Inefficient Firestore queries with multiple unindexed filters.
- Batch writes exceeding Firestore limits (500 ops).

---

## Red Flag Severity Levels

| Severity | Action |
| -------- | ------ |
| Critical | Immediate Overseer review required |
| High | Operator review required before merge |
| Medium | Allowed with human notation |
| Informational | Logged for future audits |

---

