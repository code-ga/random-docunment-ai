import WorkspaceList from "../components/Workspace/WorkspaceList";
import { client } from "../lib/client";

export default function MainDashboard() {
  const {} = client.api.workspace["list-workspace"].get();
  return (
    <div className="bg-[#0f172a] min-h-screen text-white pt-6">
      <h1 className="text-3xl font-bold px-6 mb-4">Your Workspaces</h1>
      <WorkspaceList workspaces={[]} />
    </div>
  );
}
