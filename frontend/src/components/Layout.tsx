import { Link, useLocation } from "react-router-dom";
import { MessageSquare, Plus, Settings } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <header className="bg-white border-b border-primary-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-primary-700" />
              <span className="text-xl font-bold text-primary-900">
                Thought Dump
              </span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === "/"
                    ? "bg-primary-100 text-primary-700"
                    : "text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                }`}
              >
                Home
              </Link>

              <Link
                to="/create"
                className="btn btn-primary btn-sm flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>New Post</span>
              </Link>

              <Link
                to="/admin"
                className={`p-2 rounded-md transition-colors ${
                  location.pathname === "/admin"
                    ? "bg-primary-100 text-primary-700"
                    : "text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                }`}
              >
                <Settings className="h-4 w-4" />
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-primary-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-primary-500">
            <p>Thought Dump - A minimalist platform for anonymous discussion</p>
            <p className="mt-1">
              Built with React, TypeScript, and TailwindCSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
