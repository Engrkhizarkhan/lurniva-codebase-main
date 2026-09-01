import { Icon } from "@lurniva/ui";
import type { IconName } from "@lurniva/ui";

interface OrbitNode {
  label: string;
  sublabel: string;
  icon: IconName;
  iconBg: string;
  iconFg: string;
  position: string;
  delay: string;
}

const orbitNodes: OrbitNode[] = [
  {
    label: "Student",
    sublabel: "Asks, practises, retains",
    icon: "graduation-cap",
    iconBg: "bg-ember-050",
    iconFg: "text-ember-600",
    position: "left-0 top-10",
    delay: "0s",
  },
  {
    label: "Teacher",
    sublabel: "Uploads, teaches, earns",
    icon: "presentation",
    iconBg: "bg-teal-100",
    iconFg: "text-teal-600",
    position: "right-0 top-10",
    delay: "0.8s",
  },
  {
    label: "Institution",
    sublabel: "Own content, own students",
    icon: "building-2",
    iconBg: "bg-forest-050",
    iconFg: "text-forest-700",
    position: "left-1/2 bottom-4 -translate-x-1/2",
    delay: "1.6s",
  },
];

const spokes = [
  // Center → Student
  "M280 260 L110 96",

  // Center → Teacher
  "M280 260 L450 96",

  // Center → Institution
  "M280 260 L280 450",
];

/** The hero's animated triangular hub-and-spoke diagram. */
export function HeroOrbit() {
  return (
    <div className="relative h-[420px] min-w-0 sm:h-[520px] sm:min-w-[420px]">
      <svg
        viewBox="0 0 560 520"
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        {/* Base spokes */}
        <g
          stroke="var(--color-forest-500)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.85"
        >
          {spokes.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>

        {/* Animated highlights */}
        <g
          stroke="var(--color-lime-500)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="6 154"
          style={{
            animation: "lv-dash 3.2s linear infinite",
          }}
        >
          {spokes.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </svg>

      {/* Lurniva AI */}
      <div className="absolute top-1/2 left-1/2 grid size-[186px] -translate-x-1/2 -translate-y-1/2 place-items-center gap-1.5 rounded-full border border-lime-500 bg-forest-700 shadow-[0_0_0_12px_rgba(209,249,65,0.06)]">
        <Icon name="sparkles" size={28} className="text-lime-500" />

        <span className="font-display text-lg font-extrabold text-cream-100">
          Lurniva AI
        </span>

        <span className="text-xs font-semibold tracking-caps text-forest-300 uppercase">
          Understands content
        </span>
      </div>

      {/* Orbit nodes */}
      {orbitNodes.map((node) => (
        <div
          key={node.label}
          style={{
            animation: `lv-float 6s ease-in-out ${node.delay} infinite`,
          }}
          className={`absolute ${node.position} flex items-center gap-2.5 rounded-md bg-surface-card px-3.5 py-3 shadow-md`}
        >
          <span
            className={`grid size-8 place-items-center rounded-full ${node.iconBg} ${node.iconFg}`}
          >
            <Icon name={node.icon} size={18} />
          </span>

          <span className="grid">
            <span className="text-sm font-semibold text-text-heading">
              {node.label}
            </span>

            <span className="text-xs text-text-muted">{node.sublabel}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
