"use client";

import { Avatar } from "./avatar.js";
import { Badge } from "./badge.js";
import { Button } from "./button.js";
import { cn } from "./cn.js";
import { Icon } from "./icon.js";

export interface TeacherCardProps {
  name: string;
  subject: string;
  subscribers: string;
  lessons: string | number;
  verified?: boolean;
  following?: boolean;
  onToggleFollow?: () => void;
  avatarSrc?: string;
  className?: string;
}

/** A teacher's card in the marketplace grid — identity, reach, and a follow action. */
export function TeacherCard({
  name,
  subject,
  subscribers,
  lessons,
  verified = false,
  following = false,
  onToggleFollow,
  avatarSrc,
  className,
}: TeacherCardProps) {
  return (
    <div
      className={cn(
        "grid justify-items-center gap-4 rounded-card border border-border-subtle bg-surface-card p-6 text-center shadow-sm",
        className,
      )}
    >
      <Avatar name={name} src={avatarSrc} size="lg" role="teacher" />
      <div className="grid gap-1">
        <div className="flex items-center justify-center gap-1.5">
          <span className="font-display text-lg font-bold text-text-heading">
            {name}
          </span>
          {verified ? (
            <Badge tone="teacher" icon="badge-check">
              Verified
            </Badge>
          ) : null}
        </div>
        <div className="text-sm text-text-muted">{subject}</div>
      </div>
      <div className="flex gap-5 text-sm tabular-nums text-text-muted">
        <span>{subscribers} subscribers</span>
        <span>{lessons} lessons</span>
      </div>
      <Button
        variant={following ? "outline" : "secondary"}
        size="sm"
        icon={<Icon name={following ? "check" : "plus"} size={16} />}
        fullWidth
        onClick={onToggleFollow}
      >
        {following ? "Following" : "Follow"}
      </Button>
    </div>
  );
}