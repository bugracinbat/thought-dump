import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, BarChart3, Eye, EyeOff } from "lucide-react";
import { LoadingSpinner } from "../components/LoadingSpinner";
import type { Post } from "@/types";

interface AdminStats {
  totalPosts: number;
  totalTopics: number;
  totalVotes: number;
  moderatedPosts: number;
  recentPosts: number;
}

export function AdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminKey, setAdminKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const fetchAdminData = async (key: string) => {
    try {
      setLoading(true);

      // Fetch posts
      const postsResponse = await fetch(
        "/api/admin/posts?includeModerated=true",
        {
          headers: {
            "x-admin-key": key,
          },
        }
      );

      if (!postsResponse.ok) {
        throw new Error("Unauthorized");
      }

      const postsData = await postsResponse.json();
      setPosts(postsData.posts);

      // Fetch stats
      const statsResponse = await fetch("/api/admin/stats", {
        headers: {
          "x-admin-key": key,
        },
      });

      if (!statsResponse.ok) {
        throw new Error("Failed to fetch stats");
      }

      const statsData = await statsResponse.json();
      setStats(statsData);

      setAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey.trim()) {
      fetchAdminData(adminKey.trim());
    }
  };

  const handleModerate = async (
    postId: string,
    action: "approve" | "remove"
  ) => {
    try {
      const response = await fetch(`/api/admin/posts/${postId}/moderate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error("Failed to moderate post");
      }

      // Refresh posts
      fetchAdminData(adminKey);
    } catch (err) {
      console.error("Failed to moderate post:", err);
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="p-2 rounded-md text-primary-600 hover:text-primary-700 hover:bg-primary-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <h1 className="text-2xl font-bold text-primary-900">Admin Panel</h1>
        </div>

        <form onSubmit={handleLogin} className="card p-6 space-y-4">
          <div className="text-center mb-4">
            <Shield className="h-12 w-12 text-primary-400 mx-auto mb-2" />
            <p className="text-primary-600">Enter admin key to continue</p>
          </div>

          <div>
            <label
              htmlFor="adminKey"
              className="block text-sm font-medium text-primary-700 mb-2"
            >
              Admin Key
            </label>
            <input
              type="password"
              id="adminKey"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="input"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? <LoadingSpinner size="sm" /> : "Login"}
          </button>
        </form>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/"
          className="p-2 rounded-md text-primary-600 hover:text-primary-700 hover:bg-primary-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <h1 className="text-2xl font-bold text-primary-900">Admin Panel</h1>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-primary-900">
              {stats.totalPosts}
            </div>
            <div className="text-sm text-primary-600">Total Posts</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-primary-900">
              {stats.totalTopics}
            </div>
            <div className="text-sm text-primary-600">Topics</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-primary-900">
              {stats.totalVotes}
            </div>
            <div className="text-sm text-primary-600">Total Votes</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.moderatedPosts}
            </div>
            <div className="text-sm text-primary-600">Moderated</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.recentPosts}
            </div>
            <div className="text-sm text-primary-600">Last 24h</div>
          </div>
        </div>
      )}

      {/* Posts */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-primary-900 mb-4">
          Recent Posts
        </h2>

        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`border rounded-lg p-4 ${
                post.isModerated
                  ? "border-red-200 bg-red-50"
                  : "border-primary-200"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm text-primary-500">
                  <span className="font-medium">{post.topic?.name}</span>
                  <span className="mx-2">•</span>
                  <span>{post.authorNickname || "Anonymous"}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-2">
                  {post.isModerated ? (
                    <button
                      onClick={() => handleModerate(post.id, "approve")}
                      className="btn btn-sm btn-secondary flex items-center space-x-1"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Approve</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleModerate(post.id, "remove")}
                      className="btn btn-sm bg-red-600 text-white hover:bg-red-700 flex items-center space-x-1"
                    >
                      <EyeOff className="h-3 w-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>

              <p className="text-primary-800 leading-relaxed">{post.content}</p>

              <div className="flex items-center space-x-4 mt-2 text-sm text-primary-500">
                <span>↑ {post.upvotes}</span>
                <span>↓ {post.downvotes}</span>
                <span>Score: {post.score.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
