export interface Faq {
  question: string;
  answer: string;
}

export const faqs: Faq[] = [
  {
    question: "What is Lurniva?",
    answer:
      "A learning platform that turns educational content into an interactive experience. Students study with an AI companion bound to their actual material; teachers upload content and get lectures, assessments and grading generated from it.",
  },
  {
    question: "How does the AI Companion work?",
    answer:
      "You pick a course, chapter or your own upload. The companion answers from that material and cites the page — it does not answer from the open internet.",
  },
  {
    question: "Can students study from their own content?",
    answer:
      "Yes. Upload a PDF, a set of slides or a teacher's handout and it behaves exactly like a Lurniva course: explanations, summaries, notes, flashcards and practice.",
  },
  {
    question: "How does AI grading work?",
    answer:
      "The Examiner reads each answer for accuracy, method and reasoning, marks it against the source material, and flags borderline answers for the teacher. Teachers can override any mark.",
  },
  {
    question: "What curriculum systems are supported?",
    answer:
      "Cambridge International, the National Curriculum of Pakistan, SNC and O/A Levels are live. IB and further regional systems are in development.",
  },
  {
    question: "Is Lurniva free?",
    answer:
      "There is a free tier for students to start with. Premium adds unlimited AI, plans across every subject and full past-paper practice.",
  },
  {
    question: "I want to teach or bring my institute onto Lurniva — where do I start?",
    answer:
      "Teachers and institutes each have their own page — see \"For Teachers\" and \"For Institutes\" in the navigation for tools, workflows and pricing specific to you.",
  },
];
