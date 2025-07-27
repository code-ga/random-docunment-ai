import { useState } from "react";

interface AddDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (file: File[]) => void;
}

export default function AddDocumentsModal({
  isOpen,
  onClose,
  onAdd,
}: AddDocumentsModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setError("Please select at least one file to add.");
      return;
    }
    
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB limit
    const oversizedFiles = Array.from(selectedFiles).filter(file => file.size > maxSizeInBytes);
    if (oversizedFiles.length > 0) {
      setError(`The following files exceed the 10MB size limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    try {
      onAdd(Array.from(selectedFiles));
      handleClose();
    } catch (err) {
      setError("An error occurred while adding the files. Please try again.");
      console.error("Error in handleAdd:", err);
    }
  };

  const handleClose = () => {
    setSelectedFiles(null);
    setError("");
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files;
    if (file) {
      setSelectedFiles(file);
      setError("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-[#1e293b] w-full max-w-md rounded-xl p-6 shadow-lg relative">
        <h2 className="text-lg font-semibold mb-4">Add Documents</h2>

        {error && (
          <p className="text-red-500 mb-4 bg-red-900/20 rounded-lg p-2 border border-red-400 text-sm">
            {error}
          </p>
        )}

        {/* Content Input */}

        <div className="mb-4">
          <input
            type="file"
            onChange={(e) => handleFileChange(e)}
            accept=".txt,.pdf,.doc,.docx,.md"
            className="hidden"
            id="file-upload"
            multiple
          />
          <label
            htmlFor="file-upload"
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            {/* {selectedFiles
              ? Array.from(selectedFiles).map((file) => file.name)
              : "Choose file..."} */}
            {"Choose file..."}
          </label>
          {selectedFiles &&
            Array.from(selectedFiles).map((file) => (
              <p key={file.name} className="text-sm text-gray-400 mt-2">
                Selected: {file.name} (
                {(file.size / 1024).toFixed(1)} KB)
              </p>
            ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="text-sm text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
