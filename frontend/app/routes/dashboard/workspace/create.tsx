import type { Route } from "../+types";
import CreateWorkspaceForm from "../../../workspace/create";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "study.ai" },
    { name: "description", content: "Welcome to study.ai!" },
  ];
}

export default function CreateWorkspace() {
  return (
    <>
      <CreateWorkspaceForm></CreateWorkspaceForm>
    </>
  );
}
