# Eagle Pass — Firestore Security Rules Test Matrix v1.0

| Role | Collection | Action | Expected Result |
| ---- | ---------- | ------ | ---------------- |
| Student | passes (own) | read | ✅ Allowed |
| Student | passes (others) | read | ❌ Denied |
| Student | eventLogs | write | ❌ Denied |
| Teacher | passes (assigned) | read/write | ✅ Allowed |
| Teacher | users | write | ❌ Denied |
| Admin | users | read/write | ✅ Allowed |
| Admin | autonomyMatrix | write | ✅ Allowed |
| Dev | All Collections | read/write | ✅ Allowed |
| Support Staff | passes (assigned) | read | ✅ Allowed |
| Anonymous | Any Collection | any | ❌ Denied |

*Note: Extend as roles or collections evolve.*

---

## Validation Protocol

- Execute full test matrix on:
  - Every PRD version increment
  - Post-AI code generation
  - Pre-deployment promotion

