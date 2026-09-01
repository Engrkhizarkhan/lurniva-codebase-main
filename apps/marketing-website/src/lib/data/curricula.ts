export interface Curriculum {
  id: string;
  name: string;
  status: "Live" | "Coming soon";
  levels: string;
  coverage: number;
  subjects: string[];
  courses: string[];
}

export const curricula: Curriculum[] = [
  {
    id: "cambridge",
    name: "Cambridge International",
    status: "Live",
    levels: "IGCSE · AS · A Level",
    coverage: 92,
    subjects: [
      "Biology 0610",
      "Chemistry 0620",
      "Physics 0625",
      "Mathematics 0580",
      "Economics 0455",
      "Computer Science 0478",
    ],
    courses: [
      "IGCSE Biology — full syllabus, 14 chapters",
      "AS Physics 9702 — paper 1 and 2 practice",
    ],
  },
  {
    id: "ncp",
    name: "National Curriculum of Pakistan",
    status: "Live",
    levels: "Grade 6–12 · FSc",
    coverage: 78,
    subjects: [
      "Biology",
      "Chemistry",
      "Physics",
      "Mathematics",
      "Computer Science",
      "English",
    ],
    courses: ["FSc Part 1 Physics — Punjab board", "Grade 9 Mathematics — full year"],
  },
  {
    id: "snc",
    name: "Single National Curriculum",
    status: "Live",
    levels: "Grade 1–8",
    coverage: 64,
    subjects: ["General Science", "Mathematics", "English", "Social Studies"],
    courses: ["Grade 8 General Science", "Grade 6 Mathematics"],
  },
  {
    id: "oal",
    name: "O / A Levels",
    status: "Live",
    levels: "O Level · A Level",
    coverage: 86,
    subjects: [
      "Biology",
      "Chemistry",
      "Physics",
      "Mathematics",
      "Accounting",
      "Business",
    ],
    courses: [
      "O Level Chemistry — past paper drills",
      "A Level Mathematics — pure and mechanics",
    ],
  },
  {
    id: "ib",
    name: "International Baccalaureate",
    status: "Coming soon",
    levels: "MYP · DP",
    coverage: 0,
    subjects: ["DP Biology", "DP Mathematics AA", "MYP Sciences"],
    courses: ["DP subject guides — in development"],
  },
  {
    id: "more",
    name: "More systems",
    status: "Coming soon",
    levels: "Regional boards · vocational",
    coverage: 0,
    subjects: ["Tell us which board you need"],
    courses: ["Request a curriculum"],
  },
];
