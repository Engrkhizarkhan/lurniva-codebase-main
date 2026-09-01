import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { Button, Divider, Icon, Input } from "@lurniva/ui";
import { signUpSchema, type SignUpInput } from "@lurniva/validation";
import { GoogleSignUpButton } from "./GoogleSignUpButton.js";
import { useSignUp } from "../hooks/useSignUp.js";
import CheckEmailPanel from "./check-email.js";

export function SignUpForm() {
  const { signUp, isSubmitting, error, status, email } = useSignUp();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit((data) => signUp(data));

  if (status === "check-email" && email) {
    return <CheckEmailPanel email={email} />;
  }

  return (
    <div className="grid gap-4.5">
      <div className="grid gap-1">
        <h2 className="font-display text-2xl font-bold text-text-heading">
          Create your account
        </h2>
        <p className="text-sm text-text-muted">
          Let&apos;s get to know you better.
        </p>
      </div>

      <GoogleSignUpButton isSignup={true} />
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
          placeholder="Create a strong password"
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
          {isSubmitting ? "Creating your account…" : "Create your account"}
        </Button>
      </form>

      <p className="text-center text-sm text-text-muted">
        Already have an account?{" "}
        <Link
          to="/sign-in"
          className="text-text-link hover:text-text-link-hover"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
