import { createFileRoute, redirect } from "@tanstack/react-router";
import { SignInForm } from "~/features/auth/components/SignInForm";
import { getAuthContext } from "~/utils/supabase/server";

const errorMessages: Record<string, string> = {
  "link-expired":
    "That verification link has expired or is invalid. Please sign in, or sign up again to get a new one.",
  "oauth-failed": "Google sign-in failed. Please try again.",
};

export const Route = createFileRoute("/sign-in")({
  validateSearch: (search: Record<string, unknown>): { error?: string } =>
    typeof search.error === "string" ? { error: search.error } : {},
  beforeLoad: async () => {
    const { user, isOnboarded } = await getAuthContext();
    if (user && isOnboarded) throw redirect({ to: "/dashboard" });
  },
  component: SignInPage,
});

function SignInPage() {
  const { error } = Route.useSearch();
  const banner = error ? errorMessages[error] : undefined;

  return (
    <section className="min-h-dvh w-full bg-surface-canvas lg:grid lg:grid-cols-[42%_58%]">
      {/* Sign-in section */}
      <div className="flex min-h-dvh items-center justify-center px-5 py-8 sm:px-8 lg:px-10">
        <div className="w-full max-w-[420px]">
          {/* Brand */}
          <div className="mb-8">
            <span className="font-display text-xl font-extrabold tracking-tight text-text-heading">
              Lurniva
            </span>
          </div>

          {banner ? (
            <p
              role="alert"
              className="mb-4 rounded-card border border-border-subtle bg-surface-card p-3 text-sm text-error"
            >
              {banner}
            </p>
          ) : null}

          {/* Sign-in card */}
          <div className="rounded-card border border-border-subtle bg-surface-card p-6 shadow-sm sm:p-8">
            <SignInForm />
          </div>

          {/* Supporting message */}
          <p className="mt-5 text-center text-xs leading-relaxed text-text-muted">
            Welcome back to Lurniva. Continue where you left off.
          </p>
        </div>
      </div>

      {/* Visual section */}
      <div className="relative hidden min-h-dvh overflow-hidden bg-primary lg:flex">
        {/* Ambient background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          {/* Main glow behind Zara */}
          <div className="absolute -bottom-[15%] right-[-10%] h-[75%] w-[75%] rounded-full bg-forest-500/30 blur-[120px]" />

          {/* Lime glow */}
          <div className="absolute bottom-[20%] left-[8%] h-72 w-72 rounded-full bg-lime-500/10 blur-[100px]" />

          {/* Upper ambient glow */}
          <div className="absolute right-[15%] top-[5%] h-56 w-56 rounded-full bg-forest-300/10 blur-[90px]" />

          {/* Decorative particles */}
          <span className="absolute left-[18%] top-[24%] h-1.5 w-1.5 rounded-full bg-lime-300/60" />
          <span className="absolute left-[35%] top-[14%] h-1 w-1 rounded-full bg-lime-100/50" />
          <span className="absolute right-[28%] top-[25%] h-1 w-1 rounded-full bg-amber-100/50" />
          <span className="absolute right-[10%] top-[42%] h-1.5 w-1.5 rounded-full bg-lime-300/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex w-full flex-col px-10 py-10 xl:px-16">
          {/* Heading */}
          <div className="max-w-xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Welcome back
            </p>

            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-text-on-primary xl:text-5xl">
              Your learning
              <br />
              journey continues.
            </h1>

            <p className="mt-5 max-w-md text-sm leading-6 text-white/60 xl:text-base">
              Pick up right where you left off and keep making progress with
              learning built around you.
            </p>
          </div>

          {/* Zara character */}
          <div className="relative flex flex-1 items-end justify-center">
            {/* Character spotlight */}
            <div
              aria-hidden="true"
              className="absolute bottom-[8%] left-1/2 h-[55%] w-[65%] -translate-x-1/2 rounded-full bg-lime-400/10 blur-[90px]"
            />

            <img
              src="https://ik.imagekit.io/bgsmyntdz/kai_character.png"
              alt="Zara, the Lurniva learning character"
              className="relative z-10 max-h-[62vh] w-auto max-w-[85%] object-contain drop-shadow-2xl"
            />
          </div>

          {/* Bottom message */}
          <div className="flex items-center justify-between border-t border-white/10 pt-5">
            <span className="text-xs text-white/40">
              Learn at your own pace.
            </span>

            <span className="h-2 w-2 rounded-full bg-lime-300/80 shadow-[0_0_12px_rgba(190,242,100,0.6)]" />
          </div>
        </div>
      </div>
    </section>
  );
}
