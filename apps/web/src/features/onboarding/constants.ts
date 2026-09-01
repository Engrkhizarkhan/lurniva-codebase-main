/**
 * Set right before navigating to /onboarding/welcome and cleared once that
 * screen has mounted — lets the layout guard tell "just finished onboarding,
 * let the celebration render once" apart from "already onboarded, revisiting
 * /onboarding/welcome via back-button/bookmark/reload", which should bounce
 * to /dashboard like every other /onboarding/* route.
 */
export const ONBOARDING_JUST_COMPLETED_KEY = "lurniva-onboarding-just-completed";
