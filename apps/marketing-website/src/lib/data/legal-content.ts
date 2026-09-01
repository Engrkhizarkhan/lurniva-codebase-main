export type LegalTab = "privacy" | "tos" | "cookie" | "ip";

export interface LegalTabMeta {
  id: LegalTab;
  label: string;
}

export const legalTabs: LegalTabMeta[] = [
  { id: "privacy", label: "Privacy Policy" },
  { id: "tos", label: "Terms of Service" },
  { id: "cookie", label: "Cookie Policy" },
  { id: "ip", label: "IP Policy" },
];

export type LegalBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "subheading"; text: string };

export interface LegalSection {
  number: string;
  heading: string;
  blocks: LegalBlock[];
}

export interface LegalDoc {
  title: string;
  intro: LegalBlock[];
  sections: LegalSection[];
}

export const legalDocs: Record<LegalTab, LegalDoc> = {
  privacy: {
    title: "Privacy Policy",
    intro: [
      {
        type: "paragraph",
        text: "Lurniva EdTech Solutions is committed to protecting the privacy of students, parents, teachers, staff, and institutions. This Policy explains how we collect, use, store, and protect personal data.",
      },
      { type: "paragraph", text: "✅ We do not sell your personal data — ever." },
    ],
    sections: [
      {
        number: "01",
        heading: "Information We Collect",
        blocks: [
          { type: "subheading", text: "A. Account Information" },
          {
            type: "list",
            items: [
              "Name, email and contact details",
              "Role (student, parent, teacher, institute staff)",
              "Login credentials",
            ],
          },
          { type: "subheading", text: "B. Educational Data" },
          {
            type: "list",
            items: [
              "Assignments, grades, attendance",
              "Course progress, timetables and schedules",
              "Institute records provided by your school/college",
            ],
          },
          { type: "subheading", text: "C. Device & Usage Data" },
          {
            type: "list",
            items: [
              "IP address and browser type",
              "Device information and activity logs",
              "Cookies (see Cookie Policy)",
            ],
          },
          { type: "subheading", text: "D. Parental/Institutional Consent" },
          { type: "list", items: ["Required for students under 18."] },
        ],
      },
      {
        number: "02",
        heading: "How We Use Your Information",
        blocks: [
          {
            type: "list",
            items: [
              "Provide learning and institute management services",
              "Personalize the learning experience",
              "Enable teachers and institutes to track progress",
              "Improve platform features and security",
              "Communicate important updates",
              "Comply with lawful requests or regulations",
            ],
          },
        ],
      },
      {
        number: "03",
        heading: "Legal Basis for Processing",
        blocks: [
          {
            type: "list",
            items: [
              "Consent — for minors, parental or institutional consent",
              "Contractual necessity — providing services to institutes/schools",
              "Legitimate interests — improving services",
              "Compliance with law — PECA 2016, tax laws, court orders, etc.",
            ],
          },
        ],
      },
      {
        number: "04",
        heading: "Children's Privacy",
        blocks: [
          {
            type: "list",
            items: [
              "Students under 18 may use Lurniva only with parent/guardian or institute authorization.",
              "We collect only the information required for educational purposes.",
              "Parents and institutes may request access, correction, or deletion of a minor's data.",
              "We do not knowingly collect more information than necessary for learning and communication.",
            ],
          },
        ],
      },
      {
        number: "05",
        heading: "Sharing Your Information",
        blocks: [
          { type: "subheading", text: "A. Your Institute" },
          { type: "paragraph", text: "To manage academic records and communication." },
          { type: "subheading", text: "B. Service Providers" },
          {
            type: "paragraph",
            text: "Trusted providers for hosting, cloud infrastructure, AI processing, and analytics. All are contractually bound to protect your data.",
          },
          { type: "subheading", text: "C. Legal Authorities" },
          {
            type: "paragraph",
            text: "Only when required by law, through a valid legal process, or to protect safety or prevent harm.",
          },
        ],
      },
      {
        number: "06",
        heading: "Data Security",
        blocks: [
          {
            type: "list",
            items: [
              "Encrypted storage and transmission",
              "Role-based access controls",
              "Regular backups and monitoring",
              "Threat detection, security audits and testing",
            ],
          },
        ],
      },
      {
        number: "07",
        heading: "Data Retention",
        blocks: [
          {
            type: "paragraph",
            text: "We keep your data only as long as needed to provide services, or as required by law or institute policy. When no longer required, data is securely deleted or anonymized.",
          },
        ],
      },
      {
        number: "08",
        heading: "International Data Transfers",
        blocks: [
          {
            type: "paragraph",
            text: "If data is stored or processed outside Pakistan, we ensure equivalent protections through contracts, encryption, and safeguards. Only trusted international providers are used.",
          },
        ],
      },
      {
        number: "09",
        heading: "Your Rights",
        blocks: [
          {
            type: "list",
            items: [
              "A copy of your data",
              "Correction of inaccurate data",
              "Deletion (where applicable)",
              "Withdrawal of consent (may affect access)",
            ],
          },
          {
            type: "paragraph",
            text: "Students must submit such requests through their institute or parent/guardian.",
          },
        ],
      },
      {
        number: "10",
        heading: "Cookies",
        blocks: [
          {
            type: "paragraph",
            text: "Cookies help us improve platform performance. See our Cookie Policy for details and management options.",
          },
        ],
      },
      {
        number: "11",
        heading: "Changes to This Policy",
        blocks: [
          {
            type: "paragraph",
            text: "We may update this Policy when required. Continued use of Lurniva means you accept the updated version.",
          },
        ],
      },
    ],
  },

  tos: {
    title: "Terms of Service",
    intro: [
      {
        type: "paragraph",
        text: "Welcome to Lurniva. By creating an account or using our services, you agree to these Terms. These Terms apply to all users: students, parents, teachers, staff, and institutions.",
      },
    ],
    sections: [
      {
        number: "01",
        heading: "About Lurniva",
        blocks: [
          {
            type: "paragraph",
            text: "Lurniva EdTech Solutions (Private) Limited (‘Lurniva’, ‘we’, ‘our’, ‘us’) provides an online learning, school management, and AI-assisted educational platform.",
          },
          {
            type: "paragraph",
            text: "By creating an account or using our services, you agree to these Terms. These Terms apply to all users: students, parents, teachers, staff, and institutions.",
          },
        ],
      },
      {
        number: "02",
        heading: "Eligibility",
        blocks: [
          {
            type: "list",
            items: [
              "Students under 18 must have parent/guardian or institute consent.",
              "Institutes must ensure accuracy of the data they provide.",
            ],
          },
        ],
      },
      {
        number: "03",
        heading: "Your Account",
        blocks: [
          {
            type: "list",
            items: [
              "You must provide correct information when creating an account.",
              "You are responsible for keeping your login credentials confidential.",
              "Report any unauthorized access immediately.",
            ],
          },
        ],
      },
      {
        number: "04",
        heading: "Acceptable Use Policy (AUP)",
        blocks: [
          { type: "paragraph", text: "You agree NOT to:" },
          {
            type: "list",
            items: [
              "Use Lurniva for illegal, harmful, abusive, or fraudulent activity.",
              "Upload or share content that is obscene, hateful, threatening, or discriminatory.",
              "Violate intellectual property rights.",
              "Attempt to hack, disrupt, reverse-engineer, or bypass security features.",
              "Impersonate others or share accounts.",
              "Use AI features to cheat, plagiarize, or violate school academic policies.",
              "Misuse communication tools for spam, harassment, or advertisements.",
            ],
          },
          { type: "paragraph", text: "Violation may result in suspension or termination of your account." },
        ],
      },
      {
        number: "05",
        heading: "Fair Usage Policy (FUP)",
        blocks: [
          {
            type: "list",
            items: [
              "Excessive or automated use of AI features may be limited.",
              "Storage, bandwidth, and processing resources must be used reasonably.",
              "Institutes cannot exceed their licensed user limits.",
              "Abusive or disproportionate usage may result in throttling, restrictions, or additional charges.",
            ],
          },
        ],
      },
      {
        number: "06",
        heading: "User-Generated Content",
        blocks: [
          {
            type: "paragraph",
            text: "You retain ownership of all content you upload (assignments, notes, documents, etc.). By uploading it, you give Lurniva a license to host, process, and display it only for educational use.",
          },
          { type: "paragraph", text: "You must not upload content you do not have rights to share." },
        ],
      },
      {
        number: "07",
        heading: "Intellectual Property",
        blocks: [
          {
            type: "paragraph",
            text: "All software, design, features, trademarks, and platform content belong to Lurniva. You may not copy, modify, distribute, or reverse-engineer any part of Lurniva.",
          },
        ],
      },
      {
        number: "08",
        heading: "AI & Content Disclaimer",
        blocks: [
          {
            type: "paragraph",
            text: "Lurniva provides AI-powered features such as answers, summaries, explanations, quizzes, and suggestions. Please note:",
          },
          {
            type: "list",
            items: [
              "AI content may contain errors and should be reviewed by a teacher or parent.",
              "AI is a support tool, not a replacement for textbooks, instructions, or human teaching.",
              "Lurniva is not responsible for any academic, exam, career, or personal consequences arising from reliance on AI-generated outputs, including incorrect answers, missed exam content, or failed assessments. AI features are supplementary tools only and do not constitute professional academic advice.",
              "Submitting AI-generated responses as your own work may violate academic integrity.",
            ],
          },
        ],
      },
      {
        number: "09",
        heading: "Platform Availability",
        blocks: [
          {
            type: "list",
            items: [
              "We do not guarantee uninterrupted or error-free operation.",
              "Services may be modified, updated, or temporarily suspended for maintenance or improvements.",
              "Lurniva is provided ‘as-is’ without warranties of any kind, express or implied.",
              "Lurniva shall not be liable for service disruptions caused by events beyond our reasonable control, including internet outages, cloud provider failures, natural disasters, government actions, or cyberattacks (Force Majeure).",
            ],
          },
        ],
      },
      {
        number: "10",
        heading: "Suspension or Termination",
        blocks: [
          {
            type: "paragraph",
            text: "Lurniva may suspend or terminate access if you violate these Terms, misuse the platform, upload harmful content, or attempt to breach security. Institutes may also request suspension of their users.",
          },
        ],
      },
      {
        number: "11",
        heading: "Limitation of Liability",
        blocks: [
          {
            type: "list",
            items: [
              "Lurniva is not liable for indirect, incidental, academic, or consequential damages.",
              "Our total liability is limited to the amount paid to Lurniva (if any) in the last 6 months.",
              "Users agree to defend, indemnify, and hold harmless Lurniva, its affiliates, officers, directors, employees, and agents from claims arising from their use of the platform.",
            ],
          },
        ],
      },
      {
        number: "12",
        heading: "Changes to These Terms",
        blocks: [
          {
            type: "paragraph",
            text: "We may update these Terms when needed. Significant changes will be communicated via email or platform notification. Continued use of Lurniva means you accept the updated Terms.",
          },
        ],
      },
      {
        number: "13",
        heading: "Governing Law",
        blocks: [
          {
            type: "paragraph",
            text: "These Terms are governed by the laws of Pakistan. In the event of a dispute, the parties agree to first attempt resolution through good-faith negotiation. If unresolved within 30 days, disputes shall be submitted to binding arbitration in Peshawar, Pakistan. If arbitration is not agreed upon, disputes shall be subject to the exclusive jurisdiction of the courts of Peshawar, Pakistan.",
          },
        ],
      },
    ],
  },

  cookie: {
    title: "Cookie Policy",
    intro: [
      {
        type: "paragraph",
        text: "This Cookie Policy explains how Lurniva uses cookies and similar technologies when you access our website or platform.",
      },
    ],
    sections: [
      {
        number: "01",
        heading: "What Are Cookies?",
        blocks: [
          {
            type: "paragraph",
            text: "Cookies are small text files stored on your device when you visit a website. They help websites function properly, remember your preferences, and improve your browsing experience.",
          },
        ],
      },
      {
        number: "02",
        heading: "Types of Cookies We Use",
        blocks: [
          {
            type: "list",
            items: [
              "🔒 Essential Cookies — Required. Required for login, authentication, security, and session management. Cannot be disabled.",
              "📊 Performance & Analytics — Optional. Help us understand usage patterns, improve speed, and troubleshoot issues.",
              "⚙️ Functional Cookies — Optional. Remember your preferences such as language, display settings, and UI choices.",
              "📢 Marketing Cookies — If enabled. Used to deliver relevant content or ads only if approved by the institute or user.",
            ],
          },
        ],
      },
      {
        number: "03",
        heading: "How We Use Cookies",
        blocks: [
          {
            type: "list",
            items: [
              "Keep you signed in securely",
              "Protect your account from unauthorized access",
              "Improve platform performance and reliability",
              "Understand usage patterns to build better features",
              "Personalize content and learning experience",
              "Support institute-level analytics and reporting",
            ],
          },
        ],
      },
      {
        number: "04",
        heading: "Managing Cookies",
        blocks: [
          { type: "paragraph", text: "You can control cookies by:" },
          {
            type: "list",
            items: [
              "Changing your browser settings",
              "Clearing stored cookies from your device",
              "Rejecting non-essential cookies via our cookie preferences tool",
            ],
          },
          {
            type: "paragraph",
            text: "Note: Disabling essential cookies may affect login or platform functionality.",
          },
        ],
      },
      {
        number: "05",
        heading: "Third-Party Cookies",
        blocks: [
          {
            type: "paragraph",
            text: "Some trusted third parties may place cookies on our platform to support hosting and security, AI processing, analytics, and communication services. We do not control third-party cookies and recommend reviewing their privacy policies where necessary.",
          },
        ],
      },
      {
        number: "06",
        heading: "Changes to This Policy",
        blocks: [
          {
            type: "paragraph",
            text: "We may update this Cookie Policy to reflect changes in technology, legal requirements, or our practices. Updates will be posted with a revised ‘Last Updated’ date.",
          },
        ],
      },
    ],
  },

  ip: {
    title: "Intellectual Property & UGC Policy",
    intro: [
      {
        type: "paragraph",
        text: 'This Policy explains how intellectual property ("IP") and user-generated content ("UGC") are handled on the Lurniva platform.',
      },
      { type: "subheading", text: "🏢 Lurniva Owns" },
      {
        type: "paragraph",
        text: "All platform software, design, branding, features, algorithms, AI models, and content.",
      },
      { type: "subheading", text: "👤 You Own" },
      {
        type: "paragraph",
        text: "All content you upload — assignments, notes, documents, and materials you create.",
      },
    ],
    sections: [
      {
        number: "01",
        heading: "Our Intellectual Property",
        blocks: [
          {
            type: "paragraph",
            text: "All rights to the Lurniva platform — including its software, design, branding, features, algorithms, AI models, and content — are owned by Lurniva EdTech Solutions (Private) Limited.",
          },
          { type: "paragraph", text: "Users may not:" },
          {
            type: "list",
            items: [
              "Copy, modify, or create derivative works",
              "Reverse-engineer or attempt to extract source code",
              "Sell, rent, sublicense, or redistribute any part of the platform",
              "Remove copyright, trademarks, or proprietary notices",
            ],
          },
          {
            type: "paragraph",
            text: "Use of Lurniva is provided under a limited, non-transferable license during active subscription or enrollment.",
          },
        ],
      },
      {
        number: "02",
        heading: "User-Generated Content (UGC)",
        blocks: [
          {
            type: "paragraph",
            text: "UGC includes assignments, documents, notes, lesson materials, images, videos, messages, or any content uploaded by users.",
          },
          { type: "subheading", text: "Ownership" },
          { type: "paragraph", text: "You retain full ownership of your content." },
          { type: "subheading", text: "License to Lurniva" },
          {
            type: "paragraph",
            text: "By uploading UGC, you grant Lurniva a non-exclusive, royalty-free, worldwide, educational-use-only license. This allows us to host, process, display, and transmit your content to provide platform services. We do not use UGC for marketing without permission.",
          },
        ],
      },
      {
        number: "03",
        heading: "Institute Branding",
        blocks: [
          {
            type: "paragraph",
            text: "Logos, names, and branding elements provided by institutes remain their property. Lurniva may display such branding only inside the platform, in dashboards and portals, and as agreed in the institute's service contract. We will not use institute branding for marketing unless approved.",
          },
        ],
      },
      {
        number: "04",
        heading: "Third-Party Content",
        blocks: [
          {
            type: "paragraph",
            text: "Some materials (e.g., textbooks, media, open educational resources, licensed content) may appear on the platform. Users must comply with copyright and licensing rules. Uploading or distributing copyrighted materials without permission is prohibited.",
          },
        ],
      },
      {
        number: "05",
        heading: "Academic Integrity",
        blocks: [
          { type: "paragraph", text: "Users must NOT:" },
          {
            type: "list",
            items: [
              "Submit AI-generated content as original work unless allowed by the institute",
              "Upload plagiarized materials",
              "Misuse tests, quizzes, or assessments",
              "Violate school or institute academic rules",
            ],
          },
          { type: "paragraph", text: "Institutes have the right to enforce academic policies through Lurniva." },
        ],
      },
      {
        number: "06",
        heading: "Reporting IP Violations",
        blocks: [
          {
            type: "paragraph",
            text: "If you believe your content or copyright has been misused, please contact us with: description of the issue, proof of ownership, and URL or location of the infringing content.",
          },
          {
            type: "paragraph",
            text: "We will investigate and take appropriate action, which may include removal or account suspension.",
          },
        ],
      },
      {
        number: "07",
        heading: "License Termination",
        blocks: [
          {
            type: "list",
            items: [
              "Your license to use Lurniva ends immediately when your account or subscription ends",
              "UGC may be deleted or returned as per institute policy",
              "Lurniva's IP remains fully protected",
            ],
          },
        ],
      },
      {
        number: "08",
        heading: "Changes to This Policy",
        blocks: [
          {
            type: "paragraph",
            text: "We may update this Policy when necessary. Continued use of the platform means you accept the updated version.",
          },
        ],
      },
    ],
  },
};

export const legalContact = {
  email: "info@lurniva.com",
  address: "National Incubation Center, PTCL Training Center, University Rd, Peshawar, 25000",
};
