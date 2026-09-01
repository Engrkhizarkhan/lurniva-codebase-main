export const aboutHero = {
  eyebrow: "About us",
  title: "Built by learners, for every learner.",
  description:
    "We're a small, focused team with a big obsession — making learning feel intelligent, personal, and genuinely worth your time.",
};

export const whoWeAre = {
  eyebrow: "Who we are",
  title: "Your smartest learning companion.",
  lead: "Not a school platform. Not a course library. A complete, AI-powered ecosystem for anyone who wants to grow.",
  paragraphs: [
    "We started Lurniva with one simple belief: learning should feel less like a struggle and more like a conversation.",
    "Lurniva is an AI-powered learning ecosystem built for students, exam aspirants, and curious minds at every stage of life. Whether you're cramming for MDCAT, bridging knowledge gaps, preparing for CSS, or just exploring something new — Lurniva gets it. It understands how you learn, spots where you're stuck, and helps you move forward in a way that actually sticks.",
    "Forget one-size-fits-all. Lurniva adapts to you — your pace, your style, your goals. Most platforms give you content. Lurniva gives you a learning partner. One that explains, quizzes, challenges, tracks your progress, and keeps you going — all in one place.",
  ],
};

export interface StoryMilestone {
  period: string;
  title: string;
  description: string;
}

export const ourStory = {
  eyebrow: "Our story",
  title: "A question that changed everything.",
  paragraphs: [
    "We didn't set out to build a learning platform. We set out to fix something broken. It started in 2024 — deep inside educational institutions, understanding how they operated, what they needed, and where technology was letting them down. We built tools to solve those problems.",
    "Then we looked at the learner sitting inside those institutions and asked a harder question: what if the real problem wasn't management — it was learning itself? No platform truly understood the learner. Every tool gave you content. None gave you intelligence.",
    "That question changed everything. We shifted focus entirely, leaned into AI, and kept pushing until we built something we'd never seen before. Not just another platform. A learning ecosystem that actually thinks.",
  ],
  milestones: [
    { period: "Mid 2024", title: "The beginning", description: "Going deep into education" },
    { period: "Early 2025", title: "The shift", description: "Asking a harder question" },
    { period: "Late 2025", title: "Now", description: "The AI learning engine takes shape" },
    { period: "2026", title: "Coming soon", description: "Putting the power back in teachers' hands" },
  ] satisfies StoryMilestone[],
};

export const ourMission = {
  eyebrow: "Our mission",
  title: "Make great learning accessible to every learner, everywhere.",
  body: "Quality, personalized learning shouldn't be a privilege. We're breaking that barrier — with AI that adapts to every student, every goal, every stage of life.",
};

export const ourVision = {
  eyebrow: "Our vision",
  title: "A world where every learner has an intelligent partner by their side.",
  body: "Not just a platform. A lifelong ecosystem that understands you, grows with you, and never stops helping you reach your potential.",
};
