import { FileText, Globe2, Lock, Trash2 } from "lucide-react";
import { Link } from "react-router";

type Workspace = {
  id: string;
  name: string;
  userId: string;
  description?: string | null;
  public: boolean;
  documentIds: string[];
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  workspace: Workspace;
  onDelete: (workspaceId: string) => void;
};

export default function WorkspaceCard({ workspace, onDelete }: Props) {
  return (
    <div className="bg-[#1e293b] rounded-2xl p-5 shadow-md border border-gray-700 hover:border-blue-500 transition flex flex-col justify-between">
      <div>
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
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400 mt-4">
        <span className="flex items-center gap-1">
          <FileText className="w-4 h-4" />
          {workspace.documentIds.length} documents
        </span>

        <div className="flex gap-3">
          <button
            onClick={() => onDelete(workspace.id)}
            className="text-red-500 hover:text-red-400 flex items-center gap-1 transition text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>

          <Link
            to={`/dashboard/workspace/${workspace.id}`}
            className="text-blue-400 hover:underline"
          >
            Open →
          </Link>
        </div>
      </div>
    </div>
  );
}
