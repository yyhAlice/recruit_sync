# RecruitSync — Product Design Doc

**Author:** TBD
**Status:** Draft v0.1
**Last updated:** 2026-06-25
**One-liner:** A recruitment CRM for agencies placing international candidates in Japan — tracks every client, job, and candidate from first contact to placement, no spreadsheet required.

---

## 1. The user & the moment

- **Who:** A recruiter at a small-to-mid-size international recruitment agency placing candidates into Japanese companies. They juggle multiple clients, jobs across industries, and candidates from multiple countries. Their tools today: Excel, Google Drive, WhatsApp, and memory.
- **When:** Monday morning. They have 24 active jobs, 8 interviews this week, and 5 overdue follow-up reminders. They open Excel, spend 10 minutes figuring out where each candidate is, then ask a colleague "who last spoke to Nexus Systems about the Java role?" No one knows.
- **Why now:** The agency is growing. The Excel system that worked for two recruiters breaks at five. Placements are falling through because candidate stages aren't tracked. Clients go cold because nobody logged the last call. Offer letters, CVs, and signed NDAs live in someone's Google Drive with no clear ownership.

---

## 2. The contract (I/O)

- **Input:** A client company record → a job opening linked to that client → a candidate CV (PDF, Word, or image) uploaded and parsed → the candidate attached to the job at a starting stage.
- **Output:** A pipeline Kanban board per job showing every candidate by stage (Sourced → Screening → Interview → Offered → Placed / Rejected), with the last activity log visible on the card and the next due reminder flagged in red/amber/green.
- **The loop:** Open RecruitSync → check today's reminders → open an active job's pipeline → drag a candidate to the next stage and log the move → close. Repeat daily. Weekly: review the dashboard for placement counts and overdue items.

---

## 3. The magical moment

> "I opened the pipeline board and for the first time I could see every candidate, every stage, every overdue follow-up — all in one screen. I didn't open Excel once today."

---

## 4. Scope: what we ARE building (v1)

- **User login** — recruiter accounts with role-based access (recruiter / admin); JWT-based session
- **Guided onboarding** — first-time flow: Add Client → Add Job → Upload CV; no blank dashboard on day one
- **Dashboard** — active job count, candidates by stage bar chart, today's due reminders, recent placements with salary
- **Client management** — company profile (name, industry, contact person, email, phone, address, website, notes); tabs for linked jobs, activity logs, files, and reminders
- **Job management** — job opening linked to a client; fields include employment type, location, salary range (JPY), required skills, experience years, Japanese level (N1–N5/Native), English level, closing date; tabs for candidates, logs, files
- **Candidate management** — profile created from CV upload (PDF/Word/image, auto-parsed); fields: name, contact, experience years, skills, education, current location, source; one candidate can be linked to many jobs
- **CV upload & parser** — upload 1 or 2 CV files (PDF/Word/image); supported formats: 履歴書 (File 1) + 職務経歴書 (File 2); select parse language (Auto / English / Japanese / Myanmar); parser runs async; results are fully editable before saving
- **CV data merge engine** — when two files are uploaded, a merge service combines extracted fields from both: personal data from 履歴書 merged with work history and skills from 職務経歴書 into a single candidate record; conflicts resolved by manual recruiter review
- **CV template selector** — recruiter selects an output format before generating: Agency Standard, Client-specific, Japanese 履歴書 format, or Work Experience Sheet (職務経歴書); format determines field layout and language of the generated document
- **Formatted CV export** — generate a formatted DOCX or PDF from the merged candidate data + chosen template; recruiter reviews a profile editor before generation; output is downloadable and stored as a FileAsset linked to the candidate
- **Job Pipeline (board)** — Kanban per job with 6 stages: Sourced, Screening, Interview, Offered, Placed, Rejected; candidate cards show status dot (green/amber/red), last log preview, and next reminder date; drag to move stage. Scoped to one client's one job — this is the view a recruiter shares with the Hiring Manager to report progress on that role.
- **Recruiter Pipeline (list)** — a cross-job view of every candidate a given recruiter is currently working, regardless of client or job. Table format, one row per candidate-job link, sortable by last activity. Filters: Client, Job, Recruiter, Stage, Date (applied date or last activity date range). Lets a recruiter (or their manager) see their full workload in one place instead of opening each job's board separately.
- **Activity logs** — manual communication log attached to a client, job, or candidate; fields: type (Call / Email / Meeting / Chat), summary, next action; team-visible and timestamped
- **Reminders** — follow-up tasks attached to any entity; due date, priority (High / Medium / Low), assigned user; shared team view sorted into Overdue / Today / This week sections
- **File Workspace** — a hierarchical folder system modelled as a Recruitment File Workspace, not a flat file list. Each client, candidate, and job gets its own root workspace with default subfolders pre-created on record creation. Recruiters can also create, rename, and delete custom folders at any level. Every folder is a mini-workspace with four tabs: **Files** (upload, download ZIP, drag-and-drop reorder, move between folders), **Notes** (short rich-text notes scoped to the folder — meeting prep, context), **Activity History** (automatic log of every upload, rename, move, and note event), and **Shared Members** (show which team members have access; admin can restrict per folder in v2). File actions available everywhere: Upload File, New Folder, Rename Folder, Move File, Drag & Drop into folder, Download as ZIP.

  **Default folder structure:**
  - **Clients / {Company name}:** Contracts, JD, Meeting Notes, NDA, Visa, Others
  - **Candidates / {Full name}:** CV, Passport, Certificates, JLPT, Photos, Other Documents
  - **Jobs / {Job title}:** JD, Interview Results, Offer Letters, Others

---

## 5. Scope: what we are NOT building

- **No email integration** — recruiters log communications manually; no Gmail / Outlook sync in v1
- **No payroll or salary calculation engine** — salary range is stored as min/max fields for reference; no computation
- **No business card OCR** — high engineering cost, especially for bilingual (Japanese/English) cards; deferred to Phase 4
- **No candidate-facing portal** — internal tool only; no public job board or candidate login
- **No client-facing portal** — clients do not log into RecruitSync; all data entry is done by recruiters
- **No AI scoring or ranking** — the CV parser extracts fields; it does not score candidates or recommend matches
- **No mobile native app** — responsive web only in v1; iOS/Android is a v2 platform decision
- **No bulk Excel import** — records are entered manually or via CV upload in v1; CSV import is a v1.1 candidate if adoption is high
- **No multi-tenancy** — single agency, single database; no per-team data isolation
- **No per-folder access control in v1** — all folders are visible to all recruiters; per-folder member restrictions are a v2 feature (data model supports it via `folder_members` table; UI enforcement deferred)

---

## 6. The signature detail

The status dot on every pipeline card. It is a 9px filled circle — green if the last contact was within 7 days, amber if 7–14 days, red if overdue beyond 14 days or a reminder has passed. It appears on every candidate card in the pipeline board, on every row in the reminder list, and on every job card in the job list. From across the room, a recruiter scanning the pipeline board can instantly see which candidates are falling through the cracks. Red dots demand action. Green dots mean calm. The dot is the pulse of the agency.

---

## 7. Success: how we know it worked

- **Primary:** ≥ 80% of active jobs have at least one candidate stage update logged in RecruitSync within 7 days of go-live — measured by pipeline log entries, not by survey.
- **Secondary:** Overdue reminders drop by ≥ 30% between month 1 and month 2 — measured by reminders flagged overdue at time of "mark done."
- **What we're NOT measuring:** Total logins, session length, page views. Vanity metrics for an internal tool.

---

## 8. Open questions

- [ ] Hard cutover from Excel or parallel-run? Parallel run is safer for adoption but requires double data entry during transition — PM to decide with team lead.
- [ ] Is candidate data shared across all recruiters, or siloed per assigned recruiter? Affects whether all pipeline views are team-wide or personal. Default assumption: shared.
- [ ] What is the acceptable CV parser field extraction error rate before we switch from heuristic (PDFBox/POI text extraction + regex) to LLM-based extraction? Need to test against a real sample of 20+ CVs including Japanese and Myanmar formats.
- [ ] Which languages does the CV parser need to support at launch? English is assumed; Japanese (katakana/kanji names, addresses) and Myanmar script are flagged as hard; confirm priority with agency leadership.

---

## 9. Handoff

- **For UX:** The Job Pipeline board is the hero screen and the moment that wins or loses the user on day one. The hardest design problems are: (1) the empty-stage state — a column with zero candidates must still feel purposeful; (2) the status dot color system must be immediately legible without a legend. The Recruiter Pipeline is a secondary but high-value screen — it answers "what is this recruiter working on right now" without forcing a manager to click through every job board; design it as a filterable table, not a second Kanban. The sidebar carries only one pipeline entry point, labelled **"Pipeline,"** which opens the Recruiter Pipeline; the Job Pipeline board has no nav entry of its own and is reached by drilling in from a candidate row or from Job Detail.
- **For Eng:** CV parsing is the highest-risk feature — multilingual input (EN/JP/Myanmar), variable file formats (PDF/Word/scanned image), and messy candidate-entered data. Scope the parser as an isolated async service with a mandatory human-review step before the candidate record is saved. Parser failures must never block the recruiter from creating a candidate manually. The CV pipeline introduces four new backend services (Parser, Merge, Template Mapping, Export) and four new DB tables (`cv_uploads`, `cv_parsed_data`, `cv_templates`, `generated_profiles`). On the Java/Spring Boot stack, text extraction runs through Apache PDFBox (PDF) and Apache POI (Word), with Tess4J for scanned-image OCR; the export service renders DOCX via docx4j and produces PDF via LibreOffice headless conversion. Template files and generated outputs are stored in Google Cloud Storage in production (local disk in dev) and tracked as FileAssets linked to the candidate.
- **Stack at a glance:** React 19 + Vite + TypeScript frontend (TanStack Query/Table, DnD Kit, React Hook Form + Zod) on Firebase Hosting; Java 21 + Spring Boot backend on Cloud Run; PostgreSQL 16 on Cloud SQL. This doesn't change any product scope — it's the implementation the engineering doc should be read against.
