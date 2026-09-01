import { CreatePlanProvider } from "../context/CreatePlanContext";
import { CreatePlanFlow } from "./create-plan/create-plan-flow";

export function CreatePlan() {
  return (
    <CreatePlanProvider>
      <CreatePlanFlow />
    </CreatePlanProvider>
  );
}

export default CreatePlan;
