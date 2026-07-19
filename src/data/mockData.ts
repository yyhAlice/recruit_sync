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

// ─── Jobs (10 total, 2 per client) ─────────────────────────────────────────────
export const jobs: Job[] = [
  // Nexus Systems (c1)
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
  // Atlas Fintech (c2)
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
  // Toyota IT Systems (c3)
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
  // Mitsubishi Trading (c4)
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
  // SoftBank Robotics (c5)
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
]

// ─── Candidates (35 total, 3-4 per job) ────────────────────────────────────────
export const candidates: Candidate[] = [
  // j1 – Senior Java Engineer
  { id: 'cj1-1', jobId: 'j1', name: 'Tanaka Hiroshi',  skills: ['Java', 'Spring Boot'], experienceYears: 6,  location: 'Osaka',    email: 'tanaka.hiroshi@email.com', stage: 'sourced',   recruiterId: 'r1', appliedDate: '2026-06-18', lastActivityDate: '2026-06-29', nextReminderDate: '2026-07-05', reminderOverdue: false, photoUrl: 'https://i.pravatar.cc/150?img=12' },
  { id: 'cj1-3', jobId: 'j1', name: 'Kim Jae-won',     skills: ['Java', 'N2', 'Spring'],  experienceYears: 5,  location: 'Seoul',    email: 'kim.jaewon@email.com',     stage: 'screening', recruiterId: 'r1', appliedDate: '2026-06-08', lastActivityDate: '2026-06-08', nextReminderDate: '2026-06-23', reminderOverdue: true, photoUrl: 'https://i.pravatar.cc/150?img=13' },
  { id: 'cj1-4', jobId: 'j1', name: 'Aung Aung',       skills: ['Java', 'N1', 'Microservices'], experienceYears: 7, location: 'Yangon',  email: 'aung.aung@email.com',      stage: 'interview', recruiterId: 'r2', appliedDate: '2026-06-12', lastActivityDate: '2026-06-30', nextReminderDate: '2026-07-02', reminderOverdue: false, photoUrl: 'https://i.pravatar.cc/150?img=14' },
  { id: 'cj1-5', jobId: 'j1', name: 'Chen Li',         skills: ['Java', 'Spring Boot', 'N2'], experienceYears: 8, location: 'Shanghai', email: 'chen.li@email.com',        stage: 'placed',    recruiterId: 'r1', appliedDate: '2026-05-01', lastActivityDate: '2026-06-10', nextReminderDate: null,         reminderOverdue: false },

  // j2 – DevOps Engineer
  { id: 'cj2-2', jobId: 'j2', name: 'Kyaw Zin',        skills: ['Jenkins', 'AWS', 'Bash'], experienceYears: 4, location: 'Yangon',   email: 'kyaw.zin@email.com',       stage: 'screening', recruiterId: 'r1', appliedDate: '2026-06-10', lastActivityDate: '2026-06-20', nextReminderDate: '2026-06-28', reminderOverdue: false },
  { id: 'cj2-3', jobId: 'j2', name: 'Watanabe Jun',    skills: ['Terraform', 'GCP', 'Linux'], experienceYears: 6, location: 'Kyoto',  email: 'watanabe.jun@email.com',   stage: 'interview', recruiterId: 'r2', appliedDate: '2026-06-14', lastActivityDate: '2026-06-29', nextReminderDate: '2026-07-03', reminderOverdue: false, photoUrl: 'https://i.pravatar.cc/150?img=15' },
  { id: 'cj2-5', jobId: 'j2', name: 'Emma Wilson',     skills: ['Kubernetes', 'Linux', 'AWS'], experienceYears: 8, location: 'Sydney', email: 'emma.wilson@email.com',    stage: 'offered',   recruiterId: 'r2', appliedDate: '2026-05-20', lastActivityDate: '2026-06-30', nextReminderDate: '2026-07-10', reminderOverdue: false, photoUrl: 'https://i.pravatar.cc/150?img=16' },
  { id: 'cj2-6', jobId: 'j2', name: 'Liu Yang',        skills: ['AWS', 'Bash', 'Python'], experienceYears: 2, location: 'Beijing',   email: 'liu.yang@email.com',       stage: 'rejected',  recruiterId: 'r1', appliedDate: '2026-05-10', lastActivityDate: '2026-05-20', nextReminderDate: null,         reminderOverdue: false },

  // j5 – Finance Analyst
  { id: 'cj5-2', jobId: 'j5', name: 'Jung Soo-yeon',   skills: ['Bloomberg', 'VBA', 'Excel'], experienceYears: 5, location: 'Seoul',  email: 'jung.sooyeon@email.com',   stage: 'screening', recruiterId: 'r1', appliedDate: '2026-06-10', lastActivityDate: '2026-06-20', nextReminderDate: '2026-06-30', reminderOverdue: false },
  { id: 'cj5-3', jobId: 'j5', name: 'Tom Anderson',    skills: ['Risk', 'Derivatives', 'Bloomberg'], experienceYears: 8, location: 'New York', email: 'tom.anderson@email.com', stage: 'interview', recruiterId: 'r3', appliedDate: '2026-06-05', lastActivityDate: '2026-06-30', nextReminderDate: '2026-07-05', reminderOverdue: false },
  { id: 'cj5-5', jobId: 'j5', name: 'Wang Fang',       skills: ['Finance', 'Excel', 'SAP'], experienceYears: 6, location: 'Beijing', email: 'wang.fang@email.com',      stage: 'offered',   recruiterId: 'r1', appliedDate: '2026-05-25', lastActivityDate: '2026-06-28', nextReminderDate: '2026-07-10', reminderOverdue: false },

  // j6 – Risk Manager
  { id: 'cj6-2', jobId: 'j6', name: 'Maya Patel',      skills: ['VaR', 'Basel III', 'Credit'], experienceYears: 6, location: 'Mumbai',  email: 'maya.patel@email.com',     stage: 'screening', recruiterId: 'r3', appliedDate: '2026-06-08', lastActivityDate: '2026-06-19', nextReminderDate: '2026-06-30', reminderOverdue: false },
  { id: 'cj6-3', jobId: 'j6', name: 'Hayashi Rin',     skills: ['Risk', 'Analytics', 'Excel'], experienceYears: 5, location: 'Kobe',    email: 'hayashi.rin@email.com',    stage: 'interview', recruiterId: 'r2', appliedDate: '2026-06-05', lastActivityDate: '2026-06-29', nextReminderDate: '2026-07-06', reminderOverdue: false },
  { id: 'cj6-4', jobId: 'j6', name: 'Zhou Xuan',       skills: ['Credit Risk', 'Market Risk'], experienceYears: 8, location: 'Shanghai', email: 'zhou.xuan@email.com',     stage: 'offered',   recruiterId: 'r1', appliedDate: '2026-05-20', lastActivityDate: '2026-07-01', nextReminderDate: '2026-07-15', reminderOverdue: false },

  // j8 – Cloud Infra Engineer
  { id: 'cj8-2', jobId: 'j8', name: 'Kato Tatsuya',    skills: ['GCP', 'Kubernetes', 'Docker'], experienceYears: 4, location: 'Toyota', email: 'kato.tatsuya@email.com',   stage: 'screening', recruiterId: 'r2', appliedDate: '2026-06-10', lastActivityDate: '2026-06-21', nextReminderDate: '2026-06-30', reminderOverdue: false },
  { id: 'cj8-3', jobId: 'j8', name: 'Yamada Emi',      skills: ['AWS', 'Ansible', 'Python'], experienceYears: 6, location: 'Osaka',    email: 'yamada.emi@email.com',     stage: 'interview', recruiterId: 'r1', appliedDate: '2026-06-05', lastActivityDate: '2026-06-29', nextReminderDate: '2026-07-03', reminderOverdue: false },
  { id: 'cj8-6', jobId: 'j8', name: 'David Kim',       skills: ['AWS', 'GCP', 'Multi-cloud'], experienceYears: 9, location: 'Vancouver', email: 'david.kim@email.com',    stage: 'offered',   recruiterId: 'r3', appliedDate: '2026-05-15', lastActivityDate: '2026-06-30', nextReminderDate: '2026-07-10', reminderOverdue: false },
  { id: 'cj8-7', jobId: 'j8', name: 'Ye Myint',        skills: ['Linux', 'Bash', 'AWS basics'], experienceYears: 2, location: 'Yangon', email: 'ye.myint@email.com',       stage: 'rejected',  recruiterId: 'r1', appliedDate: '2026-05-01', lastActivityDate: '2026-05-15', nextReminderDate: null,         reminderOverdue: false },

  // j9 – Systems Architect
  { id: 'cj9-2', jobId: 'j9', name: 'Yoshida Sota',    skills: ['Cloud', 'DDD', 'Spring'], experienceYears: 10, location: 'Tokyo',   email: 'yoshida.sota@email.com',   stage: 'interview', recruiterId: 'r1', appliedDate: '2026-06-01', lastActivityDate: '2026-06-30', nextReminderDate: '2026-07-05', reminderOverdue: false },
  { id: 'cj9-4', jobId: 'j9', name: 'Thi Thanh',       skills: ['Microservices', 'Docker', 'Cloud'], experienceYears: 6, location: 'Ho Chi Minh', email: 'thi.thanh@email.com', stage: 'screening', recruiterId: 'r2', appliedDate: '2026-06-08', lastActivityDate: '2026-06-19', nextReminderDate: '2026-06-30', reminderOverdue: false },
  { id: 'cj9-5', jobId: 'j9', name: 'Li Qiang',        skills: ['Enterprise Arch', 'Cloud', 'Java'], experienceYears: 11, location: 'Shenzhen', email: 'li.qiang@email.com', stage: 'offered',   recruiterId: 'r1', appliedDate: '2026-05-10', lastActivityDate: '2026-06-30', nextReminderDate: '2026-07-12', reminderOverdue: false },

  // j12 – Business Analyst
  { id: 'cj12-2', jobId: 'j12', name: 'Lim Sunhee',    skills: ['Agile', 'JIRA', 'UML'], experienceYears: 5, location: 'Seoul',     email: 'lim.sunhee@email.com',     stage: 'screening', recruiterId: 'r1', appliedDate: '2026-06-10', lastActivityDate: '2026-06-20', nextReminderDate: '2026-06-30', reminderOverdue: false },
  { id: 'cj12-3', jobId: 'j12', name: 'Khant Myat',    skills: ['SQL', 'Power BI', 'Stakeholder'], experienceYears: 4, location: 'Yangon', email: 'khant.myat@email.com', stage: 'interview', recruiterId: 'r2', appliedDate: '2026-06-05', lastActivityDate: '2026-06-28', nextReminderDate: '2026-07-05', reminderOverdue: false },
  { id: 'cj12-4', jobId: 'j12', name: 'Chen Yang',     skills: ['Business Analysis', 'Tableau', 'SQL'], experienceYears: 7, location: 'Guangzhou', email: 'chen.yang@email.com', stage: 'offered', recruiterId: 'r3', appliedDate: '2026-05-15', lastActivityDate: '2026-06-29', nextReminderDate: '2026-07-10', reminderOverdue: false },

  // j13 – Supply Chain Manager
  { id: 'cj13-1', jobId: 'j13', name: 'Nishimura Kenji', skills: ['SCM', 'ERP', 'SAP'], experienceYears: 8, location: 'Osaka',    email: 'nishimura.kenji@email.com', stage: 'sourced',   recruiterId: 'r2', appliedDate: '2026-06-18', lastActivityDate: '2026-06-23', nextReminderDate: '2026-07-01', reminderOverdue: false },
  { id: 'cj13-2', jobId: 'j13', name: 'Hong Gimin',    skills: ['Logistics', 'SAP', 'Procurement'], experienceYears: 6, location: 'Busan',   email: 'hong.gimin@email.com',     stage: 'screening', recruiterId: 'r3', appliedDate: '2026-06-05', lastActivityDate: '2026-06-17', nextReminderDate: '2026-06-28', reminderOverdue: false },
  { id: 'cj13-4', jobId: 'j13', name: 'Yang Lin',      skills: ['SCM', 'SAP', 'Inventory'], experienceYears: 9, location: 'Beijing', email: 'yang.lin@email.com',       stage: 'interview', recruiterId: 'r2', appliedDate: '2026-05-20', lastActivityDate: '2026-06-28', nextReminderDate: '2026-07-06', reminderOverdue: false },

  // j14 – UX Designer
  { id: 'cj14-2', jobId: 'j14', name: 'Ko Yejin',      skills: ['Figma', 'Prototype', 'UX Research'], experienceYears: 5, location: 'Seoul',  email: 'ko.yejin@email.com',       stage: 'screening', recruiterId: 'r2', appliedDate: '2026-06-12', lastActivityDate: '2026-06-21', nextReminderDate: '2026-06-30', reminderOverdue: false },
  { id: 'cj14-3', jobId: 'j14', name: 'Ei Ei Mon',     skills: ['Adobe XD', 'Figma', 'Usability'], experienceYears: 4, location: 'Yangon', email: 'ei.ei.mon@email.com',      stage: 'interview', recruiterId: 'r3', appliedDate: '2026-06-06', lastActivityDate: '2026-06-29', nextReminderDate: '2026-07-05', reminderOverdue: false },
  { id: 'cj14-5', jobId: 'j14', name: 'Chloe Vanderbilt', skills: ['UX Strategy', 'Figma', 'Research'], experienceYears: 7, location: 'Paris', email: 'chloe.vanderbilt@email.com', stage: 'offered', recruiterId: 'r2', appliedDate: '2026-05-20', lastActivityDate: '2026-06-28', nextReminderDate: '2026-07-12', reminderOverdue: false },
  { id: 'cj14-6', jobId: 'j14', name: 'Brandon Moss',  skills: ['Photoshop', 'UI basics'], experienceYears: 2, location: 'Toronto', email: 'brandon.moss@email.com',   stage: 'rejected',  recruiterId: 'r3', appliedDate: '2026-05-05', lastActivityDate: '2026-05-20', nextReminderDate: null,         reminderOverdue: false },

  // j15 – AI Engineer
  { id: 'cj15-2', jobId: 'j15', name: 'Nam Seonghun',  skills: ['PyTorch', 'Deep Learning', 'Python'], experienceYears: 4, location: 'Daejeon', email: 'nam.seonghun@email.com', stage: 'screening', recruiterId: 'r1', appliedDate: '2026-06-10', lastActivityDate: '2026-06-22', nextReminderDate: '2026-06-30', reminderOverdue: false },
  { id: 'cj15-3', jobId: 'j15', name: 'Myo Kyaw',      skills: ['Python', 'ML', 'NLP'], experienceYears: 4, location: 'Yangon',  email: 'myo.kyaw@email.com',       stage: 'interview', recruiterId: 'r2', appliedDate: '2026-06-05', lastActivityDate: '2026-06-29', nextReminderDate: '2026-07-04', reminderOverdue: false },
  { id: 'cj15-5', jobId: 'j15', name: 'Isabella Costa', skills: ['MLOps', 'PyTorch', 'LLM'], experienceYears: 6, location: 'Sao Paulo', email: 'isabella.costa@email.com', stage: 'offered', recruiterId: 'r1', appliedDate: '2026-05-15', lastActivityDate: '2026-06-30', nextReminderDate: '2026-07-15', reminderOverdue: false },
  { id: 'cj15-6', jobId: 'j15', name: 'Ethan Gray',    skills: ['Python', 'AI', 'Research'], experienceYears: 5, location: 'London', email: 'ethan.gray@email.com',     stage: 'interview', recruiterId: 'r2', appliedDate: '2026-06-02', lastActivityDate: '2026-06-25', nextReminderDate: '2026-07-02', reminderOverdue: false },
]

// ─── Activity Logs (12 total) ───────────────────────────────────────────────────
export const activityLogs: ActivityLog[] = [
  // Client logs
  { id: 'al-c1-1', targetId: 'c1', type: 'Meeting', summary: 'Quarterly review with Yamamoto-san. Discussed pipeline for Senior Java and DevOps roles. Client satisfied with candidate quality.', nextAction: 'Send shortlist for Senior Java Engineer by Jul 3', author: 'Y. Tanaka', date: '2026-06-28' },
  { id: 'al-c1-2', targetId: 'c1', type: 'Email',   summary: 'Sent updated CVs for DevOps candidates. Watanabe Jun and Emma Wilson confirmed for final interview.', nextAction: 'Follow up on interview feedback by Jun 30', author: 'J. Park', date: '2026-06-20' },
  { id: 'al-c2-1', targetId: 'c2', type: 'Meeting', summary: 'Intro meeting with Nakamura-san at Atlas HQ. Discussed risk management team expansion and fintech landscape.', nextAction: 'Send top 3 Risk Manager candidates by Jun 25', author: 'Y. Tanaka', date: '2026-06-22' },
  { id: 'al-c2-2', targetId: 'c2', type: 'Email',   summary: 'Provided update on Finance Analyst pipeline. Wang Fang offer extended and under review.', nextAction: 'Confirm offer acceptance by Jul 2', author: 'J. Park', date: '2026-06-18' },
  { id: 'al-c3-1', targetId: 'c3', type: 'Meeting', summary: 'Visited Toyota IT office in Nagoya. Met Suzuki-san and engineering leads. Strong demand for cloud talent.', nextAction: 'Submit Cloud Infra shortlist by Jul 5', author: 'Y. Tanaka', date: '2026-06-30' },
  { id: 'al-c4-1', targetId: 'c4', type: 'Email',   summary: 'Sent Business Analyst pipeline update. Ito-san requested 2 more profiles from Southeast Asia.', nextAction: 'Source 2 additional BA candidates by Jul 7', author: 'H. Yamamoto', date: '2026-06-14' },
  { id: 'al-c5-1', targetId: 'c5', type: 'Meeting', summary: 'Discovery call with Kobayashi-san. SoftBank Robotics accelerating AI hiring for H2 2026.', nextAction: 'Submit AI Engineer shortlist by Jul 3', author: 'J. Park', date: '2026-07-01' },
  // Job logs
  { id: 'al-j1-1', targetId: 'j1', type: 'Call',    summary: 'Screened Kim Jae-won. Good Java background but needs to demonstrate N2 in written test.', nextAction: 'Schedule N2 proficiency test for Kim', author: 'Y. Tanaka', date: '2026-06-08' },
  { id: 'al-j2-1', targetId: 'j2', type: 'Meeting', summary: 'Emma Wilson final interview went well. Client leaning toward offer.', nextAction: 'Prepare offer details by Jul 1', author: 'J. Park', date: '2026-06-30' },
  { id: 'al-j5-1', targetId: 'j5', type: 'Email',   summary: 'Wang Fang offer letter sent. Salary ¥7.5M agreed. Start date Aug 1.', nextAction: 'Await signed offer letter by Jul 5', author: 'Y. Tanaka', date: '2026-06-28' },
  { id: 'al-j9-1', targetId: 'j9', type: 'Email',   summary: 'Li Qiang offer in negotiation. Requesting ¥14.5M base + relocation support.', nextAction: 'Negotiate with client on package by Jul 5', author: 'Y. Tanaka', date: '2026-06-30' },
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
