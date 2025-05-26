import { Link, useLocation } from "react-router-dom";
import { MessageSquare, Plus, Settings, Sparkles } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background-primary relative">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-accent opacity-10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-pink opacity-10 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Header */}
      <header className="header-glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <MessageSquare className="h-8 w-8 text-accent-600 transition-transform group-hover:scale-110" />
                <Sparkles className="h-4 w-4 text-pink-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="text-xl font-bold text-accent-600">
                Thought Dump
              </span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-2">
              <Link
                to="/"
                className={`nav-link ${
                  location.pathname === "/" ? "active" : ""
                }`}
              >
                Home
              </Link>

              <Link
                to="/create"
                className="btn btn-primary btn-sm flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Post</span>
              </Link>

              <Link
                to="/admin"
                className={`nav-link ${
                  location.pathname === "/admin" ? "active" : ""
                }`}
              >
                <Settings className="h-4 w-4" />
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="fade-in">{children}</div>
      </main>

      {/* Footer */}
      <footer className="footer-gradient mt-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <MessageSquare className="h-6 w-6 text-accent-500" />
              <span className="text-lg font-semibold text-accent-600">
                Thought Dump
              </span>
            </div>
            <p className="text-primary-600 max-w-md mx-auto">
              A minimalist platform for anonymous discussion. Share your raw,
              unfiltered thoughts and discover what resonates with the
              community.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-primary-500">
              <span>Built with React & TypeScript</span>
              <span>•</span>
              <span>Powered by Vercel-inspired design</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
