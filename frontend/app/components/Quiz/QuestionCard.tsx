import type { Question } from "@/index";

interface QuestionCardProps {
  question: Question;
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
}

export default function QuestionCard({ question, onEdit, onDelete }: QuestionCardProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-white mb-2">Question:</h3>
        <p className="text-gray-300 text-sm">{question.question}</p>
      </div>

      <div className="mb-3">
        <h4 className="text-md font-medium text-green-400 mb-1">
          Correct Answer:
        </h4>
        <p className="text-gray-300 text-sm">{question.answer}</p>
      </div>

      {question.falseAnswer && question.falseAnswer.length > 0 && (
        <div className="mb-3">
          <h4 className="text-md font-medium text-red-400 mb-1">
            Wrong Answers:
          </h4>
          <ul className="text-gray-300 text-sm space-y-1">
            {question.falseAnswer.map((falseAns, index) => (
              <li key={index} className="flex items-center">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                {falseAns}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between items-center pt-3 border-t border-gray-700">
        <p className="text-gray-500 text-xs">
          Created: {new Date(question.createdAt).toLocaleDateString()}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(question)}
            className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(question.id)}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}