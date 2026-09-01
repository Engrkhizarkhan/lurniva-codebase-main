export const siteConfig = {
  name: "Lurniva",
  tagline: "Grow. Don't just learn.",
  description:
    "Lurniva connects students, teachers, content and AI in one place — turning any educational material into lessons, study plans, practice and graded feedback.",
  url: "https://lurniva.com",
  locale: "en_US",
  emails: {
    general: "info@lurniva.com",
    institutes: "institutes@lurniva.com",
    teachers: "teachers@lurniva.com",
  },
  social: {
    linkedin: "https://www.linkedin.com/company/lurniva",
    instagram: "https://www.instagram.com/lurnivaofficial",
  },
} as const;

export type SiteConfig = typeof siteConfig;
