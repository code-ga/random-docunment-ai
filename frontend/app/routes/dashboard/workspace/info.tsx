import type { Route } from "../+types";
import WorkspaceInfoPage from "../../../workspace/info";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "study.ai" },
    { name: "description", content: "Welcome to study.ai!" },
  ];
}

export default function WorkspaceInfo() {
  return (
    <>
      <WorkspaceInfoPage></WorkspaceInfoPage>
    </>
  );
}
