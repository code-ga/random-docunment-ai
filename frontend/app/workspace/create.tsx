import { useState } from "react";
import { fetch } from "../lib/client";
import { useNavigate } from "react-router";

export default function CreateWorkspaceForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const redirect = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const payload = {
        name,
        description,
        public: isPublic,
      };

      // Replace this with your real submission logic
      console.log("Submitting workspace:", payload);

      // await new Promise((resolve, reject) => {
      //   setTimeout(() => {
      //     // Simulate error:
      //     // reject(new Error("Network error"));
      //     resolve(true);
      //   }, 1000);
      // });
      const result = await fetch("/api/workspace/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: payload,
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      if (result.data.success === false || !result.data.data) {
        setError(result.data.message);
        return;
      }

      redirect("/workspace/" + result.data.data.workspace[0].id);

      setSuccess(true);
      setName("");
      setDescription("");
      setIsPublic(false);
    } catch (err) {
      console.error(err);
      setError((err as Error).message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto bg-[#1e293b] text-white p-6 rounded-2xl shadow-lg border border-gray-700 space-y-6"
    >
      <h2 className="text-2xl font-bold">Create New Workspace</h2>

      {/* Error Box */}
      {error && (
        <div className="bg-red-500/10 text-red-400 border border-red-600 rounded-lg px-4 py-3 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-500/10 text-green-400 border border-green-600 rounded-lg px-4 py-3 text-sm">
          ✅ Workspace created successfully!
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Name *</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={() => setIsPublic(!isPublic)}
          id="publicToggle"
          className="accent-blue-600 w-4 h-4"
        />
        <label htmlFor="publicToggle" className="text-sm">
          Make workspace public
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Workspace"}
      </button>
    </form>
  );
}
