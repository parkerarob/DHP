# Eagle Pass

## Overview
Eagle Pass is a digital hall pass system designed for K-12 schools to track student movement for safety and accountability, without enforcing attendance or behavior monitoring. The system provides staff with accurate, immutable data during both routine and emergency operations, while minimizing administrative complexity.

## Core Principles
- **Binary pass lifecycle:** OPEN or CLOSED
- **Binary movement state:** IN or OUT
- **Immutable audit logging**
- **Staff responsibility** follows student location
- **Policy controls and eligibility gates** enforce school rules without complicating the state machine
- **System reflects actual student-declared or staff-verified locations**
- **System assists staff; humans remain primary decision-makers in emergencies**

## MVP Scope
- Google SSO login (OAuth 2.0) with domain restriction to `@nhcs.net` and `@student.nhcs.net`
- Pre-loaded user and location database via Dev-managed upload
- Dev UI includes CSV Importer with schema validation
- Students declare origin and destination to open passes
- One active pass per student (idempotent Firestore writes)
- Students close passes upon return to origin
- Immutable event log for all state transitions
- UI prevents invalid actions
- Dev dashboard for full system config and user management
- Emergency freeze mode with claim functionality
- Duration timers with notifications at 10min (student/teacher) and 20min (admin escalation)
- Notification engine with failure logging
- Teacher assist: manually close student passes
- Basic teacher/admin reporting interfaces
- Group rules enforcement for Positive/Negative student groups
- Student-specific lockouts (global and class-level)
- Lightweight Policy Engine mock for early testing

## Governance & Build Process
- **Immutable Task Queue:** All build scope is governed by a locked task queue (see `docs/build-queue.md` and `docs/master-task-queue.md`).
- **AI Build Agent (Cursor):** Executes tasks, generates code, and may not modify the task queue or structure.
- **AI Operator:** Initiates tasks, reviews AI output, logs results in the Execution Ledger, and ensures environment safety.
- **AI Safety Overseer:** Audits output for compliance and can block unsafe deployments.
- **Release Authority:** Approves promotion to staging/production and ensures test coverage.
- **Full auditability:** All actions and outputs are logged for traceability and compliance.

## File Structure (Post-Bootstrap)
- `/src/services/` — Service logic per task
- `/src/controllers/` — API and business logic controllers
- `/src/models/` — Data models and schema definitions
- `/src/utils/` — Utility functions
- `/src/security/` — Security and access control logic

## Technology Stack
- **Backend:** TypeScript / Node.js, Firebase Functions
- **API:** REST (expandable to GraphQL)
- **Authentication:** Google SSO (OAuth 2.0, domain-restricted)
- **Database:** Firebase Firestore (NoSQL)
- **Hosting:** Firebase Hosting + Functions
- **CI/CD:** GitHub Actions
- **Frontend:** React (optionally Next.js), Zustand/React Query, TailwindCSS, ShadCN/Radix UI
- **Testing:** Jest, Playwright/Cypress, security test matrix
- **AI Build Support:** Cursor AI, AI Build Feed Templates

## Security & Compliance
- FERPA-compliant authentication and data handling
- Immutable logging and audit trails
- Strict role-based access control (see `docs/security-rules-test-cases.md`)
- All write operations via Cloud Functions; client SDK is read-only
- Full test coverage required for all state transitions and security rules

## Contribution & Governance
- All contributions must follow the immutable task queue and governance protocols (see `docs/ai-governance/` and `docs/operator-rules.md.md`)
- Scope changes require formal review and PRD update
- Operators and contributors must log all actions in the Execution Ledger

## Documentation
- **Product Requirements:** `docs/PRD.md`
- **Build Task Queue:** `docs/build-queue.md`, `docs/master-task-queue.md`
- **AI Governance:** `docs/ai-governance/`
- **Security Rules:** `docs/security-rules-test-cases.md`
- **Execution Ledger:** `docs/execution-ledger-v2.md`

## Getting Started
1. Clone the repository
2. Review the PRD and build queue for current scope
3. Follow the operator SOP for all build and deployment actions
4. Use the provided task queue to guide all development

---
For questions or governance issues, refer to the escalation protocols in `docs/ai-governance/ai-governance.md` and `docs/ai-governance/ai-operartor-sop.md`. 