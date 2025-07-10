import type { Workspace } from "@/index";
import { FileText, Globe2, Lock } from "lucide-react";
import { Link } from "react-router";

type Props = {
  workspace: Workspace;
};

const WorkspaceCard = ({ workspace }: Props) => {
  return (
    <div className="bg-[#1e293b] rounded-2xl p-5 shadow-md border border-gray-700 hover:border-blue-500 transition">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-white">{workspace.name}</h2>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          {workspace.public ? (
            <Globe2 className="w-4 h-4" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
          {workspace.public ? "Public" : "Private"}
        </span>
      </div>
      <p className="text-sm text-gray-300 line-clamp-3 mb-4">
        {workspace.description || "No description provided."}
      </p>
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span className="flex items-center gap-1">
          <FileText className="w-4 h-4" />
          {workspace.documentIds.length} documents
        </span>
        <Link
          to={`/workspace/${workspace.id}`}
          className="text-blue-400 hover:underline"
        >
          Open →
        </Link>
      </div>
    </div>
  );
};

export default WorkspaceCard;
