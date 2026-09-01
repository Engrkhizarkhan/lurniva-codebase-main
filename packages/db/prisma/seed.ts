import "dotenv/config";
import { prisma } from "../src/index.js";

interface SeedSubtopic {
  name: string;
}

interface SeedTopic {
  name: string;
  subtopics: SeedSubtopic[];
}

interface SeedSubject {
  name: string;
  topics: SeedTopic[];
}

interface SeedTeacher {
  name: string;
  headline: string;
  bio: string;
  subjects: string[];
  monthlyFee: number;
  availability: "available" | "limited" | "full";
  rating: number;
  reviewCount: number;
}

// Ported from apps/web/src/features/plan/lib/catalog-data.ts — the global
// (user_id IS NULL) catalog used to seed the create-plan wizard's DB-backed
// subject/topic/subtopic picker.
const CATALOG: SeedSubject[] = [
  {
    name: "Maths",
    topics: [
      {
        name: "Calculus",
        subtopics: [
          { name: "Limits & Continuity" },
          { name: "Differentiation" },
          { name: "Integration" },
          { name: "Applications of Derivatives" },
        ],
      },
      {
        name: "Algebra",
        subtopics: [{ name: "Matrices" }, { name: "Determinants" }],
      },
    ],
  },
  {
    name: "Physics",
    topics: [
      {
        name: "Mechanics",
        subtopics: [
          { name: "Kinematics" },
          { name: "Laws of Motion" },
          { name: "Work, Energy & Power" },
        ],
      },
      {
        name: "Gravitation",
        subtopics: [
          { name: "Universal Law" },
          { name: "Acceleration due to Gravity" },
          { name: "Free Fall" },
        ],
      },
      {
        name: "Thermodynamics",
        subtopics: [
          { name: "First Law of Thermodynamics" },
          { name: "Second Law of Thermodynamics" },
        ],
      },
    ],
  },
];

async function seedCatalog() {
  for (const subjectSeed of CATALOG) {
    const subject =
      (await prisma.subject.findFirst({
        where: { name: subjectSeed.name, userId: null },
      })) ??
      (await prisma.subject.create({
        data: { name: subjectSeed.name, userId: null },
      }));

    for (const topicSeed of subjectSeed.topics) {
      const topic =
        (await prisma.topic.findFirst({
          where: { name: topicSeed.name, subjectId: subject.id },
        })) ??
        (await prisma.topic.create({
          data: { name: topicSeed.name, subjectId: subject.id },
        }));

      for (const subtopicSeed of topicSeed.subtopics) {
        const existing = await prisma.subtopic.findFirst({
          where: { name: subtopicSeed.name, topicId: topic.id },
        });
        if (!existing) {
          await prisma.subtopic.create({
            data: { name: subtopicSeed.name, topicId: topic.id },
          });
        }
      }
    }
  }
}

// Platform-curated teacher listings backing /dashboard/teachers. Fees are in
// PKR whole rupees — `formatCurrency` in @lurniva/utils renders them.
const TEACHERS: SeedTeacher[] = [
  {
    name: "Hassan Raza",
    headline: "Senior Mathematics Teacher",
    bio: "Board and entry-test maths, taught from first principles. Fifteen years of Calculus and Algebra with a focus on exam technique.",
    subjects: ["Maths", "Calculus", "Algebra"],
    monthlyFee: 49000,
    availability: "available",
    rating: 4.9,
    reviewCount: 128,
  },
  {
    name: "Amina Shah",
    headline: "English Literature Teacher",
    bio: "Reading comprehension, essay structure and confident communication for O and A Level students.",
    subjects: ["English", "Literature", "Essay Writing"],
    monthlyFee: 23000,
    availability: "limited",
    rating: 4.7,
    reviewCount: 94,
  },
  {
    name: "Bilal Ahmed",
    headline: "Physics & General Science Teacher",
    bio: "Makes mechanics and electromagnetism intuitive with real-world examples and strong conceptual grounding for grades 9-12.",
    subjects: ["Physics", "General Science"],
    monthlyFee: 12000,
    availability: "available",
    rating: 4.8,
    reviewCount: 76,
  },
  {
    name: "Sana Iqbal",
    headline: "Chemistry Teacher",
    bio: "Organic and physical chemistry with a lab-first approach. Past-paper drilling every fortnight.",
    subjects: ["Chemistry", "Organic Chemistry"],
    monthlyFee: 18500,
    availability: "available",
    rating: 4.6,
    reviewCount: 61,
  },
  {
    name: "Usman Tariq",
    headline: "Computer Science Teacher",
    bio: "Programming fundamentals, data structures and algorithms. Students ship a small project every term.",
    subjects: ["Computer Science", "Programming", "Algorithms"],
    monthlyFee: 32000,
    availability: "limited",
    rating: 4.9,
    reviewCount: 143,
  },
  {
    name: "Fatima Noor",
    headline: "Biology Teacher",
    bio: "Human physiology and genetics explained through diagrams and recall practice. MDCAT preparation included.",
    subjects: ["Biology", "Genetics"],
    monthlyFee: 21000,
    availability: "available",
    rating: 4.7,
    reviewCount: 88,
  },
  {
    name: "Imran Yousaf",
    headline: "Mathematics & Statistics Teacher",
    bio: "Statistics, probability and matrices for commerce and engineering tracks.",
    subjects: ["Maths", "Statistics"],
    monthlyFee: 26000,
    availability: "full",
    rating: 4.5,
    reviewCount: 52,
  },
  {
    name: "Hira Malik",
    headline: "Urdu Language Teacher",
    bio: "Grammar, prose and poetry with structured writing practice for board examinations.",
    subjects: ["Urdu", "Grammar"],
    monthlyFee: 9500,
    availability: "available",
    rating: 4.8,
    reviewCount: 39,
  },
  {
    name: "Zeeshan Haider",
    headline: "Physics Teacher — Entry Test Prep",
    bio: "Intensive ECAT and MDCAT physics. Timed sectionals every week with individual error analysis.",
    subjects: ["Physics", "Exam Prep"],
    monthlyFee: 41000,
    availability: "limited",
    rating: 4.9,
    reviewCount: 201,
  },
  {
    name: "Ayesha Kamal",
    headline: "Primary & Middle School Tutor",
    bio: "All-subject support for grades 4-8, with an emphasis on study habits and steady homework routines.",
    subjects: ["Maths", "General Science", "English"],
    monthlyFee: 8000,
    availability: "available",
    rating: 4.6,
    reviewCount: 27,
  },
  {
    name: "Danish Aslam",
    headline: "Accounting & Business Teacher",
    bio: "Financial accounting and business studies for commerce students, taught through real company statements.",
    subjects: ["Accounting", "Business Studies"],
    monthlyFee: 17500,
    availability: "available",
    rating: 4.4,
    reviewCount: 33,
  },
  {
    name: "Nimra Sheikh",
    headline: "Chemistry & Biology Teacher",
    bio: "Combined pre-medical coaching. Weekly concept tests and a shared revision notebook.",
    subjects: ["Chemistry", "Biology"],
    monthlyFee: 29000,
    availability: "limited",
    rating: 4.8,
    reviewCount: 117,
  },
  {
    name: "Kamran Javed",
    headline: "Islamiat & Pakistan Studies Teacher",
    bio: "Structured answer writing and source-based questions for board papers.",
    subjects: ["Islamiat", "Pakistan Studies"],
    monthlyFee: 7500,
    availability: "available",
    rating: 4.5,
    reviewCount: 44,
  },
  {
    name: "Rabia Anwar",
    headline: "Mathematics Teacher — O Level",
    bio: "Cambridge O Level maths from scratch, with topic-wise past papers from 2015 onward.",
    subjects: ["Maths", "Exam Prep"],
    monthlyFee: 34000,
    availability: "available",
    rating: 4.7,
    reviewCount: 96,
  },
];

async function seedTeachers() {
  for (const teacher of TEACHERS) {
    const existing = await prisma.teacher.findFirst({
      where: { name: teacher.name },
    });
    if (existing) continue;
    await prisma.teacher.create({
      data: {
        ...teacher,
        avatarUrl: null,
      },
    });
  }
}

seedCatalog()
  .then(seedTeachers)
  .then(() => {
    console.log("Catalog and teachers seeded.");
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
