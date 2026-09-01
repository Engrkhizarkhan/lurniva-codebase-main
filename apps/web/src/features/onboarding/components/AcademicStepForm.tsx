import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { Button, Icon, Input, Select } from "@lurniva/ui";
import {
  gradeOptions,
  onboardingAcademicSchema,
  type OnboardingAcademicInput,
} from "../validation/index.js";
import { useOnboardingContext } from "../hooks/useOnboardingContext.js";
import { useOnboardingSubmit } from "../hooks/useOnboardingSubmit.js";

export function AcademicStepForm() {
  const navigate = useNavigate();
  const { draft, setAcademic } = useOnboardingContext();
  const { submit, isSubmitting, error } = useOnboardingSubmit();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingAcademicInput>({
    resolver: zodResolver(onboardingAcademicSchema),
    defaultValues: {
      grade: draft.academic.grade ?? gradeOptions[0]?.value,
      schoolName: draft.academic.schoolName ?? "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setAcademic(data);
    await submit(data);
  });

  return (
    <div className="grid gap-4.5">
      <div className="grid gap-1">
        <h2 className="font-display text-2xl font-bold text-text-heading">
          Academic details
        </h2>
        <p className="text-sm text-text-muted">
          Help us understand your educational background.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="grid gap-4.5">
        <Select
          label="Select your grade"
          options={gradeOptions.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          error={errors.grade?.message}
          {...register("grade")}
        />
        <Input
          label="School name (Optional)"
          placeholder="Enter your school name"
          icon={<Icon name="school" size={16} />}
          error={errors.schoolName?.message}
          {...register("schoolName")}
        />
        {error ? (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        ) : null}

        <div className="mt-2 flex justify-between">
          <Button
            type="button"
            variant="outline"
            icon={<Icon name="arrow-left" size={16} />}
            onClick={() =>
              navigate({ to: "/onboarding/profile", viewTransition: true })
            }
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            iconAfter={<Icon name="check" size={16} />}
          >
            {isSubmitting ? "Finishing…" : "Finish"}
          </Button>
        </div>
      </form>
    </div>
  );
}
