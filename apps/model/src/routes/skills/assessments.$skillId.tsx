import { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { createFileRoute, Link } from "@tanstack/react-router";
import { generateAssessment, getSkill } from "~/lib/client";
import type {
  AssessmentKind,
  GeneratedAssessment,
  SkillDoc,
} from "~/features/model/types";

export const Route = createFileRoute("/skills/assessments/$skillId")({
  component: AssessmentsPage,
});

const KINDS: { value: AssessmentKind; label: string }[] = [
  { value: "flashcards", label: "Flashcards" },
  { value: "mcqs", label: "Multiple choice" },
  { value: "short_questions", label: "Short questions" },
  { value: "mock_exam", label: "Mock exam" },
];

function AssessmentsPage() {
  const { skillId = "" } = useParams({ strict: false });
  const [skill, setSkill] = useState<SkillDoc | null>(null);
  const [kind, setKind] = useState<AssessmentKind>("mcqs");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<GeneratedAssessment | null>(
    null,
  );
  const [selection, setSelection] = useState<Record<string, string>>({});

  useEffect(() => {
    getSkill(skillId)
      .then(setSkill)
      .catch((err) => setError(err.message));
  }, [skillId]);

  async function onGenerate() {
    setBusy(true);
    setError(null);
    try {
      const generated = await generateAssessment(skillId, {
        kind,
        chapterIds: skill?.chapters.map((chapter) => chapter.id) ?? [],
      });
      setAssessment(generated);
      setSelection({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: 32 }}>
      <p>
        <Link to="/skills/$skillId" params={{ skillId: skillId }}>
          ← Back to skill
        </Link>
      </p>
      <h1 style={{ fontSize: 24 }}>Assessments</h1>

      <section
        className="card"
        style={{
          marginTop: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <select
          value={kind}
          onChange={(e) => setKind(e.currentTarget.value as AssessmentKind)}
        >
          {KINDS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <button
          className="btn"
          onClick={() => void onGenerate()}
          disabled={busy}
        >
          {busy ? "Generating..." : "Generate"}
        </button>
        {skill ? (
          <span className="chip">{skill.chapters.length} chapters</span>
        ) : null}
      </section>
      {error ? <p style={{ color: "#f87171" }}>{error}</p> : null}
      {busy ? (
        <p style={{ color: "#9ca3af" }}>
          Running the model on your chapters...
        </p>
      ) : null}

      {assessment ? (
        <section style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 20 }}>
            {assessment.questions.length} {assessment.kind.replace(/_/g, " ")}
          </h2>
          <div style={{ display: "grid", gap: 16 }}>
            {assessment.questions.map((question, index) => (
              <div key={question.id} className="card">
                <strong>
                  {index + 1}. {question.prompt}
                </strong>
                {question.options ? (
                  <div
                    style={{
                      display: "grid",
                      gap: 6,
                      marginTop: 10,
                      maxWidth: 520,
                    }}
                  >
                    {question.options.map((option, optionIndex) => {
                      const picked =
                        selection[question.id] === String(optionIndex);
                      return (
                        <button
                          key={option}
                          onClick={() =>
                            setSelection((prev) => ({
                              ...prev,
                              [question.id]: String(optionIndex),
                            }))
                          }
                          style={{
                            textAlign: "left",
                            background: picked ? "#1d4ed8" : "#111827",
                            color: "#e5e7eb",
                            border: "1px solid #2b3a52",
                            borderRadius: 8,
                            padding: 8,
                            cursor: "pointer",
                          }}
                        >
                          {String.fromCharCode(65 + optionIndex)}. {option}
                        </button>
                      );
                    })}
                  </div>
                ) : question.modelAnswer ? (
                  <details style={{ marginTop: 8 }}>
                    <summary style={{ cursor: "pointer" }}>
                      Reveal model answer
                    </summary>
                    <div style={{ color: "#cbd5e1", marginTop: 6 }}>
                      {question.modelAnswer}
                    </div>
                  </details>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
