import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import type { StepDirection } from "../../hooks/useStepNavigation";

interface StepTransitionProps {
  stepKey: number;
  direction: StepDirection;
  children: ReactNode;
  /** Called once the new step's content has actually mounted, i.e. after the previous step's exit animation finishes. */
  onExited?: () => void;
}

const variants = {
  enter: (direction: StepDirection) => ({
    opacity: 0,
    x: direction === "forward" ? 16 : -16,
  }),
  center: { opacity: 1, x: 0 },
  exit: (direction: StepDirection) => ({
    opacity: 0,
    x: direction === "forward" ? -16 : 16,
  }),
};

/** Animates the active step's content out/in — keeps the flow feeling like one conversation, not five pages. */
export function StepTransition({
  stepKey,
  direction,
  children,
  onExited,
}: StepTransitionProps) {
  return (
    <AnimatePresence
      mode="wait"
      custom={direction}
      initial={false}
      // With mode="wait" the new step doesn't mount until the old one's exit
      // animation finishes. onExitComplete fires right at that handoff, so we
      // wait a frame for the new content to actually paint before scrolling.
      onExitComplete={
        onExited ? () => requestAnimationFrame(onExited) : undefined
      }
    >
      <motion.div
        key={stepKey}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
