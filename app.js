/* ==========================================================================
   RecruitSync — Core Application Driver
   ========================================================================== */

// --- CONFIG & CONSTANTS ---
const LOCAL_STORAGE_KEY = 'recruitsync_db';

// Stage Configurations
const STAGES = {
  sourced: 'Sourced',
  screening: 'Screening',
  interview: 'Interview',
  offered: 'Offered',
  placed: 'Placed'
};

// State Store Object
let db = {
  clients: [],
  jobs: [],
  candidates: [],
  logs: [],
  reminders: []
};

// Currently Active Contexts
let currentView = 'today';
let activeClientId = null;
let activeJobId = null;
let activeCandidateId = null;
let currentTab = 'cv-details';
let dragSourceCardId = null;

// --- UTILITY FUNCTIONS ---
function uuid() {
  return 'uuid_' + Math.random().toString(36).substr(2, 9);
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function daysAgo(dateStr) {
  const diffTime = Math.abs(new Date() - new Date(dateStr));
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Generate human readable date strings
function getRelativeDateStr(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return formatDate(d);
}

// Check status dot color class
function getStatusColor(days) {
  if (days < 7) return 'green';
  if (days <= 14) return 'amber';
  return 'red';
}

// Seed Initial Mock Data
function seedMockData() {
  const clientAId = uuid();
  const clientBId = uuid();

  const job1Id = uuid();
  const job2Id = uuid();
  const job3Id = uuid();

  const cand1Id = uuid();
  const cand2Id = uuid();
  const cand3Id = uuid();
  const cand4Id = uuid();

  const clients = [
    {
      id: clientAId,
      name: 'Aether Systems',
      industry: 'Fintech',
      pocName: 'Mark Zuckerberg',
      pocEmail: 'zuck@aether.io',
      pocPhone: '+1 (555) 901-2943',
      notes: 'Prefers candidate logs sent directly as brief email digests. Focuses heavily on backend Go development and system design scale. Billing terms: Net 30.'
    },
    {
      id: clientBId,
      name: 'Nebula Health',
      industry: 'Healthcare Tech',
      pocName: 'Alice Smith',
      pocEmail: 'alice@nebulahealth.com',
      pocPhone: '+1 (555) 103-9218',
      notes: 'Healthcare regulatory provider. Candidate HIPAA knowledge is a must. Interview processes are: Tech Screening, Panel Board, Offer approval.'
    }
  ];

  const jobs = [
    {
      id: job1Id,
      clientId: clientAId,
      title: 'Senior Backend Engineer (Go)',
      notes: 'Open 2 weeks ago. Salary: $140,000 - $165,000. Core duties include refactoring transaction ledger to Go. System design interview is critical.',
      status: 'active',
      openedAt: getRelativeDateStr(-14)
    },
    {
      id: job2Id,
      clientId: clientAId,
      title: 'Lead UI/UX Designer',
      notes: 'Open 3 days ago. Needs high fidelity portfolio. Strong Figma experience, design systems management. Team size: 4 designers.',
      status: 'active',
      openedAt: getRelativeDateStr(-3)
    },
    {
      id: job3Id,
      clientId: clientBId,
      title: 'Full Stack Engineer (React & Python)',
      notes: 'Open 10 days ago. HIPAA security knowledge mandatory. Will help scale EHR analytics dashboard. Hybrid role in Boston.',
      status: 'active',
      openedAt: getRelativeDateStr(-10)
    }
  ];

  const candidates = [
    {
      id: cand1Id,
      fullName: 'John Doe',
      email: 'john.doe@gmail.com',
      phone: '+1 (555) 234-9021',
      currentRole: 'Software Engineer II',
      education: 'B.S. in Computer Science (Stanford)',
      summary: '4+ years of professional backend experience focusing on distributed systems in Go and C++. Scaled payment ledgers at Stripe, managing 10k RPS. Experienced with Kafka, Kubernetes, and PostgreSQL optimization.',
      skills: ['Go', 'Kubernetes', 'System Design', 'PostgreSQL', 'Kafka'],
      parseStatus: 'complete',
      jobId: job1Id,
      stage: 'interview',
      lastContactDays: 2,
      files: [
        { name: 'John_Doe_Resume.pdf', path: '/uploads/john_doe_resume.pdf' }
      ]
    },
    {
      id: cand2Id,
      fullName: 'Jane Smith',
      email: 'jane.smith@designco.net',
      phone: '+1 (555) 604-1132',
      currentRole: 'Lead Product Designer',
      education: 'B.F.A. in Communication Design (RISD)',
      summary: 'Over 6 years designing responsive web applications in complex B2B domains. Created design systems from scratch used by 50+ developers. Proficient in Figma, prototyping, and qualitative user research studies.',
      skills: ['Figma', 'User Research', 'Design Systems', 'Prototyping', 'B2B UX'],
      parseStatus: 'complete',
      jobId: job2Id,
      stage: 'offered',
      lastContactDays: 8,
      files: [
        { name: 'Jane_Smith_Portfolio.pdf', path: '/uploads/jane_smith_portfolio.pdf' }
      ]
    },
    {
      id: cand3Id,
      fullName: 'Robert Johnson',
      email: 'rob.johnson@healthdev.org',
      phone: '+1 (555) 781-9923',
      currentRole: 'Senior Full Stack Developer',
      education: 'M.S. in Software Engineering (MIT)',
      summary: '8 years experience building HIPAA-compliant web apps in React, Django, and PostgreSQL. Focused on secure electronic health records database migrations and UI accessibility standards (WCAG).',
      skills: ['React', 'Python', 'HIPAA', 'AWS', 'Django', 'PostgreSQL'],
      parseStatus: 'complete',
      jobId: job3Id,
      stage: 'screening',
      lastContactDays: 16,
      files: [
        { name: 'Robert_Johnson_CV.docx', path: '/uploads/robert_johnson_cv.docx' }
      ]
    },
    {
      id: cand4Id,
      fullName: 'Emily Davis',
      email: 'emily.davis@bootcamp.dev',
      phone: '+1 (555) 880-1249',
      currentRole: 'Junior Frontend Developer',
      education: 'Full-Stack Software Engineering Certificate',
      summary: 'Recent bootcamp graduate with strong JavaScript/React fundamentals and previous background in digital marketing. Eager to join a growth-stage startup to support frontend UI development.',
      skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Git'],
      parseStatus: 'complete',
      jobId: job1Id,
      stage: 'sourced',
      lastContactDays: 4,
      files: [
        { name: 'Emily_Davis_Resume.pdf', path: '/uploads/emily_davis_resume.pdf' }
      ]
    }
  ];

  const logs = [
    {
      id: uuid(),
      jobId: job1Id,
      candidateId: cand1Id,
      author: 'Antigravity Agent',
      body: 'Spoke with John. He is excited about Aether Systems. Scheduled technical system design interview for this Thursday 10am.',
      createdAt: getRelativeDateStr(-2)
    },
    {
      id: uuid(),
      jobId: job2Id,
      candidateId: cand2Id,
      author: 'Antigravity Agent',
      body: 'Delivered written offer package details ($145k + 0.1% equity). Jane is reviewing and will get back to us by Friday.',
      createdAt: getRelativeDateStr(-8)
    },
    {
      id: uuid(),
      jobId: job3Id,
      candidateId: cand3Id,
      author: 'Antigravity Agent',
      body: 'Initial screening callback. Candidate seems very strong on HIPAA but is seeking fully remote. Discussing budget constraints.',
      createdAt: getRelativeDateStr(-16)
    },
    {
      id: uuid(),
      jobId: job1Id,
      candidateId: cand4Id,
      author: 'Antigravity Agent',
      body: 'Sourced via GitHub portfolio. Candidate has good React projects. Reached out via email.',
      createdAt: getRelativeDateStr(-4)
    },
    {
      id: uuid(),
      jobId: job1Id,
      candidateId: null, // Client log
      author: 'Antigravity Agent',
      body: 'Zuckerberg confirmed that core budget range is flexible up to $170k for an exceptional tech lead candidate.',
      createdAt: getRelativeDateStr(-3)
    }
  ];

  const reminders = [
    {
      id: uuid(),
      jobId: job3Id,
      candidateId: cand3Id,
      clientId: clientBId,
      dueAt: getRelativeDateStr(0), // Today
      notes: 'Call Rob to confirm availability for technical panel interview',
      done: false
    },
    {
      id: uuid(),
      jobId: job2Id,
      candidateId: cand2Id,
      clientId: clientAId,
      dueAt: getRelativeDateStr(-2), // Overdue
      notes: 'Follow up with client Zuckerberg regarding offer letter signature status',
      done: false
    },
    {
      id: uuid(),
      jobId: job1Id,
      candidateId: cand1Id,
      clientId: clientAId,
      dueAt: getRelativeDateStr(2), // Upcoming
      notes: 'Prepare interview feedback document summary for Go Role',
      done: false
    }
  ];

  db = { clients, jobs, candidates, logs, reminders };
  saveToLocalStorage();
}

// Database Read/Write
function loadDatabase() {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (data) {
    try {
      db = JSON.parse(data);
    } catch (e) {
      console.error('Error parsing local storage database. Re-seeding.', e);
      seedMockData();
    }
  } else {
    seedMockData();
  }
}

function saveToLocalStorage() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db));
}

// Toast Manager
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = message;
  container.appendChild(toast);
  
  // Auto remove toast
  setTimeout(() => {
    toast.remove();
  }, 5000);
}

// --- DOM NAVIGATION & VIEW ROUTER ---
function switchView(viewName) {
  currentView = viewName;
  
  // Update sidebar active states
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-view') === viewName) {
      item.classList.add('active');
    }
  });

  // Toggle view sections
  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.remove('active');
  });

  const activeSection = document.getElementById(`view-${viewName}`);
  if (activeSection) {
    activeSection.classList.add('active');
  }

  // Close open drawers
  closeAllDrawers();

  // Render view-specific content
  renderView();
}

function closeAllDrawers() {
  document.querySelectorAll('.drawer').forEach(d => d.classList.remove('active'));
  document.querySelectorAll('.drawer-backdrop').forEach(b => b.classList.remove('active'));
}

function renderView() {
  if (currentView === 'today') {
    renderTodayView();
  } else if (currentView === 'jobs') {
    renderJobsView();
  } else if (currentView === 'clients') {
    renderClientsView();
  } else if (currentView === 'client-detail') {
    renderClientDetailView();
  } else if (currentView === 'pipeline') {
    renderPipelineBoardView();
  }
}

// --- SCREEN 1: TODAY / REMINDERS VIEW ---
function renderTodayView() {
  const container = document.getElementById('today-content-area');
  container.innerHTML = '';

  const activeReminders = db.reminders.filter(r => !r.done);
  
  if (activeReminders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <h3>Nothing due today — you're clear</h3>
        <p>No reminders set. Go to any client profile or candidate drawer to schedule a follow-up date.</p>
      </div>
    `;
    return;
  }

  const todayStr = formatDate(new Date());
  
  // Categorize reminders
  const overdueList = [];
  const todayList = [];
  const upcomingList = [];

  activeReminders.forEach(r => {
    const rDate = r.dueAt;
    if (rDate < todayStr) {
      overdueList.push(r);
    } else if (rDate === todayStr) {
      todayList.push(r);
    } else {
      upcomingList.push(r);
    }
  });

  // Sort helper
  const sortByDate = (a, b) => a.dueAt.localeCompare(b.dueAt);
  overdueList.sort(sortByDate);
  todayList.sort(sortByDate);
  upcomingList.sort(sortByDate);

  // Render segments
  if (overdueList.length > 0) {
    createReminderSection(container, 'Overdue Alert', overdueList, 'red-title', 'red');
  }
  
  if (todayList.length > 0) {
    createReminderSection(container, 'Due Today', todayList, '', 'amber');
  }
  
  if (upcomingList.length > 0) {
    createReminderSection(container, 'Upcoming Reminders (Next 7 Days)', upcomingList, '', 'green');
  }
}

function createReminderSection(parent, title, items, titleClass, dateClass) {
  const section = document.createElement('div');
  section.innerHTML = `
    <h3 class="followup-section-title ${titleClass}">${title}</h3>
    <div class="followup-card-list"></div>
  `;
  const listContainer = section.querySelector('.followup-card-list');
  
  items.forEach(r => {
    const card = document.createElement('div');
    card.className = 'reminder-row-card glass-panel';
    card.id = `reminder-row-${r.id}`;
    
    // Retrieve linked models
    const cand = db.candidates.find(c => c.id === r.candidateId);
    const job = db.jobs.find(j => j.id === r.jobId);
    
    let entityName = '';
    let clickHandler = () => {};

    if (cand) {
      entityName = cand.fullName;
      clickHandler = (e) => { e.preventDefault(); openCandidateProfileDrawer(cand.id); };
    } else {
      const clientObj = db.clients.find(c => c.id === r.clientId);
      entityName = clientObj ? clientObj.name : 'Unknown Client';
      clickHandler = (e) => { e.preventDefault(); navigateToClientDetail(r.clientId); };
    }

    const jobTitle = job ? job.title : 'General Account Note';

    card.innerHTML = `
      <div class="reminder-checkbox" data-id="${r.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <div class="reminder-entity" id="rem-entity-${r.id}">${entityName}</div>
      <div class="reminder-job">${jobTitle}</div>
      <div class="reminder-note">${r.notes}</div>
      <div class="reminder-date ${dateClass}">${r.dueAt}</div>
    `;

    card.querySelector('.reminder-checkbox').addEventListener('click', () => {
      markReminderDone(r.id);
    });

    card.querySelector('.reminder-entity').addEventListener('click', clickHandler);

    listContainer.appendChild(card);
  });

  parent.appendChild(section);
}

function markReminderDone(id) {
  const row = document.getElementById(`reminder-row-${id}`);
  if (row) {
    row.classList.add('done');
    
    // Update local state database after animation
    setTimeout(() => {
      const rem = db.reminders.find(r => r.id === id);
      if (rem) {
        rem.done = true;
        saveToLocalStorage();
        renderView();
        showToast('Reminder completed successfully', 'success');
      }
    }, 450);
  }
}

// --- SCREEN 2: JOBS LIST VIEW ---
function renderJobsView() {
  const grid = document.getElementById('jobs-grid-container');
  grid.innerHTML = '';

  const clientFilterVal = document.getElementById('filter-job-client').value;
  const healthFilterVal = document.getElementById('filter-job-health').value;

  // Filter logic
  let filteredJobs = db.jobs.filter(j => j.status === 'active');
  
  if (clientFilterVal !== 'all') {
    filteredJobs = filteredJobs.filter(j => j.clientId === clientFilterVal);
  }

  // Map candidates to job
  const jobStats = filteredJobs.map(job => {
    const cands = db.candidates.filter(c => c.jobId === job.id);
    
    // Compute pipeline counts
    const counts = { sourced: 0, screening: 0, interview: 0, offered: 0, placed: 0 };
    cands.forEach(c => {
      if (counts[c.stage] !== undefined) {
        counts[c.stage]++;
      }
    });

    // Compute contact health based on worst health dot of linked candidates
    let health = 'green';
    cands.forEach(c => {
      const cHealth = getStatusColor(c.lastContactDays);
      if (cHealth === 'red') {
        health = 'red';
      } else if (cHealth === 'amber' && health !== 'red') {
        health = 'amber';
      }
    });

    return { job, counts, health, totalCandidates: cands.length };
  });

  // Apply Health filter
  let finalStats = jobStats;
  if (healthFilterVal !== 'all') {
    finalStats = jobStats.filter(js => js.health === healthFilterVal);
  }

  if (finalStats.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
        </div>
        <h3>No active jobs matched your filter</h3>
        <p>Adjust your dropdown select options or click 'Add Job' to open a new position order.</p>
      </div>
    `;
    return;
  }

  finalStats.forEach(item => {
    const clientObj = db.clients.find(c => c.id === item.job.clientId);
    const clientName = clientObj ? clientObj.name : 'Unknown Client';
    
    const card = document.createElement('div');
    card.className = 'job-grid-card glass-panel';
    
    // Build mini pipeline representation
    const total = item.totalCandidates || 1; // Avoid divide by zero
    const sourcedPct = (item.counts.sourced / total) * 100;
    const screeningPct = (item.counts.screening / total) * 100;
    const interviewPct = (item.counts.interview / total) * 100;
    const offeredPct = (item.counts.offered / total) * 100;
    const placedPct = (item.counts.placed / total) * 100;

    card.innerHTML = `
      <div class="job-card-header">
        <div>
          <div class="job-client-name">${clientName}</div>
          <h3 class="job-title">${item.job.title}</h3>
        </div>
        <div class="followup-indicator">
          <span class="status-dot ${item.health}" title="Contact health status"></span>
        </div>
      </div>
      
      <div class="mini-pipeline-wrapper" style="width: 100%; align-items: flex-start; margin-top: 16px;">
        <div class="mini-pipeline-stats" style="display:flex; justify-content:space-between; width:100%;">
          <span>Pipeline: ${item.totalCandidates} Candidates</span>
          <span>Placed: ${item.counts.placed}</span>
        </div>
        <div class="mini-pipeline-bar">
          <div class="mini-pipeline-segment seg-sourced" style="width: ${sourcedPct}%"></div>
          <div class="mini-pipeline-segment seg-screening" style="width: ${screeningPct}%"></div>
          <div class="mini-pipeline-segment seg-interview" style="width: ${interviewPct}%"></div>
          <div class="mini-pipeline-segment seg-offered" style="width: ${offeredPct}%"></div>
          <div class="mini-pipeline-segment seg-placed" style="width: ${placedPct}%"></div>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      navigateToPipelineBoard(item.job.id);
    });

    grid.appendChild(card);
  });
}

function navigateToPipelineBoard(jobId) {
  activeJobId = jobId;
  switchView('pipeline');
}

// --- SCREEN 3: CLIENT LIST VIEW ---
function renderClientsView() {
  const container = document.getElementById('clients-grid-container');
  container.innerHTML = '';

  const searchVal = document.getElementById('search-client').value.toLowerCase();

  let filteredClients = db.clients;
  if (searchVal) {
    filteredClients = db.clients.filter(c => 
      c.name.toLowerCase().includes(searchVal) || 
      c.industry.toLowerCase().includes(searchVal)
    );
  }

  if (filteredClients.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
        <h3>No clients found</h3>
        <p>We couldn't find any clients matching '${searchVal}'. Click 'Add Client' to create a new profile.</p>
      </div>
    `;
    return;
  }

  filteredClients.forEach(c => {
    const clientJobs = db.jobs.filter(j => j.clientId === c.id && j.status === 'active');
    
    const card = document.createElement('div');
    card.className = 'client-card glass-panel';
    card.innerHTML = `
      <div class="client-card-header">
        <h3 class="client-name">${c.name}</h3>
        <span class="client-industry">${c.industry || 'General'}</span>
      </div>
      <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.4; min-height: 40px; overflow: hidden;">
        ${c.notes ? c.notes.substring(0, 75) + (c.notes.length > 75 ? '...' : '') : 'No notes added yet.'}
      </p>
      
      <div class="client-meta">
        <div class="client-meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
          <span>${clientJobs.length} Active Jobs</span>
        </div>
        <div class="client-meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span>${c.pocName}</span>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      navigateToClientDetail(c.id);
    });

    container.appendChild(card);
  });
}

function navigateToClientDetail(clientId) {
  activeClientId = clientId;
  switchView('client-detail');
}

// --- SCREEN 4: CLIENT DETAIL VIEW ---
function renderClientDetailView() {
  const clientObj = db.clients.find(c => c.id === activeClientId);
  if (!clientObj) {
    switchView('clients');
    return;
  }

  // Update Breadcrumbs & Main Details
  document.getElementById('detail-client-breadcrumb').innerText = clientObj.name;
  document.getElementById('detail-client-name').innerText = clientObj.name;
  document.getElementById('detail-client-industry').innerText = clientObj.industry || 'General';
  document.getElementById('detail-contact-name').innerText = clientObj.pocName;
  document.getElementById('detail-contact-email').innerText = clientObj.pocEmail;
  document.getElementById('detail-contact-phone').innerText = clientObj.pocPhone || 'Add phone number';
  document.getElementById('detail-client-notes').innerText = clientObj.notes || 'Enter client bio or general instructions...';

  // Load Job List
  const jobsContainer = document.getElementById('detail-client-jobs-container');
  jobsContainer.innerHTML = '';

  const clientJobs = db.jobs.filter(j => j.clientId === activeClientId);

  if (clientJobs.length === 0) {
    jobsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
        </div>
        <h3>No open jobs for this client yet</h3>
        <p>Create a job opening linked to ${clientObj.name} using the button above.</p>
      </div>
    `;
    return;
  }

  clientJobs.forEach(job => {
    const jobCands = db.candidates.filter(c => c.jobId === job.id);
    
    // Count stages
    const counts = { sourced: 0, screening: 0, interview: 0, offered: 0, placed: 0 };
    jobCands.forEach(c => {
      if (counts[c.stage] !== undefined) counts[c.stage]++;
    });

    const card = document.createElement('div');
    card.className = 'job-row-card glass-panel';
    
    const total = jobCands.length || 1;
    const sourcedPct = (counts.sourced / total) * 100;
    const screeningPct = (counts.screening / total) * 100;
    const interviewPct = (counts.interview / total) * 100;
    const offeredPct = (counts.offered / total) * 100;
    const placedPct = (counts.placed / total) * 100;

    card.innerHTML = `
      <div class="job-info-col">
        <h3>${job.title}</h3>
        <p>Opened on: ${job.openedAt} · Status: ${job.status.toUpperCase()}</p>
      </div>
      <div class="mini-pipeline-wrapper">
        <div class="mini-pipeline-stats">
          <span>Active Pipeline: ${jobCands.length} Candidates</span>
        </div>
        <div class="mini-pipeline-bar">
          <div class="mini-pipeline-segment seg-sourced" style="width: ${sourcedPct}%"></div>
          <div class="mini-pipeline-segment seg-screening" style="width: ${screeningPct}%"></div>
          <div class="mini-pipeline-segment seg-interview" style="width: ${interviewPct}%"></div>
          <div class="mini-pipeline-segment seg-offered" style="width: ${offeredPct}%"></div>
          <div class="mini-pipeline-segment seg-placed" style="width: ${placedPct}%"></div>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      navigateToPipelineBoard(job.id);
    });

    jobsContainer.appendChild(card);
  });
}

// Setup Editable Detail Fields for Client Detail
function initClientDetailEditableFields() {
  const fields = [
    { el: 'detail-contact-name', field: 'pocName' },
    { el: 'detail-contact-email', field: 'pocEmail' },
    { el: 'detail-contact-phone', field: 'pocPhone' },
    { el: 'detail-client-notes', field: 'notes' }
  ];

  fields.forEach(({ el, field }) => {
    const element = document.getElementById(el);
    if (!element) return;

    element.addEventListener('focus', () => {
      element.parentElement.classList.add('editing');
    });

    element.addEventListener('blur', () => {
      element.parentElement.classList.remove('editing');
      
      const val = element.innerText.trim();
      const client = db.clients.find(c => c.id === activeClientId);
      if (client && client[field] !== val) {
        client[field] = val;
        saveToLocalStorage();
        showToast('Client profile updated', 'success');
      }
    });

    element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && field !== 'notes') {
        e.preventDefault();
        element.blur();
      }
    });
  });
}

// --- SCREEN 5: PIPELINE BOARD (HERO VIEW) ---
function renderPipelineBoardView() {
  const jobObj = db.jobs.find(j => j.id === activeJobId);
  if (!jobObj) {
    switchView('jobs');
    return;
  }

  const clientObj = db.clients.find(c => c.id === jobObj.clientId);
  const clientName = clientObj ? clientObj.name : 'Unknown Client';

  // Breadcrumbs
  document.getElementById('pipeline-client-breadcrumb').innerText = clientName;
  document.getElementById('pipeline-client-breadcrumb').onclick = (e) => {
    e.preventDefault();
    navigateToClientDetail(jobObj.clientId);
  };
  document.getElementById('pipeline-job-title').innerText = jobObj.title;

  // Clear columns
  const columnStages = ['sourced', 'screening', 'interview', 'offered', 'placed'];
  columnStages.forEach(stage => {
    const list = document.getElementById(`cards-${stage}`);
    list.innerHTML = '';
    
    // Clear badges
    document.getElementById(`badge-${stage}`).innerText = '0';
  });

  const jobCands = db.candidates.filter(c => c.jobId === activeJobId);

  // Set counts
  columnStages.forEach(stage => {
    const stageCands = jobCands.filter(c => c.stage === stage);
    document.getElementById(`badge-${stage}`).innerText = stageCands.length;

    const list = document.getElementById(`cards-${stage}`);

    if (stageCands.length === 0) {
      const placeholder = document.createElement('div');
      placeholder.className = 'column-placeholder-card';
      placeholder.innerText = 'Drag candidate cards here';
      list.appendChild(placeholder);
      return;
    }

    stageCands.forEach(c => {
      const card = document.createElement('div');
      
      if (c.parseStatus === 'pending') {
        // Shimmer loading card for parsing CV simulation
        card.className = 'candidate-card glass-panel shimmer-card';
        card.innerHTML = `
          <div class="shimmer-line title"></div>
          <div class="shimmer-line body"></div>
          <div class="shimmer-line meta"></div>
        `;
      } else {
        // Fully loaded card
        card.className = 'candidate-card glass-panel';
        card.setAttribute('draggable', 'true');
        card.setAttribute('data-id', c.id);
        
        const healthColor = getStatusColor(c.lastContactDays);
        const relativeDays = c.lastContactDays === 0 ? 'today' : `${c.lastContactDays}d ago`;

        // Get latest log entry preview
        const candLogs = db.logs.filter(l => l.candidateId === c.id).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
        const logPreview = candLogs.length > 0 ? candLogs[0].body : 'No communications logged yet';

        // Check if reminders are set and overdue
        const candReminders = db.reminders.filter(r => r.candidateId === c.id && !r.done);
        let reminderBadgeHtml = '';
        if (candReminders.length > 0) {
          const overdue = candReminders.some(r => r.dueAt < formatDate(new Date()));
          reminderBadgeHtml = `
            <div class="reminder-pill ${overdue ? 'overdue' : ''}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              <span>Follow-up</span>
            </div>
          `;
        }

        card.innerHTML = `
          <div class="candidate-card-top">
            <span class="candidate-name">${c.fullName}</span>
            <span class="candidate-days">
              <span>${relativeDays}</span>
              <span class="status-dot ${healthColor}"></span>
            </span>
          </div>
          <p class="candidate-card-log">${logPreview}</p>
          <div class="candidate-card-bottom">
            ${reminderBadgeHtml}
            <span style="font-size:10px; color:var(--text-muted); font-weight:600;">${c.currentRole || 'N/A'}</span>
          </div>
        `;

        // Bind click profile details
        card.addEventListener('click', (e) => {
          // If clicked in log-prompt or inner form inputs, ignore card open
          if (e.target.closest('.inline-log-prompt') || e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
          openCandidateProfileDrawer(c.id);
        });

        // Setup drag start / end listeners
        card.addEventListener('dragstart', (e) => {
          dragSourceCardId = c.id;
          card.classList.add('dragging');
          e.dataTransfer.setData('text/plain', c.id);
          e.dataTransfer.effectAllowed = 'move';
        });

        card.addEventListener('dragend', () => {
          card.classList.remove('dragging');
          document.querySelectorAll('.pipeline-column').forEach(col => col.classList.remove('drag-over'));
        });
      }

      list.appendChild(card);
    });
  });

  initKanbanDragEvents();
}

// Kanban Drag and Drop Logic
function initKanbanDragEvents() {
  const columns = document.querySelectorAll('.pipeline-column');

  columns.forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      col.classList.add('drag-over');
      e.dataTransfer.dropEffect = 'move';
    });

    col.addEventListener('dragleave', () => {
      col.classList.remove('drag-over');
    });

    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('drag-over');
      
      const candidateId = e.dataTransfer.getData('text/plain');
      const targetStage = col.getAttribute('data-stage');
      const cand = db.candidates.find(c => c.id === candidateId);

      if (cand && cand.stage !== targetStage) {
        // Move candidate stage in local database
        const oldStage = cand.stage;
        cand.stage = targetStage;
        saveToLocalStorage();

        // Refresh board
        renderPipelineBoardView();

        // Display Inline Log prompt immediately beneath the dropped card
        showInlineLogPrompt(candidateId, targetStage, oldStage);
      }
    });
  });
}

function showInlineLogPrompt(candidateId, newStage, oldStage) {
  // Find card element
  const cardElement = document.querySelector(`.candidate-card[data-id="${candidateId}"]`);
  if (!cardElement) return;

  // Render prompt container
  const prompt = document.createElement('div');
  prompt.className = 'inline-log-prompt';
  prompt.innerHTML = `
    <div class="inline-log-prompt-header">
      <span>Log this stage move?</span>
      <span style="font-weight:normal;">Enter log note below</span>
    </div>
    <input type="text" id="inline-log-input-field" placeholder="e.g. Scheduled call, client liked resume..." autofocus>
    <div class="inline-log-prompt-actions">
      <span>Press Enter to save · Esc to skip</span>
    </div>
  `;

  cardElement.appendChild(prompt);
  const input = prompt.querySelector('input');
  input.focus();

  // Bind keyboard events
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = input.value.trim();
      
      // Save log entry if text is provided
      const logBody = val ? val : `Moved candidate stage from ${STAGES[oldStage]} to ${STAGES[newStage]}`;
      
      const newLog = {
        id: uuid(),
        jobId: activeJobId,
        candidateId: candidateId,
        author: 'Antigravity Agent',
        body: logBody,
        createdAt: formatDate(new Date())
      };

      db.logs.push(newLog);
      
      // Reset candidate contact date to today (green) upon communication update
      const cand = db.candidates.find(c => c.id === candidateId);
      if (cand) {
        cand.lastContactDays = 0;
      }

      saveToLocalStorage();
      prompt.remove();
      renderPipelineBoardView();
      showToast('Movement log saved successfully', 'success');

    } else if (e.key === 'Escape') {
      // Dismiss prompt, stage stays changed
      prompt.remove();
      showToast(`Stage updated to ${STAGES[newStage]} (skipped log notes)`, 'info');
    }
  });

  // Handle clicking outside to dismiss
  document.addEventListener('click', function dismissPrompt(e) {
    if (!prompt.contains(e.target) && e.target !== cardElement) {
      prompt.remove();
      document.removeEventListener('click', dismissPrompt);
    }
  });
}

// --- SLIDE-OVER DRAWER: CANDIDATE PROFILE ---
function openCandidateProfileDrawer(candidateId) {
  activeCandidateId = candidateId;
  const cand = db.candidates.find(c => c.id === candidateId);
  if (!cand) return;

  // Render Candidate Drawer Fields
  document.getElementById('profile-candidate-name').innerText = cand.fullName;
  document.getElementById('profile-current-stage').innerText = `Stage: ${STAGES[cand.stage] || cand.stage}`;
  
  // Set tab details inputs
  document.getElementById('profile-field-email').innerText = cand.email || '';
  document.getElementById('profile-field-phone').innerText = cand.phone || '';
  document.getElementById('profile-field-role').innerText = cand.currentRole || '';
  document.getElementById('profile-field-education').innerText = cand.education || '';
  document.getElementById('profile-field-summary').innerText = cand.summary || 'No resume details parsed yet.';

  // Render Skill Tags
  const skillsContainer = document.getElementById('profile-skills-container');
  skillsContainer.innerHTML = '';
  if (cand.skills && cand.skills.length > 0) {
    cand.skills.forEach(s => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.innerText = s;
      skillsContainer.appendChild(tag);
    });
  } else {
    skillsContainer.innerHTML = '<span style="color:var(--text-muted); font-size:12px;">No skills mapped</span>';
  }

  // Set initial active tab
  switchProfileTab('cv-details');

  // Trigger drawer transition
  document.getElementById('candidate-profile-backdrop').classList.add('active');
  document.getElementById('candidate-profile-drawer').classList.add('active');
}

function switchProfileTab(tabName) {
  currentTab = tabName;
  
  // Tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('active');
    }
  });

  // Tab content panels
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });
  document.getElementById(`tab-${tabName}`).classList.add('active');

  // Render tab contents
  if (tabName === 'comm-logs') {
    renderCandidateLogsTab();
  } else if (tabName === 'reminders') {
    renderCandidateRemindersTab();
  } else if (tabName === 'attachments') {
    renderCandidateAttachmentsTab();
  }
}

function renderCandidateLogsTab() {
  const container = document.getElementById('profile-log-timeline');
  container.innerHTML = '';

  const candLogs = db.logs.filter(l => l.candidateId === activeCandidateId)
                         .sort((a,b) => a.createdAt.localeCompare(b.createdAt)); // Oldest first for timeline flow

  if (candLogs.length === 0) {
    container.innerHTML = `<div style="text-align:center; color:var(--text-muted); font-size:12px; margin-top:20px;">No interaction logs found.</div>`;
    return;
  }

  candLogs.forEach(l => {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
      <div class="log-entry-meta">
        <span class="log-entry-author">${l.author}</span>
        <span>${l.createdAt}</span>
      </div>
      <div class="log-entry-body">${l.body}</div>
    `;
    container.appendChild(entry);
  });

  // Auto scroll to bottom
  container.scrollTop = container.scrollHeight;
}

function renderCandidateRemindersTab() {
  const container = document.getElementById('reminder-widget-status');
  container.innerHTML = '';

  const cand = db.candidates.find(c => c.id === activeCandidateId);
  const rem = db.reminders.find(r => r.candidateId === activeCandidateId && !r.done);

  if (rem) {
    const overdue = rem.dueAt < formatDate(new Date());
    container.innerHTML = `
      <div class="glass-panel" style="padding:16px; border-color: rgba(99, 102, 241, 0.2)">
        <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
          <span style="font-size:11px; font-weight:700; color:var(--primary); text-transform:uppercase;">Scheduled Follow-up</span>
          <span class="status-dot ${overdue ? 'red' : 'green'}" title="${overdue ? 'Overdue alert' : 'Reminder active'}"></span>
        </div>
        <p style="font-size:14px; font-weight:600; color:#fff; margin-bottom:4px;">${rem.notes}</p>
        <p style="font-size:12px; color:var(--text-secondary);">Due Date: ${rem.dueAt} ${overdue ? '(Overdue!)' : ''}</p>
        <button class="btn btn-secondary btn-icon-only" id="btn-complete-cand-rem" style="width:100%; height:34px; margin-top:12px; font-size:12px;" title="Mark Reminder Done">Mark Completed</button>
      </div>
    `;
    
    document.getElementById('btn-complete-cand-rem').addEventListener('click', () => {
      markReminderDone(rem.id);
      // Wait for complete animation
      setTimeout(() => {
        renderCandidateRemindersTab();
      }, 500);
    });
  } else {
    container.innerHTML = `
      <div style="padding:12px; text-align:center; background:rgba(255,255,255,0.01); border:1px dashed var(--glass-border); border-radius:6px; font-size:12px; color:var(--text-muted);">
        No active reminders scheduled for ${cand.fullName}. Fill details below to set a follow-up.
      </div>
    `;
  }
}

function renderCandidateAttachmentsTab() {
  const container = document.getElementById('profile-file-list');
  container.innerHTML = '';

  const cand = db.candidates.find(c => c.id === activeCandidateId);
  if (!cand.files || cand.files.length === 0) {
    container.innerHTML = `<div style="text-align:center; color:var(--text-muted); font-size:12px;">No attachments uploaded yet.</div>`;
    return;
  }

  cand.files.forEach((file, index) => {
    const row = document.createElement('div');
    row.className = 'file-item';
    row.innerHTML = `
      <div class="file-item-left">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        <span class="file-item-name">${file.name}</span>
      </div>
      <div class="file-item-delete" data-index="${index}">Delete</div>
    `;
    
    row.querySelector('.file-item-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteCandidateFile(index);
    });

    container.appendChild(row);
  });
}

function deleteCandidateFile(index) {
  const cand = db.candidates.find(c => c.id === activeCandidateId);
  if (cand && cand.files) {
    cand.files.splice(index, 1);
    saveToLocalStorage();
    renderCandidateAttachmentsTab();
    showToast('File removed', 'success');
  }
}

// Save profile fields from ContentEditable text blocks
function saveCandidateProfileChanges() {
  const cand = db.candidates.find(c => c.id === activeCandidateId);
  if (!cand) return;

  cand.email = document.getElementById('profile-field-email').innerText.trim();
  cand.phone = document.getElementById('profile-field-phone').innerText.trim();
  cand.currentRole = document.getElementById('profile-field-role').innerText.trim();
  cand.education = document.getElementById('profile-field-education').innerText.trim();
  cand.summary = document.getElementById('profile-field-summary').innerText.trim();

  saveToLocalStorage();
  renderView();
  closeAllDrawers();
  showToast('Candidate changes saved', 'success');
}

function deleteCandidateProfile() {
  if (confirm('Are you sure you want to delete this candidate profile? All logs and reminders will be removed.')) {
    // Delete logs and reminders
    db.logs = db.logs.filter(l => l.candidateId !== activeCandidateId);
    db.reminders = db.reminders.filter(r => r.candidateId !== activeCandidateId);
    db.candidates = db.candidates.filter(c => c.id !== activeCandidateId);

    saveToLocalStorage();
    renderView();
    closeAllDrawers();
    showToast('Candidate profile deleted', 'success');
  }
}

// --- CLIENT LOG DRAWER TIMELINE ---
function openClientLogsDrawer() {
  const jobObj = db.jobs.find(j => j.id === activeJobId);
  if (!jobObj) return;

  const clientObj = db.clients.find(c => c.id === jobObj.clientId);
  const clientName = clientObj ? clientObj.name : 'Client';

  document.getElementById('client-logs-subtitle').innerText = `Notes on Job order: ${jobObj.title} with ${clientName}`;
  renderClientLogsTimeline();

  document.getElementById('client-logs-backdrop').classList.add('active');
  document.getElementById('client-logs-drawer').classList.add('active');
}

function renderClientLogsTimeline() {
  const container = document.getElementById('client-log-timeline');
  container.innerHTML = '';

  // Retrieve client logs for job (where candidateId is null)
  const clientLogs = db.logs.filter(l => l.jobId === activeJobId && !l.candidateId)
                            .sort((a,b) => a.createdAt.localeCompare(b.createdAt));

  if (clientLogs.length === 0) {
    container.innerHTML = `<div style="text-align:center; color:var(--text-muted); font-size:12px; margin-top:20px;">No client feedback logs recorded for this job.</div>`;
    return;
  }

  clientLogs.forEach(l => {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
      <div class="log-entry-meta">
        <span class="log-entry-author">${l.author}</span>
        <span>${l.createdAt}</span>
      </div>
      <div class="log-entry-body">${l.body}</div>
    `;
    container.appendChild(entry);
  });

  container.scrollTop = container.scrollHeight;
}

// --- SIMULATED CV PARSER UPLOAD WORKER ---
function triggerMockCvParser(candidateId, fileName) {
  // Wait 5 seconds to simulate parsing
  setTimeout(() => {
    const cand = db.candidates.find(c => c.id === candidateId);
    if (!cand) return;

    // Developer details generator seed based on names
    const devTemplates = {
      'Figma': ['Design Systems', 'UX Research', 'Figma Prototyping', 'B2B Usability', 'Web Design'],
      'Go': ['Go', 'Kafka', 'System Architectures', 'Kubernetes', 'Microservices', 'Redis'],
      'React': ['React', 'TypeScript', 'Redux Store', 'CSS Animations', 'Git workflows'],
      'Python': ['Python', 'Django API', 'Machine Learning', 'Pandas DataFrames', 'Docker containers']
    };

    // Choose random key matching skills template
    const keys = Object.keys(devTemplates);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const simulatedSkills = devTemplates[randomKey];

    // Populate parsed info mock fields
    cand.email = `${cand.fullName.toLowerCase().replace(/\s/g, '.')}@parsedresume.com`;
    cand.phone = `+1 (555) ${Math.floor(100+Math.random()*900)}-${Math.floor(1000+Math.random()*9000)}`;
    cand.currentRole = `${randomKey} Specialist Consultant`;
    cand.education = `B.S. in Software Development (Online University)`;
    cand.summary = `Autonomous developer profile with parsed expertise in ${simulatedSkills.join(', ')}. Analyzed CV file ${fileName} indicates heavy background in continuous integration pipelines, technical documentations, and legacy refactoring projects.`;
    cand.skills = simulatedSkills;
    cand.parseStatus = 'complete'; // Parser done!
    
    // Auto attach parsed file
    cand.files = [
      { name: fileName, path: `/uploads/${fileName}` }
    ];

    saveToLocalStorage();

    // Trigger success notification
    showToast(`CV successfully parsed for ${cand.fullName}!`, 'success');

    // If currently looking at the job's pipeline board, refresh view immediately
    if (currentView === 'pipeline' && activeJobId === cand.jobId) {
      renderPipelineBoardView();
    }
  }, 5000);
}

// --- DOM EVENT REGISTRATIONS ---
function initAppEventListeners() {
  
  // Navigation Sidebar clicks
  document.getElementById('nav-today').addEventListener('click', () => switchView('today'));
  document.getElementById('nav-jobs').addEventListener('click', () => switchView('jobs'));
  document.getElementById('nav-clients').addEventListener('click', () => switchView('clients'));

  // Breadcrumbs Client detail
  document.getElementById('btn-back-to-clients').addEventListener('click', (e) => {
    e.preventDefault();
    switchView('clients');
  });
  
  // Breadcrumbs Pipeline back
  document.getElementById('btn-pipeline-to-jobs').addEventListener('click', (e) => {
    e.preventDefault();
    switchView('jobs');
  });

  // Client Detail triggers
  document.getElementById('btn-add-job-client-detail-trigger').addEventListener('click', () => {
    openAddJobDrawer(activeClientId);
  });

  // Filter Event Listeners
  document.getElementById('filter-job-client').addEventListener('change', renderJobsView);
  document.getElementById('filter-job-health').addEventListener('change', renderJobsView);
  
  // Search Client Realtime
  document.getElementById('search-client').addEventListener('input', renderClientsView);

  // Drawer Closers
  document.getElementById('btn-close-candidate-drawer').addEventListener('click', () => closeAllDrawers());
  document.getElementById('candidate-profile-backdrop').addEventListener('click', () => closeAllDrawers());

  // Tabs on Candidate Drawer
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchProfileTab(btn.getAttribute('data-tab'));
    });
  });

  // Save/Delete inside Candidate Drawer
  document.getElementById('btn-save-candidate-profile').addEventListener('click', saveCandidateProfileChanges);
  document.getElementById('btn-delete-candidate').addEventListener('click', deleteCandidateProfile);

  // Log Timeline entry addition (Candidate Drawer)
  document.getElementById('profile-log-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = e.target.value.trim();
      if (!val) return;

      const newLog = {
        id: uuid(),
        jobId: activeJobId || db.candidates.find(c => c.id === activeCandidateId).jobId,
        candidateId: activeCandidateId,
        author: 'Antigravity Agent',
        body: val,
        createdAt: formatDate(new Date())
      };

      db.logs.push(newLog);

      // Reset contact dot timer to green
      const cand = db.candidates.find(c => c.id === activeCandidateId);
      if (cand) {
        cand.lastContactDays = 0;
      }

      saveToLocalStorage();
      e.target.value = '';
      renderCandidateLogsTab();
      renderView();
      showToast('Interaction logged', 'success');
    }
  });

  // Scheduled Reminder creation
  document.getElementById('btn-save-reminder').addEventListener('click', () => {
    const dateInput = document.getElementById('reminder-due-date').value;
    const notesInput = document.getElementById('reminder-comment').value.trim();

    if (!dateInput || !notesInput) {
      alert('Please fill out both follow-up date and reminder notes!');
      return;
    }

    const candObj = db.candidates.find(c => c.id === activeCandidateId);
    const jobObj = db.jobs.find(j => j.id === candObj.jobId);

    const newReminder = {
      id: uuid(),
      jobId: candObj.jobId,
      candidateId: activeCandidateId,
      clientId: jobObj.clientId,
      dueAt: dateInput,
      notes: notesInput,
      done: false
    };

    // Remove existing active candidate reminders to prevent duplicate entries
    db.reminders = db.reminders.filter(r => r.candidateId !== activeCandidateId || r.done);
    db.reminders.push(newReminder);
    saveToLocalStorage();

    document.getElementById('reminder-due-date').value = '';
    document.getElementById('reminder-comment').value = '';
    
    renderCandidateRemindersTab();
    renderView();
    showToast('Reminder scheduled', 'success');
  });

  // Client logs drawer trigger (Kanban Header)
  document.getElementById('btn-pipeline-view-logs').addEventListener('click', () => {
    openClientLogsDrawer();
  });
  document.getElementById('btn-close-client-logs-drawer').addEventListener('click', () => closeAllDrawers());
  document.getElementById('btn-close-client-logs-drawer-footer').addEventListener('click', () => closeAllDrawers());
  document.getElementById('client-logs-backdrop').addEventListener('click', () => closeAllDrawers());

  // Logging Client Interaction notes
  document.getElementById('client-log-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = e.target.value.trim();
      if (!val) return;

      const newLog = {
        id: uuid(),
        jobId: activeJobId,
        candidateId: null, // Scopes to Client Log
        author: 'Antigravity Agent',
        body: val,
        createdAt: formatDate(new Date())
      };

      db.logs.push(newLog);
      saveToLocalStorage();

      e.target.value = '';
      renderClientLogsTimeline();
      showToast('Client feedback logged', 'success');
    }
  });

  // RESET BUTTON (Today's Tasks)
  document.getElementById('btn-toggle-mock-data').addEventListener('click', () => {
    if (confirm('This will wipe all changes and restore original mock clients and jobs database. Continue?')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      loadDatabase();
      populateDropdownFilters();
      switchView('today');
      showToast('Database reset to defaults', 'info');
    }
  });

  // Attachments Drag/Drop click mocks
  const fileZone = document.getElementById('profile-file-zone');
  const fileInput = document.getElementById('profile-file-input');
  
  fileZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const name = e.target.files[0].name;
      const cand = db.candidates.find(c => c.id === activeCandidateId);
      if (cand) {
        if (!cand.files) cand.files = [];
        cand.files.push({ name, path: `/uploads/${name}` });
        saveToLocalStorage();
        renderCandidateAttachmentsTab();
        showToast('Attachment uploaded successfully', 'success');
      }
    }
  });

  // --- DRAWER FORM TRIGGERS ---
  
  // Add Client Form Open
  document.getElementById('btn-add-client-trigger').addEventListener('click', () => {
    document.getElementById('add-client-backdrop').classList.add('active');
    document.getElementById('add-client-drawer').classList.add('active');
  });
  
  document.getElementById('btn-close-client-drawer-form').addEventListener('click', () => closeAllDrawers());
  document.getElementById('btn-cancel-client-form').addEventListener('click', () => closeAllDrawers());
  document.getElementById('add-client-backdrop').addEventListener('click', () => closeAllDrawers());

  // Add Client Form Submit
  document.getElementById('form-add-client').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('client-name').value.trim();
    const industry = document.getElementById('client-industry').value.trim();
    const pocName = document.getElementById('client-poc-name').value.trim();
    const pocEmail = document.getElementById('client-poc-email').value.trim();
    const pocPhone = document.getElementById('client-poc-phone').value.trim();
    const notes = document.getElementById('client-notes').value.trim();

    const newClient = {
      id: uuid(),
      name,
      industry,
      pocName,
      pocEmail,
      pocPhone,
      notes
    };

    db.clients.push(newClient);
    saveToLocalStorage();
    
    // Reset inputs
    document.getElementById('form-add-client').reset();
    closeAllDrawers();
    
    // Refresh
    populateDropdownFilters();
    renderClientsView();
    showToast(`Client '${name}' added!`, 'success');
  });

  // Add Job Form Open
  document.getElementById('btn-add-job-trigger').addEventListener('click', () => {
    openAddJobDrawer();
  });

  document.getElementById('btn-close-job-drawer-form').addEventListener('click', () => closeAllDrawers());
  document.getElementById('btn-cancel-job-form').addEventListener('click', () => closeAllDrawers());
  document.getElementById('add-job-backdrop').addEventListener('click', () => closeAllDrawers());

  // Add Job Form Submit
  document.getElementById('form-add-job').addEventListener('submit', (e) => {
    e.preventDefault();
    const clientId = document.getElementById('job-client-select').value;
    const title = document.getElementById('job-title-input').value.trim();
    const notes = document.getElementById('job-notes-input').value.trim();

    const newJob = {
      id: uuid(),
      clientId,
      title,
      notes,
      status: 'active',
      openedAt: formatDate(new Date())
    };

    db.jobs.push(newJob);
    saveToLocalStorage();
    document.getElementById('form-add-job').reset();
    closeAllDrawers();

    renderJobsView();
    if (currentView === 'client-detail' && activeClientId === clientId) {
      renderClientDetailView();
    }
    showToast(`Job opening published!`, 'success');
  });

  // Add Candidate Form Open
  document.getElementById('btn-add-candidate-trigger').addEventListener('click', () => {
    document.getElementById('add-candidate-backdrop').classList.add('active');
    document.getElementById('add-candidate-drawer').classList.add('active');
  });

  document.getElementById('btn-close-candidate-drawer-form').addEventListener('click', () => closeAllDrawers());
  document.getElementById('btn-cancel-candidate-form').addEventListener('click', () => closeAllDrawers());
  document.getElementById('add-candidate-backdrop').addEventListener('click', () => closeAllDrawers());

  // CV zone browse triggers file dialog
  const cvZone = document.getElementById('cv-upload-zone');
  const cvInput = document.getElementById('candidate-cv-file');
  cvZone.addEventListener('click', () => cvInput.click());
  
  cvInput.addEventListener('change', (e) => {
    if (cvInput.files && cvInput.files.length > 0) {
      document.getElementById('cv-upload-label').innerText = `File Selected: ${cvInput.files[0].name}`;
    }
  });

  // Add Candidate Form Submit
  document.getElementById('form-add-candidate').addEventListener('submit', (e) => {
    e.preventDefault();
    const fullName = document.getElementById('candidate-fullname').value.trim();
    const file = cvInput.files[0];

    if (!file) {
      alert('Please upload a candidate CV file to run the parser!');
      return;
    }

    const candId = uuid();
    const newCandidate = {
      id: candId,
      fullName,
      email: '',
      phone: '',
      currentRole: '',
      education: '',
      summary: '',
      skills: [],
      parseStatus: 'pending', // Triggers the Shimmer loading state!
      jobId: activeJobId,
      stage: 'sourced',
      lastContactDays: 0,
      files: []
    };

    db.candidates.push(newCandidate);
    
    // Add Sourced transition log default
    const newLog = {
      id: uuid(),
      jobId: activeJobId,
      candidateId: candId,
      author: 'System Parser',
      body: `CV ${file.name} uploaded. Commencing automated extraction.`,
      createdAt: formatDate(new Date())
    };
    db.logs.push(newLog);

    saveToLocalStorage();

    // Reset inputs
    document.getElementById('form-add-candidate').reset();
    document.getElementById('cv-upload-label').innerText = 'Drag & drop CV file (.pdf, .docx, .txt) or click to browse';
    closeAllDrawers();

    // Rerender Board to show shimmer loading card instantly
    renderPipelineBoardView();
    showToast('CV Uploaded! Running background parser...', 'info');

    // Fire simulated async parser worker
    triggerMockCvParser(candId, file.name);
  });
}

function openAddJobDrawer(defaultClientId = null) {
  const select = document.getElementById('job-client-select');
  select.innerHTML = '';

  if (db.clients.length === 0) {
    alert('You must add a client company first before creating job opening positions!');
    switchView('clients');
    return;
  }

  db.clients.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.innerText = c.name;
    if (defaultClientId && c.id === defaultClientId) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });

  document.getElementById('add-job-backdrop').classList.add('active');
  document.getElementById('add-job-drawer').classList.add('active');
}

// Populate Client Filters across views
function populateDropdownFilters() {
  const jobClientFilter = document.getElementById('filter-job-client');
  jobClientFilter.innerHTML = '<option value="all">All Clients</option>';

  db.clients.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.innerText = c.name;
    jobClientFilter.appendChild(opt);
  });
}

// --- INITIALIZATION ENTRY POINT ---
document.addEventListener('DOMContentLoaded', () => {
  loadDatabase();
  populateDropdownFilters();
  initAppEventListeners();
  initClientDetailEditableFields();
  
  // Show initial Today list view
  switchView('today');
});
