import React, { useState, useEffect } from "react";
import { client } from "~/lib/client";
import type { Question, QuizCollection } from "@/index";
import AddQuestionModal from "../../../components/AddQuestionModal";
import { useParams } from "react-router";

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

interface EditQuizModalProps {
  quiz: QuizCollection | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    updatedQuiz: Partial<{
      name: string;
      description: string;
      isPublic: boolean;
    }>
  ) => void;
}

function EditQuizModal({ quiz, isOpen, onClose, onSave }: EditQuizModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: true,
  });

  useEffect(() => {
    if (quiz) {
      setFormData({
        name: quiz.name || "",
        description: quiz.description || "",
        isPublic: quiz.public ?? true,
      });
    }
  }, [quiz]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      description: formData.description,
      isPublic: formData.isPublic,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Edit Quiz Collection</h2>
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
              Quiz Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Enter a description for your quiz..."
            />
          </div>

          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) =>
                  setFormData({ ...formData, isPublic: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-300">
                Make this quiz public
              </span>
            </label>
            <p className="text-xs text-gray-400 mt-1 ml-7">
              Public quizzes can be viewed and taken by anyone
            </p>
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



function EditQuestionModal({
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
              <input
                key={index}
                type="text"
                value={falseAnswer}
                onChange={(e) => handleFalseAnswerChange(index, e.target.value)}
                placeholder={`Wrong answer ${index + 1}`}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
              />
            ))}
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

interface QuestionCardProps {
  question: Question;
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
}

function QuestionCard({ question, onEdit, onDelete }: QuestionCardProps) {
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

export default function QuizCollectionPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quiz, setQuiz] = useState<QuizCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [quizId, setQuizId] = useState<string | null>(null);
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      setQuizId(id);
      fetchQuizAndQuestions(id);
    } else {
      setError("Quiz ID not provided");
      setLoading(false);
    }
  }, [id]);

  const fetchQuizAndQuestions = async (id: string) => {
    try {
      setLoading(true);

      // Fetch quiz information
      const quizResponse = await client.api.quiz({ id }).get();
      if (
        quizResponse.data?.success &&
        quizResponse.data.data?.quiz &&
        quizResponse.data.data.quiz[0]
      ) {
        setQuiz(quizResponse.data.data.quiz[0]);
      }

      // Fetch questions
      const questionsResponse = await client.api.question["list-question"]({
        quizId: id,
      }).get();

      if (questionsResponse.error) {
        setError("Failed to load questions. Please try again later.");
        return;
      }

      if (!questionsResponse.data) {
        setError("Failed to load questions. No data received.");
        return;
      }

      if (!questionsResponse.data.success) {
        setError(questionsResponse.data.message || "Failed to load questions.");
        return;
      }

      if (!questionsResponse.data.data?.question) {
        setQuestions([]);
        return;
      }

      setQuestions(questionsResponse.data.data.question);
    } catch (err) {
      setError("Failed to load quiz data. Please try again later.");
      console.error("Error fetching quiz data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuiz = () => {
    setIsQuizModalOpen(true);
  };
  const handleAddQuestion = () => {
    setIsAddQuestionModalOpen(true);
  };

  const handleAddQuestionSubmit = async (
    questionText: string,
    answerText: string,
    falseAnswers: string[]
  ) => {
    if (!quizId) {
      alert("Quiz ID not available");
      return;
    }
    try {
      const response = await client.api.question.create.post({
        question: questionText,
        answer: answerText,
        falseAnswer: falseAnswers,
        quizId,
      });
      if (response.error) {
        alert("Failed to add question");
        return;
      }
      if (!response.data?.success) {
        alert(response.data?.message || "Failed to add question");
        return;
      }
      const newQuestion = response.data?.data?.question?.[0];
      if (newQuestion) {
        setQuestions([...questions, newQuestion]);
      }
      setIsAddQuestionModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error adding question");
    }
  };

  const handleSaveQuiz = async (
    updatedData: Partial<{
      name: string;
      description: string;
      isPublic: boolean;
    }>
  ) => {
    if (!quiz) return;

    try {
      const response = await client.api.quiz({ id: quiz.id }).put(updatedData);

      if (response.error) {
        alert("Failed to update quiz. Please try again.");
        return;
      }

      if (!response.data?.success) {
        alert(response.data?.message || "Failed to update quiz.");
        return;
      }
      if (!response.data.data?.quiz || !response.data.data.quiz[0]) {
        alert("Failed to update quiz. No data received.");
        return;
      }

      // Update the quiz in the local state
      setQuiz(response.data.data.quiz[0]);
      setIsQuizModalOpen(false);
    } catch (err) {
      console.error("Error updating quiz:", err);
      alert("Failed to update quiz. Please try again.");
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (
    updatedData: Partial<{
      question: string;
      answer: string;
      falseAnswer: string[];
    }>
  ) => {
    if (!editingQuestion) return;

    try {
      const response = await client.api.question
        .update({ id: editingQuestion.id })
        .put(updatedData);

      if (response.error) {
        alert("Failed to update question. Please try again.");
        return;
      }

      if (!response.data?.success) {
        alert(response.data?.message || "Failed to update question.");
        return;
      }

      // Update the question in the local state
      setQuestions(
        questions.map((q) =>
          q.id === editingQuestion.id ? { ...q, ...updatedData } : q
        )
      );

      setIsQuestionModalOpen(false);
      setEditingQuestion(null);
    } catch (err) {
      console.error("Error updating question:", err);
      alert("Failed to update question. Please try again.");
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        const response = await client.api.question.delete.delete({ id });

        if (response.error) {
          alert("Failed to delete question. Please try again.");
          return;
        }

        if (!response.data?.success) {
          alert(response.data?.message || "Failed to delete question.");
          return;
        }

        setQuestions(questions.filter((q) => q.id !== id));
      } catch (err) {
        console.error("Error deleting question:", err);
        alert("Failed to delete question. Please try again.");
      }
    }
  };

  const handleCloseQuestionModal = () => {
    setIsQuestionModalOpen(false);
    setEditingQuestion(null);
  };

  const handleCloseAddQuestionModal = () => {
    setIsAddQuestionModalOpen(false);
  };

  const handleCloseQuizModal = () => {
    setIsQuizModalOpen(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Quiz Collection</h1>
          <p className="text-gray-400">Loading quiz information...</p>
        </div>
        <div className="text-center py-10 text-gray-400">
          Loading questions...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Quiz Collection</h1>
          <p className="text-gray-400">Error loading quiz information</p>
        </div>
        <div className="text-center py-10 text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Quiz Collection Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">
              {quiz?.name || "Quiz Collection"}
            </h1>
            {quiz?.description && (
              <p className="text-gray-300 text-lg mb-2">{quiz.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>
                Created:{" "}
                {quiz?.createdAt
                  ? new Date(quiz.createdAt).toLocaleDateString()
                  : "Unknown"}
              </span>
              <span>•</span>
              <span>
                {questions.length}{" "}
                {questions.length === 1 ? "Question" : "Questions"}
              </span>
              <span>•</span>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  quiz?.public ? "bg-green-600" : "bg-gray-600"
                }`}
              >
                {quiz?.public ? "Public" : "Private"}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleEditQuiz}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Edit Quiz
            </button>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Back to Quiz
            </button>
          </div>
        </div>
        <div className="border-b border-gray-700"></div>
      </div>

      {/* Questions Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white mb-4">Questions </h2>
          <button
            onClick={handleAddQuestion}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Add Question
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p>No questions found for this quiz.</p>
            <p className="text-sm mt-2">Add some questions to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onEdit={handleEditQuestion}
                onDelete={handleDeleteQuestion}
              />
            ))}
          </div>
        )}
      </div>

      <EditQuizModal
        quiz={quiz}
        isOpen={isQuizModalOpen}
        onClose={handleCloseQuizModal}
        onSave={handleSaveQuiz}
      />

      <EditQuestionModal
        question={editingQuestion}
        isOpen={isQuestionModalOpen}
        onClose={handleCloseQuestionModal}
        onSave={handleSaveQuestion}
      />
      <AddQuestionModal
        isOpen={isAddQuestionModalOpen}
        onClose={handleCloseAddQuestionModal}
        onAdd={handleAddQuestionSubmit}
      />
    </div>
  );
}
