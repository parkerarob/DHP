# Eagle Pass — AI Build System Rules v2.0

---

## Scope Control Rules

- Immutable Task Queue governs all build scope.
- Cursor may only execute one task at a time.
- No merging, combining, or modifying tasks permitted.
- All scope changes require PRD and Build Queue updates via Governance Committee.

---

## File Structure Rules

All generated code must adhere to the following directory structure:

/src/services/
/src/controllers/
/src/models/
/src/utils/
/src/security/

- One service/controller/model per task.
- Fully runnable code required per task submission.

---

## Naming Conventions

- Firestore collections: `kebab-case`
- React components: `PascalCase`
- Variables & functions: `camelCase`

---

## Output Behavior Rules

- No code may be printed directly into chat interface.
- All code generation must use AI file tool calls (`edit_file`, `create_file`).
- File changes must be logically grouped by function.

---

## Cloud Functions Enforcement

- All writes, updates, and validations must be executed exclusively via Cloud Functions.
- Client SDKs operate read-only wherever possible.

---

## Firestore Security Rules

- UID-based role matching strictly enforced.
- No write operations permitted directly from client SDK.
- All security rules must enforce collection-level, document-level, and field-level role access as defined in `PRD.md` and `security-rules-test-cases.md`.

---

## Testing Requirements

- Backend: Jest unit tests for all services.
- Frontend: Jest + React Testing Library.
- Backend integration: Firebase Emulator Suite (`@firebase/rules-unit-testing`) required for local validation.
- All tasks must ship with full corresponding tests.

---

## AI Output Risk Safeguards

- Cursor must evaluate AI risk signals before committing outputs (see `ai-risk-signals.md`).
- Any triggered risk signals will block operator acceptance pending review.

---

## Immutable Build Ledger Enforcement

- Only authorized fields may be updated in Execution Ledger:
    - Status
    - Timestamp
    - Operator name
    - Blocked Reason
    - Notes
- Task names, definitions, and structure may not be modified after queue lock.

---

## Operator Behavior

- Operator actions governed by `ai-operator-sop.md`.
- All escalations and exceptions must follow SOP escalation protocol.

---

## Auditability & Compliance

- System designed for full traceability, forensic reconstruction, and external audit.
- All build artifacts captured in AI Build Manifest.

---

## Version

- AI Build System Rules v2.0 (Aligned with PRD v3.0 Governance Kit)

## Environment Handling Rules

- All AI and operator actions must target a specified environment (dev, test, or prod).
- The Operator must verify and log the target environment before authorizing any build, test, or deployment action.
- AI must always prompt for the target environment if not specified and must refuse to run any operation with ambiguous or missing environment settings.
- Production credentials must never be used for testing or development, and production operations must be explicitly approved per governance protocol.
