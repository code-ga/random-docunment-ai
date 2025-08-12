import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { client } from "~/lib/client";
import type { Question, QuizCollection } from "@/index";
import AddQuestionModal from "../../../components/AddQuestionModal";
import EditQuizModal from "../../../components/Quiz/EditQuizModal";
import EditQuestionModal from "../../../components/Quiz/EditQuestionModal";
import QuestionCard from "../../../components/Quiz/QuestionCard";

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
            <Link
              to={"./flashcard"}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Flashcard
            </Link>
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
