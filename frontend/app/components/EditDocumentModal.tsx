import { useState, useEffect } from "react";

interface Document {
  id: string;
  title: string;
  workspaceId: string;
  savingPath?: string;
  chunkIds: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
  content?: string;
}

interface EditDocumentModalProps {
  document: Document | null;
  onClose: () => void;
  onSave: (title: string) => void;
}

export default function EditDocumentModal({ document, onClose, onSave }: EditDocumentModalProps) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (document) {
      setTitle(document.title);
    }
  }, [document]);

  if (!document) return null;

  const handleSave = () => {
    onSave(title);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-[#1e293b] w-full max-w-md rounded-xl p-6 shadow-lg relative">
        <h2 className="text-lg font-semibold mb-4">Edit Document Title</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}