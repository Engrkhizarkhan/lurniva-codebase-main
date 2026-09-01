import { useRef, useState } from "react";
import { Popover } from "@mantine/core";
import { Button, cn } from "@lurniva/ui";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import ModeDropdown from "./mode-dropdown";
import type { StudyMode } from "./mode-dropdown";
import {
  getAssessmentFeatures,
  getFeatureToneClasses,
  getLearningFeatures,
} from "../constants/features";
import type { AiFeatureMeta } from "../constants/features";
import { useDayStudyStore } from "../store/day-study-store";

const SCROLL_STEP = 96;

export function StudyToolsMenu() {
  const [opened, setOpened] = useState(false);
  const [mode, setMode] = useState<StudyMode>("learning");
  const listRef = useRef<HTMLDivElement>(null);
  const setActiveFeature = useDayStudyStore((state) => state.setActiveFeature);

  const features =
    mode === "learning" ? getLearningFeatures() : getAssessmentFeatures();

  function handleSelect(feature: AiFeatureMeta) {
    setActiveFeature(feature.id);
    setOpened(false);
  }

  function scrollList(direction: 1 | -1) {
    listRef.current?.scrollBy({
      top: direction * SCROLL_STEP,
      behavior: "smooth",
    });
  }

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      offset={10}
      shadow="none"
      radius="lg"
      transitionProps={{ transition: "pop-top-right", duration: 180 }}
    >
      <Popover.Target>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setOpened((o) => !o)}
          icon={<Sparkles size={15} />}
          iconAfter={
            <ChevronDown
              size={14}
              className={cn(
                "transition-transform duration-200",
                opened && "rotate-180",
              )}
            />
          }
        >
          Study Mode
          <span className="ml-1 rounded-md bg-text-on-primary/15 px-1.5 py-0.5 text-xs font-semibold">
            {mode === "learning" ? "Learning" : "Assessment"}
          </span>
        </Button>
      </Popover.Target>

      <Popover.Dropdown className="w-105 rounded-card! border! border-border-subtle! bg-white! p-3! shadow-modal!">
        <div className="mb-3 px-1">
          <ModeDropdown value={mode} onChange={setMode} showLabel />
        </div>
        <div className="relative">
          <div ref={listRef} className="space-y-3 pr-7">
            {features.map((feature) => (
              <button
                key={feature.id}
                type="button"
                onClick={() => handleSelect(feature)}
                className="flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors duration-100 hover:bg-surface-subtle"
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    getFeatureToneClasses(feature.tone),
                  )}
                >
                  <feature.icon size={16} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-text-heading">
                    {feature.label}
                  </span>
                  <span className="block truncate text-xs text-text-muted">
                    {feature.description}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="absolute inset-y-0 right-0 flex w-6 flex-col items-center justify-between py-0.5">
            <button
              type="button"
              onClick={() => scrollList(-1)}
              aria-label="Scroll up"
              className="text-text-faint transition-colors duration-100 hover:text-text-muted"
            >
              <ChevronUp size={14} />
            </button>
            <span className="w-1 flex-1 rounded-full bg-border-default" />
            <button
              type="button"
              onClick={() => scrollList(1)}
              aria-label="Scroll down"
              className="text-text-faint transition-colors duration-100 hover:text-text-muted"
            >
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}
