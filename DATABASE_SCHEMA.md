# Secrets Scanning Pipeline Database Schema

This document explains the database schema used by the secret scanning pipeline and the SOC dashboard. The schema is built using PostgreSQL.

## Table of Contents
1. [repositories](#1-repositories)
2. [scan_runs](#2-scan_runs)
3. [secrets](#3-secrets)
4. [secret_git_metadata](#4-secret_git_metadata)
5. [secret_validations](#5-secret_validations)
6. [secret_status_history](#6-secret_status_history)

---

### 1. repositories
Stores information about the Git repositories that are scanned. There is one row per scanned repository.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | Unique identifier for the repository |
| `name` | TEXT | NOT NULL | The basename of the repository directory |
| `url` | TEXT | NOT NULL | The remote URL or fallback local path of the repository |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp of when the repository was first added/scanned |

---

### 2. scan_runs
Records each execution of the scanning pipeline against a repository.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | Unique identifier for the scan run |
| `repo_id` | INTEGER | NOT NULL, REFERENCES `repositories(id)` | Foreign key linking to the scanned repository |
| `started_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | When the scan started |
| `completed_at` | TIMESTAMPTZ | | When the scan finished (NULL if still running) |
| `status` | TEXT | NOT NULL, DEFAULT 'running' | Current state (`running`, `completed`, `failed`) |
| `scanners_used`| TEXT[] | | Array of scanners used (e.g., `['gitleaks', 'truffleHog']`) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Row creation timestamp |

---

### 3. secrets
The core table containing every detected secret/credential leak.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | Unique identifier for the detected secret |
| `repo_id` | INTEGER | NOT NULL, REFERENCES `repositories(id)` | Foreign key to the repository |
| `scan_run_id`| INTEGER | NOT NULL, REFERENCES `scan_runs(id)` | Foreign key to the scan run that found this secret |
| `file_path` | TEXT | NOT NULL | Relative path within the repository where the secret was found |
| `line_number`| INTEGER | NOT NULL | Line number of the file containing the secret |
| `secret_type`| TEXT | | The rule name/type (e.g., `'PEM-Encoded Private Key'`) |
| `detected_by`| TEXT[] | | Array of scanners that found this secret |
| `secret_hash`| TEXT | NOT NULL | SHA-256 hash of the raw secret value (for safe storage/matching) |
| `fingerprint`| TEXT | NOT NULL, UNIQUE | Uniqueness constraint (typically `<file_path>:<line_number>`) |
| `source_url` | TEXT | | URL pointing to the exact line in the remote repository |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Indicates if the secret is still present in the codebase |
| `last_seen_at`| TIMESTAMPTZ | | Timestamp updated when a duplicate fingerprint is scanned |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | When the secret was first detected |

---

### 4. secret_git_metadata
Stores Git "blame" information, identifying the specific commit and author that introduced a secret.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | Unique identifier |
| `secret_id` | INTEGER | NOT NULL, REFERENCES `secrets(id)` | Foreign key to the corresponding secret |
| `commit_hash`| TEXT | | Full SHA-1 hash of the commit that introduced the secret |
| `branch_name`| TEXT | | The branch at the time of the scan |
| `author_name`| TEXT | | Name of the author from git blame |
| `author_email`| TEXT | | Email of the author from git blame |
| `author_date`| TIMESTAMPTZ | | Timestamp of the commit (ISO-8601) |
| `subject` | TEXT | | The commit message subject line |
| `author_commit_hash`| TEXT | | Aliased copy of `commit_hash` used for certain queries |

---

### 5. secret_validations
Contains confidence scoring, manual verification status, and AI analysis for each secret. This table is primarily used by the dashboard for incident management.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | Unique identifier |
| `secret_id` | INTEGER | NOT NULL, REFERENCES `secrets(id)` | Foreign key to the corresponding secret |
| `validator_type`| TEXT | NOT NULL | The source of the validation (e.g., `'scanner'`, `'ai'`, `'manual'`) |
| `verdict` | TEXT | | AI/Scanner verdict (e.g., `'VALID_CANDIDATE'`, `'FALSE_POSITIVE'`) |
| `verdict_legacy`| TEXT | | Older verdict format (e.g., `'true_positive'`) |
| `confidence` | FLOAT | | Probability score (0.0 – 1.0) of validation accuracy |
| `risk_score` | INTEGER | | A severity metric (0 – 10). Scores $\ge$ 9 are often flagged as Critical |
| `is_likely_active`| BOOLEAN | | Whether the secret appears functionally active right now |
| `secret_kind` | TEXT | | Granular categorization (e.g., `'private_key'`, `'api_key'`) |
| `reasoning` | TEXT | | Human-readable explanation of why a secret received its verdict |
| `evidence` | TEXT[] | | Supporting context/evidence strings |
| `status` | TEXT | | The workflow status for the incident (e.g. `'OPEN'`, `'IN_PROGRESS'`, `'RESOLVED'`,`'ACCEPTED_RISK'`) |
| `validated_at`| TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | When the validation record was created |

*(Note: The `status` field is heavily relied upon by the SOC dashboard to calculate "Active Incidents" and display the current triage state).*

---

### 6. secret_status_history
An audit trail tracking changes to a secret's workflow status over time.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | Unique identifier |
| `secret_id` | INTEGER | NOT NULL, REFERENCES `secrets(id)` | Foreign key to the corresponding secret |
| `status` | TEXT | NOT NULL | The new status (e.g., `'detected'`, `'confirmed'`, `'resolved'`) |
| `changed_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp of the change |
| `changed_by` | TEXT | NOT NULL | Who/what made the change (e.g., `'system'`, user email/ID) |
