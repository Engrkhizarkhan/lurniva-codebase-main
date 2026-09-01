import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createSkill, getHandshake, listSkills } from "~/lib/client";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handshake, setHandshake] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<{
    modelName: string | null;
    baseUrl: string;
    configured: boolean;
  } | null>(null);
  const [skills, setSkills] = useState<Awaited<ReturnType<typeof listSkills>>>(
    [],
  );
  const [createdId, setCreatedId] = useState<string | null>(null);

  async function refresh() {
    try {
      const info = await getHandshake();
      setModelInfo(info);
      setHandshake(info.message);
    } catch {
      setHandshake("Could not reach the model API.");
    }
    try {
      setSkills(await listSkills());
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(timer);
  }, []);

  async function onCreate() {
    setError(null);
    setCreatedId(null);
    if (content.trim().length < 40) {
      setError("Add at least a paragraph of content to structure.");
      return;
    }
    setBusy(true);
    try {
      const skill = await createSkill(title || undefined, content);
      setCreatedId(skill.id);
      setContent("");
      await refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to structure content.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: 32 }}>
      <header>
        <h1 style={{ fontSize: 26 }}>Lurniva &middot; Model Service</h1>
        <p style={{ color: "#9ca3af" }}>
          A <strong>book-to-skill</strong> style engine. Paste any content and
          it is distilled into a structured skill &mdash; overview, on-demand
          chapters, glossary, patterns, and a cheat sheet &mdash; then turned
          into plans, chat answers, and assessments.
        </p>
        {modelInfo ? (
          <p>
            <span className="chip">
              {modelInfo.modelName
                ? `model: ${modelInfo.modelName}`
                : "no model configured"}
            </span>{" "}
            <span className="chip">{modelInfo.baseUrl}</span>
            {modelInfo.configured ? null : (
              <span
                style={{ color: "#f1c40f", display: "block", fontSize: 13 }}
              >
                {handshake}
              </span>
            )}
          </p>
        ) : (
          <p style={{ color: "#9ca3af" }}>{handshake ?? "checking..."}</p>
        )}
      </header>

      <section className="card" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18 }}>
          1 &middot; Structure content into a skill
        </h2>
        <input
          value={title}
          onChange={(event) => setTitle(event.currentTarget.value)}
          placeholder="Title (optional)"
          style={{ width: "100%", marginBottom: 10 }}
        />
        <textarea
          value={content}
          onChange={(event) => setContent(event.currentTarget.value)}
          placeholder="Paste a study chapter, article, docs, or any body of knowledge here..."
          rows={10}
          style={{ width: "100%", resize: "vertical" }}
        />
        {error ? <p style={{ color: "#f87171" }}>{error}</p> : null}
        <button className="btn" onClick={onCreate} disabled={busy}>
          {busy ? "Structuring..." : "Distill into a skill"}
        </button>
        {createdId ? (
          <p>
            Created.{" "}
            <Link to="/skills/$skillId" params={{ skillId: createdId }}>
              Open it
            </Link>
          </p>
        ) : null}
      </section>

      <section className="card" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18 }}>
          Existing skills <span className="chip">{skills.length}</span>
        </h2>
        {skills.length === 0 ? (
          <p style={{ color: "#9ca3af", fontSize: 14 }}>
            No skills yet. Distill your first above.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {skills.map((skill) => (
              <li
                key={skill.id}
                style={{ padding: 10, borderBottom: "1px solid #233043" }}
              >
                <Link to="/skills/$skillId" params={{ skillId: skill.id }}>
                  <strong>{skill.title}</strong>
                </Link>{" "}
                <span className="chip">{skill.chapterCount} chapters</span>{" "}
                <span className="chip">
                  {new Date(skill.createdAt).toLocaleString()}
                </span>
                <div style={{ color: "#9ca3af", fontSize: 13 }}>
                  {skill.overview}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
