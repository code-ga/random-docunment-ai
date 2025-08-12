import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { FlashcardArray } from "react-quizlet-flashcard";
import { client } from "~/lib/client";
import type { Question, QuizCollection } from "@/index";
import { ArrowLeft, RotateCcw, Shuffle } from "lucide-react";

interface FlashcardData {
  id: number;
  frontHTML: string;
  backHTML: string;
}

export default function Flashcard() {
  const { id } = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quiz, setQuiz] = useState<QuizCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);

  useEffect(() => {
    if (id) {
      fetchQuizAndQuestions(id);
    } else {
      setError("Quiz ID not provided");
      setLoading(false);
    }
  }, [id]);

  const fetchQuizAndQuestions = async (quizId: string) => {
    try {
      setLoading(true);

      // Fetch quiz information
      const quizResponse = await client.api.quiz({ id: quizId }).get();
      if (
        quizResponse.data?.success &&
        quizResponse.data.data?.quiz &&
        quizResponse.data.data.quiz[0]
      ) {
        setQuiz(quizResponse.data.data.quiz[0]);
      }

      // Fetch questions
      const questionsResponse = await client.api.question["list-question"]({
        quizId,
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

      const fetchedQuestions = questionsResponse.data.data.question;
      setQuestions(fetchedQuestions);
    } catch (err) {
      setError("Failed to load quiz data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const shuffleFlashcards = () => {
    if (questions.length === 0) return;

    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    // setCurrentCardIndex(0);
    setIsShuffled(true);
  };

  const resetFlashcards = async () => {
    if (questions.length === 0) return;

    // Fetch questions
    const questionsResponse = await client.api.question["list-question"]({
      quizId: id!,
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

    const fetchedQuestions = questionsResponse.data.data.question;
    setQuestions(fetchedQuestions);
    // setCurrentCardIndex(0);
    setIsShuffled(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link
              to={`/dashboard/quiz/${id}`}
              className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quiz
            </Link>
            <h1 className="text-2xl font-bold text-white">Flashcards</h1>
            <p className="text-gray-400">Loading flashcards...</p>
          </div>
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link
              to={`/dashboard/quiz/${id}`}
              className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quiz
            </Link>
            <h1 className="text-2xl font-bold text-white">Flashcards</h1>
            <p className="text-gray-400">Error loading flashcards</p>
          </div>
          <div className="text-center py-20">
            <div className="text-red-400 text-lg">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link
              to={`/dashboard/quiz/${id}`}
              className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quiz
            </Link>
            <h1 className="text-2xl font-bold text-white">
              {quiz?.name || "Quiz"} - Flashcards
            </h1>
            <p className="text-gray-400">Study with interactive flashcards</p>
          </div>
          <div className="text-center py-20">
            <div className="text-gray-400 text-lg">
              No questions available for flashcards.
            </div>
            <p className="text-gray-500 mt-2">
              Add some questions to this quiz to start studying!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <style>{`
        .flashcard-content {
          padding: 2rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
          border-radius: 1rem;
          color: white;
        }
        
        .flashcard-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
        }
        
        .flashcard-text {
          font-size: 1.25rem;
          font-weight: 500;
          line-height: 1.6;
          color: #f9fafb;
          max-width: 100%;
          word-wrap: break-word;
        }
        
        .flashcard-array {
          max-width: 600px;
          margin: 0 auto;
        }
        
        .flashcard-array .flashcard {
          border-radius: 1rem !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
          border: 1px solid #374151 !important;
        }
        
        .flashcard-array .flashcard-front,
        .flashcard-array .flashcard-back {
          border-radius: 1rem !important;
        }
        .FlashcardArrayWrapper__controls {
          color: #9ca3af !important;
        }
        div.FlashcardArrayWrapper__controls > button > svg > path{
          fill: #9ca3af !important;
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/dashboard/quiz/${id}`}
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quiz
          </Link>

          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {quiz?.name || "Quiz"} - Flashcards
              </h1>
              <p className="text-gray-400">
                Study with interactive flashcards • {questions.length} cards
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={shuffleFlashcards}
                className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                disabled={questions.length === 0}
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Shuffle
              </button>

              <button
                onClick={resetFlashcards}
                className="inline-flex items-center bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                disabled={questions.length === 0 || !isShuffled}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Order
              </button>
            </div>
          </div>

          <div className="border-b border-gray-700"></div>
        </div>

        {/* Flashcards */}
        <div className="flashcard-array">
          <FlashcardArray
            cards={questions.map(
              (question, index): FlashcardData => ({
                id: index + 1,
                frontHTML: `<div class="flashcard-content">
                              <div class="flashcard-label">Question</div>
                              <div class="flashcard-text">${question.question}</div>
                            </div>`,
                backHTML: `<div class="flashcard-content">
                            <div class="flashcard-label">Answer</div>
                            <div class="flashcard-text">${question.answer}</div>
                          </div>`,
              })
            )}
            FlashcardArrayStyle={{
              height: "400px",
            }}
            frontCardStyle={{
              backgroundColor: "transparent",
            }}
            backCardStyle={{
              backgroundColor: "transparent",
            }}
            controls={true}
          />
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              How to use flashcards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div className="flex flex-col items-center">
                <div className="bg-blue-600 rounded-full p-2 mb-2">
                  <span className="text-white font-bold">1</span>
                </div>
                <p>Click on a card to flip it and see the answer</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-600 rounded-full p-2 mb-2">
                  <span className="text-white font-bold">2</span>
                </div>
                <p>Swipe left/right or use arrow keys to navigate</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-600 rounded-full p-2 mb-2">
                  <span className="text-white font-bold">3</span>
                </div>
                <p>Use shuffle to randomize the order</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
