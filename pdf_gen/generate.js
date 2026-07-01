const puppeteer = require('puppeteer');
const { marked } = require('marked');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function readMd(name) {
  return fs.readFileSync(path.join(ROOT, name), 'utf8');
}

function mdToHtml(md, sectionClass) {
  return `<div class="md-section ${sectionClass}">${marked.parse(md)}</div>`;
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 11pt;
  color: #1a1a1a;
  background: #fff;
  line-height: 1.65;
}

/* ── COVER ── */
.cover {
  page-break-after: always;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 80px 72px;
  background: #fff;
  border-left: 6px solid #185FA5;
}
.cover-logo { font-size: 32pt; font-weight: 600; color: #185FA5; margin-bottom: 8px; }
.cover-subtitle { font-size: 14pt; color: #555; margin-bottom: 48px; }
.cover-title { font-size: 26pt; font-weight: 600; color: #111; margin-bottom: 12px; line-height: 1.2; }
.cover-desc { font-size: 12pt; color: #444; max-width: 480px; line-height: 1.7; margin-bottom: 56px; }
.cover-meta { font-size: 10pt; color: #888; display: flex; flex-direction: column; gap: 4px; }
.cover-divider { width: 64px; height: 3px; background: #185FA5; margin: 32px 0; }
.cover-toc { margin-top: 40px; }
.cover-toc-title { font-size: 10pt; font-weight: 600; color: #185FA5; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }
.cover-toc-item { display: flex; align-items: baseline; gap: 8px; font-size: 10pt; color: #444; margin-bottom: 6px; }
.cover-toc-dot { width: 5px; height: 5px; border-radius: 50%; background: #185FA5; flex-shrink: 0; margin-bottom: 1px; }

/* ── SECTION HEADER ── */
.section-header {
  page-break-before: always;
  padding: 56px 72px 40px;
  border-bottom: 2px solid #185FA5;
  margin-bottom: 0;
}
.section-num { font-size: 10pt; font-weight: 600; color: #185FA5; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
.section-title { font-size: 22pt; font-weight: 600; color: #111; }
.section-sub { font-size: 11pt; color: #666; margin-top: 6px; }

/* ── MARKDOWN BODY ── */
.md-section {
  padding: 32px 72px 48px;
}

.md-section h1 {
  font-size: 20pt; font-weight: 600; color: #111;
  margin: 32px 0 16px; padding-bottom: 8px;
  border-bottom: 1.5px solid #e0e0e0;
  page-break-after: avoid;
}
.md-section h2 {
  font-size: 14pt; font-weight: 600; color: #185FA5;
  margin: 28px 0 10px;
  page-break-after: avoid;
}
.md-section h3 {
  font-size: 12pt; font-weight: 600; color: #333;
  margin: 20px 0 8px;
  page-break-after: avoid;
}
.md-section h4 {
  font-size: 11pt; font-weight: 600; color: #555;
  margin: 14px 0 6px;
  page-break-after: avoid;
}
.md-section p { margin: 0 0 10px; }
.md-section ul, .md-section ol { margin: 8px 0 10px 22px; }
.md-section li { margin-bottom: 5px; }
.md-section li > ul, .md-section li > ol { margin-top: 4px; }

.md-section blockquote {
  border-left: 4px solid #185FA5;
  background: #f0f6ff;
  padding: 12px 16px;
  margin: 12px 0;
  border-radius: 0 6px 6px 0;
  font-style: italic;
  color: #333;
}
.md-section blockquote p { margin: 0; }

.md-section code {
  font-family: 'Courier New', monospace;
  font-size: 9.5pt;
  background: #f4f4f4;
  padding: 2px 5px;
  border-radius: 3px;
  color: #c0392b;
}
.md-section pre {
  background: #1e2432;
  color: #d4d4d4;
  border-radius: 8px;
  padding: 16px 20px;
  overflow: hidden;
  margin: 12px 0 16px;
  page-break-inside: avoid;
}
.md-section pre code {
  background: none;
  color: #d4d4d4;
  padding: 0;
  font-size: 8.5pt;
  line-height: 1.6;
}
.md-section table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0 16px;
  font-size: 10pt;
  page-break-inside: avoid;
}
.md-section th {
  background: #f0f6ff;
  color: #185FA5;
  font-weight: 600;
  padding: 8px 12px;
  text-align: left;
  border: 0.5px solid #d0dff0;
}
.md-section td {
  padding: 7px 12px;
  border: 0.5px solid #e8e8e8;
  color: #333;
  vertical-align: top;
}
.md-section tr:nth-child(even) td { background: #fafafa; }

.md-section strong { font-weight: 600; color: #111; }
.md-section em { color: #555; }

.md-section hr {
  border: none;
  border-top: 1px solid #e8e8e8;
  margin: 20px 0;
}

/* checkbox list items */
.md-section li input[type=checkbox] { margin-right: 6px; }

/* ── UI DESIGN SECTION ── */
.ui-section {
  page-break-before: always;
}
.ui-intro {
  padding: 32px 72px 20px;
  font-size: 10.5pt;
  color: #555;
  border-bottom: 1px solid #e8e8e8;
  margin-bottom: 0;
}
.ui-intro p { margin: 0; }

.screen-wrapper {
  padding: 28px 72px;
  page-break-inside: avoid;
}
.screen-label {
  font-size: 9pt;
  font-weight: 600;
  color: #185FA5;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.screen-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e0ecff;
}

/* ── MINI APP CHROME ── */
.app-chrome {
  border: 1px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  height: auto;
  min-height: 360px;
  background: #f5f5f5;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
.sidebar {
  width: 170px;
  background: #fff;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.sidebar-logo {
  padding: 13px 16px;
  font-size: 13pt;
  font-weight: 600;
  border-bottom: 1px solid #eee;
  color: #111;
}
.sidebar-logo span { color: #185FA5; }
.nav-item {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 10px; font-size: 9pt; color: #777;
  border-radius: 5px; margin: 2px 5px;
}
.nav-item.active { background: #e8f1fb; color: #185FA5; font-weight: 600; }
.nav-item i { font-size: 14px; }
.nav-section { padding: 8px 10px 2px; font-size: 8pt; color: #bbb; text-transform: uppercase; letter-spacing: 0.07em; font-weight: 600; }
.user-block { padding: 10px 12px; border-top: 1px solid #eee; display: flex; align-items: center; gap: 8px; margin-top: auto; }
.avatar { width: 26px; height: 26px; border-radius: 50%; background: #e8f1fb; display: flex; align-items: center; justify-content: center; font-size: 9pt; font-weight: 600; color: #0C447C; }

.main-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
.topbar { padding: 11px 18px; border-bottom: 1px solid #eee; background: #fff; display: flex; align-items: center; justify-content: space-between; }
.topbar-title { font-size: 12pt; font-weight: 600; }
.content-area { flex: 1; padding: 14px 18px; background: #f9f9f9; }

/* ── MINI UI COMPONENTS ── */
.metric-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 14px; }
.metric-card { background: #f0f0f0; border-radius: 7px; padding: 10px 12px; }
.metric-label { font-size: 8pt; color: #888; margin-bottom: 3px; }
.metric-val { font-size: 18pt; font-weight: 600; color: #111; }
.metric-sub { font-size: 8pt; color: #999; margin-top: 2px; }
.metric-val.red { color: #E24B4A; }

.card { background: #fff; border: 1px solid #e8e8e8; border-radius: 8px; padding: 12px 14px; margin-bottom: 8px; }
.card-title { font-size: 10pt; font-weight: 600; margin-bottom: 8px; }

.tbl { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
.tbl th { text-align: left; padding: 6px 9px; font-size: 8pt; font-weight: 600; color: #888; border-bottom: 1px solid #eee; background: #fafafa; }
.tbl td { padding: 7px 9px; border-bottom: 1px solid #f0f0f0; color: #333; vertical-align: middle; }
.tbl tr:last-child td { border-bottom: none; }
.tbl-wrap { background: #fff; border: 1px solid #e8e8e8; border-radius: 8px; overflow: hidden; margin-bottom: 10px; }

.badge { display: inline-block; padding: 2px 7px; border-radius: 99px; font-size: 8pt; font-weight: 600; }
.b-blue { background: #e8f1fb; color: #0C447C; }
.b-green { background: #e8f3de; color: #27500A; }
.b-amber { background: #faeeda; color: #633806; }
.b-red { background: #fcebeb; color: #791F1F; }
.b-gray { background: #f0efe8; color: #444; }
.b-teal { background: #e0f5ee; color: #085041; }
.b-purple { background: #eeecfe; color: #3C3489; }

.dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
.dot-g { background: #639922; } .dot-a { background: #EF9F27; } .dot-r { background: #E24B4A; }

.btn-mock { display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; font-size: 8.5pt; border: 1px solid #ccc; border-radius: 5px; background: #fff; color: #333; }
.btn-primary-mock { background: #185FA5; border-color: #185FA5; color: #fff; }

.search-bar { display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: #f0f0f0; border: 1px solid #e0e0e0; border-radius: 5px; font-size: 8.5pt; color: #999; margin-bottom: 10px; }
.search-bar svg { flex-shrink: 0; }

.pipeline-outer { display: flex; gap: 7px; }
.p-col { flex: 1; background: #f0f0f0; border-radius: 7px; padding: 8px; }
.p-col-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 7px; }
.p-col-title { font-size: 7.5pt; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
.p-col-n { font-size: 8pt; background: #fff; border: 1px solid #e0e0e0; border-radius: 99px; padding: 1px 6px; color: #888; }
.p-card { background: #fff; border: 1px solid #e8e8e8; border-radius: 6px; padding: 8px 9px; margin-bottom: 6px; }
.p-card-name { font-size: 8.5pt; font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between; }
.p-card-log { font-size: 7.5pt; color: #aaa; border-top: 1px solid #f0f0f0; padding-top: 4px; margin-top: 4px; }
.p-empty { border: 1px dashed #d0d0d0; border-radius: 6px; padding: 10px; font-size: 8pt; color: #ccc; text-align: center; }

.tabs { display: flex; border-bottom: 1px solid #eee; margin-bottom: 10px; }
.tab { padding: 6px 12px; font-size: 8.5pt; color: #999; border-bottom: 2px solid transparent; }
.tab.active { color: #185FA5; border-bottom-color: #185FA5; font-weight: 600; }

.form-grid { display: grid; gap: 10px; }
.form-grid-2 { grid-template-columns: 1fr 1fr; }
.field { display: flex; flex-direction: column; gap: 4px; }
.field label { font-size: 8pt; color: #888; font-weight: 600; }
.field-val { padding: 6px 9px; font-size: 8.5pt; border: 1px solid #e0e0e0; border-radius: 5px; background: #f5f5f5; color: #333; }

.rem-section-title { font-size: 8pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #888; margin: 10px 0 6px; }
.rem-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 11px; background: #fff; border: 1px solid #e8e8e8; border-radius: 6px; margin-bottom: 5px; }
.rem-row.overdue { border-color: #f7c1c1; background: #fef5f5; }
.rem-name { font-size: 9pt; font-weight: 600; }
.rem-sub { font-size: 8pt; color: #999; }
.overdue-date { font-size: 8pt; color: #A32D2D; font-weight: 600; }

.log-item { padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
.log-header { display: flex; align-items: center; gap: 7px; margin-bottom: 4px; }
.log-body { font-size: 8.5pt; color: #333; margin-bottom: 3px; }
.log-next { font-size: 8pt; color: #185FA5; }
.log-meta { font-size: 8pt; color: #aaa; }

.file-row { display: flex; align-items: center; gap: 9px; padding: 8px 11px; background: #fff; border: 1px solid #e8e8e8; border-radius: 6px; margin-bottom: 5px; }
.file-icon { width: 28px; height: 28px; border-radius: 5px; background: #e8f1fb; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

.upload-zone { border: 1.5px dashed #ccc; border-radius: 8px; padding: 22px; text-align: center; background: #f9f9f9; margin-bottom: 12px; }

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

/* login card */
.login-wrap { display: flex; align-items: center; justify-content: center; background: #f5f5f5; padding: 40px; }
.login-card { background: #fff; border: 1px solid #e8e8e8; border-radius: 10px; padding: 28px; width: 280px; }
.login-logo { font-size: 18pt; font-weight: 600; margin-bottom: 20px; text-align: center; }
.login-logo span { color: #185FA5; }

/* stage bar */
.stage-bar { display: flex; flex-direction: column; gap: 6px; }
.stage-row { display: flex; align-items: center; gap: 8px; }
.stage-name { font-size: 8pt; color: #888; width: 60px; }
.stage-track { flex: 1; height: 7px; background: #f0f0f0; border-radius: 99px; }
.stage-fill { height: 100%; border-radius: 99px; }
.stage-count { font-size: 8pt; color: #888; width: 18px; text-align: right; }

/* onboarding */
.onboard-wrap { display: flex; align-items: center; justify-content: center; padding: 40px; background: #f9f9f9; }
.onboard-card { background: #fff; border: 1px solid #e8e8e8; border-radius: 10px; padding: 28px; text-align: center; max-width: 340px; }
.steps { display: flex; align-items: center; justify-content: center; gap: 0; margin: 20px 0; }
.step-circle { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10pt; font-weight: 600; }
.step-active { background: #185FA5; color: #fff; }
.step-inactive { background: #eee; color: #999; }
.step-line { width: 40px; height: 1px; background: #e0e0e0; margin-bottom: 18px; }
.step-label { font-size: 8pt; color: #888; margin-top: 4px; }

@media print {
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .screen-wrapper { page-break-inside: avoid; }
}
`;

// ── SIDEBAR HTML ──────────────────────────────────────────────────
function sidebar(activeItem) {
  const items = [
    { key: 'dashboard', icon: '⊞', label: 'Dashboard' },
    { key: 'clients',   icon: '🏢', label: 'Clients' },
    { key: 'jobs',      icon: '💼', label: 'Jobs' },
    { key: 'pipeline',  icon: '▦', label: 'Pipeline' },
    { key: 'candidates',icon: '👤', label: 'Candidates' },
    { key: 'upload',    icon: '↑', label: 'Upload CV' },
    { key: 'logs',      icon: '💬', label: 'Activity Logs' },
    { key: 'reminders', icon: '🔔', label: 'Reminders' },
    { key: 'files',     icon: '📁', label: 'Files' },
  ];
  return `
    <div class="sidebar">
      <div class="sidebar-logo">Recruit<span>Sync</span></div>
      <div style="flex:1;padding:6px 0">
        <div class="nav-section">Main</div>
        ${items.slice(0,1).map(i => `<div class="nav-item${activeItem===i.key?' active':''}"><span>${i.icon}</span>${i.label}</div>`).join('')}
        <div class="nav-section">Manage</div>
        ${items.slice(1,5).map(i => `<div class="nav-item${activeItem===i.key?' active':''}"><span>${i.icon}</span>${i.label}</div>`).join('')}
        <div class="nav-section">Tools</div>
        ${items.slice(5).map(i => `<div class="nav-item${activeItem===i.key?' active':''}"><span>${i.icon}</span>${i.label}</div>`).join('')}
      </div>
      <div class="user-block">
        <div class="avatar">TK</div>
        <div><div style="font-size:8.5pt;font-weight:600">Tanaka Kenji</div><div style="font-size:7.5pt;color:#999">Recruiter</div></div>
      </div>
    </div>`;
}

// ── SCREEN BUILDERS ───────────────────────────────────────────────

function screenLogin() {
  return `
  <div class="screen-wrapper">
    <div class="screen-label">Screen 01 — Login</div>
    <div class="app-chrome" style="min-height:320px">
      <div style="flex:1;display:flex;align-items:center;justify-content:center;background:#f5f5f5">
        <div class="login-card">
          <div class="login-logo">Recruit<span>Sync</span></div>
          <div class="field" style="margin-bottom:10px"><label>Email</label><div class="field-val" style="color:#999">you@company.com</div></div>
          <div class="field" style="margin-bottom:14px"><label>Password</label><div class="field-val" style="color:#999">••••••••</div></div>
          <div class="btn-primary-mock btn-mock" style="width:100%;justify-content:center;padding:8px">Log in</div>
          <div style="font-size:7.5pt;color:#aaa;text-align:center;margin-top:10px">RecruitSync V1 · Internal use only</div>
        </div>
      </div>
    </div>
  </div>`;
}

function screenOnboarding() {
  return `
  <div class="screen-wrapper">
    <div class="screen-label">Screen 02 — Onboarding (first-time flow)</div>
    <div class="app-chrome" style="min-height:280px">
      <div style="flex:1;display:flex;align-items:center;justify-content:center;background:#f9f9f9">
        <div class="onboard-card">
          <div style="font-size:14pt;font-weight:600;margin-bottom:6px">Welcome to RecruitSync</div>
          <div style="font-size:9pt;color:#888;margin-bottom:16px">Start by adding a client, then a job, then upload a candidate CV.</div>
          <div class="steps">
            <div style="display:flex;flex-direction:column;align-items:center"><div class="step-circle step-active">1</div><div class="step-label">Client</div></div>
            <div class="step-line"></div>
            <div style="display:flex;flex-direction:column;align-items:center"><div class="step-circle step-inactive">2</div><div class="step-label">Job</div></div>
            <div class="step-line"></div>
            <div style="display:flex;flex-direction:column;align-items:center"><div class="step-circle step-inactive">3</div><div class="step-label">Upload CV</div></div>
          </div>
          <div style="display:flex;gap:8px;justify-content:center;margin-top:8px">
            <div class="btn-mock btn-primary-mock">Add your first client</div>
            <div class="btn-mock">Skip — existing client</div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function screenDashboard() {
  return `
  <div class="screen-wrapper">
    <div class="screen-label">Screen 03 — Dashboard</div>
    <div class="app-chrome">
      ${sidebar('dashboard')}
      <div class="main-area">
        <div class="topbar"><span class="topbar-title">Dashboard</span><div class="btn-mock" style="font-size:8pt">This month ▾</div></div>
        <div class="content-area">
          <div class="metric-grid">
            <div class="metric-card"><div class="metric-label">Active jobs</div><div class="metric-val">24</div><div class="metric-sub">↑ 3 this month</div></div>
            <div class="metric-card"><div class="metric-label">In screening</div><div class="metric-val">16</div><div class="metric-sub">Across 12 jobs</div></div>
            <div class="metric-card"><div class="metric-label">Interviews today</div><div class="metric-val">8</div><div class="metric-sub">3 need confirmation</div></div>
            <div class="metric-card"><div class="metric-label">Reminders due</div><div class="metric-val red">5</div><div class="metric-sub">2 overdue</div></div>
          </div>
          <div class="two-col">
            <div class="card">
              <div class="card-title">Candidates by stage</div>
              <div class="stage-bar">
                <div class="stage-row"><span class="stage-name">Sourced</span><div class="stage-track"><div class="stage-fill" style="width:60%;background:#B5D4F4"></div></div><span class="stage-count">24</span></div>
                <div class="stage-row"><span class="stage-name">Screening</span><div class="stage-track"><div class="stage-fill" style="width:40%;background:#85B7EB"></div></div><span class="stage-count">16</span></div>
                <div class="stage-row"><span class="stage-name">Interview</span><div class="stage-track"><div class="stage-fill" style="width:20%;background:#378ADD"></div></div><span class="stage-count">8</span></div>
                <div class="stage-row"><span class="stage-name">Offered</span><div class="stage-track"><div class="stage-fill" style="width:8%;background:#185FA5"></div></div><span class="stage-count">3</span></div>
                <div class="stage-row"><span class="stage-name">Placed</span><div class="stage-track"><div class="stage-fill" style="width:12%;background:#639922"></div></div><span class="stage-count">5</span></div>
              </div>
            </div>
            <div class="card">
              <div class="card-title">Due today</div>
              <div style="padding:7px 9px;background:#fef5f5;border:1px solid #f7c1c1;border-radius:5px;margin-bottom:5px">
                <div style="font-size:9pt;font-weight:600;color:#791F1F">Call Yamamoto Corp</div>
                <div style="font-size:8pt;color:#A32D2D">Client · 3 days overdue</div>
              </div>
              <div style="padding:7px 9px;background:#f9f9f9;border:1px solid #eee;border-radius:5px;margin-bottom:5px">
                <div style="font-size:9pt;font-weight:600">Follow up — Tanaka Hiroshi</div>
                <div style="font-size:8pt;color:#999">Interview feedback due</div>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-title">Recent placements</div>
            <table class="tbl"><thead><tr><th>Candidate</th><th>Job</th><th>Client</th><th>Placed</th><th>Salary</th></tr></thead><tbody>
              <tr><td>Suzuki Akiko</td><td>Senior Java Engineer</td><td>Nexus Systems</td><td>20 Jun 2026</td><td>¥9,500,000</td></tr>
              <tr><td>Park Ji-ho</td><td>Product Manager</td><td>MedTech Japan</td><td>15 Jun 2026</td><td>¥11,200,000</td></tr>
            </tbody></table>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function screenClientList() {
  return `
  <div class="screen-wrapper">
    <div class="screen-label">Screen 04 — Client List</div>
    <div class="app-chrome">
      ${sidebar('clients')}
      <div class="main-area">
        <div class="topbar"><span class="topbar-title">Clients</span><div class="btn-mock btn-primary-mock">+ Add client</div></div>
        <div class="content-area">
          <div style="display:flex;gap:8px;margin-bottom:10px">
            <div class="search-bar" style="flex:1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> Search company, contact…</div>
            <div class="btn-mock" style="font-size:8pt">All industries ▾</div>
          </div>
          <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Company</th><th>Contact</th><th>Industry</th><th>Active jobs</th><th>Last contact</th></tr></thead><tbody>
            <tr><td style="font-weight:600">Nexus Systems K.K.</td><td>Yamamoto Jiro</td><td><span class="badge b-blue">Technology</span></td><td>4</td><td>2 days ago</td></tr>
            <tr><td style="font-weight:600">MedTech Japan</td><td>Ito Sachiko</td><td><span class="badge b-teal">Healthcare</span></td><td>2</td><td>Today</td></tr>
            <tr><td style="font-weight:600">Atlas Fintech</td><td>Nakamura Daisuke</td><td><span class="badge b-purple">Finance</span></td><td>3</td><td>5 days ago</td></tr>
            <tr><td style="font-weight:600">Tokyo Analytics</td><td>Watanabe Yuki</td><td><span class="badge b-blue">Technology</span></td><td>1</td><td>1 week ago</td></tr>
          </tbody></table></div>
        </div>
      </div>
    </div>
  </div>`;
}

function screenAddClient() {
  return `
  <div class="screen-wrapper">
    <div class="screen-label">Screen 05 — Add / Edit Client</div>
    <div class="app-chrome">
      ${sidebar('clients')}
      <div class="main-area">
        <div class="topbar"><span class="topbar-title"><span style="color:#185FA5;cursor:pointer">← Clients</span> &nbsp; Add client</span></div>
        <div class="content-area">
          <div class="card">
            <div class="form-grid form-grid-2" style="margin-bottom:10px">
              <div class="field"><label>Company name *</label><div class="field-val">e.g. Nexus Systems K.K.</div></div>
              <div class="field"><label>Industry</label><div class="field-val" style="color:#bbb">Select…</div></div>
              <div class="field"><label>Contact person *</label><div class="field-val" style="color:#bbb">Full name</div></div>
              <div class="field"><label>Email *</label><div class="field-val" style="color:#bbb">contact@company.com</div></div>
              <div class="field"><label>Phone</label><div class="field-val" style="color:#bbb">+81 3 0000 0000</div></div>
              <div class="field"><label>Website</label><div class="field-val" style="color:#bbb">https://</div></div>
              <div class="field" style="grid-column:1/-1"><label>Address</label><div class="field-val" style="color:#bbb">Tokyo, Japan</div></div>
              <div class="field" style="grid-column:1/-1"><label>Notes</label><div class="field-val" style="color:#bbb;height:40px">Internal notes…</div></div>
            </div>
            <div style="display:flex;gap:8px"><div class="btn-mock btn-primary-mock">Save client</div><div class="btn-mock">Cancel</div></div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function screenClientDetail() {
  return `
  <div class="screen-wrapper">
    <div class="screen-label">Screen 06 — Client Detail (tabs: Jobs / Logs / Files / Reminders)</div>
    <div class="app-chrome">
      ${sidebar('clients')}
      <div class="main-area">
        <div class="topbar"><span class="topbar-title" style="font-size:11pt"><span style="color:#185FA5">← Clients</span> &nbsp; Nexus Systems K.K.</span><div style="display:flex;gap:6px"><div class="btn-mock" style="font-size:8pt">Edit</div><div class="btn-mock btn-primary-mock" style="font-size:8pt">+ Add job</div></div></div>
        <div class="content-area">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">
            <div class="card" style="margin-bottom:0"><div style="font-size:8pt;color:#999;margin-bottom:3px">Contact</div><div style="font-weight:600;font-size:9pt">Yamamoto Jiro</div><div style="font-size:8pt;color:#888">yamamoto@nexus.co.jp</div></div>
            <div class="card" style="margin-bottom:0"><div style="font-size:8pt;color:#999;margin-bottom:3px">Industry</div><span class="badge b-blue">Technology</span><div style="font-size:8pt;color:#888;margin-top:4px">Shinjuku, Tokyo</div></div>
            <div class="card" style="margin-bottom:0"><div style="font-size:8pt;color:#999;margin-bottom:3px">Activity</div><div style="font-weight:600;font-size:9pt">4 active jobs</div><div style="font-size:8pt;color:#888">Last contact: 2 days ago</div></div>
          </div>
          <div class="tabs"><div class="tab active">Jobs</div><div class="tab">Activity logs</div><div class="tab">Files</div><div class="tab">Reminders</div></div>
          <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Job title</th><th>Type</th><th>Status</th><th>Candidates</th><th>Closing</th></tr></thead><tbody>
            <tr><td style="font-weight:600">Senior Java Engineer</td><td>Full-time</td><td><span class="badge b-green">Active</span></td><td>6</td><td>30 Jul 2026</td></tr>
            <tr><td style="font-weight:600">DevOps Lead</td><td>Full-time</td><td><span class="badge b-green">Active</span></td><td>3</td><td>15 Aug 2026</td></tr>
          </tbody></table></div>
        </div>
      </div>
    </div>
  </div>`;
}

function screenJobList() {
  return `
  <div class="screen-wrapper">
    <div class="screen-label">Screen 07 — Job List</div>
    <div class="app-chrome">
      ${sidebar('jobs')}
      <div class="main-area">
        <div class="topbar"><span class="topbar-title">Jobs</span><div class="btn-mock btn-primary-mock">+ Add job</div></div>
        <div class="content-area">
          <div style="display:flex;gap:8px;margin-bottom:10px">
            <div class="search-bar" style="flex:1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> Search job title, skills…</div>
            <div class="btn-mock" style="font-size:8pt">All clients ▾</div>
            <div class="btn-mock" style="font-size:8pt">All statuses ▾</div>
          </div>
          <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Job title</th><th>Client</th><th>Type</th><th>Status</th><th>Candidates</th><th>Closing</th></tr></thead><tbody>
            <tr><td style="font-weight:600">Senior Java Engineer</td><td>Nexus Systems</td><td>Full-time</td><td><span class="badge b-green">Active</span></td><td>6</td><td>30 Jul</td></tr>
            <tr><td style="font-weight:600">React Frontend Dev</td><td>Atlas Fintech</td><td>Full-time</td><td><span class="badge b-green">Active</span></td><td>4</td><td>10 Aug</td></tr>
            <tr><td style="font-weight:600">Clinical Data Manager</td><td>MedTech Japan</td><td>Contract</td><td><span class="badge b-amber">On hold</span></td><td>2</td><td>1 Sep</td></tr>
          </tbody></table></div>
        </div>
      </div>
    </div>
  </div>`;
}

function screenAddJob() {
  return `
  <div class="screen-wrapper">
    <div class="screen-label">Screen 08 — Add / Edit Job</div>
    <div class="app-chrome">
      ${sidebar('jobs')}
      <div class="main-area">
        <div class="topbar"><span class="topbar-title"><span style="color:#185FA5">← Jobs</span> &nbsp; Add job</span></div>
        <div class="content-area">
          <div class="card">
            <div class="form-grid form-grid-2" style="margin-bottom:10px">
              <div class="field"><label>Client *</label><div class="field-val" style="color:#bbb">Select client…</div></div>
              <div class="field"><label>Job title *</label><div class="field-val" style="color:#bbb">e.g. Senior Java Engineer</div></div>
              <div class="field"><label>Employment type *</label><div class="field-val" style="color:#bbb">Full-time ▾</div></div>
              <div class="field"><label>Location</label><div class="field-val" style="color:#bbb">e.g. Tokyo, Remote</div></div>
              <div class="field"><label>Salary min (JPY)</label><div class="field-val" style="color:#bbb">8000000</div></div>
              <div class="field"><label>Salary max (JPY)</label><div class="field-val" style="color:#bbb">12000000</div></div>
              <div class="field"><label>Japanese level</label><div class="field-val" style="color:#bbb">N2 ▾</div></div>
              <div class="field"><label>English level</label><div class="field-val" style="color:#bbb">Business ▾</div></div>
              <div class="field" style="grid-column:1/-1"><label>Required skills *</label><div class="field-val">Java, Spring Boot, Microservices, AWS</div></div>
            </div>
            <div style="display:flex;gap:8px"><div class="btn-mock btn-primary-mock">Save job</div><div class="btn-mock">Cancel</div></div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function screenJobDetail() {
  return `
  <div class="screen-wrapper">
    <div class="screen-label">Screen 09 — Job Detail (tabs: Candidates / Logs / Files)</div>
    <div class="app-chrome">
      ${sidebar('jobs')}
      <div class="main-area">
        <div class="topbar"><span class="topbar-title" style="font-size:10pt"><span style="color:#185FA5">← Jobs</span> &nbsp; Sr Java Engineer — Nexus</span><div style="display:flex;gap:6px"><div class="btn-mock btn-primary-mock" style="font-size:8pt">↑ Upload CV</div><div class="btn-mock" style="font-size:8pt">▦ Pipeline</div></div></div>
        <div class="content-area">
          <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px"><span class="badge b-green">Active</span><span class="badge b-blue">Full-time</span><span class="badge b-gray">Tokyo</span><span class="badge b-gray">N2+ Japanese</span><span class="badge b-gray">¥8M–¥12M</span><span class="badge b-gray">5+ yrs</span></div>
          <div class="tabs"><div class="tab active">Candidates (6)</div><div class="tab">Activity logs</div><div class="tab">Files</div></div>
          <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Candidate</th><th>Stage</th><th>Applied</th><th>Recruiter</th><th>Next reminder</th></tr></thead><tbody>
            <tr><td style="font-weight:600">Suzuki Akiko</td><td><span class="badge b-teal">Placed</span></td><td>1 May</td><td>Tanaka K.</td><td>—</td></tr>
            <tr><td style="font-weight:600">Kim Jae-won</td><td><span class="badge b-blue">Interview</span></td><td>10 Jun</td><td>Tanaka K.</td><td style="color:#E24B4A;font-weight:600">Today</td></tr>
            <tr><td style="font-weight:600">Patel Rahul</td><td><span class="badge b-amber">Screening</span></td><td>15 Jun</td><td>Tanaka K.</td><td>28 Jun</td></tr>
          </tbody></table></div>
        </div>
      </div>
    </div>
  </div>`;
}

function screenUploadCV() {
  return `
  <div class="screen-wrapper">
    <div class="screen-label">Screen 10 — Upload CV &amp; Parsed Profile Review</div>
    <div class="app-chrome">
      ${sidebar('upload')}
      <div class="main-area">
        <div class="topbar"><span class="topbar-title">Upload CV</span></div>
        <div class="content-area" style="overflow-y:auto">
          <div class="card">
            <div class="upload-zone">
              <div style="font-size:20pt;color:#ccc">↑</div>
              <div style="font-size:9pt;color:#999;margin-top:5px">Drag &amp; drop CV here, or click to choose file</div>
              <div style="font-size:8pt;color:#ccc;margin-top:3px">PDF, Word, or image · Max 10MB</div>
            </div>
            <div class="form-grid form-grid-2" style="margin-bottom:10px">
              <div class="field"><label>Attach to job *</label><div class="field-val">Senior Java Engineer (Nexus)</div></div>
              <div class="field"><label>Parse language</label><div class="field-val" style="color:#bbb">Auto-detect ▾</div></div>
            </div>
            <div class="btn-mock btn-primary-mock">Parse CV →</div>
          </div>
          <div class="card">
            <div class="card-title">Parsed profile — review before saving</div>
            <div class="form-grid form-grid-2" style="margin-bottom:10px">
              <div class="field"><label>Full name *</label><div class="field-val">Kim Jae-won</div></div>
              <div class="field"><label>Email</label><div class="field-val">kim.jaewon@email.com</div></div>
              <div class="field"><label>Phone</label><div class="field-val">+82 10 1234 5678</div></div>
              <div class="field"><label>Location</label><div class="field-val">Seoul, South Korea</div></div>
              <div class="field"><label>Experience (yrs)</label><div class="field-val">7</div></div>
              <div class="field"><label>Source</label><div class="field-val">CV upload</div></div>
              <div class="field" style="grid-column:1/-1"><label>Skills</label><div class="field-val">Java, Spring Boot, Kafka, AWS, Docker, Kubernetes</div></div>
            </div>
            <div style="display:flex;gap:8px"><div class="btn-mock btn-primary-mock">Save candidate</div><div class="btn-mock">Re-parse</div></div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function screenCandidateProfile() {
  return `
  <div class="screen-wrapper">
    <div class="screen-label">Screen 11 — Candidate Profile (tabs: Linked Jobs / Logs / Files)</div>
    <div class="app-chrome">
      ${sidebar('candidates')}
      <div class="main-area">
        <div class="topbar"><span class="topbar-title" style="font-size:11pt"><span style="color:#185FA5">← Candidates</span> &nbsp; Kim Jae-won</span><div style="display:flex;gap:6px"><div class="btn-mock" style="font-size:8pt">Edit</div><div class="btn-mock btn-primary-mock" style="font-size:8pt">↑ New CV</div></div></div>
        <div class="content-area">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">
            <div class="card" style="margin-bottom:0"><div style="font-size:8pt;color:#999;margin-bottom:3px">Contact</div><div style="font-weight:600;font-size:9pt">Kim Jae-won</div><div style="font-size:8pt;color:#888">kim.jaewon@email.com</div><div style="font-size:8pt;color:#888">+82 10 1234 5678</div></div>
            <div class="card" style="margin-bottom:0"><div style="font-size:8pt;color:#999;margin-bottom:3px">Profile</div><div style="font-size:9pt">7 yrs exp · Seoul</div><div style="font-size:8.5pt;margin-top:4px">N1 Japanese · Fluent EN</div></div>
            <div class="card" style="margin-bottom:0"><div style="font-size:8pt;color:#999;margin-bottom:3px">Skills</div><div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px"><span class="badge b-blue">Java</span><span class="badge b-blue">Spring</span><span class="badge b-gray">Kafka</span><span class="badge b-gray">AWS</span></div></div>
          </div>
          <div class="tabs"><div class="tab active">Linked jobs</div><div class="tab">Activity logs</div><div class="tab">Files</div></div>
          <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Job</th><th>Client</th><th>Stage</th><th>Applied</th><th>Recruiter</th></tr></thead><tbody>
            <tr><td style="font-weight:600">Senior Java Engineer</td><td>Nexus Systems</td><td><span class="badge b-blue">Interview</span></td><td>10 Jun 2026</td><td>Tanaka K.</td></tr>
          </tbody></table></div>
          <div class="btn-mock" style="font-size:8.5pt">+ Attach to another job</div>
        </div>
      </div>
    </div>
  </div>`;
}

function screenPipeline() {
  return `
  <div class="screen-wrapper">
    <div class="screen-label">Screen 12 — Pipeline Board (Kanban — hero screen)</div>
    <div class="app-chrome">
      ${sidebar('pipeline')}
      <div class="main-area">
        <div class="topbar"><span class="topbar-title" style="font-size:10pt"><span style="color:#185FA5">← Jobs</span> &nbsp; Senior Java Engineer — Nexus Systems</span><div class="btn-mock btn-primary-mock" style="font-size:8pt">+ Add candidate</div></div>
        <div class="content-area">
          <div class="pipeline-outer">
            <div class="p-col"><div class="p-col-hd"><span class="p-col-title">Sourced</span><span class="p-col-n">2</span></div>
              <div class="p-card"><div class="p-card-name">Sato Hiroshi <span class="dot dot-a"></span></div><div style="font-size:8pt;color:#aaa">LinkedIn outreach</div><div class="p-card-log">No contact yet</div></div>
              <div class="p-card"><div class="p-card-name">Liu Ming <span class="dot dot-g"></span></div><div style="font-size:8pt;color:#aaa">Referred by client</div><div class="p-card-log">Replied — interested</div></div>
            </div>
            <div class="p-col"><div class="p-col-hd"><span class="p-col-title">Screening</span><span class="p-col-n">1</span></div>
              <div class="p-card"><div class="p-card-name">Patel Rahul <span class="dot dot-g"></span></div><div style="font-size:8pt;color:#aaa">5 yrs · N2 · Biz EN</div><div class="p-card-log">Phone screen 28 Jun 10am</div></div>
            </div>
            <div class="p-col"><div class="p-col-hd"><span class="p-col-title">Interview</span><span class="p-col-n">1</span></div>
              <div class="p-card"><div class="p-card-name">Kim Jae-won <span class="dot dot-r"></span></div><div style="font-size:8pt;color:#aaa">7 yrs · N1 · Fluent EN</div><div class="p-card-log">1st round done — no feedback</div></div>
            </div>
            <div class="p-col"><div class="p-col-hd"><span class="p-col-title">Offered</span><span class="p-col-n">0</span></div>
              <div class="p-empty">Drop candidate here</div>
            </div>
            <div class="p-col"><div class="p-col-hd"><span class="p-col-title">Placed</span><span class="p-col-n">1</span></div>
              <div class="p-card" style="opacity:0.55"><div class="p-card-name">Suzuki Akiko <span class="badge b-teal" style="font-size:7pt">Placed</span></div><div class="p-card-log">¥9,500,000 · 1 Jun 2026</div></div>
            </div>
            <div class="p-col"><div class="p-col-hd"><span class="p-col-title">Rejected</span><span class="p-col-n">1</span></div>
              <div class="p-card" style="opacity:0.5"><div class="p-card-name">Tanaka Ryo</div><div class="p-card-log">Salary mismatch</div></div>
            </div>
          </div>
          <div style="margin-top:10px;padding:10px 12px;background:#f0f6ff;border:1px solid #c5daf7;border-radius:7px;display:flex;align-items:center;gap:8px">
            <div style="font-size:8.5pt;color:#185FA5;font-weight:600">Log this move?</div>
            <div class="field-val" style="flex:1;font-size:8.5pt;color:#bbb">Type note and press Enter…</div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function screenActivityLog() {
  return `
  <div class="screen-wrapper">
    <div class="screen-label">Screen 13 — Activity Logs</div>
    <div class="app-chrome">
      ${sidebar('logs')}
      <div class="main-area">
        <div class="topbar"><span class="topbar-title">Activity Logs</span><div class="btn-mock btn-primary-mock">+ Add log</div></div>
        <div class="content-area">
          <div class="card" style="margin-bottom:12px">
            <div class="card-title">New log entry</div>
            <div class="form-grid form-grid-2" style="margin-bottom:10px">
              <div class="field"><label>Target type</label><div class="field-val" style="color:#bbb">Candidate ▾</div></div>
              <div class="field"><label>Select target</label><div class="field-val" style="color:#bbb">Kim Jae-won ▾</div></div>
              <div class="field"><label>Communication type</label><div class="field-val" style="color:#bbb">Call ▾</div></div>
              <div class="field"><label>Author</label><div class="field-val">Tanaka Kenji</div></div>
              <div class="field" style="grid-column:1/-1"><label>Summary *</label><div class="field-val" style="height:36px;color:#bbb">What was discussed?</div></div>
              <div class="field" style="grid-column:1/-1"><label>Next action</label><div class="field-val" style="color:#bbb">e.g. Send updated profile by Friday</div></div>
            </div>
            <div class="btn-mock btn-primary-mock">Save log</div>
          </div>
          <div class="log-item"><div class="log-header"><span class="badge b-blue">Call</span><span class="badge b-gray">Candidate</span><span class="log-meta" style="margin-left:auto">Tanaka K. · 23 Jun</span></div><div class="log-body">Kim Jae-won — 1st round confirmed Thu 26 Jun. Salary expectation ¥10M.</div><div class="log-next">→ Get feedback from Nexus by 27 Jun</div></div>
          <div class="log-item"><div class="log-header"><span class="badge b-teal">Meeting</span><span class="badge b-gray">Client</span><span class="log-meta" style="margin-left:auto">Tanaka K. · 15 Jun</span></div><div class="log-body">Nexus onsite briefing — 2 new headcount, N2+ required.</div></div>
          <div class="log-item"><div class="log-header"><span class="badge b-purple">Email</span><span class="badge b-gray">Candidate</span><span class="log-meta" style="margin-left:auto">Tanaka K. · 10 Jun</span></div><div class="log-body">Patel Rahul — Sent JD and company profile. Awaiting reply.</div></div>
        </div>
      </div>
    </div>
  </div>`;
}

function screenReminders() {
  return `
  <div class="screen-wrapper">
    <div class="screen-label">Screen 14 — Reminders (Overdue / Today / This week)</div>
    <div class="app-chrome">
      ${sidebar('reminders')}
      <div class="main-area">
        <div class="topbar"><span class="topbar-title">Reminders</span><div style="display:flex;gap:6px"><div class="btn-mock" style="font-size:8pt">All users ▾</div><div class="btn-mock btn-primary-mock" style="font-size:8pt">+ Add reminder</div></div></div>
        <div class="content-area">
          <div class="rem-section-title" style="color:#A32D2D">Overdue</div>
          <div class="rem-row overdue"><div><div class="rem-name" style="color:#791F1F">Send updated JD — Nexus Systems</div><div class="rem-sub" style="color:#A32D2D">Client · Due 20 Jun · 5 days overdue · High priority</div></div><div style="display:flex;gap:5px"><div class="btn-mock" style="font-size:8pt">Reschedule</div><div class="btn-mock" style="font-size:8pt;border-color:#A32D2D;color:#A32D2D">Done</div></div></div>
          <div class="rem-row overdue"><div><div class="rem-name" style="color:#791F1F">Interview feedback — Kim Jae-won</div><div class="rem-sub" style="color:#A32D2D">Candidate · Due 22 Jun · 3 days overdue</div></div><div style="display:flex;gap:5px"><div class="btn-mock" style="font-size:8pt">Reschedule</div><div class="btn-mock" style="font-size:8pt;border-color:#A32D2D;color:#A32D2D">Done</div></div></div>
          <div class="rem-section-title">Today</div>
          <div class="rem-row"><div><div class="rem-name">Follow up — Patel Rahul</div><div class="rem-sub">Candidate · Screening · Medium priority</div></div><div style="display:flex;gap:5px"><div class="btn-mock" style="font-size:8pt">Reschedule</div><div class="btn-mock" style="font-size:8pt">Done</div></div></div>
          <div class="rem-section-title">This week</div>
          <div class="rem-row"><div><div class="rem-name">Quarterly check-in — MedTech Japan</div><div class="rem-sub">Client · Due 28 Jun · Low priority</div></div><div style="display:flex;gap:5px"><div class="btn-mock" style="font-size:8pt">Reschedule</div><div class="btn-mock" style="font-size:8pt">Done</div></div></div>
        </div>
      </div>
    </div>
  </div>`;
}

function screenFileWorkspaceRoot() {
  return `
  <div class="screen-wrapper">
    <div class="screen-label">Screen 15 — File Workspace Root</div>
    <div class="app-chrome">
      ${sidebar('files')}
      <div class="main-area">
        <div class="topbar"><span class="topbar-title">File Workspace</span>
          <div class="search-bar" style="width:200px;margin:0"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>&nbsp;Search files &amp; folders…</div>
        </div>
        <div class="content-area">
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">
            ${[
              ['🏢','Clients','12 companies','Last updated 2h ago','b-purple'],
              ['👤','Candidates','38 profiles','Last updated today','b-gray'],
              ['💼','Jobs','24 openings','Last updated 1h ago','b-blue'],
            ].map(([icon,label,count,sub,badge])=>`
            <div class="card" style="margin-bottom:0;cursor:pointer;border-color:#e0ecff">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
                <div style="width:36px;height:36px;border-radius:8px;background:#f0f6ff;display:flex;align-items:center;justify-content:center;font-size:16pt">${icon}</div>
                <div><div style="font-size:11pt;font-weight:600">${label}</div><span class="badge ${badge}" style="font-size:7.5pt">${count}</span></div>
              </div>
              <div style="font-size:8pt;color:#aaa">${sub}</div>
            </div>`).join('')}
          </div>
          <div class="card">
            <div class="card-title">Recently modified</div>
            ${[
              ['📄','contract_v2.pdf','Nexus Systems / Contracts','Tanaka K.','2h ago'],
              ['📄','Aung_Aung_Passport.pdf','Candidates / Aung Aung / Passport','Yamamoto R.','Today'],
              ['📂','2026 Projects','Toyota / (new folder)','Tanaka K.','Yesterday'],
              ['📄','JD_BackendDev_v3.pdf','Jobs / Backend Developer / JD','Ito S.','2 days ago'],
            ].map(([icon,name,path,user,time])=>`
            <div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid #f5f5f5">
              <div style="font-size:14pt;width:24px;text-align:center">${icon}</div>
              <div style="flex:1"><div style="font-size:9pt;font-weight:600">${name}</div><div style="font-size:8pt;color:#999">${path}</div></div>
              <div style="text-align:right"><div style="font-size:8pt;color:#888">${user}</div><div style="font-size:7.5pt;color:#bbb">${time}</div></div>
            </div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function screenFileWorkspaceEntity() {
  return `
  <div class="screen-wrapper">
    <div class="screen-label">Screen 16 — File Workspace — Entity Folder (e.g. Toyota)</div>
    <div class="app-chrome">
      ${sidebar('files')}
      <div class="main-area">
        <div class="topbar">
          <span class="topbar-title" style="font-size:10pt"><span style="color:#185FA5">File Workspace</span> › <span style="color:#185FA5">Clients</span> › Toyota</span>
          <div style="display:flex;gap:6px">
            <div class="btn-mock" style="font-size:8pt">+ New Folder</div>
            <div class="btn-mock btn-primary-mock" style="font-size:8pt">↑ Upload File</div>
          </div>
        </div>
        <div class="content-area">
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px">
            ${[
              ['📂','Contracts','4 files','Default'],
              ['📂','JD','2 files','Default'],
              ['📂','Meeting Notes','7 files','Default'],
              ['📂','NDA','1 file','Default'],
              ['📂','Visa','3 files','Default'],
              ['📂','2026 Projects','5 files','Custom'],
              ['📂','Interview Results','2 files','Default'],
              ['📂','My Folder','0 files','Custom'],
            ].map(([icon,name,count,type])=>`
            <div style="border:1px solid ${type==='Custom'?'#e0d9ff':'#e8e8e8'};border-radius:8px;padding:10px 11px;background:${type==='Custom'?'#f8f5ff':'#fff'};cursor:pointer">
              <div style="font-size:18pt;margin-bottom:5px">${icon}</div>
              <div style="font-size:9pt;font-weight:600;margin-bottom:2px">${name}</div>
              <div style="display:flex;align-items:center;justify-content:space-between">
                <span style="font-size:7.5pt;color:#aaa">${count}</span>
                ${type==='Custom'?'<span style="font-size:7pt;color:#7c5cbf;background:#eeecfe;padding:1px 5px;border-radius:99px">Custom</span>':''}
              </div>
            </div>`).join('')}
          </div>
          <div style="font-size:8pt;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">Loose files (entity root)</div>
          <div class="tbl-wrap"><table class="tbl"><thead><tr><th>File</th><th>Size</th><th>Uploaded by</th><th>Date</th><th></th></tr></thead><tbody>
            <tr><td>📄 company_profile.pdf</td><td>1.2 MB</td><td>Tanaka K.</td><td>5 Jun</td><td><div style="display:flex;gap:4px"><div class="btn-mock" style="font-size:7.5pt">Move</div><div class="btn-mock" style="font-size:7.5pt">↓</div></div></td></tr>
          </tbody></table></div>
        </div>
      </div>
    </div>
  </div>`;
}

function screenFileWorkspaceFolder() {
  return `
  <div class="screen-wrapper">
    <div class="screen-label">Screen 17 — File Workspace — Folder Detail (4 tabs: Files / Notes / Activity / Members)</div>
    <div class="app-chrome" style="min-height:400px">
      ${sidebar('files')}
      <div class="main-area">
        <div class="topbar">
          <span class="topbar-title" style="font-size:9.5pt"><span style="color:#185FA5">File Workspace</span> › <span style="color:#185FA5">Clients</span> › <span style="color:#185FA5">Toyota</span> › Contracts</span>
          <div style="display:flex;gap:6px">
            <div class="btn-mock" style="font-size:8pt">↓ ZIP</div>
            <div class="btn-mock" style="font-size:8pt">+ Subfolder</div>
            <div class="btn-mock btn-primary-mock" style="font-size:8pt">↑ Upload</div>
          </div>
        </div>
        <div class="content-area">

          <!-- Files tab active -->
          <div class="tabs" style="margin-bottom:10px">
            <div class="tab active">📄 Files (3)</div>
            <div class="tab">💬 Notes</div>
            <div class="tab">🕒 Activity History</div>
            <div class="tab">👥 Shared Members</div>
          </div>

          <!-- upload drop zone hint -->
          <div style="border:1.5px dashed #c5daf7;border-radius:6px;padding:8px 12px;font-size:8pt;color:#185FA5;background:#f0f6ff;display:flex;align-items:center;gap:6px;margin-bottom:10px">
            <span>↑</span> Drag files here to upload — or use the Upload button above
          </div>

          <!-- file list -->
          <div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th>File name</th><th>Size</th><th>Uploaded by</th><th>Date</th><th>Actions</th></tr></thead><tbody>
            <tr>
              <td style="width:18px"><input type="checkbox" style="margin:0"></td>
              <td>📄 contract_v1.pdf</td><td>842 KB</td><td>Tanaka K.</td><td>1 May</td>
              <td><div style="display:flex;gap:4px"><div class="btn-mock" style="font-size:7.5pt">↓</div><div class="btn-mock" style="font-size:7.5pt">Move</div><div class="btn-mock" style="font-size:7.5pt">Rename</div><div class="btn-mock" style="font-size:7.5pt;color:#A32D2D;border-color:#f7c1c1">Delete</div></div></td>
            </tr>
            <tr>
              <td><input type="checkbox" style="margin:0"></td>
              <td>📄 contract_v2.pdf</td><td>895 KB</td><td>Tanaka K.</td><td>10 Jun</td>
              <td><div style="display:flex;gap:4px"><div class="btn-mock" style="font-size:7.5pt">↓</div><div class="btn-mock" style="font-size:7.5pt">Move</div><div class="btn-mock" style="font-size:7.5pt">Rename</div><div class="btn-mock" style="font-size:7.5pt;color:#A32D2D;border-color:#f7c1c1">Delete</div></div></td>
            </tr>
            <tr>
              <td><input type="checkbox" style="margin:0"></td>
              <td>📄 signed_contract.pdf</td><td>1.1 MB</td><td>Yamamoto R.</td><td>20 Jun</td>
              <td><div style="display:flex;gap:4px"><div class="btn-mock" style="font-size:7.5pt">↓</div><div class="btn-mock" style="font-size:7.5pt">Move</div><div class="btn-mock" style="font-size:7.5pt">Rename</div><div class="btn-mock" style="font-size:7.5pt;color:#A32D2D;border-color:#f7c1c1">Delete</div></div></td>
            </tr>
          </tbody></table></div>
          <div style="margin-top:8px;display:flex;gap:6px">
            <div class="btn-mock" style="font-size:8pt;color:#888">☐ Select all</div>
            <div class="btn-mock" style="font-size:8pt">↓ Download selected as ZIP</div>
          </div>

          <!-- Notes tab preview (collapsed) -->
          <div style="margin-top:14px;border:1px solid #eee;border-radius:8px;overflow:hidden">
            <div style="background:#fafafa;padding:7px 12px;border-bottom:1px solid #eee;display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:8.5pt;font-weight:600;color:#555">💬 Notes <span style="color:#bbb;font-weight:400">(click Notes tab to edit)</span></span>
              <span style="font-size:7.5pt;color:#bbb">Last edited by Tanaka K. · 22 Jun</span>
            </div>
            <div style="padding:10px 12px;font-size:8.5pt;color:#555;line-height:1.6">
              ✅ Review signed contract deadline by 30 Jun<br>
              📌 Send copy to Nexus legal team after client signature<br>
              ⚠ NDA must be re-signed before project kickoff
            </div>
          </div>

          <!-- Activity History preview -->
          <div style="margin-top:12px;border:1px solid #eee;border-radius:8px;overflow:hidden">
            <div style="background:#fafafa;padding:7px 12px;border-bottom:1px solid #eee">
              <span style="font-size:8.5pt;font-weight:600;color:#555">🕒 Activity History</span>
            </div>
            <div style="padding:8px 12px">
              ${[
                ['Yamamoto R.','uploaded','signed_contract.pdf','20 Jun 14:32'],
                ['Tanaka K.','renamed','contract_draft.pdf → contract_v2.pdf','10 Jun 09:11'],
                ['Tanaka K.','edited note','—','22 Jun 10:05'],
                ['Tanaka K.','uploaded','contract_v1.pdf','1 May 11:00'],
              ].map(([user,action,detail,time])=>`
              <div style="display:flex;align-items:baseline;gap:8px;padding:5px 0;border-bottom:1px solid #f5f5f5;font-size:8pt">
                <span style="width:76px;color:#888;flex-shrink:0">${time}</span>
                <span style="font-weight:600">${user}</span>
                <span style="color:#555">${action}</span>
                <span style="color:#aaa;font-style:italic;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${detail}</span>
              </div>`).join('')}
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>`;
}

// ── CV PIPELINE SECTION ───────────────────────────────────────────
function cvPipelineSection() {
  return `
<!-- ══ PART 5: CV PIPELINE ═══════════════════════════════════════ -->
<div class="section-header" style="page-break-before:always">
  <div class="section-num">Part 5 of 5</div>
  <div class="section-title">CV Upload &amp; Generation Pipeline</div>
  <div class="section-sub">System design — dual-file upload, parser, merge engine, template selector, export (DOCX/PDF)</div>
</div>
<div class="md-section cv-pipeline">

<!-- ── SYSTEM FLOW ── -->
<h2>System Design Flow</h2>
<div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:20px 0 28px">
  ${[
    ['CV Upload Screen',        'Recruiter uploads one or two CV files (PDF / DOCX / Image)'],
    ['CV Parser',               'Extract name, contact, skills, experience, education'],
    ['Data Merge Engine',       'Combine data from File 1 &amp; File 2 into a single candidate record'],
    ['Template Selector',       'Recruiter selects output format (Agency Standard / Client / 履歴書)'],
    ['Profile Editor',          'Recruiter reviews parsed fields and corrects errors'],
    ['Export Generator',        'Render chosen template → DOCX or PDF'],
    ['Download',                'Recruiter downloads the finished formatted CV'],
  ].map(([title, desc], i, arr) => `
    <div style="display:flex;flex-direction:column;align-items:center;width:100%">
      <div style="display:flex;align-items:center;gap:12px;width:100%;max-width:600px">
        <div style="width:26px;height:26px;border-radius:50%;background:#185FA5;color:#fff;font-size:9pt;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0">${i+1}</div>
        <div style="flex:1;border:1px solid #c5daf7;border-radius:8px;padding:10px 14px;background:#f0f6ff">
          <div style="font-size:10pt;font-weight:600;color:#0C447C">${title}</div>
          <div style="font-size:8.5pt;color:#555;margin-top:2px">${desc}</div>
        </div>
        ${title === 'CV Upload Screen' ? '<div style="font-size:8pt;color:#888;margin-left:4px">File 1: 履歴書<br>File 2: 職務経歴書</div>' : ''}
      </div>
      ${i < arr.length-1 ? '<div style="width:2px;height:18px;background:#c5daf7;margin:2px 0 2px 13px;align-self:flex-start"></div>' : ''}
    </div>`).join('')}
</div>

<!-- ── MAIN MODULES ── -->
<h2>Main Modules</h2>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px">
  <div class="card" style="margin-bottom:0">
    <div class="card-title" style="color:#185FA5">Frontend</div>
    <ul style="font-size:9pt;color:#444;margin:0;padding-left:16px">
      <li>CV Upload UI</li>
      <li>Parsed Data Review UI</li>
      <li>Template Select UI</li>
      <li>Profile Editor UI</li>
      <li>Download UI</li>
    </ul>
  </div>
  <div class="card" style="margin-bottom:0">
    <div class="card-title" style="color:#185FA5">Backend Services</div>
    <ul style="font-size:9pt;color:#444;margin:0;padding-left:16px">
      <li>File Upload API</li>
      <li>CV Parser Service</li>
      <li>Data Merge Service</li>
      <li>Template Mapping Service</li>
      <li>Document Export Service</li>
    </ul>
  </div>
  <div class="card" style="margin-bottom:0">
    <div class="card-title" style="color:#185FA5">Storage</div>
    <ul style="font-size:9pt;color:#444;margin:0;padding-left:16px">
      <li>Original CV files (object store)</li>
      <li>Parsed candidate data (DB)</li>
      <li>Template files (object store)</li>
      <li>Generated DOCX/PDF files</li>
    </ul>
  </div>
</div>

<!-- ── DATABASE TABLES ── -->
<h2>Database Tables</h2>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px">
  <div>
    <h3>cv_uploads</h3>
    <table class="tbl" style="margin-top:6px"><thead><tr><th>Column</th><th>Type</th><th>Note</th></tr></thead><tbody>
      <tr><td>upload_id</td><td>UUID PK</td><td></td></tr>
      <tr><td>candidate_id</td><td>UUID FK</td><td>→ candidates</td></tr>
      <tr><td>file_name</td><td>text</td><td>Original filename</td></tr>
      <tr><td>file_type</td><td>text</td><td>pdf / docx / image</td></tr>
      <tr><td>file_path</td><td>text</td><td>Object store path</td></tr>
      <tr><td>uploaded_by</td><td>UUID FK</td><td>→ users</td></tr>
      <tr><td>created_at</td><td>timestamptz</td><td></td></tr>
    </tbody></table>
  </div>
  <div>
    <h3>cv_parsed_data</h3>
    <table class="tbl" style="margin-top:6px"><thead><tr><th>Column</th><th>Type</th><th>Note</th></tr></thead><tbody>
      <tr><td>parsed_id</td><td>UUID PK</td><td></td></tr>
      <tr><td>upload_id</td><td>UUID FK</td><td>→ cv_uploads</td></tr>
      <tr><td>full_name</td><td>text</td><td></td></tr>
      <tr><td>email</td><td>text</td><td></td></tr>
      <tr><td>phone</td><td>text</td><td></td></tr>
      <tr><td>skills</td><td>jsonb</td><td>Array of strings</td></tr>
      <tr><td>experience</td><td>jsonb</td><td>Array of objects</td></tr>
      <tr><td>education</td><td>jsonb</td><td>Array of objects</td></tr>
      <tr><td>language_level</td><td>jsonb</td><td>{ja: "N2", en: "Business"}</td></tr>
    </tbody></table>
  </div>
  <div>
    <h3>cv_templates</h3>
    <table class="tbl" style="margin-top:6px"><thead><tr><th>Column</th><th>Type</th><th>Note</th></tr></thead><tbody>
      <tr><td>template_id</td><td>UUID PK</td><td></td></tr>
      <tr><td>template_name</td><td>text</td><td>e.g. "Agency Standard"</td></tr>
      <tr><td>language</td><td>text</td><td>ja / en</td></tr>
      <tr><td>file_path</td><td>text</td><td>DOCX template path</td></tr>
      <tr><td>created_by</td><td>UUID FK</td><td>→ users</td></tr>
    </tbody></table>
  </div>
  <div>
    <h3>generated_profiles</h3>
    <table class="tbl" style="margin-top:6px"><thead><tr><th>Column</th><th>Type</th><th>Note</th></tr></thead><tbody>
      <tr><td>profile_id</td><td>UUID PK</td><td></td></tr>
      <tr><td>candidate_id</td><td>UUID FK</td><td>→ candidates</td></tr>
      <tr><td>template_id</td><td>UUID FK</td><td>→ cv_templates</td></tr>
      <tr><td>output_type</td><td>text</td><td>docx / pdf</td></tr>
      <tr><td>file_path</td><td>text</td><td>Generated file path</td></tr>
      <tr><td>generated_at</td><td>timestamptz</td><td></td></tr>
    </tbody></table>
  </div>
</div>

<!-- ── API DESIGN ── -->
<h2>API Design</h2>
<table class="tbl" style="margin-bottom:20px"><thead><tr><th>Method</th><th>Endpoint</th><th>Description</th></tr></thead><tbody>
  <tr><td><span class="badge b-blue">POST</span></td><td>/cv/uploads</td><td>Upload 1 or 2 CV files (multipart/form-data). Returns upload_id(s).</td></tr>
  <tr><td><span class="badge b-blue">POST</span></td><td>/cv/parse</td><td>Trigger async extraction from upload_id. Returns parsed_id(s) when complete.</td></tr>
  <tr><td><span class="badge b-blue">POST</span></td><td>/cv/merge</td><td>Merge parsed data from two upload_ids into a single candidate record.</td></tr>
  <tr><td><span class="badge b-green">GET</span></td><td>/cv/templates</td><td>List available recruiter templates (language, name, preview).</td></tr>
  <tr><td><span class="badge b-blue">POST</span></td><td>/cv/generate</td><td>Render chosen template with candidate data → DOCX or PDF. Returns profile_id.</td></tr>
  <tr><td><span class="badge b-green">GET</span></td><td>/cv/download/{profileId}</td><td>Stream the generated DOCX or PDF file for download.</td></tr>
</tbody></table>

<!-- ── UI WIREFRAMES ── -->
<h2>UI Screen Designs</h2>

<!-- Screen 1: Upload -->
<h3>Screen 1 — CV Upload</h3>
<div class="screen-wrapper" style="padding:0 0 24px">
  <div class="app-chrome" style="min-height:280px">
    ${sidebar('upload')}
    <div class="main-area">
      <div class="topbar"><span class="topbar-title">Upload Candidate CV</span></div>
      <div class="content-area">
        <div class="card">
          <div class="form-grid" style="margin-bottom:12px">
            <div class="field"><label>Candidate name (optional)</label><div class="field-val" style="color:#bbb">Pre-fill or leave blank to detect from CV</div></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:4px">
              <div style="border:1.5px dashed #c5daf7;border-radius:7px;padding:14px;text-align:center;background:#f0f6ff">
                <div style="font-size:11pt;color:#185FA5">↑</div>
                <div style="font-size:9pt;font-weight:600;color:#185FA5;margin-top:3px">File 1 — 履歴書</div>
                <div style="font-size:8pt;color:#999;margin-top:2px">PDF / DOCX / Image</div>
              </div>
              <div style="border:1.5px dashed #d0d0d0;border-radius:7px;padding:14px;text-align:center;background:#f9f9f9">
                <div style="font-size:11pt;color:#bbb">↑</div>
                <div style="font-size:9pt;font-weight:600;color:#aaa;margin-top:3px">File 2 — 職務経歴書</div>
                <div style="font-size:8pt;color:#ccc;margin-top:2px">Optional second file</div>
              </div>
            </div>
            <div class="field" style="margin-top:6px"><label>Output language</label><div class="field-val" style="color:#185FA5">Japanese (日本語) ▾</div></div>
          </div>
          <div class="btn-mock btn-primary-mock">Upload &amp; Parse →</div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Screen 2: Parsed Review -->
<h3>Screen 2 — Parsed Data Review</h3>
<div class="screen-wrapper" style="padding:0 0 24px">
  <div class="app-chrome" style="min-height:300px">
    ${sidebar('upload')}
    <div class="main-area">
      <div class="topbar">
        <span class="topbar-title"><span style="color:#185FA5">← Upload</span> &nbsp; Review Extracted Data</span>
        <div style="display:flex;gap:6px"><div class="btn-mock" style="font-size:8pt">Re-parse</div><div class="btn-mock btn-primary-mock" style="font-size:8pt">Continue →</div></div>
      </div>
      <div class="content-area">
        <div style="display:flex;gap:8px;align-items:center;padding:8px 12px;background:#e8f3de;border:1px solid #c0dda0;border-radius:6px;margin-bottom:12px;font-size:8.5pt;color:#27500A">
          <span>✓</span> <span>Parsed from 2 files — 履歴書 + 職務経歴書. Review all fields before saving.</span>
        </div>
        <div class="card">
          <div class="form-grid form-grid-2" style="margin-bottom:10px">
            <div class="field"><label>Full name</label><div class="field-val">Aung Aung</div></div>
            <div class="field"><label>Email</label><div class="field-val">aung.aung@email.com</div></div>
            <div class="field"><label>Phone</label><div class="field-val">090-1234-5678</div></div>
            <div class="field"><label>Location</label><div class="field-val">Osaka, Japan</div></div>
            <div class="field"><label>Experience</label><div class="field-val">5 years · Software Engineering</div></div>
            <div class="field"><label>Education</label><div class="field-val">Bachelor of Engineering, Rangoon Univ.</div></div>
            <div class="field"><label>Japanese level</label><div class="field-val">N2 <span style="color:#aaa;font-size:8pt">(detected from 職務経歴書)</span></div></div>
            <div class="field"><label>English level</label><div class="field-val">Business</div></div>
            <div class="field" style="grid-column:1/-1"><label>Skills</label><div class="field-val">Java, Spring Boot, SQL, Python, AWS, Docker</div></div>
          </div>
          <div style="display:flex;gap:8px"><div class="btn-mock">Edit fields</div><div class="btn-mock btn-primary-mock">Save &amp; Continue →</div></div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Screen 3: Template Selection -->
<h3>Screen 3 — Template Selection &amp; Export</h3>
<div class="screen-wrapper" style="padding:0 0 24px">
  <div class="app-chrome" style="min-height:300px">
    ${sidebar('upload')}
    <div class="main-area">
      <div class="topbar"><span class="topbar-title"><span style="color:#185FA5">← Review</span> &nbsp; Select Output Format</span></div>
      <div class="content-area">
        <div class="card" style="margin-bottom:10px">
          <div class="card-title">Choose template</div>
          ${[
            ['Agency Standard Format',       'English · Company-branded header · Skills table'],
            ['Client A Format',              'English · Tailored for Nexus Systems submission'],
            ['Japanese 履歴書 Format',       '日本語 · JIS standard 履歴書 layout with photo field'],
            ['Work Experience Sheet Format', '日本語 · 職務経歴書 format · Detailed project history'],
          ].map(([ name, desc ], i) => `
          <div style="display:flex;align-items:center;gap:10px;padding:9px 10px;border:1px solid ${i===2?'#185FA5':'#e8e8e8'};border-radius:6px;margin-bottom:6px;background:${i===2?'#f0f6ff':'#fff'}">
            <div style="width:14px;height:14px;border-radius:50%;border:2px solid ${i===2?'#185FA5':'#ccc'};display:flex;align-items:center;justify-content:center;flex-shrink:0">${i===2?'<div style="width:7px;height:7px;border-radius:50%;background:#185FA5"></div>':''}</div>
            <div><div style="font-size:9pt;font-weight:600;color:${i===2?'#0C447C':'#333'}">${name}</div><div style="font-size:8pt;color:#888;margin-top:1px">${desc}</div></div>
          </div>`).join('')}
        </div>
        <div class="card">
          <div class="card-title">Output type</div>
          <div style="display:flex;gap:8px;margin-bottom:12px">
            <div style="display:flex;align-items:center;gap:6px;padding:7px 12px;border:1.5px solid #185FA5;border-radius:5px;background:#f0f6ff;font-size:9pt;font-weight:600;color:#0C447C">
              <div style="width:12px;height:12px;border-radius:50%;border:2px solid #185FA5;display:flex;align-items:center;justify-content:center"><div style="width:6px;height:6px;border-radius:50%;background:#185FA5"></div></div>DOCX
            </div>
            <div style="display:flex;align-items:center;gap:6px;padding:7px 12px;border:1px solid #e0e0e0;border-radius:5px;font-size:9pt;color:#888">
              <div style="width:12px;height:12px;border-radius:50%;border:2px solid #ccc"></div>PDF
            </div>
          </div>
          <div class="btn-mock btn-primary-mock">Generate CV →</div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Screen 4: Download -->
<h3>Screen 4 — Download</h3>
<div class="screen-wrapper" style="padding:0 0 8px">
  <div class="app-chrome" style="min-height:220px">
    ${sidebar('upload')}
    <div class="main-area">
      <div class="topbar"><span class="topbar-title"><span style="color:#185FA5">← Template</span> &nbsp; Ready to Download</span></div>
      <div class="content-area">
        <div style="padding:20px;text-align:center;background:#e8f3de;border:1px solid #c0dda0;border-radius:8px;margin-bottom:12px">
          <div style="font-size:16pt;color:#639922;margin-bottom:6px">✓</div>
          <div style="font-size:11pt;font-weight:600;color:#27500A">CV generated successfully</div>
          <div style="font-size:8.5pt;color:#558830;margin-top:3px">Aung_Aung_JA_履歴書.docx &nbsp;·&nbsp; Japanese 履歴書 Format</div>
        </div>
        <div style="display:flex;gap:8px;justify-content:center">
          <div class="btn-mock btn-primary-mock" style="font-size:9pt;padding:8px 16px">↓ Download DOCX</div>
          <div class="btn-mock" style="font-size:9pt;padding:8px 16px">Generate another format</div>
          <div class="btn-mock" style="font-size:9pt;padding:8px 16px">← Back to candidate</div>
        </div>
      </div>
    </div>
  </div>
</div>

</div>`;
}

// ── FULL HTML DOCUMENT ────────────────────────────────────────────
async function main() {
  const product = readMd('product.md');
  const ui      = readMd('ui.md');
  const eng     = readMd('engineering.md');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>RecruitSync V1 — Design Specification</title>
<style>${CSS}</style>
</head>
<body>

<!-- ══ COVER PAGE ══════════════════════════════════════════════ -->
<div class="cover">
  <div class="cover-logo">RecruitSync</div>
  <div class="cover-subtitle">V1 Full Design Specification</div>
  <div class="cover-divider"></div>
  <div class="cover-title">Product · UX · Engineering<br>Design Document</div>
  <div class="cover-desc">A recruitment CRM for agencies placing international candidates in Japan — tracks every client, job, and candidate from first contact to placement.</div>
  <div class="cover-toc">
    <div class="cover-toc-title">Contents</div>
    <div class="cover-toc-item"><div class="cover-toc-dot"></div>Part 1 — Product Design Doc (PRD)</div>
    <div class="cover-toc-item"><div class="cover-toc-dot"></div>Part 2 — UX Design Doc (21 screens)</div>
    <div class="cover-toc-item"><div class="cover-toc-dot"></div>Part 3 — Engineering Design Doc</div>
    <div class="cover-toc-item"><div class="cover-toc-dot"></div>Part 4 — UI Screen Designs (17 screens)</div>
    <div class="cover-toc-item"><div class="cover-toc-dot"></div>Part 5 — CV Upload &amp; Generation Pipeline</div>
  </div>
  <div class="cover-meta" style="margin-top:40px">
    <span>Status: Draft v0.1</span>
    <span>Last updated: 2026-06-25</span>
    <span>Internal use only</span>
  </div>
</div>

<!-- ══ PART 1: PRODUCT ════════════════════════════════════════ -->
<div class="section-header">
  <div class="section-num">Part 1 of 5</div>
  <div class="section-title">Product Design Doc</div>
  <div class="section-sub">PRD — user, magical moment, scope, success metrics, open questions</div>
</div>
${mdToHtml(product, 'product')}

<!-- ══ PART 2: UX ═════════════════════════════════════════════ -->
<div class="section-header">
  <div class="section-num">Part 2 of 5</div>
  <div class="section-title">UX Design Doc</div>
  <div class="section-sub">21 screens — design bet, defining interaction, screen-by-screen specs, user journey, accessibility</div>
</div>
${mdToHtml(ui, 'ux')}

<!-- ══ PART 3: ENGINEERING ════════════════════════════════════ -->
<div class="section-header">
  <div class="section-num">Part 3 of 5</div>
  <div class="section-title">Engineering Design Doc</div>
  <div class="section-sub">Architecture, data model (18 tables), API surface (30+ endpoints), File Workspace, CV pipeline, testing strategy</div>
</div>
${mdToHtml(eng, 'engineering')}

<!-- ══ PART 4: UI SCREEN DESIGNS ══════════════════════════════ -->
<div class="section-header ui-section">
  <div class="section-num">Part 4 of 5</div>
  <div class="section-title">UI Screen Designs</div>
  <div class="section-sub">17 screens — Login through File Workspace. All screens reflect the full system design spec.</div>
</div>
<div class="ui-intro">
  <p>All 17 application screens shown below. Colours: blue = active/info, green = placed/success, amber = on-hold/warning, red = overdue/danger. The 9px status dot (green / amber / red) on pipeline cards is the product's signature visual — it encodes follow-up health at a glance. Screens 15–17 show the new File Workspace: hierarchical folder browser with Files · Notes · Activity History · Shared Members tabs.</p>
</div>

${screenLogin()}
${screenOnboarding()}
${screenDashboard()}
${screenClientList()}
${screenAddClient()}
${screenClientDetail()}
${screenJobList()}
${screenAddJob()}
${screenJobDetail()}
${screenUploadCV()}
${screenCandidateProfile()}
${screenPipeline()}
${screenActivityLog()}
${screenReminders()}
${screenFileWorkspaceRoot()}
${screenFileWorkspaceEntity()}
${screenFileWorkspaceFolder()}

${cvPipelineSection()}

</body>
</html>`;

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });

  const outPath = path.join(ROOT, 'RecruitSync_V1_Design_Spec.pdf');
  await page.pdf({
    path: outPath,
    format: 'A4',
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;text-align:center;font-size:9pt;color:#bbb;font-family:system-ui;padding-bottom:8px">
      RecruitSync V1 Design Specification &nbsp;·&nbsp; <span class="pageNumber"></span> / <span class="totalPages"></span>
    </div>`,
  });

  await browser.close();
  console.log('PDF saved to:', outPath);
}

main().catch(err => { console.error(err); process.exit(1); });
