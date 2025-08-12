import React, { useState, useEffect } from "react";
import type { Question } from "@/index";

interface EditQuestionModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    updatedQuestion: Partial<{
      question: string;
      answer: string;
      falseAnswer: string[];
    }>
  ) => void;
}

export default function EditQuestionModal({
  question,
  isOpen,
  onClose,
  onSave,
}: EditQuestionModalProps) {
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    falseAnswer: ["", "", ""],
  });

  useEffect(() => {
    if (question) {
      setFormData({
        question: question.question || "",
        answer: question.answer || "",
        falseAnswer:
          (question.falseAnswer || [])?.length >= 3
            ? (question.falseAnswer || []).slice(0, 3)
            : [...(question.falseAnswer || []), "", "", ""].slice(0, 3),
      });
    }
  }, [question]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredFalseAnswers = formData.falseAnswer.filter(
      (answer) => answer.trim() !== ""
    );
    onSave({
      question: formData.question,
      answer: formData.answer,
      falseAnswer: filteredFalseAnswers,
    });
  };

  const handleFalseAnswerChange = (index: number, value: string) => {
    const newFalseAnswers = [...formData.falseAnswer];
    newFalseAnswers[index] = value;
    setFormData({ ...formData, falseAnswer: newFalseAnswers });
  };

  const handleAddFalseAnswer = () => {
    setFormData({ ...formData, falseAnswer: [...formData.falseAnswer, ""] });
  };

  const handleRemoveFalseAnswer = (index: number) => {
    setFormData({
      ...formData,
      falseAnswer: formData.falseAnswer.filter((_, i) => i !== index),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Edit Question</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Question
            </label>
            <textarea
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Correct Answer
            </label>
            <input
              type="text"
              value={formData.answer}
              onChange={(e) =>
                setFormData({ ...formData, answer: e.target.value })
              }
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Wrong Answers (Optional)
            </label>
            {formData.falseAnswer.map((falseAnswer, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={falseAnswer}
                  onChange={(e) => handleFalseAnswerChange(index, e.target.value)}
                  placeholder={`Wrong answer ${index + 1}`}
                  className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFalseAnswer(index)}
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
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}