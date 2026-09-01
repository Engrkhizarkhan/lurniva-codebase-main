"use client";

import { useState } from "react";
import { TeacherCard } from "@lurniva/ui";
import { Reveal } from "@/components/motion/reveal";
import { featuredTeachers } from "@/lib/data/teachers";

/** Client island: each teacher card owns its own follow-toggle state. */
export function TeacherGrid() {
  const [following, setFollowing] = useState<Record<string, boolean>>({});

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {featuredTeachers.map((teacher, index) => (
        <Reveal key={teacher.name} index={index}>
          <TeacherCard
            name={teacher.name}
            subject={teacher.subject}
            subscribers={teacher.subscribers}
            lessons={teacher.lessons}
            verified={teacher.verified}
            following={Boolean(following[teacher.name])}
            onToggleFollow={() =>
              setFollowing((prev) => ({
                ...prev,
                [teacher.name]: !prev[teacher.name],
              }))
            }
          />
        </Reveal>
      ))}
    </div>
  );
}
