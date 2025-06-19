# Eagle Pass — AI Operator Standard Operating Procedure (SOP) v1.0

## Purpose

This document defines the roles, responsibilities, procedures, and constraints for all human operators managing AI-assisted builds using Cursor AI for Eagle Pass.

---

## Operator Core Responsibilities

- Execute assigned tasks from the Immutable Build Queue.
- Monitor AI build output for compliance with system rules.
- Log all task completions accurately in Execution Ledger v2.
- Trigger escalations when AI build agents encounter blockers or generate unsafe code.
- Maintain auditability and traceability throughout the build lifecycle.

---

## Environment Verification Responsibilities

- Before triggering any AI build, test, or deployment task, the Operator must:
  - Select and record the intended environment (dev, test, or prod) for the operation.
  - Ensure the correct Firebase project credentials (service account key, API key, .env) for that environment are available and loaded.
  - Confirm the Firebase project ID and endpoints match the intended environment before authorizing the AI to proceed.
  - Never provide production credentials unless all tests have passed and explicit Release Authority approval is given.
- If the AI requests credentials or access, the Operator must provide the correct secret for the specified environment only.
- If unsure about which environment is in use, the Operator must pause and verify before continuing.

---

## Operator Authority Scope

- ✅ Initiate task runs via Cursor AI.
- ✅ Perform basic non-functional edits:
  - Code formatting corrections
  - File organization fixes
  - Compilation error fixes
  - Documentation corrections

- ❌ Forbidden:
  - Modifying AI-generated business logic or algorithms.
  - Combining, merging, or reordering tasks.
  - Altering task definitions or queue structure.
  - Modifying AI build risk signals without safety authority approval.
  - Skipping safety review checkpoints.

---

## Build Execution Workflow

1. **Task Selection**
    - Assign task directly from Immutable Build Queue.
    - Confirm task ID and scope.

2. **AI Task Execution**
    - Trigger Cursor AI code generation for the task.
    - Ensure no adjacent tasks are co-executed.

3. **AI Output Review**
    - Validate adherence to:
        - File structure rules
        - Naming conventions
        - Scope isolation
        - Cloud Functions write-only behavior
        - Security rule compliance
        - Risk signals (refer to `ai-risk-signals.md`)
        - Required tests present

4. **Execution Ledger Entry**
    - Record task completion in `execution-ledger-v2.md`.
    - Log:
        - Task ID
        - Operator name/initials
        - Status
        - Timestamps
        - Any flags triggered
        - Notes

5. **Escalation (if needed)**
    - If AI returns ⚠ Blocked or triggers High/Critical risk signals:
        - Attempt one AI prompt rephrase.
        - If still blocked or unsafe → escalate to AI Safety Overseer.
        - Do not manually override without authorization.

6. **Post-Build Validation**
    - Verify full unit test and security rules test coverage.
    - Confirm Build Manifest accuracy prior to Release Authority handoff.

---

## Escalation Protocol Summary

| Scenario | Action | Escalation Target |
| -------- | ------ | ------------------ |
| Task Blocked | Retry prompt once | AI Safety Overseer |
| High/Critical Risk Signal | Pause build | AI Safety Overseer |
| Scope Violation Detected | Pause build | AI Safety Overseer |
| Ledger Anomaly | Record issue | AI Safety Overseer |
| PRD Conflict | Pause build | Governance Committee |

---

## Operator Safety Principles

- Preserve system immutability.
- Always favor safety over speed.
- Zero tolerance for unsanctioned scope changes.
- Full transparency via ledger logs.

---

## Document Authority

This SOP is governed by the AI Governance Charter. Any modifications require Governance Committee approval.

## Task Completion Workflow

1. **Complete the Task**
   - Implement all requirements as defined in the master task queue and PRD.
   - Ensure all code, models, and documentation are in place.

2. **Push to GitHub**
   - Commit and push the completed work to the appropriate branch.

3. **Complete All Required Testing**
   - Run and pass all unit, integration, and security tests.
   - Use CI/CD automation where possible.

4. **Peer Review (if applicable)**
   - Submit a pull request for review and approval.

5. **Push Stable to GitHub and Tag**
   - Merge to main branch.
   - Tag the release (e.g., `v1.0.0-taskX-complete`).

6. **Update Documentation and Execution Ledger**
   - Mark the task as complete in the execution ledger.
   - Update any relevant documentation.
   - Note any important changes, blockers, or risk signals.

7. **Security & Linting Checks**
   - Run security scans and linting/formatting checks before tagging.

8. **Move to the Next Task**
   - Only after all the above are complete and stable.
