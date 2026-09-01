import { useContext } from "react";
import { EditPlanContext } from "../context/EditPlanContext";

export function useEditPlanDraft() {
  const context = useContext(EditPlanContext);
  if (!context) {
    throw new Error("useEditPlanDraft must be used within an EditPlanProvider");
  }
  return context;
}
