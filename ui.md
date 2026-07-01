# RecruitSync — UX Design Doc

**Designer:** TBD
**Status:** Draft v0.1
**Last updated:** 2026-06-25

---

## 1. The design bet

We're betting that a recruiter's workday can be structured around three moments: the morning reminder check, the pipeline scan, and the end-of-call log entry. If those three interactions feel fast and frictionless, everything else (client records, file storage, job forms) is plumbing that supports them. We're spending 70% of design effort on the pipeline board, the reminder list, and the activity log form. The other 12 screens exist to feed into those three.

---

## 2. The defining interaction

The recruiter opens a job's pipeline board. They spot a candidate card with a red dot — overdue follow-up, 3 days late. They drag the card from "Screening" to "Interview." The card snaps into the new column. A one-line prompt appears inline: "Log this move?" They type "1st round confirmed Thu 26 Jun 10am" and press Enter. The log entry saves. The red dot turns green. The candidate count badge on the "Interview" column increments. Total time: 8 seconds. Feels like updating a whiteboard sticky note — except it's timestamped, saved, and visible to the whole team.

---

## 3. Screen inventory

1. **Login** — email + password authentication
2. **Onboarding** — guided 3-step flow for first-time users: Add Client → Add Job → Upload CV
3. **Dashboard** — metric cards, pipeline stage bar chart, today's reminders, recent placements
4. **Client list** — searchable, filterable table of all client companies
5. **Add / Edit client** — form to create or update a client record
6. **Client detail** — client profile with tabbed sub-views: Jobs, Activity logs, Files, Reminders
7. **Job list** — searchable, filterable table of all jobs across all clients
8. **Add / Edit job** — form to create or update a job (includes JPY salary, language level fields)
9. **Job detail** — job info with tabbed sub-views: Candidates, Activity logs, Files
10. **Upload CV** — dual-file upload zone (File 1: 履歴書, File 2: 職務経歴書); output language selector; parse trigger
11. **Parsed data review** — merged extracted fields from both files; all fields editable before saving
12. **Template selection** — recruiter picks output format (Agency Standard / Client-specific / 履歴書 / 職務経歴書) and output type (DOCX / PDF); triggers generation
13. **Download** — generation confirmation; download button; option to generate another format
14. **Candidate list** — searchable table of all candidates
15. **Candidate profile** — parsed CV data with tabbed sub-views: Linked jobs, Activity logs, Files
16. **Job Pipeline board** — 6-column Kanban per job; the hero screen
17. **Recruiter Pipeline** — cross-job table of every candidate one recruiter is working; filters by Client, Job, Recruiter, Stage, Date
18. **Activity logs** — log entry form + chronological feed
19. **Reminders** — Overdue / Today / This week sections with mark-done and reschedule
20. **File Workspace — root** — top-level folder browser showing Clients / Candidates / Jobs workspace roots
21. **File Workspace — entity folder** — folder browser inside an entity (e.g. Toyota); shows subfolders + top-level files; toolbar actions
22. **File Workspace — folder detail** — open folder with 4-tab workspace: Files, Notes, Activity History, Shared Members

v1 ships all 22 screens. Screens 10–13 form a connected 4-step CV pipeline flow; they share the Upload CV sidebar nav item and a linear breadcrumb: Upload → Review → Template → Download. The dashboard is included in v1 (unlike the earlier feature list which deferred it) because the full system design requires it as the landing screen after login. Screens 16 and 17 are both "pipeline" views but answer different questions: the Job Pipeline board is scoped to one job (for reporting to a Hiring Manager); the Recruiter Pipeline is scoped to one recruiter across all jobs (for personal workload or manager oversight).

**Navigation note:** Only the Recruiter Pipeline gets a sidebar entry — labelled "Pipeline." The Job Pipeline board has no sidebar entry of its own; it's reached by drilling in (clicking a candidate's "Pipeline" button from the Recruiter Pipeline table, or "Pipeline view" from Job Detail). This keeps the sidebar to one pipeline entry point while still surfacing the per-job Kanban where it's needed.

---

## 4. Screen-by-screen specs

### Login

**Purpose:** Authenticate recruiter before accessing any data.

**Layout (top to bottom, centered card):**
1. RecruitSync logo
2. Email input
3. Password input
4. Login button (full width)
5. Footer: "RecruitSync V1 · Internal use only"

**States:**
- **Default:** Empty fields, login button inactive until both fields have content
- **Error:** Inline error below password: "Invalid email or password"
- **Loading:** Button shows spinner, inputs disabled

---

### Onboarding

**Purpose:** Guide first-time users through the minimum required data entry before they reach the dashboard — prevents a blank app experience.

**Layout:**
1. Welcome heading + subtext
2. 3-step progress indicator: Client (filled blue) → Job (gray) → Upload CV (gray)
3. Two CTAs: "Add your first client" (primary) and "Skip — existing client" (secondary)

**States:**
- **Default:** Step 1 active
- **Skip:** Goes directly to dashboard
- **Complete:** After CV upload, goes to dashboard

---

### Dashboard

**Purpose:** Daily orientation — active jobs, pipeline health, overdue reminders, recent placements.

**Layout (top to bottom):**
1. Date filter (This month / Last 30 days / All time) — top right
2. Metric cards row (4 cards): Active jobs, In screening, Interviews today, Reminders due
3. Two-column section:
   - Left: Candidates by stage — horizontal bar chart per stage (Sourced → Placed)
   - Right: Due today — list of overdue/today reminders with "Done" buttons
4. Recent placements table — Candidate, Job, Client, Placed date, Salary (JPY)

**Key interactions:**
- Click metric card → navigates to the relevant filtered list
- Click "Done" on a reminder → marks it done, removes from list with strikethrough
- Click placement row → opens candidate profile

**States:**
- **Empty (new account):** Metric cards show 0; prompt to "Add your first client"
- **Reminders due card is red** when count > 0
- **Loading:** Skeleton metric cards and bar chart rows

---

### Client List

**Purpose:** Entry point for finding a client and navigating to their jobs or detail.

**Layout (top to bottom):**
1. Search input + Industry filter dropdown
2. "Add client" button — top right
3. Table: Company | Contact person | Industry | Active jobs | Last contact | View button

**Key interactions:**
- Type in search → filters table in real time
- Click row → Client Detail
- Click "Add client" → Add/Edit Client form

**States:**
- **Default:** Sorted by last activity, most recent first
- **Empty:** Centered prompt "No clients yet — add your first" with button
- **Search no results:** "No clients match '[query]'"
- **Loading:** Skeleton table rows

---

### Add / Edit Client

**Purpose:** Create or update a client company record.

**Layout:** Two-column form grid inside a card
- Row 1: Company name (required), Industry (dropdown)
- Row 2: Contact person (required), Email (required)
- Row 3: Phone, Website
- Row 4: Address (full width)
- Row 5: Notes textarea (full width)
- Actions: Save client (primary), Cancel

**States:**
- **Validation:** Required fields highlighted on failed submit
- **Edit mode:** Fields pre-populated; button reads "Update client"

---

### Client Detail

**Purpose:** Full client record with all linked data accessible via tabs.

**Layout:**
1. Breadcrumb: ← Clients
2. Page title: Company name + "Edit" and "Add job" buttons
3. 3-column info cards: Contact details | Industry + location | Activity summary (job count, last contact)
4. Tabs: Jobs | Activity logs | Files | Reminders
   - **Jobs tab:** Table of linked jobs with title, type, status, candidate count, closing date
   - **Activity logs tab:** Chronological log feed with type badge (Call/Email/Meeting/Chat), summary, next action, author, date
   - **Files tab:** File rows with icon, name, uploader, date, download button
   - **Reminders tab:** Overdue rows (red bg) and upcoming rows with Done button

**States:**
- **Empty tabs:** Each tab shows an inline empty state with a relevant add button
- **Overdue reminders:** Shown with red background and red text for due date

---

### Job List

**Purpose:** Overview of all active jobs across all clients — the recruiter's working queue.

**Layout (top to bottom):**
1. Search input + Client filter + Status filter
2. "Add job" button — top right
3. Table: Job title | Client | Type | Status badge | Candidates (count + stage summary) | Closing date | View

**Key interactions:**
- Click row → Job Detail
- Click "Add job" → Add/Edit Job form

**States:**
- **Status badges:** Active (green), On hold (amber), Closed (gray)
- **Empty:** "No active jobs" with shortcut to add one or link to a client

---

### Add / Edit Job

**Purpose:** Create or update a job opening with full recruitment brief.

**Layout:** Two-column form grid inside a card
- Row 1: Client (select, required), Job title (required)
- Row 2: Employment type (required), Location
- Row 3: Salary min (JPY), Salary max (JPY)
- Row 4: Experience (years), Closing date
- Row 5: Japanese level (N5/N4/N3/N2/N1/Native/Not required), English level (Basic/Business/Fluent/Native/Not required)
- Row 6: Required skills (full width)
- Row 7: Notes textarea (full width)
- Actions: Save job (primary), Cancel

---

### Job Detail

**Purpose:** Full job record with candidates, logs, and files accessible via tabs.

**Layout:**
1. Breadcrumb: ← Jobs
2. Page title: Job title — Client name + "Upload CV" and "Pipeline view" buttons
3. Badge row: Status, Type, Location, Japanese level, English level, Salary range
4. Tabs: Candidates | Activity logs | Files
   - **Candidates tab:** Table with Candidate name, Stage badge, Applied date, Recruiter, Next reminder, View/Pipeline buttons
   - **Activity logs tab:** Log feed
   - **Files tab:** File rows with JD documents and related files

**Key interactions:**
- Click "Pipeline view" → Pipeline Board for this job
- Click "Upload CV" → Upload CV screen with this job pre-selected

---

### Upload CV (Step 1 of 4)

**Purpose:** Upload one or two CV files, specify output language, and trigger parsing. Supports dual-file input: File 1 is typically the 履歴書 (personal data), File 2 is the 職務経歴書 (work history). Both are optional independently.

**Layout (top to bottom, single-column):**
1. Candidate name input — optional pre-fill; if blank, name is detected from CV
2. Two side-by-side upload zones:
   - **File 1 — 履歴書** (blue border, primary): drag-and-drop or click to choose; PDF / DOCX / Image; max 10MB
   - **File 2 — 職務経歴書** (gray border, optional): same formats; shown with "Optional second file" label
3. Output language selector: Japanese (日本語) / English / Auto-detect
4. "Upload & Parse →" button (primary)

**States:**
- **Default:** Both zones empty; button disabled until at least File 1 is selected
- **File selected:** Zone shows filename and file size; X to remove
- **Uploading:** Progress bar per file zone; button shows spinner
- **Complete:** Navigates to Parsed Data Review (Step 2)
- **Upload failed:** Inline error below affected zone: "Upload failed — try again"

---

### Parsed Data Review (Step 2 of 4)

**Purpose:** Show the merged fields extracted from File 1 + File 2 combined. Recruiter corrects any errors before proceeding. No candidate record is saved until Step 2 is explicitly confirmed.

**Layout:**
1. Merge status banner (green): "Parsed from 2 files — 履歴書 + 職務経歴書. Review all fields before saving."
   - Or single-file banner: "Parsed from 1 file. Review all fields before saving."
   - Or parse-failed banner (amber): "Could not extract some fields — fill in manually before saving."
2. Two-column editable form:
   - Full name (required), Email, Phone, Location, Experience years, Source
   - Japanese level (detected from 職務経歴書 if present), English level
   - Skills (full width), Education (full width)
3. Actions: "Save & Continue →" (primary), "Edit fields" (secondary — switches all fields to editable inputs), "Re-parse" (re-runs parser without saving)

**States:**
- **All fields populated:** Banner is green; form fields show detected values
- **Some fields empty:** Affected rows show placeholder text "Not detected — enter manually"
- **Required field missing:** Inline error on Full name on attempted continue
- **Continue:** Saves candidate record to DB, navigates to Template Selection (Step 3)

---

### Template Selection (Step 3 of 4)

**Purpose:** Recruiter selects the output format and file type before the CV is generated.

**Layout:**
1. "Choose template" card — radio list of available templates:
   - **Agency Standard Format** — English, company-branded header, skills table
   - **Client A Format** — English, tailored for a specific client submission
   - **Japanese 履歴書 Format** — 日本語, JIS-standard layout with photo field
   - **Work Experience Sheet Format** — 日本語, 職務経歴書 format with detailed project history
2. "Output type" card — DOCX (default) / PDF radio toggle
3. "Generate CV →" button (primary)

**States:**
- **Default:** First template pre-selected; DOCX pre-selected as output type
- **Generating:** Button shows spinner: "Generating…"; estimated 5–15 seconds
- **Generation failed:** Toast: "Could not generate CV — try again"; stays on this screen
- **Complete:** Navigates to Download (Step 4)

---

### Download (Step 4 of 4)

**Purpose:** Confirm the generated CV is ready and give the recruiter the download action.

**Layout:**
1. Success confirmation card (green background):
   - Checkmark icon
   - "CV generated successfully"
   - File name and template name as subtitle (e.g. "Aung_Aung_JA_履歴書.docx · Japanese 履歴書 Format")
2. Action buttons (centered row):
   - "↓ Download DOCX" (or PDF — matches the selected output type) — primary
   - "Generate another format" — repeats Step 3 with same candidate data
   - "← Back to candidate" — navigates to Candidate Profile

**States:**
- **DOCX generated:** Primary button reads "↓ Download DOCX"
- **PDF generated:** Primary button reads "↓ Download PDF"
- **Download clicked:** Browser download triggers; page stays on this screen (recruiter may want to generate another format)

---

### Candidate List

**Purpose:** Searchable index of all candidates regardless of job. Generated CVs are accessible from the candidate profile, not this list.

**Layout:**
1. Search input
2. Table: Name | Skills | Experience | Location | Active jobs | View

---

### Candidate Profile

**Purpose:** Full candidate record — parsed CV data plus all job applications, logs, and files.

**Layout:**
1. Breadcrumb: ← Candidates
2. Page title: Candidate name + "Edit" and "New CV" buttons
3. 3-column info cards: Contact (name, email, phone) | Profile (experience, location, language levels) | Skills (badge list)
4. Tabs: Linked jobs | Activity logs | Files
   - **Linked jobs tab:** Table with Job, Client, Stage badge, Applied date, Recruiter, Pipeline button; + "Attach to another job" button
   - **Activity logs tab:** Log feed for this candidate
   - **Files tab:** CV, passport, certificates, offer letters

---

### Job Pipeline Board

**Purpose:** The hero screen. One Kanban board per job showing all candidates across 6 stages. This is the view a recruiter shares on a screen-share with a Hiring Manager to report progress on their specific role.

**Layout (left to right):**
1. Breadcrumb: ← Jobs + Job title — Client name (sticky header)
2. Recruiter filter dropdown — top right
3. 6 Kanban columns: Sourced | Screening | Interview | Offered | Placed | Rejected
   - Each column: header with stage name + candidate count badge
   - Candidate cards (see spec below)

**Candidate card:**
- Candidate name (bold) + status dot (green / amber / red) — top row
- Skills summary or experience line — second row
- Last log preview — truncated to one line; shown below a hairline divider
- Next reminder date (calendar tag) — if set

**Key interactions:**
- Drag card to new column → stage updates; inline log prompt appears: "Log this move?" with one-line input
- Click card → opens Candidate Profile (or navigates to it)
- Enter in log prompt → saves log entry, dismisses prompt; stage change is already committed
- Escape → dismisses prompt without adding log; stage change remains

**States:**
- **Empty column:** Dashed placeholder: "Drop candidate here"
- **Placed / Rejected cards:** Shown at 60% opacity; not draggable back to active stages
- **Loading:** Skeleton cards per column (1–2 each)
- **Stage update failed:** Card snaps back; toast: "Couldn't update stage — try again"
- **Column overflow (> 15 cards):** Column scrolls internally; height capped at viewport

---

### Recruiter Pipeline

**Purpose:** A single recruiter's full candidate workload, across every client and job, in one table. Where the Job Pipeline board answers "how is this one job going," this screen answers "what is this recruiter doing right now" — useful for the recruiter's own daily planning and for a manager checking in on workload distribution. This is the only pipeline-related sidebar entry; it's simply labelled **"Pipeline."**

**Layout (top to bottom):**
1. Filter bar (5 filters, all combinable):
   - **Client** — dropdown, all clients
   - **Job** — dropdown, narrows to jobs under the selected client (or all jobs if no client selected)
   - **Recruiter** — dropdown, defaults to the logged-in recruiter; managers can switch to any recruiter
   - **Stage** — multi-select: Sourced / Screening / Interview / Offered / Placed / Rejected
   - **Date** — range picker; filters by applied date or last activity date (toggle between the two)
2. "Add reminder" / "Log activity" quick actions — top right (act on the selected row)
3. Table: Candidate (+ status dot) | Job | Client | Stage badge | Applied date | Last activity date | Next reminder | View / Pipeline buttons

**Key interactions:**
- Changing any filter re-queries the table in place; filters persist in the URL so a manager can share a link scoped to one recruiter
- Click a row → opens Candidate Profile
- Click "Pipeline" button on a row → opens that candidate's Job Pipeline board, scrolled to their card
- Clear all filters → resets to "my candidates, all stages, all time"

**States:**
- **Default (recruiter logs in):** Filtered to themselves, all clients/jobs/stages, sorted by most recent activity first
- **No candidates match filters:** "No candidates match these filters" with a "Clear filters" button
- **Loading:** Skeleton table rows
- **Manager view:** Recruiter filter unlocked to view any team member's pipeline; own pipeline remains the default on load

---

### Activity Logs

**Purpose:** Create a new manual communication log entry; view recent logs across all entities.

**Layout (top to bottom):**
1. New log entry card:
   - Row 1: Target type (Candidate / Client / Job), Target name (select)
   - Row 2: Communication type (Call / Email / Meeting / Chat), Author
   - Row 3: Summary textarea (required, full width)
   - Row 4: Next action input (full width)
   - Save button
2. Chronological feed below: each entry shows type badge, entity badge (Candidate/Client/Job), author + date, body, next action

**States:**
- **Required field missing:** Inline error on Summary field
- **Empty feed:** "No logs yet — add your first entry above"

---

### Reminders

**Purpose:** Shared team view of all follow-up tasks, sorted by urgency.

**Layout (top to bottom):**
1. Topbar: User filter dropdown + "Add reminder" button
2. Section: Overdue — red background rows, red date text
3. Section: Today
4. Section: This week
5. Each reminder row: Task name | Entity + type | Due date + priority | Reschedule + Done buttons

**Key interactions:**
- "Done" → row strikes through and fades out; no confirmation modal
- "Reschedule" → inline date picker; updates due date in place
- Click row → opens the linked entity (candidate, client, or job)

**States:**
- **All clear:** "Nothing overdue — you're clear" with a checkmark; Today and This week sections still show
- **Empty (no reminders):** "No reminders set — add a follow-up from any candidate, client, or job"

---

### File Workspace — Root (Screen 19)

**Purpose:** Entry point into the file system. Shows the three top-level workspace roots — Clients, Candidates, Jobs — each as a clickable tile. Clicking one expands to show all entity workspaces under it.

**Layout:**
1. Page title: "File Workspace"
2. Search bar — searches file names and folder names across all workspaces
3. Three workspace root cards (grid):
   - **Clients** — shows entity count (e.g. "12 clients"), last updated timestamp
   - **Candidates** — same
   - **Jobs** — same
4. "Recently modified" section — last 5 files or folders touched, across any workspace

**Key interactions:**
- Click root card → drills into entity list (e.g. all clients alphabetically)
- Click entity name (e.g. "Toyota") → opens Entity Folder view (Screen 20)
- Search → results show file name, parent folder path, entity name

---

### File Workspace — Entity Folder (Screen 20)

**Purpose:** Browse the top-level folder structure for one entity (e.g. Toyota, Aung Aung). Shows all subfolders and any loose files. All file management actions are available here.

**Layout:**
1. Breadcrumb: File Workspace → Clients → Toyota
2. Folder grid — each subfolder shown as a card:
   - 📂 Folder icon + folder name
   - File count badge + last modified date
   - Default folders are labelled (Contracts, JD, Meeting Notes, NDA, Visa, Others for clients; CV, Passport, Certificates, JLPT, Photos, Other Documents for candidates)
   - User-created folders shown identically but without a "default" label
3. Toolbar below the grid:
   - `[+ New Folder]` — inline name input appears in the grid as a new card
   - `[Upload File]` — opens file picker; file uploads to the root of this entity (no subfolder)
4. Loose files section (below folder grid) — files uploaded directly to the entity root, not inside a subfolder

**Key interactions:**
- Click folder card → opens Folder Detail workspace (Screen 21)
- Drag a file from the loose files section onto a folder card → moves the file into that folder (shows drop highlight on target folder)
- Right-click folder card → context menu: Rename, Delete, Download as ZIP
- `[+ New Folder]` → an editable card appears inline in the grid; press Enter to confirm name, Escape to cancel; new folder appears immediately without page reload
- Empty folder → folder card shows "Empty" subtitle; still clickable

**States:**
- **Loading:** Skeleton folder cards (4–6)
- **Empty entity (no folders yet):** Grid shows only the default folders pre-created on entity record creation; toolbar still visible
- **Rename mode:** Folder name becomes an inline text input; blur or Enter saves

---

### File Workspace — Folder Detail (Screen 21)

**Purpose:** The main workspace for a specific folder. This is the collaboration hub — not just a file list. Four tabs expose everything relevant to this folder: the files themselves, contextual notes, a full history of actions, and who has access.

**Layout:**
1. Breadcrumb: File Workspace → Clients → Toyota → Contracts
2. Folder title + Edit (rename) icon
3. Toolbar row:
   - `[Upload File]` (primary)
   - `[New Subfolder]`
   - `[Download ZIP]`
4. Four tabs:

**Tab 1 — Files**
- File list (table or card grid, user-toggleable):
  - 📄 File name + file type icon | File size | Uploaded by | Date | Actions (Download, Move, Rename, Delete)
- Drag-and-drop upload zone — the entire tab content area accepts dropped files; shows "Drop to upload" overlay on drag-enter
- Empty state: dashed border zone with "Upload your first file or drag one here"
- **Move File:** clicking Move opens a folder picker modal — a tree of all folders under the same entity; user picks destination, file moves without page reload

**Tab 2 — Notes**
- Short rich-text notepad scoped to this folder
- Single editable text area with minimal formatting (bold, bullet list, link)
- Auto-saves on blur (no Save button needed)
- Shows "Last edited by [name] · [timestamp]" below the editor
- Use cases: meeting prep notes before a client call, visa checklist for a candidate folder, interview brief in a job's Interview Results folder

**Tab 3 — Activity History**
- Automatic, immutable log of every action that touched this folder:
  - File uploaded — filename, uploader, timestamp
  - File renamed — old name → new name, user, timestamp
  - File moved in — source folder path, user, timestamp
  - File moved out — destination folder path, user, timestamp
  - File deleted — filename, user, timestamp
  - Note edited — user, timestamp (content not stored in history)
  - Subfolder created — folder name, user, timestamp
- Displayed as a chronological feed, newest first
- No delete or edit on history entries — append-only

**Tab 4 — Shared Members**
- List of team members who have access to this folder (v1: all recruiters)
- Each row: avatar + name + role (Recruiter / Admin) + "Can view & upload" label
- Admin can toggle per-member access in v2 (row shows a lock icon with "Access control coming in v2" tooltip in v1)
- "Invite" button disabled in v1 with tooltip: "All team members have access by default"

**Key interactions (Files tab):**
- Drag file from OS desktop into browser tab → triggers upload; progress bar per file
- Drop file onto folder breadcrumb → moves file to parent folder
- Multi-select: checkbox column appears on hover; select multiple → bulk Download ZIP or bulk Delete
- Download ZIP → generates and streams a zip of selected files (or all files if none selected)

**States:**
- **Uploading:** Each file shows an inline progress bar in the file list; list row appears immediately with "Uploading…" status
- **Upload failed:** Row shows red "Failed — retry" with retry button
- **Empty folder (Files tab):** Dashed drop zone with icon and "No files yet"
- **Empty notes (Notes tab):** Placeholder text "Add context, checklists, or meeting prep notes here…"
- **Empty history:** "No activity yet — history will appear here as files are added"

---

## 5. The user journey

**First session.** The recruiter logs in and sees the onboarding screen — a clean 3-step progress indicator. They tap "Add your first client," fill in the company form (Nexus Systems K.K., Technology, Yamamoto Jiro), and save. They're taken to Client Detail. They tap "Add job," fill in the job form — Senior Java Engineer, ¥8M–¥12M, N2 Japanese, 5 years experience — and save. They're taken to the Upload CV screen with this job pre-selected. They upload Kim Jae-won's CV. The parser runs (5–10 seconds). The parsed fields appear — name, email, skills, education — all editable. They correct one field and hit "Save candidate." The candidate appears in the Sourced column of the pipeline board. They feel like they've built something real in under 10 minutes.

**First magical moment.** Three days later, the recruiter has 4 candidates across 2 jobs. They open the pipeline board for the Senior Java Engineer role. One card has a red dot — Kim Jae-won, overdue 3 days. They drag the card from Screening to Interview. The prompt: "Log this move?" They type "1st round confirmed Thu 26 Jun 10am." Enter. The dot turns green. They check the reminders list — two overdue items, both now visible in one place. For the first time since joining the agency, they feel in control of their pipeline.

**Second session.** They open the app at 9am. Dashboard is now their start: 24 active jobs, 8 interviews this week, 3 overdue reminders. They work through the reminders section — mark two done, reschedule one. They open the Atlas Fintech job to review a new CV upload a colleague did overnight. The day runs on the app, not on Excel.

---

## 6. Component & visual notes

- **Typography:** System sans-serif (Inter or system-ui). 13px body, 15px page titles, 11px labels and metadata. Functional, not decorative.
- **Color:** Neutral base (white cards, light gray page background). Color carries only semantic meaning: blue for informational (active, job badges, links), green for success/placed, amber for warning/on-hold/overdue-soon, red for danger/overdue, gray for neutral states. No decorative color.
- **Status dot:** 9px filled circle. The single most important visual element in the product. Green = < 7 days since contact. Amber = 7–14 days. Red = > 14 days or reminder past due. Appears on pipeline cards, job list rows, and reminder rows.
- **Motion:** Kanban drag is the only animated interaction. Card drag: 60fps. Drop snap: 150ms ease-out. Log prompt slides up: 120ms. Everything else is instant.
- **Badges:** Used for stage (blue tints), status (green/amber/gray), entity type (purple for Client, blue for Job, gray for Candidate), and language levels. Always pill-shaped. Text color uses the 800-stop of the same ramp.
- **Microcopy:** Direct, imperative, zero corporate hedging. "Log this move?" not "Would you like to record this action?" "Parsing CV…" not "Please wait while we process your document." "Nothing overdue — you're clear" not "Great work, all reminders complete!"
- **Tables:** Used for Client list, Job list, Candidate list, Files, Placements. Always include a hover state on rows. Sort columns by clicking headers (v1.1 — not required for v1).
- **Tabs:** Used on Client Detail, Job Detail, Candidate Profile. Always visible at the top of the detail card. Active tab uses blue underline.

---

## 7. Accessibility & inclusion

- **Screen readers:** All table columns have `<th>` headers with scope. Form fields have `<label>` associations. Pipeline cards have ARIA labels including candidate name and stage. Drag-and-drop has keyboard fallback: focus card → Space to pick up → arrow keys to move → Space to drop.
- **Motor difficulties:** All interactive targets minimum 44×44px. Kanban drag has tap-to-move fallback: tap card → stage selector modal appears.
- **Low bandwidth:** Tables and lists load skeleton rows on first paint. CV parsing is async — candidate card appears immediately in Sourced on upload; parsed fields populate when complete.
- **Language:** UI is English-only in v1. CV parser handles English, Japanese, and Myanmar input (with known limitations on scanned/image-only files). Non-Latin candidate names (Japanese kanji, Myanmar script) are stored as-is; no transliteration.
- **Color blindness:** Status dot states (green/amber/red) are also differentiated by shape in the reminder list: overdue rows have a full red background fill, not just a dot, so color is not the only signal.

---

## 8. What we are NOT designing

- **No candidate-facing portal** — all screens are recruiter-only; candidates never log in
- **No client-facing portal** — clients do not access the system directly
- **No mobile native app** — responsive web only; layout adapts to tablet but native mobile is v2
- **No settings screen** — user preferences (notification timing, display density) are hardcoded defaults in v1
- **No bulk import UI** — no CSV/Excel import screen; manual entry and CV upload are the only data entry paths in v1
- **No business card scan screen** — deferred per product scope
- **No email compose or send UI** — recruiters log that a call or email happened; they do not compose emails inside the app

---

## 9. Open design questions

- [ ] Should the pipeline board show ALL jobs' candidates in one mega-board, or always scope to one job? Current design: scoped to one job per board. A cross-job board is a different and more complex design problem — defer to v2.
- [ ] What does the "Attach to another job" flow look like in practice? Current design: button opens a job selector modal on the Candidate Profile. Needs wireframe before build.
- [ ] How do we handle a candidate who was Rejected on one job but is a fit for another? Current design: they remain in Rejected stage for job A; a new `CandidateJob` link is created for job B at Sourced. Is this clear enough from the UI without additional signposting?

---

## 10. Handoff to engineering

**Frontend stack:** React 19 + Vite + TypeScript + Tailwind CSS. Routing via React Router. Server state and polling via TanStack Query + Axios. Tables (Client list, Job list, Candidate list, Files, Reminders, Recruiter Pipeline) built on TanStack Table rather than hand-rolled `<table>` logic — gives sorting/filtering for free when v1.1 needs it. All forms (Add/Edit Client, Add/Edit Job, Parsed Data Review, Activity Log entry) use React Hook Form + Zod for validation, matching the "Required fields highlighted on failed submit" states specified per screen.

The Recruiter Pipeline table reuses the same `GET /api/v1/candidate-jobs` style filtering as the Job Pipeline board's recruiter dropdown — same query params (`client_id`, `job_id`, `recruiter_id`, `stage`, `date_from`, `date_to`), just a flat list response instead of grouped-by-stage columns. Build the filter bar as a shared component so both screens stay in sync if filter options change.

The Job Pipeline board Kanban drag is the highest-risk frontend interaction — use `@dnd-kit/core` (accessible, keyboard-capable) rather than rolling custom drag logic. The CV pipeline is a 4-screen linear flow (Upload → Review → Template → Download); each step navigates forward on success and allows backward navigation via breadcrumb. Parsing is async: POST the files, get back `upload_id(s)` and `parse_status: pending`, poll `GET /cv/parse-status?upload_ids=...` every 3 seconds via TanStack Query's `refetchInterval` until complete or failed, then populate the Review form. The candidate stub record must be written on upload (before parsing completes) so the recruiter can navigate away without losing the file. Template generation (Step 3 → Step 4) is also async: POST `/cv/generate`, poll `GET /cv/generate-status/{profile_id}` until `ready`, then enable the download button.
