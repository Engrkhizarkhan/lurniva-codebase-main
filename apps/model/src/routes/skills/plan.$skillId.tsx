import { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { createFileRoute, Link } from "@tanstack/react-router";
import { buildPlan, getSkill } from "~/lib/client";
import type { LearningPlan, SkillDoc } from "~/features/model/types";

export const Route = createFileRoute("/skills/plan/$skillId")({
  component: PlanPage,
});

function PlanPage() {
  const { skillId = "" } = useParams({ strict: false });
  const [skill, setSkill] = useState<SkillDoc | null>(null);
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [timeline, setTimeline] = useState<"auto" | "manual">("auto");
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [daysPerWeek, setDaysPerWeek] = useState(2);
  const [totalDays, setTotalDays] = useState(4);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSkill(skillId)
      .then(setSkill)
      .catch((err) => setError(err.message));
  }, [skillId]);

  async function onBuild() {
    setBusy(true);
    setError(null);
    try {
      setPlan(
        await buildPlan(skillId, {
          timeline,
          hoursPerDay,
          daysPerWeek,
          totalDays,
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to build plan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: 32 }}>
      <p>
        <Link to="/skills/$skillId" params={{ skillId: skillId }}>
          ← {skill?.title ?? "Skill"}
        </Link>
      </p>
      <h1 style={{ fontSize: 24 }}>Build study plan</h1>

      <section className="card" style={{ marginTop: 16 }}>
        <div style={{ display: "grid", gap: 12, maxWidth: 420 }}>
          <label>
            Timeline
            <select
              value={timeline}
              onChange={(e) =>
                setTimeline(e.currentTarget.value as "auto" | "manual")
              }
              style={{ width: "100%", marginTop: 4 }}
            >
              <option value="auto">Auto — spread chapters over N days</option>
              <option value="manual">Manual — one chapter per day</option>
            </select>
          </label>
          <label>
            Hours per day
            <input
              type="number"
              min={1}
              max={12}
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.currentTarget.value))}
              style={{ width: "100%", marginTop: 4 }}
            />
          </label>
          {timeline === "auto" ? (
            <>
              <label>
                Days per week
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={daysPerWeek}
                  onChange={(e) =>
                    setDaysPerWeek(Number(e.currentTarget.value))
                  }
                  style={{ width: "100%", marginTop: 4 }}
                />
              </label>
              <label>
                Total days
                <input
                  type="number"
                  min={1}
                  value={totalDays}
                  onChange={(e) => setTotalDays(Number(e.currentTarget.value))}
                  style={{ width: "100%", marginTop: 4 }}
                />
              </label>
            </>
          ) : null}
        </div>
        {error ? <p style={{ color: "#f87171" }}>{error}</p> : null}
        <button
          className="btn"
          style={{ marginTop: 12 }}
          onClick={() => void onBuild()}
          disabled={busy}
        >
          {busy ? "Building..." : "Generate plan"}
        </button>
      </section>

      {plan ? (
        <section style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 20 }}>
            {plan.title} <span className="chip">{plan.timeline}</span>
          </h2>
          <p style={{ color: "#9ca3af" }}>
            {plan.startDate} → {plan.endDate} · {plan.hoursPerDay}h/day ·{" "}
            {plan.totalDays} days
          </p>
          <div style={{ display: "grid", gap: 12 }}>
            {plan.days.map((day) => (
              <div key={day.dayNumber} className="card">
                <strong>{day.label}</strong> · {day.title}
                <div style={{ color: "#9ca3af", fontSize: 13 }}>
                  {day.durationMinutes} min
                  {skill?.chapters.length
                    ? " · " +
                      skill.chapters
                        .filter((chapter) => day.chapters.includes(chapter.id))
                        .map((chapter) => chapter.title)
                        .join(", ")
                    : (day.chapterId ?? "")}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
