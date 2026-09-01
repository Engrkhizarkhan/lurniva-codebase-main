"use client";

import { AIAnswerCard, Icon } from "@lurniva/ui";
import { aiKeyPoints } from "@/lib/data/student-capabilities";

/** The AI Companion chat mock — its own client boundary so the demo's save/practise
 * handlers can be plain closures instead of Server Actions. */
export function StudentChatDemo() {
  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-card shadow-md">
      <div className="flex items-center justify-between gap-3 bg-cream-050 px-4.5 py-3.5 shadow-[inset_0_-1px_0_rgb(3_56_36_/_8%)]">
        <span className="flex items-center gap-2.5 text-sm text-text-muted">
          <Icon name="book-open" size={16} />
          Biology · Chapter 4 — Cell energetics
        </span>
        <span className="text-xs font-semibold text-text-muted">
          Cambridge IGCSE
        </span>
      </div>
      <div className="grid gap-3.5 bg-cream-050 p-4.5">
        <div className="max-w-[78%] justify-self-end rounded-control border border-border-subtle bg-surface-card px-3.5 py-3 text-[15px] leading-relaxed text-text-body">
          Why does the mitochondrion have folded inner membranes?
        </div>
        <AIAnswerCard
          question="Why the inner membrane is folded"
          answer="The folds — cristae — increase the surface area available for the electron transport chain, so more ATP can be produced per mitochondrion. Your chapter shows this on page 61."
          sourceLabel="From: Biology Ch.4 · p.61"
          keyPoints={aiKeyPoints}
          onSave={() => {}}
          onPractice={() => {}}
        />
        <div className="flex items-center gap-2.5 rounded-pill border border-border-default bg-surface-card px-4 py-2.5">
          <Icon name="sparkles" size={17} />
          <span className="flex-1 text-[15px] text-text-faint">
            Ask about this chapter
          </span>
          <span className="font-mono text-xs text-text-faint">⌘K</span>
        </div>
      </div>
    </div>
  );
}
