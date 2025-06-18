# Eagle Pass — AI Governance Charter v1.0

## Purpose

This charter defines roles, responsibilities, and safety protocols governing AI-assisted software generation for Eagle Pass.

---

## Governance Roles

### 1. AI Build Agent (Cursor)
- Executes task queue assignments.
- Generates code per assigned task scope.
- May not modify task queue, names, or structure.

### 2. AI Operator (Human)
- Initiates task assignments.
- Reviews AI-generated work product.
- Logs all execution results in Immutable Ledger.
- May not modify AI output beyond allowed corrections.
- Explicitly specify and verify the environment (dev, test, prod) for every operation, and ensure correct credentials are provided before any AI-initiated action.


### 3. AI Safety Overseer
- Audits AI-generated output for compliance.
- Intervenes in case of scope violations, hallucinations, or high-risk patterns.
- Has authority to block deployment.

### 4. Release Authority
- Reviews fully completed task sets.
- Approves promotion to staging and production.
- Ensures that full test coverage is in place.

---

## Scope Change Management

- Task queue is immutable post-initialization.
- Scope changes require:
  1. Governance committee review.
  2. Task queue version increment.
  3. Formal update of PRD & Master Task Queue.

---

## Escalation Protocol

| Scenario | Escalate To |
| -------- | ------------ |
| AI Blocked / Unclear Output | AI Operator |
| Safety Violation | AI Safety Overseer |
| Build Manifest Integrity Error | Release Authority |
| PRD Scope Conflict | Governance Committee |

---

## Safety Objectives

- Immutable auditability.
- Strict role separation.
- Minimization of AI hallucination impact.
- Resilience across iterative build cycles.

