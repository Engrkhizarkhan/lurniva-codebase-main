import { Input, Select } from "@lurniva/ui";
import { DAILY_STUDY_HOURS_OPTIONS } from "../../../create-plan-types";
import type { UseBasicInfoFormResult } from "../../../hooks/useBasicInfoForm";

const DAILY_STUDY_HOURS_SELECT_OPTIONS = [
  { value: "", label: "Choose a daily study time" },
  ...DAILY_STUDY_HOURS_OPTIONS.map((hours) => ({
    value: String(hours),
    label: hours === 1 ? "1 hour a day" : `${hours} hours a day`,
  })),
];

interface StepBasicInfoProps {
  form: UseBasicInfoFormResult;
}

export function StepBasicInfo({ form }: StepBasicInfoProps) {
  return (
    <div className="grid gap-5 rounded-2xl border border-border-subtle bg-surface-raised p-6 shadow-sm">
      <Input
        label="Plan name"
        placeholder="e.g. JEE Physics Sprint"
        value={form.values.name ?? ""}
        onChange={(event) => form.setName(event.target.value)}
        onBlur={form.touchName}
        error={form.touched.name ? form.errors.name : undefined}
      />

      <Select
        label="Daily study time"
        options={DAILY_STUDY_HOURS_SELECT_OPTIONS}
        value={form.values.dailyStudyHours != null ? String(form.values.dailyStudyHours) : ""}
        onChange={(event) => {
          const hours = Number(event.target.value);
          if (!Number.isNaN(hours) && hours > 0) form.setDailyStudyHours(hours);
        }}
        error={form.touched.dailyStudyHours ? form.errors.dailyStudyHours : undefined}
      />
    </div>
  );
}
