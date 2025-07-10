import { useState } from "react";
import { Link } from "react-router";
import { Menu, User, LogOut, Plus } from "lucide-react";

export const DashboardNavbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="bg-[#0f172a] text-white px-6 py-3 flex items-center justify-between shadow-md">
      {/* Logo */}
      <Link to="/" className="text-xl font-bold text-blue-400">
        study.ai
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Create Button */}
        <Link
          to="/create"
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Create
        </Link>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-9 h-9 rounded-full bg-blue-800 flex items-center justify-center hover:ring-2 hover:ring-blue-400"
          >
            <User className="w-5 h-5 text-white" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-gray-800 rounded-md shadow-lg z-20">
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 hover:bg-gray-700"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Link>
              <button
                onClick={() => {
                  // implement logout logic
                }}
                className="flex items-center w-full px-4 py-2 hover:bg-gray-700 text-left"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
