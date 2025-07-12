import { useState } from "react";

export type UpdatedWorkspace = {
  name: string;
  description: string;
  public: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  workspace: {
    name: string;
    description?: string | null;
    public: boolean;
  };
  onSave: (updated: UpdatedWorkspace) => void;
};

export default function EditWorkspaceModal({
  open,
  onClose,
  workspace,
  onSave,
}: Props) {
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description || "");
  const [isPublic, setIsPublic] = useState(workspace.public);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, description, public: isPublic });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-[#1e293b] w-full max-w-lg rounded-xl p-6 shadow-lg relative space-y-5 border border-gray-700"
      >
        <h2 className="text-xl font-semibold text-white">Edit Workspace</h2>

        <div>
          <label className="block text-sm mb-1 text-gray-300">Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-300">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={() => setIsPublic(!isPublic)}
            id="publicToggle"
            className="accent-blue-600 w-4 h-4"
          />
          <label htmlFor="publicToggle" className="text-sm text-gray-300">
            Make workspace public
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg text-sm font-semibold"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
