import { useState, useEffect } from "react";
import type { Document } from "@/index";

interface EditDocumentModalProps {
  document: Document | null;
  onClose: () => void;
  onSave: (title: string) => void;
}

export default function EditDocumentModal({
  document,
  onClose,
  onSave,
}: EditDocumentModalProps) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (document) {
      setTitle(document.title);
    }
  }, [document]); // Dependency on 'document' is necessary to update title when modal opens with a new document

  if (!document) return null;

  const handleSave = () => {
    if (!title.trim()) {
      setError("Title cannot be empty.");
      return;
    }
    if (title.length > 100) {
      setError("Title is too long. Maximum length is 100 characters.");
      return;
    }
    onSave(title);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-[#1e293b] w-full max-w-md rounded-xl p-6 shadow-lg relative">
        <h2 className="text-lg font-semibold mb-4">Edit Document Title</h2>
        {error && (
          <p className="text-red-500 mb-4 bg-red-900/20 rounded-lg p-2 border border-red-400 text-sm">
            {error}
          </p>
        )}
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
