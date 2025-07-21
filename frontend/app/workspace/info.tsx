import type { Document, Workspace } from "@/index";
import { Eye, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import AddDocumentModal from "../components/AddDocumentModal";
import EditDocumentModal from "../components/EditDocumentModal";
import ErrorPage from "../components/ErrorPage";
import LoadingPage from "../components/LoadingPage";
import ViewDocumentModal from "../components/ViewDocumentModal";
import EditWorkspaceModal, {
  type UpdatedWorkspace,
} from "../components/Workspace/EditWorkspaceModal";
import { client } from "../lib/client";
import authClient, { useSession } from "../lib/auth";
import AddDocumentsModal from "../components/AddDocumentsModal";

export default function WorkspaceInfoPage() {
  const { id } = useParams();

  if (!id)
    return <ErrorPage message="Workspace not found" status={404}></ErrorPage>;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{
    message: string;
    status: number;
  } | null>();
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showAddMultiplePopup, setShowAddMultiplePopup] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { data } = useSession();

  useEffect(() => {
    const fetchWorkspace = async () => {
      setLoading(true);

      const mockWorkspace = await client.api.workspace({ id: id || "" }).get();

      if (mockWorkspace.error) {
        setLoading(false);
        setError({
          message: mockWorkspace.error.value.message || "Something went wrong.",
          status: mockWorkspace.error.status,
        });
        return;
      }
      if (!mockWorkspace.data.data) {
        setLoading(false);
        setError({
          message: mockWorkspace.data.message,
          status: mockWorkspace.data.status,
        });
        return;
      }
      if (!mockWorkspace.data.success) {
        setLoading(false);
        setError({
          message: mockWorkspace.data.message || "Something went wrong.",
          status: mockWorkspace.data.status,
        });
        return;
      }

      const mockDocuments = await client.api.document
        .list({
          id: mockWorkspace.data.data.workspace.id,
        })
        .get();
      if (mockDocuments.error) {
        setLoading(false);
        setError({
          message: mockDocuments.error.value.message || "Something went wrong.",
          status: mockDocuments.error.status,
        });
        return;
      }
      if (!mockDocuments.data.data) {
        setLoading(false);
        setError({
          message: mockDocuments.data.message,
          status: mockDocuments.data.status,
        });
        return;
      }
      if (!mockDocuments.data.success) {
        setLoading(false);
        setError({
          message: mockDocuments.data.message || "Something went wrong.",
          status: mockDocuments.data.status,
        });
        return;
      }
      // await new Promise((res) => setTimeout(res, 500));
      const chatSocket = client.api.chats
        .chat({
          workspaceId: mockWorkspace.data.data.workspace.id || "",
        })
        .subscribe();
      chatSocket.on("message", (message) => {
        console.log("message", message);
      });
      chatSocket.on("open", (ws) => {
        console.log(data?.session.token);
        chatSocket.send({
          type: "AUTH",
          data: {
            token: encodeURIComponent(data?.session.token || ""),
          },
        });
        console.log("open");
      });
      chatSocket.on("close", () => {
        console.log("close");
      });
      chatSocket.on("error", () => {
        console.log("error");
      });
      setWorkspace(mockWorkspace.data.data.workspace);
      setDocuments(mockDocuments.data.data.documents || []);
      setLoading(false);
    };

    fetchWorkspace();
  }, [id]);

  const handleDelete = (id: string) => {
    setDocuments((docs) => docs.filter((d) => d.id !== id));
  };

  const handleEditDocument = (title: string) => {
    if (editDoc) {
      setDocuments((docs) =>
        docs.map((d) => (d.id === editDoc.id ? { ...d, title } : d))
      );
      setEditDoc(null);
    }
  };

  const handleAddDocument = async (
    title: string,
    content?: string,
    file?: File
  ) => {
    // const newDoc: Document = {
    //   id: Math.random().toString(36).substring(2),
    //   title: title || "Untitled Document",
    //   workspaceId: workspace!.id,
    //   chunkIds: [],
    //   userId: workspace!.userId,
    //   createdAt: new Date().toISOString(),
    //   updatedAt: new Date().toISOString(),
    //   content: "New document content...",
    // };
    // setDocuments((docs) => [...docs, newDoc]);
    const result = content
      ? await client.api.document
          .create({ id: workspace!.id })
          ["from-raw"].post({ name: title, content })
      : file
      ? await client.api.document
          .create({
            id: workspace!.id,
          })
          ["from-file"].post({ name: title, file })
      : null;
    if (!result) {
      setError({
        message: "Failed to create document",
        status: 500,
      });
      return;
    }
    if (result.error) {
      setError({
        message: result.error.value.message || "Something went wrong.",
        status: result.error.status,
      });
      return;
    }
    if (!result.data.success || !result.data.data) {
      setError({
        message: result.data.message || "Something went wrong.",
        status: result.data.status,
      });
      return;
    }

    setDocuments((docs) => [...docs, ...(result.data.data?.document || [])]);
  };
  const handleAddDocuments = async (files: File[]) => {};
  const handleUpdateWorkspace = async (updated: UpdatedWorkspace) => {
    if (!workspace) return;
    const result = await client.api.workspace
      .update({ id: workspace.id })
      .put({ ...updated });
    if (!result) {
      setError({
        message: "Failed to update workspace",
        status: 500,
      });
      return;
    }
    if (result.error) {
      setError({
        message: result.error.value.message || "Something went wrong.",
        status: result.error.status,
      });
      return;
    }
    if (!result.data.success || !result.data.data) {
      setError({
        message: result.data.message || "Something went wrong.",
        status: result.data.status,
      });
      return;
    }
    setWorkspace((prev) => (prev ? { ...prev, ...updated } : null));
  };
  if (loading) return <LoadingPage></LoadingPage>;
  if (error)
    return (
      <ErrorPage message={error.message} status={error.status}></ErrorPage>
    );

  return (
    <div className="bg-[#0f172a] min-h-screen px-6 py-10 text-white">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Workspace Header */}
        {workspace && (
          <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-700 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{workspace.name}</h1>
                {/* <Pencil className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" /> */}
              </div>
              <div className="flex items-center gap-4">
                <button
                  className="text-sm text-yellow-400 hover:text-yellow-300 flex items-center gap-1"
                  onClick={() => setShowEditModal(true)}
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
                <button className="text-sm text-red-500 hover:text-red-400 flex items-center gap-1">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
            <p className="text-gray-300 text-sm">{workspace.description}</p>
          </div>
        )}

        {/* Add Document Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAddPopup(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            Add Document
          </button>{" "}
          <button
            onClick={() => setShowAddMultiplePopup(true)}
            disabled
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Documents
          </button>
        </div>

        {/* Document List */}
        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-[#1e293b] p-4 rounded-lg border border-gray-700 flex justify-between items-center hover:border-blue-500 transition"
            >
              <div>
                <div className="font-medium text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  {doc.title}
                </div>
                <p className="text-xs text-gray-400">
                  {doc.chunkIds.length} chunks •{" "}
                  {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-3 items-center">
                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditDoc(doc)}
                  className="text-yellow-400 hover:text-yellow-300"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-red-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Components */}
      <ViewDocumentModal
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />

      <EditDocumentModal
        document={editDoc}
        onClose={() => setEditDoc(null)}
        onSave={handleEditDocument}
      />

      <AddDocumentModal
        isOpen={showAddPopup}
        onClose={() => setShowAddPopup(false)}
        onAdd={handleAddDocument}
      />

      <AddDocumentsModal
        isOpen={showAddMultiplePopup}
        onClose={() => setShowAddMultiplePopup(false)}
        onAdd={handleAddDocuments}
      />
      {showEditModal && workspace && (
        <EditWorkspaceModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          workspace={{
            name: workspace.name,
            description: workspace.description,
            public: workspace.public,
          }}
          onSave={handleUpdateWorkspace}
        />
      )}
    </div>
  );
}
