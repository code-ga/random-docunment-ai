import type { Document } from "@/index";
interface ViewDocumentModalProps {
  document: Document | null;
  onClose: () => void;
}

function getSavingPath(savingPath?: string) {
  return savingPath;
}

export default function ViewDocumentModal({
  document,
  onClose,
}: ViewDocumentModalProps) {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-[#1e293b] w-full max-w-lg rounded-xl p-6 shadow-lg relative">
        <h2 className="text-xl font-semibold mb-4">{document.title}</h2>
        <p className="text-sm text-gray-300 whitespace-pre-wrap">
          {document.summary}{" "}
          {document.savingPath && `(${getSavingPath(document.savingPath)})`}
        </p>
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-white text-xl"
        >
          ×
        </button>
      </div>
    </div>
  );
}
