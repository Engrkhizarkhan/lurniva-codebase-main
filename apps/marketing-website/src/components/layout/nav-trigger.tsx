import { Icon } from "@lurniva/ui";

export interface NavTriggerProps {
  label: string;
  active: boolean;
  onEnter: () => void;
}

export function NavTrigger({ label, active, onEnter }: NavTriggerProps) {
  return (
    <button
      type="button"
      onMouseEnter={onEnter}
      onFocus={onEnter}
      aria-expanded={active}
      className={`flex items-center gap-1 rounded-control px-3 py-2.5 text-[15px] font-medium transition-colors ${
        active
          ? "bg-surface-sunken text-text-heading"
          : "text-text-heading hover:bg-surface-sunken"
      }`}
    >
      {label}
      <Icon
        name="chevron-down"
        size={15}
        className={`transition-transform ${active ? "rotate-180" : ""}`}
      />
    </button>
  );
}
