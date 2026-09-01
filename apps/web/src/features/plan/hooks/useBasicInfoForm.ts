import { useState } from "react";
import type { BasicInfoDraft } from "../create-plan-types";

export interface BasicInfoErrors {
  name?: string;
  dailyStudyHours?: string;
}

function validate(values: Partial<BasicInfoDraft>): BasicInfoErrors {
  const errors: BasicInfoErrors = {};
  if (!values.name?.trim()) {
    errors.name = "Give your plan a name so you can find it later.";
  }
  if (values.dailyStudyHours == null) {
    errors.dailyStudyHours = "Choose how much time you want to study each day.";
  }
  return errors;
}

export interface UseBasicInfoFormResult {
  values: Partial<BasicInfoDraft>;
  errors: BasicInfoErrors;
  touched: { name: boolean; dailyStudyHours: boolean };
  setName: (name: string) => void;
  setDailyStudyHours: (hours: number) => void;
  touchName: () => void;
  isValid: boolean;
}

export function useBasicInfoForm(
  draft: Partial<BasicInfoDraft>,
  onChange: (basicInfo: Partial<BasicInfoDraft>) => void,
): UseBasicInfoFormResult {
  const [touched, setTouched] = useState({ name: false, dailyStudyHours: false });
  const errors = validate(draft);

  function setName(name: string) {
    onChange({ name });
  }

  function setDailyStudyHours(dailyStudyHours: number) {
    setTouched((current) => ({ ...current, dailyStudyHours: true }));
    onChange({ dailyStudyHours });
  }

  function touchName() {
    setTouched((current) => ({ ...current, name: true }));
  }

  return {
    values: draft,
    errors,
    touched,
    setName,
    setDailyStudyHours,
    touchName,
    isValid: Object.keys(errors).length === 0,
  };
}
