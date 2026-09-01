import { createFileRoute, redirect } from "@tanstack/react-router";
import { SignUpForm } from "~/features/auth/components/SignUpForm";
import { getAuthContext } from "~/utils/supabase/server";

export const Route = createFileRoute("/sign-up")({
  beforeLoad: async () => {
    const { user, isOnboarded } = await getAuthContext();
    if (user && isOnboarded) throw redirect({ to: "/dashboard" });
  },
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <section className="min-h-dvh w-full bg-surface-canvas lg:grid lg:grid-cols-[42%_58%]">
      {/* Form section */}
      <div className="flex items-center justify-center px-5 py-8 sm:px-8 lg:px-10">
        <div className="w-full max-w-105">
          {/* Brand */}
          <div className="mb-8">
            <span className="font-display text-xl font-extrabold tracking-tight text-text-heading">
              Lurniva
            </span>
          </div>

          {/* Form card */}
          <div className="rounded-card border border-border-subtle bg-surface-card p-6 shadow-sm sm:p-8">
            <SignUpForm />
          </div>

          {/* Supporting text */}
          <p className="mt-5 text-center text-xs leading-relaxed text-text-muted">
            By creating an account, you agree to our terms and privacy policy.
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
          {/* Main character glow */}
          <div className="absolute -bottom-[20%] right-[-10%] h-[75%] w-[75%] rounded-full bg-forest-500/30 blur-[120px]" />

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
              Learn smarter
            </p>

            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-text-on-primary xl:text-5xl">
              Learning that
              <br />
              adapts to you.
            </h1>

            <p className="mt-5 max-w-md text-sm leading-6 text-white/60 xl:text-base">
              Turn your learning material into a personalized experience
              designed around the way you learn.
            </p>
          </div>

          {/* Character stage */}
          <div className="relative flex flex-1 items-end justify-center">
            {/* Character spotlight */}
            <div
              aria-hidden="true"
              className="absolute bottom-[8%] left-1/2 h-[55%] w-[65%] -translate-x-1/2 rounded-full bg-lime-400/10 blur-[90px]"
            />

            <img
              src="https://ik.imagekit.io/bgsmyntdz/nova_character.png"
              alt="Nova, the Lurniva learning character"
              className="relative z-10 max-h-[62vh] w-auto max-w-[85%] object-contain drop-shadow-2xl"
            />
          </div>

          {/* Bottom message */}
          <div className="flex items-center justify-between border-t border-white/10 pt-5">
            <span className="text-xs text-white/40">
              Personalized learning, made simple.
            </span>

            <span className="h-2 w-2 rounded-full bg-lime-300/80 shadow-[0_0_12px_rgba(190,242,100,0.6)]" />
          </div>
        </div>
      </div>
    </section>
  );
}
