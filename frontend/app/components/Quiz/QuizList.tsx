import React from "react";
import QuizCard from "./QuizCard";
import type { QuizCollection } from "@/index";

interface QuizListProps {
  quizzes: Array<QuizCollection>;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function QuizList({ quizzes, onEdit, onDelete }: QuizListProps) {
  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <p>No quizzes found. Create your first quiz to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {quizzes.map((quiz) => (
        <QuizCard
          key={quiz.id}
          quiz={quiz}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
