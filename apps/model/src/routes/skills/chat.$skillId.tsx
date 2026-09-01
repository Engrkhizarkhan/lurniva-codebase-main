import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { createFileRoute, Link } from "@tanstack/react-router";
import { querySkill, type QueryResult } from "~/lib/client";

export const Route = createFileRoute("/skills/chat/$skillId")({
  component: ChatPage,
});

function ChatPage() {
  const { skillId = "" } = useParams({ strict: false });
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thread, setThread] = useState<QueryResult[]>([]);

  async function ask(text: string) {
    setBusy(true);
    setError(null);
    try {
      const result = await querySkill(skillId, {
        question: text,
        history: thread.flatMap((entry) => [
          { role: "user" as const, content: entry.question },
          { role: "assistant" as const, content: entry.answer },
        ]),
      });
      setThread((prev) => [...prev, result]);
      setQuestion("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to answer.");
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
      <h1 style={{ fontSize: 24 }}>Study chat</h1>
      <p style={{ color: "#9ca3af" }}>
        Questions are routed to the most relevant distilled chapters, then
        answered from that content — grounded, not hallucinated.
      </p>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && question.trim() && !busy)
              void ask(question.trim());
          }}
          placeholder="Ask anything about this material..."
          style={{ flex: 1 }}
        />
        <button
          className="btn"
          onClick={() => void ask(question.trim())}
          disabled={busy || !question.trim()}
        >
          {busy ? "..." : "Ask"}
        </button>
      </div>
      {error ? <p style={{ color: "#f87171" }}>{error}</p> : null}

      <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
        {thread.map((entry) => (
          <div key={entry.id} className="card">
            <strong style={{ color: "#60a5fa" }}>Q: {entry.question}</strong>
            <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>
              {entry.answer}
            </div>
            {entry.keyPoints.length ? (
              <div style={{ marginTop: 8 }}>
                <strong style={{ fontSize: 13 }}>Key points</strong>
                <ul
                  style={{ margin: "6px 0 0", paddingLeft: 20, fontSize: 14 }}
                >
                  {entry.keyPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div style={{ marginTop: 8, color: "#9ca3af", fontSize: 12 }}>
              Sources: {entry.sources.join(", ")}
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginTop: 12,
              }}
            >
              {entry.followUps.map((followUp) => (
                <button
                  key={followUp.id}
                  className="chip"
                  style={{ cursor: "pointer" }}
                  onClick={() => void ask(followUp.prompt)}
                >
                  {followUp.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
