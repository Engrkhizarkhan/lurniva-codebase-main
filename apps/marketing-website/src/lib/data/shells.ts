import type { IconName } from "@lurniva/ui";

export type Seat = "student" | "teacher" | "institute" | "organization";

export interface ShellNavItem {
  label: string;
  icon: IconName;
}

export interface ShellStat {
  label: string;
  value: string;
  rule: string;
}

export interface ShellRow {
  title: string;
  meta: string;
  icon: IconName;
  percent: number;
  tone: string;
}

export interface Shell {
  title: string;
  heading: string;
  sub: string;
  nav: ShellNavItem[];
  stats: ShellStat[];
  listTitle: string;
  rows: ShellRow[];
  aiTitle: string;
  aiBody: string;
  chips: string[];
}

export const shells: Record<Seat, Shell> = {
  student: {
    title: "Student",
    heading: "Good evening, Ayesha",
    sub: "3 tasks in today's plan · 12-day streak",
    nav: [
      { label: "Dashboard", icon: "layout-dashboard" },
      { label: "Study plan", icon: "calendar-check" },
      { label: "Learning", icon: "play" },
      { label: "AI session", icon: "sparkles" },
      { label: "My Notes", icon: "book-open" },
      { label: "Practice", icon: "target" },
      { label: "Teachers", icon: "users" },
    ],
    stats: [
      { label: "Today's plan", value: "3 / 4", rule: "var(--ember-500)" },
      { label: "Streak", value: "12 days", rule: "var(--amber-500)" },
      { label: "XP this week", value: "1,240", rule: "var(--lime-500)" },
    ],
    listTitle: "Chapters in progress",
    rows: [
      { title: "Cell energetics", meta: "Biology · 61%", icon: "book-open", percent: 61, tone: "var(--ember-500)" },
      { title: "Bonding", meta: "Chemistry · 38%", icon: "flask-conical", percent: 38, tone: "var(--forest-500)" },
      { title: "Trigonometry", meta: "Maths · 74%", icon: "ruler", percent: 74, tone: "var(--lime-600)" },
      { title: "Waves", meta: "Physics · 12%", icon: "activity", percent: 12, tone: "var(--amber-500)" },
    ],
    aiTitle: "Ready when you are",
    aiBody:
      "You asked three questions on cristae yesterday. Ten flashcards are waiting from that session.",
    chips: ["Practise 10 cards", "Summarise Ch.4"],
  },
  teacher: {
    title: "Teacher studio",
    heading: "Studio — Sir Hamza",
    sub: "2 uploads processing · 1 paper to review",
    nav: [
      { label: "Dashboard", icon: "layout-dashboard" },
      { label: "Channel", icon: "badge-check" },
      { label: "Content", icon: "library" },
      { label: "AI suite", icon: "sparkles" },
      { label: "Students", icon: "users-round" },
      { label: "Analytics", icon: "bar-chart-3" },
      { label: "Revenue", icon: "wallet" },
    ],
    stats: [
      { label: "Active students", value: "1,842", rule: "var(--teal-500)" },
      { label: "Monthly revenue", value: "PKR 486k", rule: "var(--lime-500)" },
      { label: "Completion", value: "71%", rule: "var(--ember-500)" },
    ],
    listTitle: "Content pipeline",
    rows: [
      { title: "Ch.7 lecture — AI generated", meta: "Ready to publish", icon: "sparkles", percent: 100, tone: "var(--lime-600)" },
      { title: "Waves handout.pdf", meta: "Processing · 28 of 40 pages", icon: "file-text", percent: 70, tone: "var(--forest-500)" },
      { title: "Mock paper 3", meta: "Grading 24 of 31", icon: "clipboard-check", percent: 77, tone: "var(--ember-500)" },
      { title: "Optics lesson.mp4", meta: "Uploaded", icon: "play", percent: 100, tone: "var(--teal-500)" },
    ],
    aiTitle: "Two hours of marking saved",
    aiBody:
      "The Examiner graded 24 scripts of Mock paper 3 and flagged 6 answers for your review.",
    chips: ["Review flagged", "Generate lecture"],
  },
  institute: {
    title: "Institute",
    heading: "Beacon Academy",
    sub: "1,240 students · 38 teachers · 4 campuses",
    nav: [
      { label: "Overview", icon: "layout-dashboard" },
      { label: "Content library", icon: "library" },
      { label: "Courses", icon: "play" },
      { label: "Students", icon: "users-round" },
      { label: "Teachers", icon: "presentation" },
      { label: "Assessments", icon: "clipboard-check" },
      { label: "Analytics", icon: "bar-chart-3" },
    ],
    stats: [
      { label: "Students learning", value: "1,240", rule: "var(--forest-500)" },
      { label: "Content indexed", value: "612 files", rule: "var(--lime-500)" },
      { label: "Avg. mastery", value: "68%", rule: "var(--ember-500)" },
    ],
    listTitle: "Cohort progress",
    rows: [
      { title: "Grade 10 — Biology", meta: "42 students · on track", icon: "users-round", percent: 82, tone: "var(--forest-500)" },
      { title: "Grade 10 — Physics", meta: "40 students · behind", icon: "users-round", percent: 44, tone: "var(--amber-500)" },
      { title: "Grade 9 — Chemistry", meta: "38 students · on track", icon: "users-round", percent: 76, tone: "var(--forest-500)" },
      { title: "Grade 12 — Maths", meta: "35 students · at risk", icon: "users-round", percent: 31, tone: "var(--clay-500)" },
    ],
    aiTitle: "Your syllabus, made interactive",
    aiBody:
      "612 institution files are indexed. Every chapter now has a companion, practice set and examiner.",
    chips: ["Add content", "Invite cohort"],
  },
  organization: {
    title: "Organization",
    heading: "Nova Health · Learning",
    sub: "480 learners · 6 programmes",
    nav: [
      { label: "Overview", icon: "layout-dashboard" },
      { label: "Knowledge base", icon: "folder-open" },
      { label: "Programmes", icon: "graduation-cap" },
      { label: "Onboarding", icon: "user-check" },
      { label: "People", icon: "users-round" },
      { label: "Reports", icon: "bar-chart-3" },
    ],
    stats: [
      { label: "Active learners", value: "480", rule: "var(--amber-500)" },
      { label: "Docs indexed", value: "1,108", rule: "var(--lime-500)" },
      { label: "Onboarding time", value: "-38%", rule: "var(--forest-500)" },
    ],
    listTitle: "Programme completion",
    rows: [
      { title: "Clinical SOP refresher", meta: "Required · 92%", icon: "shield-check", percent: 92, tone: "var(--forest-500)" },
      { title: "New-hire onboarding", meta: "Week 1–2 · 64%", icon: "user-check", percent: 64, tone: "var(--amber-500)" },
      { title: "Data handling", meta: "Annual · 47%", icon: "lock", percent: 47, tone: "var(--ember-500)" },
      { title: "Leadership track", meta: "Coming soon", icon: "trending-up", percent: 8, tone: "var(--stone-500)" },
    ],
    aiTitle: "Training from your own handbook",
    aiBody:
      "Upload the policy set and Lurniva builds the programme, the practice and the sign-off record.",
    chips: ["Coming soon: SSO", "Coming soon: SCIM"],
  },
};

export const planSubjects = ["Biology", "Chemistry", "Mathematics"] as const;
export type PlanSubject = (typeof planSubjects)[number];

export const planTopics: Record<PlanSubject, string[]> = {
  Biology: [
    "Cell structure recap",
    "Respiration pathways",
    "Cristae and ATP",
    "Photosynthesis limits",
    "Enzymes under stress",
    "Past paper — section A",
    "Weak-topic revision",
  ],
  Chemistry: [
    "Atomic structure",
    "Ionic bonding",
    "Covalent bonding",
    "Rates of reaction",
    "Moles practice",
    "Past paper — section A",
    "Weak-topic revision",
  ],
  Mathematics: [
    "Trig identities",
    "Sine and cosine rule",
    "Graph transformations",
    "Differentiation basics",
    "Mixed problem set",
    "Past paper — paper 1",
    "Weak-topic revision",
  ],
};

export const planDayDetails = [
  "Read + 8 flashcards",
  "AI lecture + 6 questions",
  "Practice set · 12 questions",
  "Summary notes + quiz",
  "Mixed recall",
];
