import { Bot } from "lucide-react";

interface AiGreetingsProps {
  userName: string;
}

const AiGreetings = ({ userName }: AiGreetingsProps) => {
  return (
    <>
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: "var(--radius-pill)",
          background: "var(--role-ai-soft)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Bot size={40} color="var(--color-forest-700)" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 18, color: "var(--text-body)" }}>
          Hello, {userName} 👋
        </span>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 30,
            lineHeight: "var(--lh-heading)",
            letterSpacing: "var(--track-heading)",
            color: "var(--text-heading)",
            margin: 0,
          }}
        >
          How can I help you study today?
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0 }}>
          Ask anything about your study set or choose an option below.
        </p>
      </div>
    </>
  );
};

export default AiGreetings;
