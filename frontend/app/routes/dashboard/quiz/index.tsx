import React, { useState, useEffect } from "react";
import QuizList from "~/components/Quiz/QuizList";
import { client } from "~/lib/client";
import type { QuizCollection } from "@/index";

export default function QuizIndex() {
  const [quizzes, setQuizzes] = useState<QuizCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await client.api.quiz["list-quizzes"].get();
        if (response.error) {
          setError("Failed to load quizzes. Please try again later.");
          return;
        }
        if (!response.data) {
          setError("Failed to load quizzes. No data received.");
          return;
        }
        if (!response.data.success) {
          setError("Failed to load quizzes. Please try again later.");
          return;
        }
        if (!response.data.data?.quizzes) {
          setError("Failed to load quizzes. No data received.");
          return;
        }

        setQuizzes(response.data.data.quizzes);
      } catch (err) {
        setError("Failed to load quizzes. Please try again later.");
        console.error("Error fetching quizzes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  // const handleCreateQuiz = () => {
  //   window.location.href = "/dashboard/quiz/create";
  // };

  const handleEditQuiz = (id: string) => {
    window.location.href = `/dashboard/quiz/${id}`;
  };

  const handleDeleteQuiz = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await client.api.quiz.delete.delete({ id });
        setQuizzes(quizzes.filter((quiz) => quiz.id !== id));
      } catch (err) {
        console.error("Error deleting quiz:", err);
        alert("Failed to delete quiz. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">My Quizzes</h1>
        <div className="text-center py-10 text-gray-400">
          Loading quizzes...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">My Quizzes</h1>
        <div className="text-center py-10 text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Quizzes</h1>
        {/* <button
          onClick={handleCreateQuiz}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Create New Quiz
        </button> */}
      </div>
      <QuizList
        quizzes={quizzes}
        onEdit={handleEditQuiz}
        onDelete={handleDeleteQuiz}
      />
    </div>
  );
}
