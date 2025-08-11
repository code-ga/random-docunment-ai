import { useState } from "react";

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, content?: string, file?: File) => Promise<void>;
}

export default function AddDocumentModal({
  isOpen,
  onClose,
  onAdd,
}: AddDocumentModalProps) {
  const [title, setTitle] = useState("");
  const [inputType, setInputType] = useState<"text" | "file">("text");
  const [textContent, setTextContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleAdd = async () => {
    if (!title.trim()) {
      setError("Document title is required");
      return;
    }

    if (inputType === "text" && !textContent.trim()) {
      setError("Text content is required");
      return;
    }

    if (inputType === "file" && !selectedFile) {
      setError("Please select a file");
      return;
    }

    setIsLoading(true);
    try {
      await onAdd(
        title,
        inputType === "text" ? textContent : undefined,
        inputType === "file" ? selectedFile || undefined : undefined
      );
    } catch (err) {
      setError(
        "An error occurred while adding the document. Please try again."
      );
      console.error("Error in handleAdd:", err);
    } finally {
      setIsLoading(false);
      handleClose();
    }
  };

  const handleClose = () => {
    setTitle("");
    setTextContent("");
    setSelectedFile(null);
    setError("");
    setInputType("text");
    setIsLoading(false);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-[#1e293b] w-full max-w-md rounded-xl p-6 shadow-lg relative">
        <h2 className="text-lg font-semibold mb-4">Add Document</h2>

        {error && (
          <p className="text-red-500 mb-4 bg-red-900/20 rounded-lg p-2 border border-red-400 text-sm">
            {error}
          </p>
        )}

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document title"
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Input Type Toggle */}
        <div className="mb-4">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setInputType("text")}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                inputType === "text"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Text Input
            </button>
            <button
              type="button"
              onClick={() => setInputType("file")}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                inputType === "file"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              File Upload
            </button>
          </div>
        </div>

        {/* Content Input */}
        {inputType === "text" ? (
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Enter your document content..."
            rows={6}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        ) : (
          <div className="mb-4">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".txt,.pdf,.doc,.docx,.md"
              className="hidden"
              id="file-upload"
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
              {selectedFile ? selectedFile.name : "Choose file..."}
            </label>
            {selectedFile && (
              <p className="text-sm text-gray-400 mt-2">
                Selected: {selectedFile.name} (
                {(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="text-sm text-gray-400 hover:text-white"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : (
              "Add"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
