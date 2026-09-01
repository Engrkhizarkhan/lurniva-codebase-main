import { FileText, Layers, MessageCircle, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface AiTile {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

const TILES: AiTile[] = [
  { icon: MessageCircle, title: "Ask AI", subtitle: "Get instant answers" },
  { icon: FileText, title: "Summarize", subtitle: "Summarize any topic" },
  { icon: Layers, title: "Practice", subtitle: "MCQs, flashcards & more" },
];

/** Purely presentational preview of the AI assistant — none of these flows exist yet. */
export function AiAssistantBanner() {
  return (
    <div className="flex flex-col gap-5 rounded-card bg-surface-inverse p-6 text-text-on-primary sm:flex-row sm:items-center sm:gap-6">
      <div className="flex items-center gap-3 sm:w-56 sm:shrink-0">
        <Sparkles size={20} className="text-accent" />
        <div className="flex flex-col gap-0.5">
          <span className="font-display text-sm font-bold">AI study assistant</span>
          <span className="text-xs text-cream-100/70">
            Learn smarter with AI by your side
          </span>
        </div>
      </div>
      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
        {TILES.map((tile) => (
          <div
            key={tile.title}
            className="flex items-center gap-2.5 rounded-lg bg-white/8 px-4 py-3"
          >
            <tile.icon size={18} className="shrink-0 text-accent" />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold">{tile.title}</span>
              <span className="text-[11px] text-cream-100/60">
                {tile.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
