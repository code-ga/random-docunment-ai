import React from "react";
import type { QuizCollection } from "@/index";

interface QuizCardProps {
  quiz: QuizCollection;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function QuizCard({ quiz, onEdit, onDelete }: QuizCardProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-lg font-semibold text-white mb-2">{quiz.name}</h3>
      {quiz.description && (
        <p className="text-gray-400 text-sm mb-2">{quiz.description}</p>
      )}
      <p className="text-gray-500 text-xs mb-4">
        Created: {new Date(quiz.createdAt).toLocaleDateString()}
      </p>
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() =>
              (window.location.href = `/dashboard/quiz/${quiz.id}`)
            }
            className="text-green-400 hover:text-green-500 font-medium text-sm"
          >
            View Details
          </button>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(quiz.id)}
              className="text-yellow-400 hover:text-yellow-500 text-sm"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(quiz.id)}
              className="text-red-400 hover:text-red-500 text-sm"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
