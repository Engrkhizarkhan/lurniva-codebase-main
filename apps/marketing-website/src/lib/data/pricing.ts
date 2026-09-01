export interface PricingPlan {
  name: string;
  price: string;
  note: string;
  tag: string;
  primary?: boolean;
  dark?: boolean;
  features: string[];
  cta: string;
}

export const pricingAudiences = [
  "Students",
  "Teachers",
  "Institutes",
  "Organizations",
] as const;
export type PricingAudience = (typeof pricingAudiences)[number];

export const pricing: Record<PricingAudience, PricingPlan[]> = {
  Students: [
    {
      name: "Free",
      price: "PKR 0",
      note: "Everything you need to start studying.",
      tag: "Available now",
      features: [
        "AI Companion — 20 questions a day",
        "Study plan for one subject",
        "My Notes and highlights",
        "Browse all teachers",
      ],
      cta: "Start free",
    },
    {
      name: "Premium",
      price: "PKR 900",
      note: "Per month, billed monthly.",
      tag: "Most picked",
      primary: true,
      dark: true,
      features: [
        "Unlimited AI Companion",
        "Plans across all subjects",
        "AI lectures and practice sets",
        "Upload your own content",
        "Full past-paper practice",
      ],
      cta: "Go premium",
    },
    {
      name: "Campus",
      price: "Bundled",
      note: "Provided by your school or institute.",
      tag: "Via institute",
      features: [
        "Premium features included",
        "Your institute's content library",
        "Teacher-assigned plans",
      ],
      cta: "Check with your school",
    },
  ],
  Teachers: [
    {
      name: "Free",
      price: "PKR 0",
      note: "Publish and see if it lands.",
      tag: "Available now",
      features: [
        "Up to 3 courses",
        "Content and video upload",
        "2 AI lectures a month",
        "Basic analytics",
      ],
      cta: "Start teaching",
    },
    {
      name: "Creator",
      price: "15% share",
      note: "No monthly fee — Lurniva takes a share of revenue.",
      tag: "Most picked",
      primary: true,
      dark: true,
      features: [
        "Unlimited courses and uploads",
        "AI lecture generation",
        "AI Examiner and grading",
        "Subscriptions and payouts",
        "Channel page and audience tools",
      ],
      cta: "Become a creator",
    },
    {
      name: "Professional",
      price: "PKR 4,500",
      note: "Per month · 8% revenue share.",
      tag: "Available now",
      features: [
        "Lower revenue share",
        "Priority AI processing",
        "Cohort management",
        "Advanced analytics",
      ],
      cta: "Talk to us",
    },
  ],
  Institutes: [
    {
      name: "Pilot",
      price: "Free",
      note: "One cohort, one term.",
      tag: "Available now",
      features: [
        "Up to 100 students",
        "50 content files indexed",
        "AI Companion on your material",
        "Cohort analytics",
      ],
      cta: "Start a pilot",
    },
    {
      name: "Institute",
      price: "Custom",
      note: "Priced per student, per year.",
      tag: "Available now",
      primary: true,
      dark: true,
      features: [
        "Unlimited students and content",
        "Institution content library",
        "Student and teacher management",
        "Assessments and AI grading",
        "Campus-level analytics",
      ],
      cta: "Request pricing",
    },
    {
      name: "Multi-campus",
      price: "Custom",
      note: "For groups and networks.",
      tag: "Coming soon",
      features: [
        "Cross-campus reporting",
        "Shared content governance",
        "Dedicated onboarding",
      ],
      cta: "Join the waitlist",
    },
  ],
  Organizations: [
    {
      name: "Team",
      price: "Custom",
      note: "Up to 100 learners.",
      tag: "Early access",
      features: [
        "Knowledge base indexing",
        "AI-powered training programmes",
        "Learner progress",
      ],
      cta: "Request access",
    },
    {
      name: "Organization",
      price: "Custom",
      note: "Priced per learner, per year.",
      tag: "Early access",
      primary: true,
      dark: true,
      features: [
        "Unlimited learners and content",
        "Role-based onboarding paths",
        "Assessment and sign-off records",
        "Reporting for managers",
      ],
      cta: "Talk to sales",
    },
    {
      name: "Enterprise",
      price: "Custom",
      note: "Security and compliance requirements.",
      tag: "Coming soon",
      features: ["SSO and SCIM", "Compliance reporting", "Skills mapping"],
      cta: "Join the waitlist",
    },
  ],
};
