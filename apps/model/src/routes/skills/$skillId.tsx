import { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getSkill } from "~/lib/client";
import type { SkillDoc } from "~/features/model/types";

export const Route = createFileRoute("/skills/$skillId")({
  component: SkillPage,
});

function SkillPage() {
  const { skillId = "" } = useParams({ strict: false });
  const [skill, setSkill] = useState<SkillDoc | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSkill(skillId)
      .then(setSkill)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load skill."),
      );
  }, [skillId]);

  if (error)
    return (
      <div style={{ padding: 32 }}>
        <p>
          <Link to="/">← All skills</Link>
        </p>
        <p>Error&nbsp;: {error}</p>
      </div>
    );
  if (!skill) return <div style={{ padding: 32 }}>Loading skill...</div>;

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: 32 }}>
      <p>
        <Link to="/">← All skills</Link>
      </p>
      <h1 style={{ fontSize: 24 }}>{skill.title}</h1>
      <p style={{ color: "#9ca3af", fontSize: 14 }}>
        Distilled {new Date(skill.createdAt).toLocaleString()} &middot;{" "}
        {skill.chapters.length} chapters &middot; {skill.patterns.length}{" "}
        patterns &middot; {skill.glossary.length} glossary terms
      </p>

      <div style={{ display: "flex", gap: 12, margin: "16px 0" }}>
        <Link
          className="btn"
          to="/skills/plan/$skillId"
          params={{ skillId: skill.id }}
        >
          Build a plan
        </Link>
        <Link
          className="btn"
          to="/skills/chat/$skillId"
          params={{ skillId: skill.id }}
        >
          Study chat
        </Link>
        <Link
          className="btn"
          to="/skills/assessments/$skillId"
          params={{ skillId: skill.id }}
        >
          Assessments
        </Link>
      </div>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 18 }}>Overview</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>{skill.overview}</p>
      </section>

      {skill.cheatsheet ? (
        <section className="card" style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 18 }}>Cheat sheet</h2>
          <pre style={{ whiteSpace: "pre-wrap", color: "#d1d5db" }}>
            {skill.cheatsheet}
          </pre>
        </section>
      ) : null}

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 18 }}>Chapters (loaded on demand)</h2>
        <div style={{ display: "grid", gap: 8 }}>
          {skill.chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              style={{
                border: "1px solid #233043",
                borderRadius: 8,
                padding: 12,
              }}
            >
              <strong>
                {index + 1}. {chapter.title}
              </strong>
              <div>
                {chapter.topics.map((topic) => (
                  <span key={topic} className="chip">
                    {topic}
                  </span>
                ))}
              </div>
              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: "pointer", fontSize: 14 }}>
                  Show chapter content
                </summary>
                <pre style={{ whiteSpace: "pre-wrap", color: "#d1d5db" }}>
                  {chapter.content}
                </pre>
              </details>
            </div>
          ))}
        </div>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 18 }}>Patterns / frameworks</h2>
        <ul style={{ paddingLeft: 20 }}>
          {skill.patterns.map((pattern) => (
            <li key={pattern.name} style={{ marginBottom: 8 }}>
              <strong>{pattern.name}</strong>{" "}
              <span className="chip">{pattern.kind}</span>
              <div style={{ color: "#cbd5e1", fontSize: 14 }}>
                {pattern.description}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 18 }}>Glossary</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {skill.glossary.map((entry) => (
            <li
              key={entry.term}
              style={{ padding: 8, borderBottom: "1px solid #233043" }}
            >
              <strong>{entry.term}</strong>
              <span style={{ color: "#9ca3af", fontSize: 12 }}>
                {" "}
                · {entry.chapterIds.join(", ")}
              </span>
              <div style={{ color: "#cbd5e1", fontSize: 14 }}>
                {entry.definition}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
