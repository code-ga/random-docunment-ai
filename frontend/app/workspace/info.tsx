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
import ChatBox from "../components/Chat/ChatBox";
import ChatList from "../components/Chat/ChatList";
import { ChatProvider } from "../contexts/ChatContext";

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

      setWorkspace(mockWorkspace.data.data.workspace);
      setDocuments(mockDocuments.data.data.documents || []);
      setLoading(false);
    };

    fetchWorkspace();
  }, [id]);

  const handleDelete = async (id: string) => {
    // setDocuments((docs) => docs.filter((d) => d.id !== id));
    const result = await client.api.document.delete.delete({ id });
    if (!result) {
      setError({
        message: "Failed to delete document",
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
    setDocuments((docs) => docs.filter((d) => d.id !== id));
  };

  const handleEditDocument = async (title: string) => {
    if (editDoc) {
      // setDocuments((docs) =>
      //   docs.map((d) => (d.id === editDoc.id ? { ...d, title } : d))
      // );
      // setEditDoc(null);

      const result = await client.api.document
        .update({ id: editDoc.id })
        .put({ name: title });
      if (!result) {
        setError({
          message: "Failed to update document",
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

      if (!result.data.data.document || !result.data.data.document[0]) {
        setError({
          message: result.data.message || "Something went wrong.",
          status: result.data.status,
        });
        return;
      }
      if (!result.data.data) {
        setError({
          message: result.data.message || "Something went wrong.",
          status: result.data.status,
        });
        return;
      }
      setDocuments((docs) =>
        docs.map((d) =>
          d.id === editDoc.id ? result.data.data!.document[0] : d
        )
      );
      setEditDoc(null);
    }
  };

  const handleAddDocument = async (
    title: string,
    content?: string,
    file?: File
  ) => {
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
    <div className="bg-[#0f172a] min-h-screen px-6 py-2 text-white">
      <h1 className="text-3xl font-bold text-white my-8">
        This Feature is under maintenance because of this pull request
        https://github.com/hackclub/ai/pull/24
      </h1>
      <div className=" mx-auto space-y-8">
        {/* Workspace Header */}
        {workspace && (
          <div className="bg-[#1e293b] p-8 px-6 rounded-2xl border border-gray-700 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{workspace.name}</h1>
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

        <div className="flex gap-4">
          {/* Documents Section - Left Sidebar */}
          <div className="w-80 flex-shrink-0">
            {/* Add Document Button */}
            <div className="flex flex-col gap-2 mb-4">
              <button
                onClick={() => setShowAddPopup(true)}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm font-semibold transition"
              >
                <Plus className="w-4 h-4" />
                Add Document
              </button>
              <button
                onClick={() => setShowAddMultiplePopup(true)}
                disabled
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm font-semibold transition disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add Documents
              </button>
            </div>

            {/* Document List */}
            <div className="bg-[#1e293b] rounded-lg border border-gray-700 min-h-[300px] overflow-y-auto">
              <div className="p-4 border-b border-gray-700">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Documents ({documents.length})
                </h3>
              </div>
              <div className="p-2 space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 hover:border-blue-500 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm truncate">
                          {doc.title}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {doc.chunkIds.length} chunks
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="text-blue-400 hover:text-blue-300 p-1"
                          title="View"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setEditDoc(doc)}
                          className="text-yellow-400 hover:text-yellow-300 p-1"
                          title="Edit"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="text-red-500 hover:text-red-400 p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {documents.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                    <p className="text-sm">No documents yet</p>
                    <p className="text-xs">Add documents to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Section with Context Provider */}
          <ChatProvider>
            {/* Chat Box - Center (Largest) */}
            <div className="flex-1 min-w-0">
              <ChatBox workspaceId={workspace?.id || ""} />
            </div>

            {/* Chat History - Right Sidebar */}
            <div className="w-72 flex-shrink-0">
              <ChatList workspaceId={workspace?.id || ""} />
            </div>
          </ChatProvider>
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
