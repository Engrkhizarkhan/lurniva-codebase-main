"use client";

import { Fragment } from "react";
import { AIBadge } from "./ai-badge.js";
import { Button } from "./button.js";
import { cn } from "./cn.js";
import { Icon } from "./icon.js";

export interface AIAnswerCardProps {
  question?: string;
  answer?: string;
  keyPoints?: string[];
  sourceLabel?: string;
  onSave?: () => void;
  onPractice?: () => void;
  onFollowUp?: () => void;
  loading?: boolean;
  loadingLabel?: string;
  className?: string;
}

const loadingBarWidths = [92, 76, 58];

/** The AI Companion's answer surface — question, cited answer, key points and follow-on actions. */
export function AIAnswerCard({
  question,
  answer,
  keyPoints = [],
  sourceLabel,
  onSave,
  onPractice,
  onFollowUp,
  loading = false,
  loadingLabel = "Reading your lecture",
  className,
}: AIAnswerCardProps) {
  return (
    <div
      className={cn(
        "grid gap-4 overflow-hidden rounded-xl bg-surface-inverse p-6 text-cream-100",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <AIBadge dark label="Lurniva AI" />
        {sourceLabel ? (
          <span className="text-sm text-forest-300">{sourceLabel}</span>
        ) : null}
      </div>

      {question ? (
        <div className="font-display text-xl font-bold leading-snug">
          {question}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-2">
          <span className="text-base text-forest-300">
            {loadingLabel}&hellip;
          </span>
          {loadingBarWidths.map((width) => (
            <span
              key={width}
              style={{ width: `${width}%` }}
              className="h-3 animate-pulse rounded-pill bg-cream-100/10"
            />
          ))}
        </div>
      ) : (
        <Fragment>
          <p className="m-0 text-base leading-relaxed text-cream-100">
            {answer}
          </p>

          {keyPoints.length > 0 ? (
            <div className="grid gap-2.5 rounded-md bg-cream-100/[0.07] p-4">
              <div className="text-xs font-semibold uppercase tracking-caps text-lime-500">
                Key points
              </div>
              {keyPoints.map((point) => (
                <div key={point} className="flex gap-2.5 text-base leading-snug">
                  <Icon name="check" size={16} className="mt-0.5 shrink-0 text-lime-500" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2.5 pt-1">
            {onPractice ? (
              <Button variant="accent" size="sm" icon={<Icon name="target" size={16} />} onClick={onPractice}>
                Practise this
              </Button>
            ) : null}
            {onSave ? (
              <Button variant="outline" size="sm" icon={<Icon name="bookmark" size={16} />} onClick={onSave} className="border-cream-100/30 text-cream-100 hover:bg-cream-100/10">
                Save to notes
              </Button>
            ) : null}
            {onFollowUp ? (
              <Button variant="ghost" size="sm" icon={<Icon name="message-circle" size={16} />} onClick={onFollowUp} className="text-cream-100 hover:bg-cream-100/10">
                Follow-up
              </Button>
            ) : null}
          </div>
        </Fragment>
      )}
    </div>
  );
}