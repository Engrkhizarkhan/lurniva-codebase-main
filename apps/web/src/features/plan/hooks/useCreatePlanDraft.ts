import { useContext } from "react";
import { CreatePlanContext } from "../context/CreatePlanContext";

export function useCreatePlanDraft() {
  const context = useContext(CreatePlanContext);
  if (!context) {
    throw new Error("useCreatePlanDraft must be used within a CreatePlanProvider");
  }
  return context;
}
