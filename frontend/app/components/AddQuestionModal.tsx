import { useState } from "react";

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (question: string, answer: string, falseAnswer: string[]) => Promise<void>;
}

export default function AddQuestionModal({
  isOpen,
  onClose,
  onAdd,
}: AddQuestionModalProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [falseAnswer, setFalseAnswer] = useState<string[]>(["", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleAdd = async () => {
    if (!question.trim()) {
      setError("Question is required");
      return;
    }
    if (!answer.trim()) {
      setError("Answer is required");
      return;
    }

    const filteredFalseAnswers = falseAnswer.filter((a) => a.trim() !== "");

    setIsLoading(true);
    try {
      await onAdd(question, answer, filteredFalseAnswers);
    } catch (err) {
      setError("Failed to add question. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
      handleClose();
    }
  };

  const handleClose = () => {
    setQuestion("");
    setAnswer("");
    setFalseAnswer(["", "", ""]);
    setError("");
    setIsLoading(false);
    onClose();
  };

  const handleFalseAnswerChange = (index: number, value: string) => {
    const newAnswers = [...falseAnswer];
    newAnswers[index] = value;
    setFalseAnswer(newAnswers);
  };

  const handleAddFalseAnswer = () => {
    setFalseAnswer([...falseAnswer, ""]);
  };

  const handleRemoveFalseAnswer = (index: number) => {
    setFalseAnswer(falseAnswer.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-[#1e293b] w-full max-w-md rounded-xl p-6 shadow-lg relative">
        <h2 className="text-lg font-semibold mb-4">Add Question</h2>

        {error && (
          <p className="text-red-500 mb-4 bg-red-900/20 rounded-lg p-2 border border-red-400 text-sm">
            {error}
          </p>
        )}

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter question..."
          rows={3}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 mb-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          required
        />

        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Correct answer"
          className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 mb-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {/* Wrong answers */}
        {falseAnswer.map((fa, idx) => (
          <div key={idx} className="flex items-center mb-2">
            <input
              type="text"
              value={fa}
              onChange={(e) => handleFalseAnswerChange(idx, e.target.value)}
              placeholder={`Wrong answer ${idx + 1} (optional)`}
              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => handleRemoveFalseAnswer(idx)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddFalseAnswer}
          className="mt-2 text-sm text-blue-400 hover:text-blue-200"
        >
          + Add false answer
        </button>

        <div className="flex justify-end gap-3 mt-4">
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
                <svg
                  className="animate-spin h-4 w-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
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