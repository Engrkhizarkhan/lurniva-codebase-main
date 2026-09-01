export interface FeaturedTeacher {
  name: string;
  subject: string;
  subscribers: string;
  lessons: number;
  verified?: boolean;
}

export const featuredTeachers: FeaturedTeacher[] = [
  { name: "Hamza Iqbal", subject: "Physics · Cambridge IGCSE", subscribers: "18.4k", lessons: 212, verified: true },
  { name: "Nida Rehman", subject: "Biology · O Level", subscribers: "9.7k", lessons: 164, verified: true },
  { name: "Ali Raza", subject: "Mathematics · A Level", subscribers: "24.1k", lessons: 308, verified: true },
  { name: "Sara Baig", subject: "Chemistry · NCP Grade 9–12", subscribers: "6.2k", lessons: 98 },
];
