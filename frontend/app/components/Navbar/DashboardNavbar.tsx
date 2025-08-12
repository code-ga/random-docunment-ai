import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Menu, User, LogOut, Plus, X } from "lucide-react";
import { signOut, useSession } from "../../lib/auth";
import { username } from "better-auth/plugins";
import ErrorPage from "../ErrorPage";
import LoadingPage from "../LoadingPage";

export const DashboardNavbar = () => {
  const { data, isPending, error } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const redirect = useNavigate();

  // Replace this with your actual user profile image URL
  // const profileImage = "https://i.pravatar.cc/150?img=32"; // demo avatar (replace with actual user photo)
  if (isPending) {
    return <LoadingPage></LoadingPage>;
  }
  if (error) {
    return (
      <ErrorPage message={error.message} status={error.status}></ErrorPage>
    );
  }
  const profileImage = data?.user?.image || "https://i.pravatar.cc/150?img=32";
  const username = data?.user?.name;

  return (
    <nav className="bg-[#0f172a] text-white px-6 py-4 shadow-md">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-2xl font-bold text-blue-400">
            study.ai
          </Link>
          <Link to="/dashboard" className="text-lg  text-blue-400">
            workspaces
          </Link>
          <Link to="/dashboard/quiz" className="text-lg  text-blue-400">
            quizzes
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-x-6">
          {/* Create Button */}
          <Link
            to="/dashboard/workspace/create"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            Create Workspace
          </Link>
          <Link
            to="/dashboard/quiz/create"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            Create Quiz
          </Link>
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen((prev) => !prev)}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-600 hover:ring-2 hover:ring-blue-400 transition"
            >
              <img
                src={profileImage}
                alt="User"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/fallback.png";
                }}
              />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-3 w-52 bg-gray-800 rounded-md shadow-lg z-20 py-2">
                {/* Username */}
                <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                  Signed in as
                  <br />
                  <span className="font-semibold text-white">{username}</span>
                </div>

                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 hover:bg-gray-700 transition"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    // logout logic
                  }}
                  className="flex items-center w-full px-4 py-2 hover:bg-gray-700 text-left transition"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded hover:bg-blue-700 transition"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-5 space-y-3">
          <Link
            to="/create"
            className="block w-full bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg text-sm font-medium"
          >
            + Create
          </Link>

          <div className="border-t border-gray-700 pt-3 space-y-2">
            <Link
              to="/profile"
              className="block px-5 py-2 hover:bg-gray-700 rounded transition"
            >
              Profile
            </Link>
            <button
              onClick={() => {
                signOut()
                  .catch(console.error)
                  .then(() => redirect("/"));
              }}
              className="w-full text-left px-5 py-2 hover:bg-gray-700 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default DashboardNavbar;
