import React, { useState } from "react";
import ErrorToast from "../../../components/Toast/ErrorToast";
import DashboardNavbar from "../../../components/Navbar/DashboardNavbar";
import { useNavigate } from "react-router";
import { client } from "../../../lib/client";

const CreateQuizCollection: React.FC = () => {
  const [collectionName, setCollectionName] = useState("");
  const [description, setDescription] = useState("");
  const [errorToast, setErrorToast] = useState<string>("");

  const navigate = useNavigate();

  const handleSubmit = async () => {
    // Validate required fields before submission
    if (!collectionName.trim()) {
      setErrorToast("Collection Name is required.");
      return;
    }

    try {
      // Prepare data for submission (excluding documents as it's not supported by the backend API)
      const quizData = {
        name: collectionName,
        description: description || "",
        isPublic: true, // Default to private; can be modified as needed
      };

      // Simulate API call to backend (replace with actual API client call)
      // For now, we'll log the data that would be sent to the backend
      console.log("Submitting quiz collection:", quizData);

      // Placeholder for actual API call
      // const response = await apiClient.createQuiz(quizData);
      // if (!response.success) {
      //   throw new Error(response.message || "Failed to create quiz collection");
      // }
      const response = await client.api.quiz.create.post(quizData);

      // Handle response from backend (e.g., show success message, redirect, etc.)
      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to create quiz collection"
        );
      }
      if (!response.data.data?.quiz || !response.data.data.quiz[0]) {
        throw new Error("Failed to create quiz collection. No data received.");
      }

      alert("Quiz collection created successfully!");
      // Reset form fields after successful submission
      setCollectionName("");
      setDescription("");
      navigate(`/dashboard/quiz/${response.data.data.quiz[0].id}`);
    } catch (error: unknown) {
      console.error("Error creating quiz collection:", error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setErrorToast(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white">
      <main className="container mx-auto p-8 max-w-xl">
        <div className="bg-[#1f2937] p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-6">
            Create New Quiz Collection
          </h1>
          <form className="space-y-4">
            <div>
              <label
                htmlFor="collectionName"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Collection Name
              </label>
              <input
                id="collectionName"
                type="text"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="Enter collection name"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white resize-none"
                placeholder="Enter a brief description of the quiz collection"
              ></textarea>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="text-sm text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Create Collection
              </button>
            </div>
          </form>
        </div>
      </main>
      {errorToast && (
        <ErrorToast message={errorToast} onClose={() => setErrorToast("")} />
      )}
    </div>
  );
};

export default CreateQuizCollection;
