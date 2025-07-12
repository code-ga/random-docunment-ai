import { useEffect, useState } from "react";
import type { Workspace } from "../../../backend/src";
import WorkspaceList from "../components/Workspace/WorkspaceList";
import { client } from "../lib/client";
import LoadingPage from "../components/LoadingPage";
import ErrorPage from "../components/ErrorPage";

export default function MainDashboard() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    client.api.workspace["list-workspace"]
      .get()
      .then((res) => {
        if (res.error) {
          setError(res.error.value.message || "Something went wrong.");
          return;
        }
        if (!res.data) {
          setError("Something went wrong.");
          return;
        }
        if (!res.data.success) {
          setError(res.data.message || "Something went wrong.");
          return;
        }
        setWorkspaces(res.data.data?.workspace || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingPage></LoadingPage>;
  if (error) return <ErrorPage message={error} status={500}></ErrorPage>;
  return (
    <div className="bg-[#0f172a] min-h-screen text-white pt-6">
      <h1 className="text-3xl font-bold px-6 mb-4">Your Workspaces</h1>
      <WorkspaceList workspaces={workspaces} />
    </div>
  );
}
