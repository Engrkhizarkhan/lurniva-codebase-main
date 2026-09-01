import { useState } from "react";
import { Popover } from "@mantine/core";
import { cn } from "@lurniva/ui";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { getFeatureToneClasses } from "../constants/features";
import type { AiResponseStyle } from "../types";
import { RESPONSE_STYLES, RESPONSE_STYLE_BY_ID } from "../constants/response-styles";

interface ResponseStyleMenuProps {
  /** `null` until the student picks one — the trigger shows the placeholder. */
  value: AiResponseStyle | null;
  disabled?: boolean;
  onChange: (style: AiResponseStyle) => void;
}

/**
 * How the student wants the next answer delivered. It sits inside the composer,
 * beside the question it will shape, and the trigger names the current choice
 * rather than the control — so once a style is picked the setting is legible
 * without opening the menu.
 */
export function ResponseStyleMenu({
  value,
  disabled = false,
  onChange,
}: ResponseStyleMenuProps) {
  const [opened, setOpened] = useState(false);
  const active = value ? RESPONSE_STYLE_BY_ID[value] : null;
  const TriggerIcon = active?.icon ?? SlidersHorizontal;

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="top-start"
      offset={8}
      shadow="none"
      radius="lg"
      transitionProps={{ transition: "pop-bottom-left", duration: 150 }}
    >
      <Popover.Target>
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="menu"
          aria-expanded={opened}
          aria-label="Response style"
          onClick={() => setOpened((current) => !current)}
          className={cn(
            "inline-flex h-9 min-w-0 items-center gap-1.5 rounded-control border border-border-default bg-white px-2.5 text-sm",
            "transition-colors duration-150 hover:bg-surface-sunken",
            "disabled:cursor-not-allowed disabled:opacity-50",
            active ? "font-semibold text-text-heading" : "text-text-muted",
          )}
        >
          <TriggerIcon size={14} className="shrink-0" />
          <span className="max-w-36 truncate">
            {active ? active.label : "Response style"}
          </span>
          <ChevronDown
            size={14}
            className={cn(
              "shrink-0 transition-transform duration-200",
              opened && "rotate-180",
            )}
          />
        </button>
      </Popover.Target>

      <Popover.Dropdown className="w-[min(20rem,calc(100vw-2rem))] rounded-card! border! border-border-subtle! bg-white! p-2! shadow-modal!">
        <div role="menu" aria-label="Response style" className="grid gap-0.5">
          {RESPONSE_STYLES.map((style) => {
            const selected = style.id === value;
            return (
              <button
                key={style.id}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => {
                  onChange(style.id);
                  setOpened(false);
                }}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors duration-100 hover:bg-surface-subtle",
                  selected && "bg-surface-subtle ring-1 ring-border-default",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    getFeatureToneClasses(style.tone),
                  )}
                >
                  <style.icon size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-text-heading">
                    {style.label}
                  </span>
                  <span className="block text-xs text-text-muted">
                    {style.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}
