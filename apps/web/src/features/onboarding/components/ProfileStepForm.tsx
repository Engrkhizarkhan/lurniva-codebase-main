import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useForm, useWatch } from "react-hook-form";
import { Button, Icon, Input } from "@lurniva/ui";
import {
  curriculumOptions,
  onboardingProfileSchema,
  type OnboardingProfileInput,
} from "../validation/index.js";
import { CurriculumOptionCard } from "./CurriculumOptionCard.js";
import { useOnboardingContext } from "../hooks/useOnboardingContext.js";

export function ProfileStepForm() {
  const navigate = useNavigate();
  const { draft, setProfile } = useOnboardingContext();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<OnboardingProfileInput>({
    resolver: zodResolver(onboardingProfileSchema),
    defaultValues: {
      fullName: draft.profile.fullName ?? "",
      curriculum: draft.profile.curriculum,
    },
  });
  const curriculum = useWatch({ control, name: "curriculum" });

  const onSubmit = handleSubmit((data) => {
    setProfile(data);
    navigate({ to: "/onboarding/academic", viewTransition: true });
  });

  return (
    <div className="grid gap-4.5">
      <div className="grid gap-1">
        <h2 className="font-display text-2xl font-bold text-text-heading">
          Tell us about yourself
        </h2>
        <p className="text-sm text-text-muted">
          This helps us personalize your experience.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="grid gap-4.5">
        <Input
          label="Full name"
          placeholder="Enter your full name"
          icon={<Icon name="user" size={16} />}
          error={errors.fullName?.message}
          {...register("fullName")}
        />

        <div className="grid gap-2.5">
          <span className="text-sm font-medium text-text-body">
            Choose your curriculum
          </span>
          <div className="flex flex-wrap gap-3">
            {curriculumOptions.map((option) => (
              <CurriculumOptionCard
                key={option.id}
                option={option}
                selected={curriculum === option.id}
                onSelect={(id) =>
                  setValue("curriculum", id, { shouldValidate: true })
                }
              />
            ))}
          </div>
          {errors.curriculum ? (
            <p role="alert" className="text-sm text-error">
              {errors.curriculum.message}
            </p>
          ) : null}
        </div>

        <div className="mt-2 flex justify-between">
          <Button
            type="button"
            variant="outline"
            icon={<Icon name="arrow-left" size={16} />}
            onClick={() => navigate({ to: "/sign-up" })}
          >
            Back
          </Button>
          <Button type="submit" iconAfter={<Icon name="arrow-right" size={16} />}>
            Next
          </Button>
        </div>
      </form>
    </div>
  );
}
