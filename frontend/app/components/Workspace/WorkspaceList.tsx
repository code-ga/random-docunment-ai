import WorkspaceCard from "./WorkspaceCard";
import type { Workspace } from "@/types"; // Your type definition

type Props = {
  workspaces: Workspace[];
};

const WorkspaceList = ({ workspaces }: Props) => {
  if (workspaces.length === 0) {
    return (
      <div className="text-center text-gray-400 mt-20">
        No workspaces found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {workspaces.map((ws) => (
        <WorkspaceCard key={ws.id} workspace={ws} />
      ))}
    </div>
  );
};

export default WorkspaceList;
