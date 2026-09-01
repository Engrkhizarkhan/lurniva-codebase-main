import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { Button, Divider, Icon, Input } from "@lurniva/ui";
import { signInSchema, type SignInInput } from "@lurniva/validation";
import { useSignIn } from "../hooks/useSignIn.js";
import { GoogleSignUpButton } from "./GoogleSignUpButton.js";

export function SignInForm() {
  const { signIn, isSubmitting, error } = useSignIn();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit((data) => signIn(data));

  return (
    <div className="grid gap-4.5">
      <div className="grid gap-1">
        <h2 className="font-display text-2xl font-bold text-text-heading">
          Welcome back
        </h2>
        <p className="text-sm text-text-muted">Log in to keep learning.</p>
      </div>
      <GoogleSignUpButton isSignup={false} />
      <Divider label="or" />

      <form onSubmit={onSubmit} noValidate className="grid gap-4.5">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          icon={<Icon name="mail" size={16} />}
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          icon={<Icon name="lock" size={16} />}
          error={errors.password?.message}
          {...register("password")}
        />
        {error ? (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        ) : null}
        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <p className="text-center text-sm text-text-muted">
        Don&apos;t have an account?{" "}
        <Link
          to="/sign-up"
          className="text-text-link hover:text-text-link-hover"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
