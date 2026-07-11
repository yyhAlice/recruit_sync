import type { WsFolder, WsFile, WsActivity, WsFileType } from '../types/workspace'

type FileSpec = [string, WsFileType, string, number, string[], string, string]

function mkFolder(id: string, wsId: string, name: string, by: string, date: string, notes = ''): WsFolder {
  return { id, workspaceId: wsId, parentId: null, name, createdAt: date, createdBy: by, updatedAt: date, notes }
}

function mkFiles(folderId: string, wsId: string, specs: FileSpec[]): WsFile[] {
  return specs.map(([name, fileType, description, size, tags, uploadedBy, uploadedAt], i) => ({
    id: `fi-${folderId}-${i + 1}`,
    folderId,
    workspaceId: wsId,
    name,
    fileType,
    description,
    size,
    tags,
    uploadedBy,
    uploadedAt,
  }))
}

// ─── Client Workspaces ──────────────────────────────────────────────────────────
// cl-c1  Nexus Systems K.K.
const c1Folders: WsFolder[] = [
  mkFolder('fc1-1', 'cl-c1', 'Contracts',     'Y. Tanaka', '2026-01-10', 'All signed contracts and amendments with Nexus Systems. Renew MSA before 2027-01-31.'),
  mkFolder('fc1-2', 'cl-c1', 'Job Descriptions', 'J. Park', '2026-03-05'),
  mkFolder('fc1-3', 'cl-c1', 'Meeting Notes', 'Y. Tanaka', '2026-04-15', 'Monthly check-ins every first Thursday.'),
  mkFolder('fc1-4', 'cl-c1', 'Others',        'H. Yamamoto', '2026-05-01'),
]
const c1Files: WsFile[] = [
  ...mkFiles('fc1-1', 'cl-c1', [
    ['Nexus_MSA_2026.pdf',         'pdf',  'Master Service Agreement — valid until Jan 2027', 248000, ['contract','msa'],       'Y. Tanaka',   '2026-01-10'],
    ['NDA_Nexus_2026.pdf',         'pdf',  'Non-disclosure agreement signed by both parties',  195000, ['nda','legal'],          'Y. Tanaka',   '2026-01-12'],
    ['SLA_Definitions.docx',       'docx', 'Service level definitions and KPI thresholds',     102000, ['sla'],                  'J. Park',     '2026-02-05'],
    ['Amendment_01.pdf',           'pdf',  'Scope amendment for Q2 additional headcount',       88000, ['amendment'],            'Y. Tanaka',   '2026-04-20'],
    ['Fee_Schedule_2026.xlsx',     'xlsx', 'Placement fee structure and payment terms',         74000, ['fees','billing'],       'H. Yamamoto', '2026-01-15'],
  ]),
  ...mkFiles('fc1-2', 'cl-c1', [
    ['JD_Senior_Java_Engineer.pdf',  'pdf',  'Full JD for Senior Java Engineer role (j1)',       156000, ['jd','java'],      'J. Park',   '2026-03-05'],
    ['JD_DevOps_Engineer.pdf',       'pdf',  'Full JD for DevOps Engineer role (j2)',            148000, ['jd','devops'],    'J. Park',   '2026-03-10'],
    ['Skills_Matrix_Java.xlsx',      'xlsx', 'Technical skills matrix and scoring rubric',       91000,  ['assessment'],    'Y. Tanaka', '2026-03-12'],
    ['Interview_Scorecard.docx',     'docx', 'Interview evaluation template for all roles',       83000, ['interview'],     'J. Park',   '2026-03-20'],
  ]),
  ...mkFiles('fc1-3', 'cl-c1', [
    ['Kickoff_Meeting_2026-01.docx', 'docx', 'Kickoff meeting minutes — Jan 2026',               67000, ['minutes'],       'Y. Tanaka',   '2026-01-20'],
    ['Q1_Review_Notes.docx',         'docx', 'Q1 progress review — 3 placements confirmed',      72000, ['review'],        'Y. Tanaka',   '2026-04-05'],
    ['Requirements_Update.docx',     'docx', 'Updated hiring requirements from Yamamoto-san',    58000, ['requirements'],  'J. Park',     '2026-05-10'],
    ['Tech_Screening_Prep.pdf',      'pdf',  'Guidance notes for technical pre-screening',        95000, ['screening'],    'H. Yamamoto', '2026-06-01'],
  ]),
  ...mkFiles('fc1-4', 'cl-c1', [
    ['Nexus_Company_Profile.pdf', 'pdf',  'Company overview, org chart and office locations',  312000, ['profile'],     'Y. Tanaka',   '2026-01-08'],
    ['Org_Chart_2026.png',        'png',  'Current organisation chart — updated Q2',           185000, ['org-chart'],   'J. Park',     '2026-04-25'],
    ['VISA_Guide_Japan.pdf',      'pdf',  'Japan visa sponsorship process guide',              204000, ['visa','guide'],'H. Yamamoto', '2026-02-15'],
  ]),
]

// cl-c2  Atlas Fintech Ltd.
const c2Folders: WsFolder[] = [
  mkFolder('fc2-1', 'cl-c2', 'Contracts',     'J. Park',   '2026-02-01', 'Atlas Fintech contracts. 15% placement fee agreed.'),
  mkFolder('fc2-2', 'cl-c2', 'Job Descriptions', 'J. Park','2026-03-15'),
  mkFolder('fc2-3', 'cl-c2', 'Meeting Notes', 'Y. Tanaka', '2026-04-01'),
  mkFolder('fc2-4', 'cl-c2', 'Visa Documents','H. Yamamoto','2026-04-10'),
]
const c2Files: WsFile[] = [
  ...mkFiles('fc2-1', 'cl-c2', [
    ['Atlas_MSA_2026.pdf',          'pdf',  'Master service agreement with Atlas Fintech',       235000, ['contract','msa'],  'J. Park',   '2026-02-01'],
    ['NDA_Atlas.pdf',               'pdf',  'Mutual NDA signed Feb 2026',                        190000, ['nda'],             'J. Park',   '2026-02-03'],
    ['Fee_Agreement_Finance.pdf',   'pdf',  'Fee schedule for Finance and Risk roles',            88000, ['fees'],            'J. Park',   '2026-02-10'],
    ['SOW_Q2_2026.docx',            'docx', 'Statement of work for Q2 hiring campaign',          112000, ['sow'],            'Y. Tanaka', '2026-04-01'],
  ]),
  ...mkFiles('fc2-2', 'cl-c2', [
    ['JD_Finance_Analyst.pdf',      'pdf',  'Finance Analyst JD — Bloomberg required',           148000, ['jd','finance'],   'J. Park',   '2026-03-15'],
    ['JD_Risk_Manager.pdf',         'pdf',  'Senior Risk Manager JD — Basel III required',       162000, ['jd','risk'],      'J. Park',   '2026-03-20'],
    ['Competency_Framework.xlsx',   'xlsx', 'Finance division competency and level guide',        95000, ['assessment'],    'Y. Tanaka', '2026-03-25'],
  ]),
  ...mkFiles('fc2-3', 'cl-c2', [
    ['Kickoff_Atlas_2026-02.docx',  'docx', 'Initial client meeting notes — requirements captured', 65000, ['minutes'], 'J. Park',   '2026-02-15'],
    ['Candidate_Briefing_Q2.docx',  'docx', 'Briefing note on shortlisted candidates',           78000, ['briefing'],       'J. Park',   '2026-06-10'],
    ['Mid_Year_Review.docx',        'docx', 'Mid-year performance and pipeline review',           82000, ['review'],        'Y. Tanaka', '2026-07-01'],
  ]),
  ...mkFiles('fc2-4', 'cl-c2', [
    ['Work_Visa_WangFang.pdf',      'pdf',  'Work visa application package — Wang Fang',         345000, ['visa','wang-fang'],    'H. Yamamoto', '2026-06-25'],
    ['Visa_Checklist.xlsx',         'xlsx', 'Required documents checklist for visa application', 62000, ['visa','checklist'],    'H. Yamamoto', '2026-06-20'],
    ['Sponsorship_Letter.docx',     'docx', 'Employer sponsorship letter template',              88000, ['visa','sponsorship'],  'H. Yamamoto', '2026-06-22'],
  ]),
]

// cl-c3  Toyota IT Systems
const c3Folders: WsFolder[] = [
  mkFolder('fc3-1', 'cl-c3', 'Contracts',     'H. Yamamoto','2026-01-20', 'Toyota IT Systems contracts. Renewal due Jan 2027.'),
  mkFolder('fc3-2', 'cl-c3', 'Job Descriptions','Y. Tanaka', '2026-02-10'),
  mkFolder('fc3-3', 'cl-c3', 'Meeting Notes', 'Y. Tanaka',  '2026-03-01'),
  mkFolder('fc3-4', 'cl-c3', 'Visa Documents','H. Yamamoto','2026-05-05'),
]
const c3Files: WsFile[] = [
  ...mkFiles('fc3-1', 'cl-c3', [
    ['Toyota_MSA_2026.pdf',          'pdf',  'MSA with Toyota IT Systems — 5 year agreement',    280000, ['contract','msa'], 'H. Yamamoto', '2026-01-20'],
    ['NDA_Toyota_2026.pdf',          'pdf',  'Bilateral NDA effective Jan 2026',                  195000, ['nda'],           'H. Yamamoto', '2026-01-22'],
    ['Fee_Schedule_Toyota.xlsx',     'xlsx', 'Placement fee structure — engineering roles',        81000, ['fees'],          'Y. Tanaka',   '2026-01-25'],
    ['Preferred_Vendor_Cert.pdf',    'pdf',  'Preferred vendor certification from Toyota Group',  135000, ['certification'], 'H. Yamamoto', '2026-02-01'],
  ]),
  ...mkFiles('fc3-2', 'cl-c3', [
    ['JD_Cloud_Infra_Engineer.pdf',  'pdf',  'Cloud Infrastructure Engineer JD (j8)',             152000, ['jd','cloud'],    'Y. Tanaka',   '2026-02-10'],
    ['JD_Systems_Architect.pdf',     'pdf',  'Systems Architect JD (j9) — 10 yrs exp required',  165000, ['jd','architect'],'Y. Tanaka',   '2026-02-12'],
    ['Technical_Test_Infra.zip',     'zip',  'Technical assessment materials — compressed',       520000, ['assessment'],   'H. Yamamoto', '2026-02-20'],
  ]),
  ...mkFiles('fc3-3', 'cl-c3', [
    ['Kickoff_Toyota_2026-01.docx',  'docx', 'Project kickoff minutes — Nagoya visit',             72000, ['minutes'],       'H. Yamamoto', '2026-01-28'],
    ['Tech_Requirements_v2.docx',    'docx', 'Updated requirements after Suzuki-san review',       85000, ['requirements'],  'Y. Tanaka',   '2026-05-05'],
    ['Interview_Panel_Schedule.xlsx','xlsx', 'Panel interview schedule for shortlisted candidates', 68000,['schedule'],      'Y. Tanaka',   '2026-06-15'],
    ['Q2_Progress_Report.pdf',       'pdf',  'Q2 hiring progress: 2 of 4 positions filled',       110000, ['report'],       'H. Yamamoto', '2026-07-01'],
  ]),
  ...mkFiles('fc3-4', 'cl-c3', [
    ['Visa_App_DavidKim.pdf',        'pdf',  'Work visa application — David Kim',                  318000, ['visa','david-kim'],  'H. Yamamoto', '2026-07-01'],
    ['Supporting_Docs_DavidKim.zip', 'zip',  'Supporting documents package — David Kim',           742000, ['visa','zip'],       'H. Yamamoto', '2026-07-01'],
    ['Immigration_Checklist.xlsx',   'xlsx', 'Japan immigration checklist for employer sponsors',   72000, ['visa'],             'H. Yamamoto', '2026-06-25'],
  ]),
]

// cl-c4  Mitsubishi Trading Co.
const c4Folders: WsFolder[] = [
  mkFolder('fc4-1', 'cl-c4', 'Contracts',      'J. Park',   '2026-01-05'),
  mkFolder('fc4-2', 'cl-c4', 'Job Descriptions','J. Park',  '2026-02-20'),
  mkFolder('fc4-3', 'cl-c4', 'Meeting Notes',  'Y. Tanaka', '2026-03-10'),
  mkFolder('fc4-4', 'cl-c4', 'Others',         'Y. Tanaka', '2026-04-05'),
]
const c4Files: WsFile[] = [
  ...mkFiles('fc4-1', 'cl-c4', [
    ['Mitsubishi_MSA_2026.pdf',    'pdf',  'MSA with Mitsubishi Trading Co.',                   261000, ['contract','msa'],   'J. Park',   '2026-01-05'],
    ['NDA_Mitsubishi.pdf',         'pdf',  'NDA — Mitsubishi standard template',                192000, ['nda'],              'J. Park',   '2026-01-07'],
    ['Invoice_Template.xlsx',      'xlsx', 'Standard invoice template — approved format',        55000, ['billing'],          'Y. Tanaka', '2026-01-10'],
  ]),
  ...mkFiles('fc4-2', 'cl-c4', [
    ['JD_Business_Analyst.pdf',    'pdf',  'Business Analyst JD (j12) — Tableau + SQL',         142000, ['jd','ba'],         'J. Park',   '2026-02-20'],
    ['JD_Supply_Chain.pdf',        'pdf',  'Supply Chain Manager JD (j13) — on hold',           155000, ['jd','scm','hold'], 'J. Park',   '2026-02-25'],
    ['Competency_Matrix.xlsx',     'xlsx', 'Role competency matrix and required certs',           82000, ['assessment'],     'Y. Tanaka', '2026-03-01'],
  ]),
  ...mkFiles('fc4-3', 'cl-c4', [
    ['Initial_Meeting_Notes.docx', 'docx', 'First client meeting — Ito-san requirements',        68000, ['minutes'],        'J. Park',   '2026-03-10'],
    ['Candidate_Presentation.pdf', 'pdf',  'Shortlist presentation slides — 3 candidates',      215000, ['presentation'],   'J. Park',   '2026-06-20'],
    ['Offer_Negotiation_Notes.txt','txt',  'Internal notes on offer negotiation for Chen Yang',   12000, ['notes','offer'],  'Y. Tanaka', '2026-07-01'],
  ]),
  ...mkFiles('fc4-4', 'cl-c4', [
    ['Mitsubishi_OrgChart.png',    'png',  'Corporate org chart — Trading division',             225000, ['org-chart'],      'J. Park',   '2026-03-15'],
    ['ERP_Migration_Brief.pdf',    'pdf',  'Context brief on ERP migration project',             185000, ['context'],        'J. Park',   '2026-03-20'],
  ]),
]

// cl-c5  SoftBank Robotics
const c5Folders: WsFolder[] = [
  mkFolder('fc5-1', 'cl-c5', 'Contracts',      'Y. Tanaka', '2026-03-01', 'Premium client — special fee structure 18%.'),
  mkFolder('fc5-2', 'cl-c5', 'Job Descriptions','J. Park',  '2026-03-20'),
  mkFolder('fc5-3', 'cl-c5', 'Meeting Notes',  'J. Park',   '2026-04-01'),
  mkFolder('fc5-4', 'cl-c5', 'Others',         'H. Yamamoto','2026-04-05'),
]
const c5Files: WsFile[] = [
  ...mkFiles('fc5-1', 'cl-c5', [
    ['SoftBank_MSA_2026.pdf',       'pdf',  'MSA with SoftBank Robotics — 18% placement fee',   272000, ['contract','msa'],    'Y. Tanaka', '2026-03-01'],
    ['NDA_SoftBank.pdf',            'pdf',  'SoftBank Group standard NDA',                       205000, ['nda'],               'Y. Tanaka', '2026-03-03'],
    ['Fee_Agreement_SBR.pdf',       'pdf',  'Premium fee agreement — AI and Robotics roles',     118000, ['fees','premium'],    'Y. Tanaka', '2026-03-05'],
    ['Preferred_Vendor.pdf',        'pdf',  'Preferred vendor status certification',             142000, ['certification'],     'Y. Tanaka', '2026-03-10'],
  ]),
  ...mkFiles('fc5-2', 'cl-c5', [
    ['JD_UX_Designer.pdf',          'pdf',  'UX Designer JD (j14) — Figma/Sketch',              138000, ['jd','ux'],           'J. Park',   '2026-03-20'],
    ['JD_AI_Engineer.pdf',          'pdf',  'AI Engineer JD (j15) — PyTorch/TensorFlow',        168000, ['jd','ai','ml'],      'J. Park',   '2026-03-22'],
    ['Technical_Assessment_AI.zip', 'zip',  'ML assessment kit — coding challenge + case study', 485000, ['assessment','ai'],  'J. Park',   '2026-04-01'],
  ]),
  ...mkFiles('fc5-3', 'cl-c5', [
    ['Kickoff_SBR_2026-03.docx',    'docx', 'Kickoff — Kobayashi-san requirements brief',         74000, ['minutes'],          'J. Park',   '2026-04-01'],
    ['AI_Talent_Briefing.pdf',      'pdf',  'AI talent market briefing for SoftBank',            196000, ['briefing','ai'],    'Y. Tanaka', '2026-05-10'],
    ['Candidate_Longlist.xlsx',     'xlsx', 'AI Engineer longlist — 12 candidates evaluated',   104000, ['candidates'],       'J. Park',   '2026-06-15'],
  ]),
  ...mkFiles('fc5-4', 'cl-c5', [
    ['SoftBank_Culture.pdf',        'pdf',  'Company culture and values document',               155000, ['culture'],          'J. Park',   '2026-04-05'],
    ['Robotics_Overview.pdf',       'pdf',  'Technical overview of Pepper and product line',     340000, ['product'],          'Y. Tanaka', '2026-04-08'],
  ]),
]

// ─── Job Workspaces ─────────────────────────────────────────────────────────────
// jo-j1  Senior Java Engineer
const j1Folders: WsFolder[] = [
  mkFolder('fj1-1', 'jo-j1', 'Job Description', 'J. Park',   '2026-03-05'),
  mkFolder('fj1-2', 'jo-j1', 'Candidate CVs',   'J. Park',   '2026-03-10'),
  mkFolder('fj1-3', 'jo-j1', 'Offer Letters',   'Y. Tanaka', '2026-06-01'),
]
const j1Files: WsFile[] = [
  ...mkFiles('fj1-1', 'jo-j1', [
    ['JD_Senior_Java_Engineer.pdf', 'pdf',  'Full job description — Nexus Systems (j1)',           156000, ['jd'],         'J. Park',   '2026-03-05'],
    ['Requirements_Brief.docx',     'docx', 'Internal requirements briefing from Yamamoto-san',    92000, ['requirements'],'J. Park',   '2026-03-08'],
    ['Assessment_Questions.xlsx',   'xlsx', 'Technical assessment question bank — Java',            75000, ['assessment'],  'J. Park',   '2026-03-12'],
  ]),
  ...mkFiles('fj1-2', 'jo-j1', [
    ['AungAung_CV.pdf',             'pdf',  'Aung Aung — 7 years Java, N1 Japanese',              312000, ['cv','myanmar'], 'J. Park',   '2026-06-12'],
    ['KimJaewon_CV.pdf',            'pdf',  'Kim Jae-won — 5 years Java, N2 Japanese',            285000, ['cv','korea'],   'J. Park',   '2026-06-08'],
    ['TanakaHiroshi_CV.pdf',        'pdf',  'Tanaka Hiroshi — 6 years Java, Native',              298000, ['cv','japan'],   'Y. Tanaka', '2026-06-18'],
    ['ChenLi_CV.pdf',               'pdf',  'Chen Li — 8 years Java, N2 Japanese',                320000, ['cv','china'],   'J. Park',   '2026-05-01'],
    ['Interview_Scores.xlsx',       'xlsx', 'Consolidated interview scorecard — all candidates',   88000, ['scores'],       'Y. Tanaka', '2026-06-25'],
  ]),
  ...mkFiles('fj1-3', 'jo-j1', [
    ['Offer_Template.docx',         'docx', 'Standard offer letter template — Nexus Systems',     105000, ['offer','template'], 'Y. Tanaka', '2026-06-01'],
    ['ChenLi_Offer_Letter.pdf',     'pdf',  'Signed offer letter — Chen Li, ¥10M package',       185000, ['offer','signed'],   'Y. Tanaka', '2026-06-10'],
  ]),
]

// jo-j5  Finance Analyst
const j5Folders: WsFolder[] = [
  mkFolder('fj5-1', 'jo-j5', 'Job Description', 'J. Park',   '2026-03-15'),
  mkFolder('fj5-2', 'jo-j5', 'Candidate CVs',   'J. Park',   '2026-03-20'),
  mkFolder('fj5-3', 'jo-j5', 'Offer Letters',   'Y. Tanaka', '2026-06-25'),
]
const j5Files: WsFile[] = [
  ...mkFiles('fj5-1', 'jo-j5', [
    ['JD_Finance_Analyst.pdf',     'pdf',  'Finance Analyst JD — Atlas Fintech (j5)',             148000, ['jd','finance'],  'J. Park', '2026-03-15'],
    ['Competency_Framework.xlsx',  'xlsx', 'Bloomberg and VBA competency scoring matrix',           82000, ['assessment'],   'J. Park', '2026-03-18'],
  ]),
  ...mkFiles('fj5-2', 'jo-j5', [
    ['JungSooyeon_CV.pdf',         'pdf',  'Jung Soo-yeon — 5 yrs finance, Bloomberg expert',    278000, ['cv','korea'],    'J. Park', '2026-06-10'],
    ['TomAnderson_CV.pdf',         'pdf',  'Tom Anderson — 8 yrs derivatives, NY background',    310000, ['cv','usa'],      'J. Park', '2026-06-05'],
    ['WangFang_CV.pdf',            'pdf',  'Wang Fang — 6 yrs finance, SAP certified',           294000, ['cv','china'],    'J. Park', '2026-05-25'],
  ]),
  ...mkFiles('fj5-3', 'jo-j5', [
    ['WangFang_Offer_Draft.docx',  'docx', 'Offer letter draft — Wang Fang, ¥8.5M',             112000, ['offer','draft'], 'Y. Tanaka', '2026-06-25'],
  ]),
]

// jo-j8  Cloud Infra Engineer
const j8Folders: WsFolder[] = [
  mkFolder('fj8-1', 'jo-j8', 'Job Description', 'Y. Tanaka', '2026-02-10'),
  mkFolder('fj8-2', 'jo-j8', 'Candidate CVs',   'Y. Tanaka', '2026-02-15'),
  mkFolder('fj8-3', 'jo-j8', 'Assessments',     'H. Yamamoto','2026-03-01'),
]
const j8Files: WsFile[] = [
  ...mkFiles('fj8-1', 'jo-j8', [
    ['JD_Cloud_Infra_Engineer.pdf', 'pdf',  'Cloud Infra Engineer JD — Toyota IT (j8)',          152000, ['jd','cloud'],   'Y. Tanaka',   '2026-02-10'],
    ['Role_Scorecard.docx',         'docx', 'Hiring scorecard and must-have criteria',             88000, ['scorecard'],   'H. Yamamoto', '2026-02-15'],
  ]),
  ...mkFiles('fj8-2', 'jo-j8', [
    ['KatoTatsuya_CV.pdf',          'pdf',  'Kato Tatsuya — 4 yrs GCP/Kubernetes, Nagoya',      265000, ['cv','japan'],   'Y. Tanaka',   '2026-06-10'],
    ['YamadaEmi_CV.pdf',            'pdf',  'Yamada Emi — 6 yrs AWS/Ansible, Osaka based',      278000, ['cv','japan'],   'Y. Tanaka',   '2026-06-05'],
    ['DavidKim_CV.pdf',             'pdf',  'David Kim — 9 yrs multi-cloud, Canada based',       315000, ['cv','canada'],  'H. Yamamoto', '2026-05-15'],
  ]),
  ...mkFiles('fj8-3', 'jo-j8', [
    ['Cloud_Assessment.zip',        'zip',  'Terraform + AWS architecture assessment kit',        410000, ['assessment'],   'H. Yamamoto', '2026-03-01'],
    ['Assessment_Results.xlsx',     'xlsx', 'Candidate assessment scores — all three candidates', 78000, ['results'],      'Y. Tanaka',   '2026-06-28'],
  ]),
]

// ─── Candidate Workspaces ────────────────────────────────────────────────────────
function candidateWorkspace(wsId: string, nameSlug: string, by: string): { folders: WsFolder[]; files: WsFile[] } {
  const folders: WsFolder[] = [
    mkFolder(`${wsId}-f1`, wsId, 'CV',             by, '2026-05-01', 'Main CV files for this candidate.'),
    mkFolder(`${wsId}-f2`, wsId, 'Passport / ID',  by, '2026-05-01'),
    mkFolder(`${wsId}-f3`, wsId, 'Certificates',   by, '2026-05-01'),
    mkFolder(`${wsId}-f4`, wsId, 'Generated CVs',  by, '2026-05-05'),
  ]
  const files: WsFile[] = [
    ...mkFiles(`${wsId}-f1`, wsId, [
      [`${nameSlug}_CV_Original.pdf`, 'pdf', 'Original CV submitted by candidate', 295000, ['cv','original'], by, '2026-05-01'],
      [`${nameSlug}_CV_Updated.pdf`,  'pdf', 'Updated CV after review session',    310000, ['cv','updated'],  by, '2026-06-01'],
    ]),
    ...mkFiles(`${wsId}-f2`, wsId, [
      [`${nameSlug}_Passport.pdf`,    'pdf', 'Passport scan — valid until 2030', 185000, ['passport','id'],  by, '2026-05-02'],
      [`${nameSlug}_Residence.pdf`,   'pdf', 'Residence card or visa copy',      142000, ['visa','id'],      by, '2026-05-10'],
    ]),
    ...mkFiles(`${wsId}-f3`, wsId, [
      [`${nameSlug}_Degree.pdf`,      'pdf', 'University degree certificate',     220000, ['certificate','degree'],       by, '2026-05-03'],
      [`${nameSlug}_JLPT.pdf`,        'pdf', 'JLPT certificate — N1 or N2',       165000, ['certificate','japanese'],    by, '2026-05-03'],
      [`${nameSlug}_AWS_Cert.pdf`,    'pdf', 'AWS certification or equivalent',   178000, ['certificate','technical'],   by, '2026-05-05'],
    ]),
    ...mkFiles(`${wsId}-f4`, wsId, [
      [`${nameSlug}_GenCV_AgencyStd.pdf`, 'pdf', 'Generated CV — Agency Standard template', 288000, ['generated','cv'], by, '2026-06-15'],
    ]),
  ]
  return { folders, files }
}

const cand1 = candidateWorkspace('ca-cj1-4',  'AungAung',       'J. Park')
const cand2 = candidateWorkspace('ca-cj1-3',  'KimJaewon',      'J. Park')
const cand3 = candidateWorkspace('ca-cj9-2',  'YoshidaSota',    'Y. Tanaka')
const cand4 = candidateWorkspace('ca-cj5-5',  'WangFang',       'J. Park')
const cand5 = candidateWorkspace('ca-cj6-4',  'ZhouXuan',       'J. Park')
const cand6 = candidateWorkspace('ca-cj2-5',  'EmmaWilson',     'Y. Tanaka')
const cand7 = candidateWorkspace('ca-cj8-3',  'YamadaEmi',      'Y. Tanaka')
const cand8 = candidateWorkspace('ca-cj12-3', 'KhantMyat',      'H. Yamamoto')

// ─── Activities ─────────────────────────────────────────────────────────────────
export const initialActivities: WsActivity[] = [
  { id: 'act-1', workspaceId: 'cl-c1', folderId: 'fc1-1', type: 'upload',        description: 'Nexus_MSA_2026.pdf uploaded',          performedBy: 'Y. Tanaka',   timestamp: '2026-01-10T09:20:00' },
  { id: 'act-2', workspaceId: 'cl-c1', folderId: 'fc1-2', type: 'upload',        description: 'JD_Senior_Java_Engineer.pdf uploaded',  performedBy: 'J. Park',     timestamp: '2026-03-05T14:35:00' },
  { id: 'act-3', workspaceId: 'cl-c1', folderId: 'fc1-3', type: 'upload',        description: 'Q1_Review_Notes.docx uploaded',         performedBy: 'Y. Tanaka',   timestamp: '2026-04-05T11:10:00' },
  { id: 'act-4', workspaceId: 'cl-c1', folderId: 'fc1-1', type: 'rename',        description: 'SLA document renamed to SLA_Definitions', performedBy: 'J. Park',  timestamp: '2026-04-20T16:05:00' },
  { id: 'act-5', workspaceId: 'cl-c1', folderId: 'fc1-4', type: 'create_folder', description: 'Folder "Others" created',               performedBy: 'H. Yamamoto', timestamp: '2026-05-01T10:00:00' },

  { id: 'act-6', workspaceId: 'cl-c2', folderId: 'fc2-4', type: 'upload',        description: 'Work_Visa_WangFang.pdf uploaded',        performedBy: 'H. Yamamoto', timestamp: '2026-06-25T13:40:00' },
  { id: 'act-7', workspaceId: 'cl-c2', folderId: 'fc2-3', type: 'upload',        description: 'Mid_Year_Review.docx uploaded',          performedBy: 'Y. Tanaka',   timestamp: '2026-07-01T09:00:00' },
  { id: 'act-8', workspaceId: 'cl-c2', folderId: 'fc2-1', type: 'rename',        description: 'Fee document renamed to Fee_Agreement_Finance', performedBy: 'J. Park', timestamp: '2026-06-01T14:20:00' },

  { id: 'act-9',  workspaceId: 'cl-c3', folderId: 'fc3-4', type: 'upload',       description: 'Visa_App_DavidKim.pdf uploaded',          performedBy: 'H. Yamamoto', timestamp: '2026-07-01T10:15:00' },
  { id: 'act-10', workspaceId: 'cl-c3', folderId: 'fc3-3', type: 'upload',       description: 'Q2_Progress_Report.pdf uploaded',          performedBy: 'H. Yamamoto', timestamp: '2026-07-01T09:45:00' },
  { id: 'act-11', workspaceId: 'cl-c3', folderId: 'fc3-2', type: 'upload',       description: 'Technical_Test_Infra.zip uploaded',        performedBy: 'H. Yamamoto', timestamp: '2026-02-20T15:30:00' },

  { id: 'act-12', workspaceId: 'jo-j1', folderId: 'fj1-3', type: 'upload',       description: 'ChenLi_Offer_Letter.pdf uploaded',         performedBy: 'Y. Tanaka',   timestamp: '2026-06-10T16:00:00' },
  { id: 'act-13', workspaceId: 'jo-j1', folderId: 'fj1-2', type: 'upload',       description: 'Interview_Scores.xlsx uploaded',           performedBy: 'Y. Tanaka',   timestamp: '2026-06-25T13:00:00' },
  { id: 'act-14', workspaceId: 'jo-j1', folderId: 'fj1-2', type: 'upload',       description: 'AungAung_CV.pdf uploaded',                 performedBy: 'J. Park',     timestamp: '2026-06-12T11:20:00' },

  { id: 'act-15', workspaceId: 'ca-cj1-4', folderId: 'ca-cj1-4-f4', type: 'upload', description: 'AungAung_GenCV_AgencyStd.pdf uploaded', performedBy: 'J. Park',   timestamp: '2026-06-15T14:30:00' },
  { id: 'act-16', workspaceId: 'ca-cj1-4', folderId: 'ca-cj1-4-f1', type: 'upload', description: 'AungAung_CV_Updated.pdf uploaded',      performedBy: 'J. Park',   timestamp: '2026-06-01T11:05:00' },
  { id: 'act-17', workspaceId: 'ca-cj1-4', folderId: 'ca-cj1-4-f3', type: 'note_update', description: 'Notes updated in Certificates folder', performedBy: 'J. Park', timestamp: '2026-06-10T09:30:00' },

  { id: 'act-18', workspaceId: 'jo-j5', folderId: 'fj5-3', type: 'upload',       description: 'WangFang_Offer_Draft.docx uploaded',       performedBy: 'Y. Tanaka',   timestamp: '2026-06-25T15:45:00' },
  { id: 'act-19', workspaceId: 'jo-j8', folderId: 'fj8-3', type: 'upload',       description: 'Assessment_Results.xlsx uploaded',          performedBy: 'Y. Tanaka',   timestamp: '2026-06-28T10:00:00' },
]

// ─── Exports ────────────────────────────────────────────────────────────────────
export const initialFolders: WsFolder[] = [
  ...c1Folders, ...c2Folders, ...c3Folders, ...c4Folders, ...c5Folders,
  ...j1Folders, ...j5Folders, ...j8Folders,
  ...cand1.folders, ...cand2.folders, ...cand3.folders, ...cand4.folders,
  ...cand5.folders, ...cand6.folders, ...cand7.folders, ...cand8.folders,
]

export const initialFiles: WsFile[] = [
  ...c1Files, ...c2Files, ...c3Files, ...c4Files, ...c5Files,
  ...j1Files, ...j5Files, ...j8Files,
  ...cand1.files, ...cand2.files, ...cand3.files, ...cand4.files,
  ...cand5.files, ...cand6.files, ...cand7.files, ...cand8.files,
]

// Workspace ID helpers
export function clientWsId(clientId: string) { return `cl-${clientId}` }
export function jobWsId(jobId: string)         { return `jo-${jobId}` }
export function candidateWsId(candidateId: string) { return `ca-${candidateId}` }
