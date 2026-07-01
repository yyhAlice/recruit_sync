import type { Client, Job, Candidate, Recruiter, ActivityLog, PipelineStage } from '../types'

export const PIPELINE_STAGES: PipelineStage[] = [
  'sourced',
  'screening',
  'interview',
  'offered',
  'placed',
  'rejected',
]

export const STAGE_LABELS: Record<PipelineStage, string> = {
  sourced: 'Sourced',
  screening: 'Screening',
  interview: 'Interview',
  offered: 'Offered',
  placed: 'Placed',
  rejected: 'Rejected',
}

// ─── Recruiters ────────────────────────────────────────────────────────────────
export const recruiters: Recruiter[] = [
  { id: 'r1', name: 'Y. Tanaka' },
  { id: 'r2', name: 'J. Park' },
  { id: 'r3', name: 'H. Yamamoto' },
]

// ─── Clients ───────────────────────────────────────────────────────────────────
export const clients: Client[] = [
  {
    id: 'c1',
    companyName: 'Nexus Systems K.K.',
    contactPerson: 'Yamamoto Jiro',
    industry: 'Technology',
    email: 'yamamoto@nexus.co.jp',
    phone: '+81-3-1234-5678',
    address: '2-5-1 Marunouchi Tokyo',
    website: 'nexus-sys.co.jp',
    notes: 'Key enterprise technology client. Strong preference for N2+ Japanese speakers.',
    lastContactDate: '2026-06-28',
  },
  {
    id: 'c2',
    companyName: 'Atlas Fintech Ltd.',
    contactPerson: 'Nakamura Yuki',
    industry: 'Finance',
    email: 'nakamura@atlasfintech.com',
    phone: '+81-3-2345-6789',
    address: '1-1-1 Shinjuku Tokyo',
    website: 'atlasfintech.com',
    notes: 'Rapidly growing fintech. Multiple open roles in risk and engineering.',
    lastContactDate: '2026-06-22',
  },
  {
    id: 'c3',
    companyName: 'Toyota IT Systems',
    contactPerson: 'Suzuki Hiroshi',
    industry: 'Manufacturing',
    email: 'suzuki@toyotait.co.jp',
    phone: '+81-52-1234-5678',
    address: '1 Toyota-cho Toyota Aichi',
    website: 'toyotait.co.jp',
    notes: 'Subsidiary of Toyota Group handling all IT infrastructure. Nagoya-based positions.',
    lastContactDate: '2026-06-30',
  },
  {
    id: 'c4',
    companyName: 'Mitsubishi Trading Co.',
    contactPerson: 'Ito Kenji',
    industry: 'Trading',
    email: 'ito@mitsubishi-trading.co.jp',
    phone: '+81-3-3456-7890',
    address: '3-1 Marunouchi Chiyoda Tokyo',
    website: 'mitsubishitrading.com',
    notes: 'Large trading conglomerate. Focus on supply chain digitalization.',
    lastContactDate: '2026-06-14',
  },
  {
    id: 'c5',
    companyName: 'SoftBank Robotics',
    contactPerson: 'Kobayashi Mai',
    industry: 'Technology',
    email: 'kobayashi@softbankrobotics.com',
    phone: '+81-3-4567-8901',
    address: '1-9-1 Higashi-Shimbashi Minato Tokyo',
    website: 'softbank-robotics.com',
    notes: 'Robotics and AI division of SoftBank. Looking for high-caliber AI and product talent.',
    lastContactDate: '2026-07-01',
  },
]

// ─── Jobs ──────────────────────────────────────────────────────────────────────
export const jobs: Job[] = [
  // Nexus Systems (c1) – 4 jobs
  {
    id: 'j1',
    clientId: 'c1',
    title: 'Senior Java Engineer',
    employmentType: 'Full-time',
    location: 'Tokyo',
    salaryMin: 8000000,
    salaryMax: 12000000,
    status: 'active',
    closingDate: '2026-08-01',
    requiredSkills: ['Java', 'Spring Boot', 'PostgreSQL'],
    experienceYears: 5,
    japaneseLevel: 'N2',
    englishLevel: 'Business English',
    notes: 'Core backend role for the new microservices platform.',
  },
  {
    id: 'j2',
    clientId: 'c1',
    title: 'DevOps Engineer',
    employmentType: 'Full-time',
    location: 'Tokyo',
    salaryMin: 7000000,
    salaryMax: 10000000,
    status: 'active',
    closingDate: '2026-07-15',
    requiredSkills: ['Docker', 'Kubernetes', 'Terraform', 'AWS'],
    experienceYears: 4,
    japaneseLevel: 'N2',
    englishLevel: 'Business English',
    notes: 'Urgent hire to support cloud migration project.',
  },
  {
    id: 'j3',
    clientId: 'c1',
    title: 'Project Manager',
    employmentType: 'Contract',
    location: 'Tokyo',
    salaryMin: 6000000,
    salaryMax: 9000000,
    status: 'on-hold',
    closingDate: '2026-09-01',
    requiredSkills: ['PMP', 'Agile', 'JIRA', 'Scrum'],
    experienceYears: 7,
    japaneseLevel: 'N2',
    englishLevel: 'Business English',
    notes: 'On hold pending budget approval from HQ.',
  },
  {
    id: 'j4',
    clientId: 'c1',
    title: 'Data Engineer',
    employmentType: 'Full-time',
    location: 'Tokyo',
    salaryMin: 8000000,
    salaryMax: 11000000,
    status: 'active',
    closingDate: '2026-08-15',
    requiredSkills: ['Python', 'Spark', 'Airflow', 'dbt'],
    experienceYears: 5,
    japaneseLevel: 'N1',
    englishLevel: 'Fluent English',
    notes: 'Building new data lake infrastructure.',
  },
  // Atlas Fintech (c2) – 3 jobs
  {
    id: 'j5',
    clientId: 'c2',
    title: 'Finance Analyst',
    employmentType: 'Full-time',
    location: 'Tokyo',
    salaryMin: 6000000,
    salaryMax: 9000000,
    status: 'active',
    closingDate: '2026-07-31',
    requiredSkills: ['Excel', 'Bloomberg', 'SAP', 'VBA'],
    experienceYears: 4,
    japaneseLevel: 'N2',
    englishLevel: 'Business English',
    notes: 'Supporting FX and derivatives desk.',
  },
  {
    id: 'j6',
    clientId: 'c2',
    title: 'Risk Manager',
    employmentType: 'Full-time',
    location: 'Tokyo',
    salaryMin: 9000000,
    salaryMax: 13000000,
    status: 'active',
    closingDate: '2026-08-20',
    requiredSkills: ['Risk', 'VaR', 'Basel III', 'Credit Risk'],
    experienceYears: 7,
    japaneseLevel: 'N1',
    englishLevel: 'Fluent English',
    notes: 'Senior role overseeing credit and market risk.',
  },
  {
    id: 'j7',
    clientId: 'c2',
    title: 'Software Engineer',
    employmentType: 'Full-time',
    location: 'Tokyo',
    salaryMin: 7000000,
    salaryMax: 10000000,
    status: 'closed',
    closingDate: '2026-05-31',
    requiredSkills: ['React', 'Node.js', 'Python', 'Java'],
    experienceYears: 5,
    japaneseLevel: 'N2',
    englishLevel: 'Business English',
    notes: 'Position filled. 3 candidates placed.',
  },
  // Toyota IT Systems (c3) – 4 jobs
  {
    id: 'j8',
    clientId: 'c3',
    title: 'Cloud Infra Engineer',
    employmentType: 'Full-time',
    location: 'Nagoya',
    salaryMin: 8000000,
    salaryMax: 12000000,
    status: 'active',
    closingDate: '2026-07-20',
    requiredSkills: ['AWS', 'GCP', 'Terraform', 'Linux'],
    experienceYears: 5,
    japaneseLevel: 'N2',
    englishLevel: 'Business English',
    notes: 'Supporting Toyota cloud transformation initiative.',
  },
  {
    id: 'j9',
    clientId: 'c3',
    title: 'Systems Architect',
    employmentType: 'Full-time',
    location: 'Nagoya',
    salaryMin: 12000000,
    salaryMax: 16000000,
    status: 'active',
    closingDate: '2026-08-01',
    requiredSkills: ['Architecture', 'Cloud', 'Microservices'],
    experienceYears: 10,
    japaneseLevel: 'N1',
    englishLevel: 'Fluent English',
    notes: 'Senior architect to lead next-gen manufacturing platform.',
  },
  {
    id: 'j10',
    clientId: 'c3',
    title: 'Embedded Engineer',
    employmentType: 'Full-time',
    location: 'Nagoya',
    salaryMin: 7000000,
    salaryMax: 10000000,
    status: 'active',
    closingDate: '2026-09-01',
    requiredSkills: ['C++', 'RTOS', 'CAN', 'Linux'],
    experienceYears: 6,
    japaneseLevel: 'N2',
    englishLevel: 'Business English',
    notes: 'Automotive embedded systems role.',
  },
  {
    id: 'j11',
    clientId: 'c3',
    title: 'Security Analyst',
    employmentType: 'Full-time',
    location: 'Nagoya',
    salaryMin: 8000000,
    salaryMax: 11000000,
    status: 'on-hold',
    closingDate: '2026-10-01',
    requiredSkills: ['CISSP', 'Penetration Testing', 'SIEM'],
    experienceYears: 5,
    japaneseLevel: 'N2',
    englishLevel: 'Business English',
    notes: 'On hold pending internal security audit completion.',
  },
  // Mitsubishi Trading (c4) – 2 jobs
  {
    id: 'j12',
    clientId: 'c4',
    title: 'Business Analyst',
    employmentType: 'Full-time',
    location: 'Tokyo',
    salaryMin: 6000000,
    salaryMax: 8000000,
    status: 'active',
    closingDate: '2026-07-30',
    requiredSkills: ['SQL', 'Tableau', 'Requirements', 'Agile'],
    experienceYears: 4,
    japaneseLevel: 'N2',
    englishLevel: 'Business English',
    notes: 'Supporting ERP migration project.',
  },
  {
    id: 'j13',
    clientId: 'c4',
    title: 'Supply Chain Manager',
    employmentType: 'Full-time',
    location: 'Tokyo',
    salaryMin: 8000000,
    salaryMax: 11000000,
    status: 'on-hold',
    closingDate: '2026-09-15',
    requiredSkills: ['SCM', 'ERP', 'SAP', 'Logistics'],
    experienceYears: 8,
    japaneseLevel: 'N1',
    englishLevel: 'Fluent English',
    notes: 'On hold while restructuring logistics division.',
  },
  // SoftBank Robotics (c5) – 3 jobs
  {
    id: 'j14',
    clientId: 'c5',
    title: 'UX Designer',
    employmentType: 'Full-time',
    location: 'Tokyo',
    salaryMin: 6000000,
    salaryMax: 9000000,
    status: 'active',
    closingDate: '2026-08-10',
    requiredSkills: ['Figma', 'Sketch', 'Research', 'Prototyping'],
    experienceYears: 4,
    japaneseLevel: 'N2',
    englishLevel: 'Business English',
    notes: 'Designing interfaces for Pepper robot companion app.',
  },
  {
    id: 'j15',
    clientId: 'c5',
    title: 'AI Engineer',
    employmentType: 'Full-time',
    location: 'Tokyo',
    salaryMin: 10000000,
    salaryMax: 15000000,
    status: 'active',
    closingDate: '2026-08-31',
    requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps'],
    experienceYears: 5,
    japaneseLevel: 'N1',
    englishLevel: 'Fluent English',
    notes: 'Building perception and decision-making models for robotics.',
  },
  {
    id: 'j16',
    clientId: 'c5',
    title: 'Product Manager',
    employmentType: 'Full-time',
    location: 'Tokyo',
    salaryMin: 8000000,
    salaryMax: 12000000,
    status: 'active',
    closingDate: '2026-08-20',
    requiredSkills: ['Product', 'Roadmap', 'Agile', 'Analytics'],
    experienceYears: 6,
    japaneseLevel: 'N2',
    englishLevel: 'Business English',
    notes: 'Leading the next-gen robotics product roadmap.',
  },
]

// ─── Candidates ────────────────────────────────────────────────────────────────
export const candidates: Candidate[] = [
  // j1 – Senior Java Engineer
  { id: 'cj1-1', jobId: 'j1', name: 'Tanaka Hiroshi', skills: ['Java', 'Spring Boot'], experienceYears: 6, location: 'Osaka', email: 'tanaka.hiroshi@email.com', stage: 'sourced', recruiterId: 'r1', appliedDate: '2026-06-18', lastActivityDate: '2026-06-29', nextReminderDate: '2026-07-05', reminderOverdue: false },
  { id: 'cj1-2', jobId: 'j1', name: 'Park Ji-su', skills: ['Python', 'AWS', 'Kubernetes'], experienceYears: 4, location: 'Busan', email: 'park.jisu@email.com', stage: 'sourced', recruiterId: 'r2', appliedDate: '2026-06-20', lastActivityDate: '2026-06-25', nextReminderDate: '2026-07-03', reminderOverdue: false },
  { id: 'cj1-3', jobId: 'j1', name: 'Kim Jae-won', skills: ['Java', 'N2', 'Spring'], experienceYears: 5, location: 'Seoul', email: 'kim.jaewon@email.com', stage: 'screening', recruiterId: 'r1', appliedDate: '2026-06-08', lastActivityDate: '2026-06-08', nextReminderDate: '2026-06-23', reminderOverdue: true },
  { id: 'cj1-4', jobId: 'j1', name: 'Aung Aung', skills: ['Java', 'N1', 'Microservices'], experienceYears: 7, location: 'Yangon', email: 'aung.aung@email.com', stage: 'interview', recruiterId: 'r2', appliedDate: '2026-06-12', lastActivityDate: '2026-06-30', nextReminderDate: '2026-07-02', reminderOverdue: false },
  { id: 'cj1-5', jobId: 'j1', name: 'Chen Li', skills: ['Java', 'Spring Boot', 'N2'], experienceYears: 8, location: 'Shanghai', email: 'chen.li@email.com', stage: 'placed', recruiterId: 'r1', appliedDate: '2026-05-01', lastActivityDate: '2026-06-10', nextReminderDate: null, reminderOverdue: false },
  { id: 'cj1-6', jobId: 'j1', name: 'Yamamoto Ken', skills: ['Spring Boot', 'MySQL'], experienceYears: 3, location: 'Tokyo', email: 'yamamoto.ken@email.com', stage: 'rejected', recruiterId: 'r2', appliedDate: '2026-05-15', lastActivityDate: '2026-06-01', nextReminderDate: null, reminderOverdue: false },
  { id: 'cj1-7', jobId: 'j1', name: 'Lee Hyun-ji', skills: ['Kotlin', 'Java', 'Docker'], experienceYears: 4, location: 'Incheon', email: 'lee.hyunji@email.com', stage: 'sourced', recruiterId: 'r1', appliedDate: '2026-06-21', lastActivityDate: '2026-06-27', nextReminderDate: '2026-07-04', reminderOverdue: false },

  // j2 – DevOps Engineer
  { id: 'cj2-1', jobId: 'j2', name: 'Sarah Johnson', skills: ['Docker', 'Kubernetes'], experienceYears: 5, location: 'London', email: 'sarah.johnson@email.com', stage: 'sourced', recruiterId: 'r2', appliedDate: '2026-06-22', lastActivityDate: '2026-06-28', nextReminderDate: '2026-07-05', reminderOverdue: false },
  { id: 'cj2-2', jobId: 'j2', name: 'Kyaw Zin', skills: ['Jenkins', 'AWS', 'Bash'], experienceYears: 4, location: 'Yangon', email: 'kyaw.zin@email.com', stage: 'screening', recruiterId: 'r1', appliedDate: '2026-06-10', lastActivityDate: '2026-06-20', nextReminderDate: '2026-06-28', reminderOverdue: false },
  { id: 'cj2-3', jobId: 'j2', name: 'Watanabe Jun', skills: ['Terraform', 'GCP', 'Linux'], experienceYears: 6, location: 'Kyoto', email: 'watanabe.jun@email.com', stage: 'interview', recruiterId: 'r2', appliedDate: '2026-06-14', lastActivityDate: '2026-06-29', nextReminderDate: '2026-07-03', reminderOverdue: false },
  { id: 'cj2-4', jobId: 'j2', name: 'Oh Joon-seo', skills: ['Docker', 'CI/CD', 'Jenkins'], experienceYears: 3, location: 'Busan', email: 'oh.joon@email.com', stage: 'interview', recruiterId: 'r1', appliedDate: '2026-06-15', lastActivityDate: '2026-06-20', nextReminderDate: '2026-07-01', reminderOverdue: false },
  { id: 'cj2-5', jobId: 'j2', name: 'Emma Wilson', skills: ['Kubernetes', 'Linux', 'AWS'], experienceYears: 8, location: 'Sydney', email: 'emma.wilson@email.com', stage: 'offered', recruiterId: 'r2', appliedDate: '2026-05-20', lastActivityDate: '2026-06-30', nextReminderDate: '2026-07-10', reminderOverdue: false },
  { id: 'cj2-6', jobId: 'j2', name: 'Liu Yang', skills: ['AWS', 'Bash', 'Python'], experienceYears: 2, location: 'Beijing', email: 'liu.yang@email.com', stage: 'rejected', recruiterId: 'r1', appliedDate: '2026-05-10', lastActivityDate: '2026-05-20', nextReminderDate: null, reminderOverdue: false },

  // j3 – Project Manager
  { id: 'cj3-1', jobId: 'j3', name: 'Ma Nwe', skills: ['Scrum', 'JIRA', 'Agile'], experienceYears: 5, location: 'Yangon', email: 'ma.nwe@email.com', stage: 'sourced', recruiterId: 'r3', appliedDate: '2026-06-20', lastActivityDate: '2026-06-24', nextReminderDate: '2026-07-03', reminderOverdue: false },
  { id: 'cj3-2', jobId: 'j3', name: 'Chris Lee', skills: ['PMP', 'Waterfall', 'Stakeholder'], experienceYears: 10, location: 'Singapore', email: 'chris.lee@email.com', stage: 'interview', recruiterId: 'r3', appliedDate: '2026-06-05', lastActivityDate: '2026-07-01', nextReminderDate: '2026-07-08', reminderOverdue: false },
  { id: 'cj3-3', jobId: 'j3', name: 'Su Su Htet', skills: ['Agile', 'Scrum', 'JIRA'], experienceYears: 4, location: 'Mandalay', email: 'susu.htet@email.com', stage: 'sourced', recruiterId: 'r2', appliedDate: '2026-06-22', lastActivityDate: '2026-06-26', nextReminderDate: '2026-07-05', reminderOverdue: false },
  { id: 'cj3-4', jobId: 'j3', name: 'Alex Brown', skills: ['PMP', 'Prince2'], experienceYears: 6, location: 'Melbourne', email: 'alex.brown@email.com', stage: 'rejected', recruiterId: 'r3', appliedDate: '2026-05-01', lastActivityDate: '2026-06-01', nextReminderDate: null, reminderOverdue: false },
  { id: 'cj3-5', jobId: 'j3', name: 'Nakamura Rio', skills: ['Agile', 'Scrum', 'Excel'], experienceYears: 7, location: 'Osaka', email: 'nakamura.rio@email.com', stage: 'screening', recruiterId: 'r1', appliedDate: '2026-06-12', lastActivityDate: '2026-06-18', nextReminderDate: '2026-06-30', reminderOverdue: false },

  // j4 – Data Engineer
  { id: 'cj4-1', jobId: 'j4', name: 'Zhang Wei', skills: ['Python', 'Spark', 'Kafka'], experienceYears: 5, location: 'Shanghai', email: 'zhang.wei@email.com', stage: 'sourced', recruiterId: 'r2', appliedDate: '2026-06-24', lastActivityDate: '2026-06-30', nextReminderDate: '2026-07-07', reminderOverdue: false },
  { id: 'cj4-2', jobId: 'j4', name: 'Kobayashi Mei', skills: ['dbt', 'SQL', 'Airflow'], experienceYears: 4, location: 'Tokyo', email: 'kobayashi.mei@email.com', stage: 'screening', recruiterId: 'r1', appliedDate: '2026-06-14', lastActivityDate: '2026-06-22', nextReminderDate: '2026-07-01', reminderOverdue: false },
  { id: 'cj4-3', jobId: 'j4', name: 'James Miller', skills: ['Kafka', 'Airflow', 'Python'], experienceYears: 7, location: 'San Francisco', email: 'james.miller@email.com', stage: 'interview', recruiterId: 'r2', appliedDate: '2026-06-10', lastActivityDate: '2026-06-28', nextReminderDate: '2026-07-04', reminderOverdue: false },
  { id: 'cj4-4', jobId: 'j4', name: 'Han So-yeon', skills: ['Python', 'ETL', 'SQL'], experienceYears: 3, location: 'Seoul', email: 'han.soyeon@email.com', stage: 'sourced', recruiterId: 'r3', appliedDate: '2026-06-25', lastActivityDate: '2026-06-29', nextReminderDate: '2026-07-06', reminderOverdue: false },
  { id: 'cj4-5', jobId: 'j4', name: 'Min Thu', skills: ['Spark', 'Hadoop', 'Hive'], experienceYears: 6, location: 'Yangon', email: 'min.thu@email.com', stage: 'offered', recruiterId: 'r1', appliedDate: '2026-06-01', lastActivityDate: '2026-06-29', nextReminderDate: '2026-07-08', reminderOverdue: false },
  { id: 'cj4-6', jobId: 'j4', name: 'Gao Rui', skills: ['SQL', 'MySQL', 'Hive'], experienceYears: 2, location: 'Beijing', email: 'gao.rui@email.com', stage: 'rejected', recruiterId: 'r2', appliedDate: '2026-05-10', lastActivityDate: '2026-06-05', nextReminderDate: null, reminderOverdue: false },

  // j5 – Finance Analyst
  { id: 'cj5-1', jobId: 'j5', name: 'Sato Yuki', skills: ['Excel', 'SAP', 'PowerBI'], experienceYears: 4, location: 'Tokyo', email: 'sato.yuki@email.com', stage: 'sourced', recruiterId: 'r3', appliedDate: '2026-06-23', lastActivityDate: '2026-06-27', nextReminderDate: '2026-07-04', reminderOverdue: false },
  { id: 'cj5-2', jobId: 'j5', name: 'Jung Soo-yeon', skills: ['Bloomberg', 'VBA', 'Excel'], experienceYears: 5, location: 'Seoul', email: 'jung.sooyeon@email.com', stage: 'screening', recruiterId: 'r1', appliedDate: '2026-06-10', lastActivityDate: '2026-06-20', nextReminderDate: '2026-06-30', reminderOverdue: false },
  { id: 'cj5-3', jobId: 'j5', name: 'Tom Anderson', skills: ['Risk', 'Derivatives', 'Bloomberg'], experienceYears: 8, location: 'New York', email: 'tom.anderson@email.com', stage: 'interview', recruiterId: 'r3', appliedDate: '2026-06-05', lastActivityDate: '2026-06-30', nextReminderDate: '2026-07-05', reminderOverdue: false },
  { id: 'cj5-4', jobId: 'j5', name: 'Htet Htet', skills: ['Accounting', 'SAP', 'Excel'], experienceYears: 3, location: 'Yangon', email: 'htet.htet@email.com', stage: 'sourced', recruiterId: 'r2', appliedDate: '2026-06-24', lastActivityDate: '2026-06-28', nextReminderDate: '2026-07-06', reminderOverdue: false },
  { id: 'cj5-5', jobId: 'j5', name: 'Wang Fang', skills: ['Finance', 'Excel', 'SAP'], experienceYears: 6, location: 'Beijing', email: 'wang.fang@email.com', stage: 'offered', recruiterId: 'r1', appliedDate: '2026-05-25', lastActivityDate: '2026-06-28', nextReminderDate: '2026-07-10', reminderOverdue: false },
  { id: 'cj5-6', jobId: 'j5', name: 'Oliver Smith', skills: ['Forex', 'Risk', 'Bloomberg'], experienceYears: 4, location: 'London', email: 'oliver.smith@email.com', stage: 'screening', recruiterId: 'r3', appliedDate: '2026-06-14', lastActivityDate: '2026-06-18', nextReminderDate: '2026-07-01', reminderOverdue: false },
  { id: 'cj5-7', jobId: 'j5', name: 'Ito Keiji', skills: ['SAP', 'Finance', 'Accounting'], experienceYears: 5, location: 'Osaka', email: 'ito.keiji@email.com', stage: 'rejected', recruiterId: 'r2', appliedDate: '2026-05-01', lastActivityDate: '2026-05-15', nextReminderDate: null, reminderOverdue: false },

  // j6 – Risk Manager
  { id: 'cj6-1', jobId: 'j6', name: 'Yoon Tae-joon', skills: ['Risk', 'Compliance', 'Basel III'], experienceYears: 7, location: 'Seoul', email: 'yoon.taejoon@email.com', stage: 'sourced', recruiterId: 'r1', appliedDate: '2026-06-20', lastActivityDate: '2026-06-26', nextReminderDate: '2026-07-03', reminderOverdue: false },
  { id: 'cj6-2', jobId: 'j6', name: 'Maya Patel', skills: ['VaR', 'Basel III', 'Credit'], experienceYears: 6, location: 'Mumbai', email: 'maya.patel@email.com', stage: 'screening', recruiterId: 'r3', appliedDate: '2026-06-08', lastActivityDate: '2026-06-19', nextReminderDate: '2026-06-30', reminderOverdue: false },
  { id: 'cj6-3', jobId: 'j6', name: 'Hayashi Rin', skills: ['Risk', 'Analytics', 'Excel'], experienceYears: 5, location: 'Kobe', email: 'hayashi.rin@email.com', stage: 'interview', recruiterId: 'r2', appliedDate: '2026-06-05', lastActivityDate: '2026-06-29', nextReminderDate: '2026-07-06', reminderOverdue: false },
  { id: 'cj6-4', jobId: 'j6', name: 'Zhou Xuan', skills: ['Credit Risk', 'Market Risk'], experienceYears: 8, location: 'Shanghai', email: 'zhou.xuan@email.com', stage: 'offered', recruiterId: 'r1', appliedDate: '2026-05-20', lastActivityDate: '2026-07-01', nextReminderDate: '2026-07-15', reminderOverdue: false },
  { id: 'cj6-5', jobId: 'j6', name: 'Xu Ming', skills: ['Risk Mgmt', 'Compliance'], experienceYears: 3, location: 'Guangzhou', email: 'xu.ming@email.com', stage: 'sourced', recruiterId: 'r3', appliedDate: '2026-06-22', lastActivityDate: '2026-06-25', nextReminderDate: '2026-07-03', reminderOverdue: false },

  // j7 – Software Engineer (Closed)
  { id: 'cj7-1', jobId: 'j7', name: 'Li Mei', skills: ['Java', 'Python', 'Spring'], experienceYears: 5, location: 'Shanghai', email: 'li.mei@email.com', stage: 'placed', recruiterId: 'r2', appliedDate: '2026-04-01', lastActivityDate: '2026-05-20', nextReminderDate: null, reminderOverdue: false },
  { id: 'cj7-2', jobId: 'j7', name: 'Choi Min-jun', skills: ['React', 'Node.js', 'TypeScript'], experienceYears: 6, location: 'Seoul', email: 'choi.minjun@email.com', stage: 'placed', recruiterId: 'r1', appliedDate: '2026-04-05', lastActivityDate: '2026-05-15', nextReminderDate: null, reminderOverdue: false },
  { id: 'cj7-3', jobId: 'j7', name: 'Zaw Lin', skills: ['PHP', 'MySQL', 'Laravel'], experienceYears: 3, location: 'Yangon', email: 'zaw.lin@email.com', stage: 'rejected', recruiterId: 'r3', appliedDate: '2026-04-10', lastActivityDate: '2026-05-10', nextReminderDate: null, reminderOverdue: false },
  { id: 'cj7-4', jobId: 'j7', name: 'Thida Win', skills: ['Angular', 'Java', 'REST'], experienceYears: 4, location: 'Mandalay', email: 'thida.win@email.com', stage: 'rejected', recruiterId: 'r2', appliedDate: '2026-04-12', lastActivityDate: '2026-05-12', nextReminderDate: null, reminderOverdue: false },
  { id: 'cj7-5', jobId: 'j7', name: 'Wu Jian', skills: ['Full Stack', 'React', 'Python'], experienceYears: 7, location: 'Beijing', email: 'wu.jian@email.com', stage: 'placed', recruiterId: 'r1', appliedDate: '2026-04-15', lastActivityDate: '2026-05-25', nextReminderDate: null, reminderOverdue: false },

  // j8 – Cloud Infra Engineer
  { id: 'cj8-1', jobId: 'j8', name: 'Suzuki Nana', skills: ['AWS', 'Terraform', 'Linux'], experienceYears: 5, location: 'Nagoya', email: 'suzuki.nana@email.com', stage: 'sourced', recruiterId: 'r1', appliedDate: '2026-06-22', lastActivityDate: '2026-06-28', nextReminderDate: '2026-07-05', reminderOverdue: false },
  { id: 'cj8-2', jobId: 'j8', name: 'Kato Tatsuya', skills: ['GCP', 'Kubernetes', 'Docker'], experienceYears: 4, location: 'Toyota', email: 'kato.tatsuya@email.com', stage: 'screening', recruiterId: 'r2', appliedDate: '2026-06-10', lastActivityDate: '2026-06-21', nextReminderDate: '2026-06-30', reminderOverdue: false },
  { id: 'cj8-3', jobId: 'j8', name: 'Yamada Emi', skills: ['AWS', 'Ansible', 'Python'], experienceYears: 6, location: 'Osaka', email: 'yamada.emi@email.com', stage: 'interview', recruiterId: 'r1', appliedDate: '2026-06-05', lastActivityDate: '2026-06-29', nextReminderDate: '2026-07-03', reminderOverdue: false },
  { id: 'cj8-4', jobId: 'j8', name: 'Sun Hao', skills: ['GCP', 'Terraform', 'CI/CD'], experienceYears: 3, location: 'Shanghai', email: 'sun.hao@email.com', stage: 'sourced', recruiterId: 'r3', appliedDate: '2026-06-25', lastActivityDate: '2026-06-29', nextReminderDate: '2026-07-07', reminderOverdue: false },
  { id: 'cj8-5', jobId: 'j8', name: 'Jessica Roberts', skills: ['Azure', 'DevOps', 'Terraform'], experienceYears: 7, location: 'Sydney', email: 'jessica.roberts@email.com', stage: 'interview', recruiterId: 'r2', appliedDate: '2026-06-03', lastActivityDate: '2026-06-27', nextReminderDate: '2026-07-02', reminderOverdue: false },
  { id: 'cj8-6', jobId: 'j8', name: 'David Kim', skills: ['AWS', 'GCP', 'Multi-cloud'], experienceYears: 9, location: 'Vancouver', email: 'david.kim@email.com', stage: 'offered', recruiterId: 'r3', appliedDate: '2026-05-15', lastActivityDate: '2026-06-30', nextReminderDate: '2026-07-10', reminderOverdue: false },
  { id: 'cj8-7', jobId: 'j8', name: 'Ye Myint', skills: ['Linux', 'Bash', 'AWS basics'], experienceYears: 2, location: 'Yangon', email: 'ye.myint@email.com', stage: 'rejected', recruiterId: 'r1', appliedDate: '2026-05-01', lastActivityDate: '2026-05-15', nextReminderDate: null, reminderOverdue: false },

  // j9 – Systems Architect
  { id: 'cj9-1', jobId: 'j9', name: 'Shin Wonho', skills: ['Microservices', 'Java', 'Architecture'], experienceYears: 8, location: 'Seoul', email: 'shin.wonho@email.com', stage: 'sourced', recruiterId: 'r2', appliedDate: '2026-06-20', lastActivityDate: '2026-06-26', nextReminderDate: '2026-07-04', reminderOverdue: false },
  { id: 'cj9-2', jobId: 'j9', name: 'Yoshida Sota', skills: ['Cloud', 'DDD', 'Spring'], experienceYears: 10, location: 'Tokyo', email: 'yoshida.sota@email.com', stage: 'interview', recruiterId: 'r1', appliedDate: '2026-06-01', lastActivityDate: '2026-06-30', nextReminderDate: '2026-07-05', reminderOverdue: false },
  { id: 'cj9-3', jobId: 'j9', name: 'Michael Torres', skills: ['AWS Architecture', 'Serverless'], experienceYears: 12, location: 'Chicago', email: 'michael.torres@email.com', stage: 'sourced', recruiterId: 'r3', appliedDate: '2026-06-22', lastActivityDate: '2026-06-28', nextReminderDate: '2026-07-06', reminderOverdue: false },
  { id: 'cj9-4', jobId: 'j9', name: 'Thi Thanh', skills: ['Microservices', 'Docker', 'Cloud'], experienceYears: 6, location: 'Ho Chi Minh', email: 'thi.thanh@email.com', stage: 'screening', recruiterId: 'r2', appliedDate: '2026-06-08', lastActivityDate: '2026-06-19', nextReminderDate: '2026-06-30', reminderOverdue: false },
  { id: 'cj9-5', jobId: 'j9', name: 'Li Qiang', skills: ['Enterprise Arch', 'Cloud', 'Java'], experienceYears: 11, location: 'Shenzhen', email: 'li.qiang@email.com', stage: 'offered', recruiterId: 'r1', appliedDate: '2026-05-10', lastActivityDate: '2026-06-30', nextReminderDate: '2026-07-12', reminderOverdue: false },

  // j10 – Embedded Engineer
  { id: 'cj10-1', jobId: 'j10', name: 'Kimura Takeshi', skills: ['C++', 'RTOS', 'CAN'], experienceYears: 6, location: 'Nagoya', email: 'kimura.takeshi@email.com', stage: 'sourced', recruiterId: 'r3', appliedDate: '2026-06-23', lastActivityDate: '2026-06-27', nextReminderDate: '2026-07-05', reminderOverdue: false },
  { id: 'cj10-2', jobId: 'j10', name: 'Jang Hyun', skills: ['C', 'Embedded Linux', 'AUTOSAR'], experienceYears: 5, location: 'Daejeon', email: 'jang.hyun@email.com', stage: 'screening', recruiterId: 'r1', appliedDate: '2026-06-10', lastActivityDate: '2026-06-18', nextReminderDate: '2026-06-30', reminderOverdue: false },
  { id: 'cj10-3', jobId: 'j10', name: 'Nyi Nyi', skills: ['C++', 'FreeRTOS', 'ARM'], experienceYears: 4, location: 'Yangon', email: 'nyi.nyi@email.com', stage: 'interview', recruiterId: 'r2', appliedDate: '2026-06-05', lastActivityDate: '2026-06-28', nextReminderDate: '2026-07-03', reminderOverdue: false },
  { id: 'cj10-4', jobId: 'j10', name: 'Zhao Shen', skills: ['C', 'Microcontrollers', 'Linux'], experienceYears: 3, location: 'Chengdu', email: 'zhao.shen@email.com', stage: 'sourced', recruiterId: 'r3', appliedDate: '2026-06-24', lastActivityDate: '2026-06-29', nextReminderDate: '2026-07-07', reminderOverdue: false },
  { id: 'cj10-5', jobId: 'j10', name: 'Laura Hansen', skills: ['C++', 'RTOS', 'CAN/LIN'], experienceYears: 8, location: 'Stuttgart', email: 'laura.hansen@email.com', stage: 'offered', recruiterId: 'r1', appliedDate: '2026-05-20', lastActivityDate: '2026-06-29', nextReminderDate: '2026-07-15', reminderOverdue: false },

  // j11 – Security Analyst
  { id: 'cj11-1', jobId: 'j11', name: 'Inoue Masato', skills: ['CISSP', 'Penetration Testing', 'SIEM'], experienceYears: 5, location: 'Tokyo', email: 'inoue.masato@email.com', stage: 'sourced', recruiterId: 'r2', appliedDate: '2026-06-15', lastActivityDate: '2026-06-20', nextReminderDate: '2026-07-01', reminderOverdue: false },
  { id: 'cj11-2', jobId: 'j11', name: 'Kwon Dongwoo', skills: ['SOC', 'SIEM', 'Incident Response'], experienceYears: 4, location: 'Seoul', email: 'kwon.dongwoo@email.com', stage: 'screening', recruiterId: 'r1', appliedDate: '2026-06-05', lastActivityDate: '2026-06-17', nextReminderDate: '2026-06-28', reminderOverdue: false },
  { id: 'cj11-3', jobId: 'j11', name: 'Wai Phyo', skills: ['Security', 'Networking', 'Linux'], experienceYears: 3, location: 'Yangon', email: 'wai.phyo@email.com', stage: 'sourced', recruiterId: 'r3', appliedDate: '2026-06-18', lastActivityDate: '2026-06-25', nextReminderDate: '2026-07-05', reminderOverdue: false },
  { id: 'cj11-4', jobId: 'j11', name: 'Huang Ning', skills: ['CISSP', 'Cloud Security', 'AWS'], experienceYears: 7, location: 'Chongqing', email: 'huang.ning@email.com', stage: 'interview', recruiterId: 'r2', appliedDate: '2026-05-25', lastActivityDate: '2026-06-30', nextReminderDate: '2026-07-08', reminderOverdue: false },
  { id: 'cj11-5', jobId: 'j11', name: "Ryan O'Brien", skills: ['Ethical Hacking', 'OSCP', 'SIEM'], experienceYears: 6, location: 'Dublin', email: 'ryan.obrien@email.com', stage: 'sourced', recruiterId: 'r1', appliedDate: '2026-06-20', lastActivityDate: '2026-06-28', nextReminderDate: '2026-07-05', reminderOverdue: false },

  // j12 – Business Analyst
  { id: 'cj12-1', jobId: 'j12', name: 'Matsumoto Akira', skills: ['SQL', 'Tableau', 'Requirements'], experienceYears: 4, location: 'Tokyo', email: 'matsumoto.akira@email.com', stage: 'sourced', recruiterId: 'r3', appliedDate: '2026-06-22', lastActivityDate: '2026-06-26', nextReminderDate: '2026-07-04', reminderOverdue: false },
  { id: 'cj12-2', jobId: 'j12', name: 'Lim Sunhee', skills: ['Agile', 'JIRA', 'UML'], experienceYears: 5, location: 'Seoul', email: 'lim.sunhee@email.com', stage: 'screening', recruiterId: 'r1', appliedDate: '2026-06-10', lastActivityDate: '2026-06-20', nextReminderDate: '2026-06-30', reminderOverdue: false },
  { id: 'cj12-3', jobId: 'j12', name: 'Khant Myat', skills: ['SQL', 'Power BI', 'Stakeholder'], experienceYears: 4, location: 'Yangon', email: 'khant.myat@email.com', stage: 'interview', recruiterId: 'r2', appliedDate: '2026-06-05', lastActivityDate: '2026-06-28', nextReminderDate: '2026-07-05', reminderOverdue: false },
  { id: 'cj12-4', jobId: 'j12', name: 'Chen Yang', skills: ['Business Analysis', 'Tableau', 'SQL'], experienceYears: 7, location: 'Guangzhou', email: 'chen.yang@email.com', stage: 'offered', recruiterId: 'r3', appliedDate: '2026-05-15', lastActivityDate: '2026-06-29', nextReminderDate: '2026-07-10', reminderOverdue: false },
  { id: 'cj12-5', jobId: 'j12', name: 'Sophia Nguyen', skills: ['Excel', 'Visio', 'Requirements'], experienceYears: 3, location: 'Melbourne', email: 'sophia.nguyen@email.com', stage: 'sourced', recruiterId: 'r1', appliedDate: '2026-06-24', lastActivityDate: '2026-06-30', nextReminderDate: '2026-07-07', reminderOverdue: false },

  // j13 – Supply Chain Manager
  { id: 'cj13-1', jobId: 'j13', name: 'Nishimura Kenji', skills: ['SCM', 'ERP', 'SAP'], experienceYears: 8, location: 'Osaka', email: 'nishimura.kenji@email.com', stage: 'sourced', recruiterId: 'r2', appliedDate: '2026-06-18', lastActivityDate: '2026-06-23', nextReminderDate: '2026-07-01', reminderOverdue: false },
  { id: 'cj13-2', jobId: 'j13', name: 'Hong Gimin', skills: ['Logistics', 'SAP', 'Procurement'], experienceYears: 6, location: 'Busan', email: 'hong.gimin@email.com', stage: 'screening', recruiterId: 'r3', appliedDate: '2026-06-05', lastActivityDate: '2026-06-17', nextReminderDate: '2026-06-28', reminderOverdue: false },
  { id: 'cj13-3', jobId: 'j13', name: 'Tin Maung', skills: ['Supply Chain', 'Excel', 'SAP basics'], experienceYears: 4, location: 'Yangon', email: 'tin.maung@email.com', stage: 'sourced', recruiterId: 'r1', appliedDate: '2026-06-20', lastActivityDate: '2026-06-25', nextReminderDate: '2026-07-03', reminderOverdue: false },
  { id: 'cj13-4', jobId: 'j13', name: 'Yang Lin', skills: ['SCM', 'SAP', 'Inventory'], experienceYears: 9, location: 'Beijing', email: 'yang.lin@email.com', stage: 'interview', recruiterId: 'r2', appliedDate: '2026-05-20', lastActivityDate: '2026-06-28', nextReminderDate: '2026-07-06', reminderOverdue: false },
  { id: 'cj13-5', jobId: 'j13', name: 'Nathan Fischer', skills: ['Logistics', 'Excel', '3PL'], experienceYears: 5, location: 'Hamburg', email: 'nathan.fischer@email.com', stage: 'rejected', recruiterId: 'r3', appliedDate: '2026-05-01', lastActivityDate: '2026-06-01', nextReminderDate: null, reminderOverdue: false },

  // j14 – UX Designer
  { id: 'cj14-1', jobId: 'j14', name: 'Fujita Haruki', skills: ['Figma', 'Sketch', 'Research'], experienceYears: 4, location: 'Tokyo', email: 'fujita.haruki@email.com', stage: 'sourced', recruiterId: 'r1', appliedDate: '2026-06-24', lastActivityDate: '2026-06-30', nextReminderDate: '2026-07-07', reminderOverdue: false },
  { id: 'cj14-2', jobId: 'j14', name: 'Ko Yejin', skills: ['Figma', 'Prototype', 'UX Research'], experienceYears: 5, location: 'Seoul', email: 'ko.yejin@email.com', stage: 'screening', recruiterId: 'r2', appliedDate: '2026-06-12', lastActivityDate: '2026-06-21', nextReminderDate: '2026-06-30', reminderOverdue: false },
  { id: 'cj14-3', jobId: 'j14', name: 'Ei Ei Mon', skills: ['Adobe XD', 'Figma', 'Usability'], experienceYears: 4, location: 'Yangon', email: 'ei.ei.mon@email.com', stage: 'interview', recruiterId: 'r3', appliedDate: '2026-06-06', lastActivityDate: '2026-06-29', nextReminderDate: '2026-07-05', reminderOverdue: false },
  { id: 'cj14-4', jobId: 'j14', name: 'Lin Tao', skills: ['UI Design', 'Figma', 'CSS'], experienceYears: 3, location: 'Chengdu', email: 'lin.tao@email.com', stage: 'sourced', recruiterId: 'r1', appliedDate: '2026-06-25', lastActivityDate: '2026-06-30', nextReminderDate: '2026-07-08', reminderOverdue: false },
  { id: 'cj14-5', jobId: 'j14', name: 'Chloe Vanderbilt', skills: ['UX Strategy', 'Figma', 'Research'], experienceYears: 7, location: 'Paris', email: 'chloe.vanderbilt@email.com', stage: 'offered', recruiterId: 'r2', appliedDate: '2026-05-20', lastActivityDate: '2026-06-28', nextReminderDate: '2026-07-12', reminderOverdue: false },
  { id: 'cj14-6', jobId: 'j14', name: 'Brandon Moss', skills: ['Photoshop', 'UI basics'], experienceYears: 2, location: 'Toronto', email: 'brandon.moss@email.com', stage: 'rejected', recruiterId: 'r3', appliedDate: '2026-05-05', lastActivityDate: '2026-05-20', nextReminderDate: null, reminderOverdue: false },

  // j15 – AI Engineer
  { id: 'cj15-1', jobId: 'j15', name: 'Okamoto Yuki', skills: ['Python', 'TensorFlow', 'MLOps'], experienceYears: 5, location: 'Tokyo', email: 'okamoto.yuki@email.com', stage: 'sourced', recruiterId: 'r3', appliedDate: '2026-06-22', lastActivityDate: '2026-06-28', nextReminderDate: '2026-07-05', reminderOverdue: false },
  { id: 'cj15-2', jobId: 'j15', name: 'Nam Seonghun', skills: ['PyTorch', 'Deep Learning', 'Python'], experienceYears: 4, location: 'Daejeon', email: 'nam.seonghun@email.com', stage: 'screening', recruiterId: 'r1', appliedDate: '2026-06-10', lastActivityDate: '2026-06-22', nextReminderDate: '2026-06-30', reminderOverdue: false },
  { id: 'cj15-3', jobId: 'j15', name: 'Myo Kyaw', skills: ['Python', 'ML', 'NLP'], experienceYears: 4, location: 'Yangon', email: 'myo.kyaw@email.com', stage: 'interview', recruiterId: 'r2', appliedDate: '2026-06-05', lastActivityDate: '2026-06-29', nextReminderDate: '2026-07-04', reminderOverdue: false },
  { id: 'cj15-4', jobId: 'j15', name: 'He Xin', skills: ['TensorFlow', 'Computer Vision', 'Python'], experienceYears: 3, location: 'Wuhan', email: 'he.xin@email.com', stage: 'sourced', recruiterId: 'r3', appliedDate: '2026-06-25', lastActivityDate: '2026-06-30', nextReminderDate: '2026-07-08', reminderOverdue: false },
  { id: 'cj15-5', jobId: 'j15', name: 'Isabella Costa', skills: ['MLOps', 'PyTorch', 'LLM'], experienceYears: 6, location: 'Sao Paulo', email: 'isabella.costa@email.com', stage: 'offered', recruiterId: 'r1', appliedDate: '2026-05-15', lastActivityDate: '2026-06-30', nextReminderDate: '2026-07-15', reminderOverdue: false },
  { id: 'cj15-6', jobId: 'j15', name: 'Ethan Gray', skills: ['Python', 'AI', 'Research'], experienceYears: 5, location: 'London', email: 'ethan.gray@email.com', stage: 'interview', recruiterId: 'r2', appliedDate: '2026-06-02', lastActivityDate: '2026-06-25', nextReminderDate: '2026-07-02', reminderOverdue: false },

  // j16 – Product Manager
  { id: 'cj16-1', jobId: 'j16', name: 'Goto Shota', skills: ['Product', 'Roadmap', 'Agile'], experienceYears: 6, location: 'Tokyo', email: 'goto.shota@email.com', stage: 'sourced', recruiterId: 'r2', appliedDate: '2026-06-23', lastActivityDate: '2026-06-27', nextReminderDate: '2026-07-04', reminderOverdue: false },
  { id: 'cj16-2', jobId: 'j16', name: 'Bae Eunji', skills: ['Analytics', 'JIRA', 'Stakeholder'], experienceYears: 5, location: 'Seoul', email: 'bae.eunji@email.com', stage: 'screening', recruiterId: 'r1', appliedDate: '2026-06-10', lastActivityDate: '2026-06-21', nextReminderDate: '2026-06-30', reminderOverdue: false },
  { id: 'cj16-3', jobId: 'j16', name: 'Chan Mya', skills: ['Product', 'UX', 'Analytics'], experienceYears: 4, location: 'Yangon', email: 'chan.mya@email.com', stage: 'interview', recruiterId: 'r3', appliedDate: '2026-06-06', lastActivityDate: '2026-06-28', nextReminderDate: '2026-07-04', reminderOverdue: false },
  { id: 'cj16-4', jobId: 'j16', name: 'Lu Sheng', skills: ['Product Strategy', 'B2B', 'SaaS'], experienceYears: 8, location: 'Hangzhou', email: 'lu.sheng@email.com', stage: 'offered', recruiterId: 'r2', appliedDate: '2026-05-20', lastActivityDate: '2026-06-30', nextReminderDate: '2026-07-12', reminderOverdue: false },
  { id: 'cj16-5', jobId: 'j16', name: 'Mia Beaumont', skills: ['Product', 'Design Thinking', 'Agile'], experienceYears: 4, location: 'Toronto', email: 'mia.beaumont@email.com', stage: 'sourced', recruiterId: 'r1', appliedDate: '2026-06-24', lastActivityDate: '2026-06-29', nextReminderDate: '2026-07-06', reminderOverdue: false },
]

// ─── Activity Logs ──────────────────────────────────────────────────────────────
export const activityLogs: ActivityLog[] = [
  // Client activity logs
  { id: 'al-c1-1', targetId: 'c1', type: 'Meeting', summary: 'Quarterly review meeting with Yamamoto-san. Discussed pipeline progress for j1 and j2. Client satisfied with candidate quality.', nextAction: 'Send shortlist for Senior Java Engineer by Jul 3', author: 'Y. Tanaka', date: '2026-06-28' },
  { id: 'al-c1-2', targetId: 'c1', type: 'Email', summary: 'Sent updated CVs for DevOps candidates. Watanabe Jun and Emma Wilson confirmed for final interview.', nextAction: 'Follow up on interview feedback by Jun 30', author: 'J. Park', date: '2026-06-20' },
  { id: 'al-c1-3', targetId: 'c1', type: 'Call', summary: 'Call with HR re: Data Engineer role expansion. They may add another headcount for dbt specialist.', nextAction: 'Confirm additional headcount by Jul 5', author: 'H. Yamamoto', date: '2026-06-15' },

  { id: 'al-c2-1', targetId: 'c2', type: 'Meeting', summary: 'Intro meeting with Nakamura-san at Atlas HQ. Discussed risk management team expansion and fintech landscape.', nextAction: 'Send top 3 Risk Manager candidates by Jun 25', author: 'Y. Tanaka', date: '2026-06-22' },
  { id: 'al-c2-2', targetId: 'c2', type: 'Email', summary: 'Provided update on Finance Analyst pipeline. Wang Fang offer extended.', nextAction: 'Confirm offer acceptance by Jul 2', author: 'J. Park', date: '2026-06-18' },
  { id: 'al-c2-3', targetId: 'c2', type: 'Call', summary: 'Checked in on Software Engineer placements. All 3 placed candidates settled in well.', nextAction: 'Schedule 90-day placement review for Jul 15', author: 'H. Yamamoto', date: '2026-06-10' },

  { id: 'al-c3-1', targetId: 'c3', type: 'Meeting', summary: 'Visited Toyota IT office in Nagoya. Met Suzuki-san and the engineering leads. Strong demand for cloud talent.', nextAction: 'Submit Cloud Infra shortlist by Jul 5', author: 'Y. Tanaka', date: '2026-06-30' },
  { id: 'al-c3-2', targetId: 'c3', type: 'Call', summary: 'Quick call re: Systems Architect urgency. They need someone by August.', nextAction: 'Fast-track Li Qiang offer', author: 'J. Park', date: '2026-06-24' },

  { id: 'al-c4-1', targetId: 'c4', type: 'Email', summary: 'Sent Business Analyst pipeline update. Ito-san requested 2 more profiles from Southeast Asia.', nextAction: 'Source 2 additional BA candidates by Jul 7', author: 'H. Yamamoto', date: '2026-06-14' },
  { id: 'al-c4-2', targetId: 'c4', type: 'Call', summary: 'Confirmed Supply Chain Manager is still on hold. Budget freeze extended until August.', nextAction: 'Check back Aug 1 on SCM budget status', author: 'Y. Tanaka', date: '2026-06-10' },

  { id: 'al-c5-1', targetId: 'c5', type: 'Meeting', summary: 'Discovery call with Kobayashi-san. SoftBank Robotics accelerating AI hiring for H2 2026.', nextAction: 'Submit AI Engineer shortlist by Jul 3', author: 'J. Park', date: '2026-07-01' },
  { id: 'al-c5-2', targetId: 'c5', type: 'Email', summary: 'UX Designer search update sent. Chloe Vanderbilt offer discussions underway.', nextAction: 'Confirm offer terms by Jul 5', author: 'H. Yamamoto', date: '2026-06-28' },
  { id: 'al-c5-3', targetId: 'c5', type: 'Chat', summary: 'Kobayashi-san asked about Product Manager timeline. Lu Sheng in final negotiations.', nextAction: 'Get offer letter out by Jul 3', author: 'Y. Tanaka', date: '2026-06-25' },

  // Job activity logs
  { id: 'al-j1-1', targetId: 'j1', type: 'Call', summary: 'Screened Kim Jae-won. Good Java background but needs to demonstrate N2 in written test.', nextAction: 'Schedule N2 proficiency test for Kim', author: 'Y. Tanaka', date: '2026-06-08' },
  { id: 'al-j1-2', targetId: 'j1', type: 'Email', summary: 'Aung Aung interview confirmed for July 2. Client excited about his microservices experience.', nextAction: 'Prep Aung for interview', author: 'J. Park', date: '2026-06-30' },

  { id: 'al-j2-1', targetId: 'j2', type: 'Meeting', summary: 'Emma Wilson final interview went well. Client leaning toward offer.', nextAction: 'Prepare offer details by Jul 1', author: 'J. Park', date: '2026-06-30' },
  { id: 'al-j2-2', targetId: 'j2', type: 'Call', summary: 'Watanabe Jun second interview scheduled for July 3.', nextAction: 'Brief Watanabe on interview format', author: 'H. Yamamoto', date: '2026-06-29' },

  { id: 'al-j5-1', targetId: 'j5', type: 'Email', summary: 'Wang Fang offer letter sent. Salary ¥7.5M agreed. Start date Aug 1.', nextAction: 'Await signed offer letter by Jul 5', author: 'Y. Tanaka', date: '2026-06-28' },
  { id: 'al-j6-1', targetId: 'j6', type: 'Call', summary: 'Zhou Xuan offer accepted verbally. Formal offer being prepared.', nextAction: 'Issue formal offer by Jul 5', author: 'J. Park', date: '2026-07-01' },

  { id: 'al-j8-1', targetId: 'j8', type: 'Meeting', summary: 'David Kim flew in for final interview. Strong technical performance.', nextAction: 'Prepare competitive offer package', author: 'H. Yamamoto', date: '2026-06-30' },
  { id: 'al-j9-1', targetId: 'j9', type: 'Email', summary: 'Li Qiang offer in negotiation. Requesting ¥14.5M base + relocation support.', nextAction: 'Negotiate with client on package by Jul 5', author: 'Y. Tanaka', date: '2026-06-30' },

  { id: 'al-j12-1', targetId: 'j12', type: 'Call', summary: 'Chen Yang offered the BA role at ¥7.2M. Strong match for Mitsubishi ERP project.', nextAction: 'Confirm start date with both parties', author: 'H. Yamamoto', date: '2026-06-29' },
  { id: 'al-j15-1', targetId: 'j15', type: 'Meeting', summary: 'Technical assessment for Myo Kyaw and Ethan Gray completed. Both performed well on NLP tasks.', nextAction: 'Submit assessment results to SoftBank', author: 'J. Park', date: '2026-06-29' },
]

// ─── Lookup helpers ─────────────────────────────────────────────────────────────
export function getClientById(id: string): Client | undefined {
  return clients.find(c => c.id === id)
}

export function getJobById(id: string): Job | undefined {
  return jobs.find(j => j.id === id)
}

export function getJobsByClientId(clientId: string): Job[] {
  return jobs.filter(j => j.clientId === clientId)
}

export function getCandidatesByJobId(jobId: string): Candidate[] {
  return candidates.filter(c => c.jobId === jobId)
}

export function getRecruiterById(id: string): Recruiter | undefined {
  return recruiters.find(r => r.id === id)
}

export function getActivityLogsByTargetId(targetId: string): ActivityLog[] {
  return activityLogs.filter(a => a.targetId === targetId)
}

export function getActiveJobsCount(clientId: string): number {
  return jobs.filter(j => j.clientId === clientId && j.status !== 'closed').length
}
