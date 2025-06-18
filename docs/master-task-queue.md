🚀 Eagle Pass — AI Build Plan v3.0 (Master Task Queue)
🗂 MASTER TASK LIST (Decomposed from PRD v3.0)


## Task 0 — Project Bootstrap Initialization

Task: Initialize Eagle Pass project scaffold.

Requirements:
- Backend: Node.js (TypeScript strict mode), Firebase Functions.
- Setup folders:
  /src/services
  /src/controllers
  /src/models
  /src/utils
  /src/security
- Setup TypeScript strict mode.
- Setup basic GitHub Actions CI/CD scaffold.
- Setup Firebase Emulator Suite.
- Create .env file scaffold for dev secrets (NOT for production).
- Fully runnable initialization.


## Task 1 — Authentication & Authorization System

Task: Implement authentication & authorization.

Requirements:
- Google SSO via Firebase Auth (OAuth 2.0).
- Local Auth (email/password).
- Token verification middleware (`verifyAuth.ts`).
- UID-based access control logic.
- Create `authService.ts` to wrap all auth flows.


## Task 2 — Firestore Data Models & Schema Definitions

Task: Generate Firestore schema models.

Requirements:
- Collections: users, locations, passes, eventLogs, groups, autonomyMatrix, restrictions.
- TypeScript interfaces per collection.
- Use kebab-case Firestore collections.
- Create `firestoreModels.ts`.
- Add versioning scaffold for schema evolution.


## Task 3 — Pass Lifecycle Engine

Task: Implement pass lifecycle state machine.

Requirements:
- Transitions: IN ➔ OUT (create pass), OUT ➔ IN (return or assist).
- Single active pass per student.
- Firestore transactions to enforce idempotency.
- Server-generated passId.
- Log transitions to EventLog.
- Log invalid transitions as INVALID_TRANSITION.
- Create `passService.ts`.


## Task 4 — Emergency Freeze & Claim System

Task: Build emergency freeze system.

Requirements:
- Global toggle: emergencyFreeze: boolean.
- Prevent pass creation when freeze is ON.
- Allow emergency claims (OUT ➔ IN).
- Log EMERGENCY_ACTIVATED events.
- Build Emergency Banner UI (frontend).
- Create `emergencyService.ts`.


## Task 5 — Notification Engine

Task: Build duration timer notification system.

Requirements:
- Cloud Scheduler triggers at 10min & 20min.
- 10min: student/teacher notification.
- 20min: admin escalation.
- SendGrid email delivery.
- Log failures and undeliverables.
- Create `notificationService.ts`.


## Task 6 — Data Ingestion Tooling (CSV Loader)

Task: Build dev ingestion tooling.

Requirements:
- Dev-only CLI or web admin UI.
- CSV schema validation.
- Upload users, locations, groups.
- Use Firestore batch writes.
- Ingestion summary log: total processed, success/failure, timestamp.
- Create `dataIngestionService.ts`.


## Task 7 — Teacher Assist Pass Closure

Task: Implement teacher assist pass closure.

Requirements:
- Teachers may manually close passes.
- Validate pass is open.
- Log teacher actorId into EventLog.
- Create `teacherAssistController.ts`.


## Task 8 — Lightweight Policy Engine Mock

Task: Implement policy engine mock.

Requirements:
- Evaluate:
  - Autonomy Matrix
  - Group Rule eligibility
  - Student Restrictions
  - Emergency Freeze
- Config-driven policy scaffold.
- Replaceable for full post-MVP engine.
- Create `policyEngine.ts`.


## Task 9 — Security Rule Scaffold

Task: Generate Firestore security rules.

Requirements:
- UID-based role enforcement.
- Write access via Cloud Functions only.
- Scoped read access for roles.
- Apply strict role definitions.
- Create `firestore.rules`.


## Task 10 — Monitoring & Observability Layer

Task: Build observability layer.

Requirements:
- Cloud Logging & Cloud Monitoring:
  - Function error rates
  - API latencies
  - Firestore write conflicts
  - Notification failures
- Crashlytics integration for React.
- Frontend exception & breadcrumb capture.
- Cloud Monitoring alerts for backend failures.
- Create `observabilityService.ts`.

## Task 11 — Minimal Reporting Interfaces

Task: Build minimal reporting APIs.

Requirements:
- Student pass history.
- Current active passes.
- Emergency event logs.
- Admin query filters by student, group, location.
- Create `reportingService.ts`.
