import type { IconName } from "@lurniva/ui";

export interface NavLink {
  label: string;
  description: string;
  href: string;
}

export interface NavColumn {
  label: string;
  icon: IconName;
  iconClassName: string;
  links: NavLink[];
}

/** The Platform mega-menu — one column per audience. Teachers/Institutes columns point at the dedicated pages; Organizations points at its fold-in band on /institutes. */
export const platformMenu: NavColumn[] = [
  {
    label: "For students",
    icon: "graduation-cap",
    iconClassName: "text-ember-700",
    links: [
      { label: "AI Companion", description: "Study with your own material", href: "/#student" },
      { label: "Lesson Planner", description: "A plan that fits your week", href: "/#planner" },
      { label: "My Notes", description: "Highlights become a library", href: "/#notes" },
      { label: "Courses & teachers", description: "Follow teachers you trust", href: "/#teachers" },
      { label: "Curriculum coverage", description: "Cambridge, NCP, SNC, O/A", href: "/#curriculum" },
    ],
  },
  {
    label: "For teachers",
    icon: "presentation",
    iconClassName: "text-teal-600",
    links: [
      { label: "Course creation", description: "Build once, teach for years", href: "/teachers#teacher" },
      { label: "Content & video upload", description: "PDFs, slides, docs, lessons", href: "/teachers#teacher" },
      { label: "AI lecture generation", description: "Turn a chapter into a lesson", href: "/teachers#teacher" },
      { label: "AI Examiner & grading", description: "Assess from your content", href: "/teachers#examiner" },
      { label: "Monetisation", description: "Subscriptions and payouts", href: "/teachers#teacher" },
    ],
  },
  {
    label: "For institutes",
    icon: "building-2",
    iconClassName: "text-forest-600",
    links: [
      { label: "Teach from your content", description: "Your syllabus, our AI layer", href: "/institutes#institutes" },
      { label: "AI-powered learning", description: "Companion on every chapter", href: "/institutes#institutes" },
      { label: "Student management", description: "Cohorts, sections, progress", href: "/institutes#institutes" },
      { label: "Content library", description: "One source of truth", href: "/institutes#institutes" },
    ],
  },
  {
    label: "For organizations",
    icon: "briefcase",
    iconClassName: "text-stone-600",
    links: [
      { label: "Organization-wide learning", description: "One learning surface for all", href: "/institutes#orgs" },
      { label: "Internal knowledge", description: "Handbooks, decks, recordings", href: "/institutes#orgs" },
      { label: "AI-powered training", description: "Onboarding that keeps up", href: "/institutes#orgs" },
      { label: "Learner progress", description: "Completion and gaps", href: "/institutes#orgs" },
    ],
  },
];

/** The AI mega-menu — link grid plus "the difference" callout, exactly as designed. */
export const aiMenuLinks: NavLink[] = [
  { label: "AI Companion", description: "Explains, summarises, quizzes", href: "/#student" },
  { label: "AI lecture generation", description: "Chapter to narrated lesson", href: "/teachers#teacher" },
  { label: "AI Examiner", description: "Papers built from your content", href: "/teachers#examiner" },
  { label: "AI grading", description: "Marks with reasoning shown", href: "/teachers#examiner" },
];

export interface PrimaryNavLink {
  label: string;
  href: string;
}

/** Plain top-level nav links — one dedicated page or anchor per audience. */
export const primaryNavLinks: PrimaryNavLink[] = [
  { label: "For Teachers", href: "/teachers" },
  { label: "For Institutes", href: "/institutes" },
  { label: "Pricing", href: "/#pricing" },
  { label: "About", href: "/about" },
];

export interface FooterColumnData {
  label: string;
  links: { label: string; href: string }[];
}

export const footerColumns: FooterColumnData[] = [
  {
    label: "Platform",
    links: [
      { label: "For students", href: "/#student" },
      { label: "For teachers", href: "/teachers" },
      { label: "For institutes", href: "/institutes" },
      { label: "Curriculum", href: "/#curriculum" },
    ],
  },
  {
    label: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Pricing", href: "/#pricing" },
      { label: "FAQ", href: "/#faq" },
      { label: "Contact", href: "/#contact" },
    ],
  },
  {
    label: "Legal",
    links: [
      { label: "Privacy Policy", href: "/legal?tab=privacy" },
      { label: "Terms of Service", href: "/legal?tab=tos" },
      { label: "Cookie Policy", href: "/legal?tab=cookie" },
      { label: "IP Policy", href: "/legal?tab=ip" },
    ],
  },
];
