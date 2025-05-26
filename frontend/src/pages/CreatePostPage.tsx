import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, Hash } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { LoadingSpinner } from "../components/LoadingSpinner";
import type { Topic } from "@/types";

export function CreatePostPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [content, setContent] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState(
    location.state?.topicId || ""
  );
  const [authorNickname, setAuthorNickname] = useState("");

  // Fetch topics
  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/topics");
        if (!response.ok) {
          throw new Error("Failed to fetch topics");
        }
        const data = await response.json();
        setTopics(data.topics);
      } catch (err) {
        setError("Failed to load topics");
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || !selectedTopicId) {
      setError("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          topicId: selectedTopicId,
          authorNickname: authorNickname.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      const post = await response.json();

      // Navigate to the topic page or home
      const topic = topics.find((t) => t.id === selectedTopicId);
      if (topic) {
        navigate(`/topics/${topic.slug}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 fade-in">
      {/* Header */}
      <div className="card-gradient p-6">
        <div className="flex items-center space-x-4">
          <Link to="/" className="btn btn-ghost p-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="flex items-center space-x-3">
            <Sparkles className="h-8 w-8 text-accent-600" />
            <h1 className="text-3xl font-bold text-accent-600">
              Share Your Thoughts
            </h1>
          </div>
        </div>
        <p className="text-primary-600 mt-3 ml-14">
          Express yourself authentically and connect with the community
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-gradient p-8 space-y-8">
          {/* Topic Selection */}
          <div className="space-y-3">
            <label
              htmlFor="topic"
              className="flex items-center space-x-2 text-sm font-semibold text-primary-700"
            >
              <Hash className="h-4 w-4 text-accent-500" />
              <span>Topic *</span>
            </label>
            <select
              id="topic"
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="input w-full"
              required
            >
              <option value="">Select a topic...</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          {/* Author Nickname */}
          <div className="space-y-3">
            <label
              htmlFor="nickname"
              className="flex items-center space-x-2 text-sm font-semibold text-primary-700"
            >
              <Sparkles className="h-4 w-4 text-pink-500" />
              <span>Nickname (optional)</span>
            </label>
            <input
              type="text"
              id="nickname"
              value={authorNickname}
              onChange={(e) => setAuthorNickname(e.target.value)}
              placeholder="Anonymous"
              className="input w-full"
              maxLength={50}
            />
            <p className="text-xs text-primary-500 flex items-center space-x-1">
              <span>💡</span>
              <span>Leave blank to post anonymously</span>
            </p>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <label
              htmlFor="content"
              className="flex items-center space-x-2 text-sm font-semibold text-primary-700"
            >
              <Send className="h-4 w-4 text-accent-500" />
              <span>Your Thoughts *</span>
            </label>
            <div className="relative">
              <TextareaAutosize
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your raw, unfiltered thoughts..."
                className="input resize-none w-full"
                minRows={6}
                maxRows={20}
                maxLength={5000}
                required
              />
              <div className="absolute bottom-3 right-3 text-xs text-primary-400">
                {content.length}/5000
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-primary-500">
              <span className="flex items-center space-x-1">
                <span>✨</span>
                <span>Be authentic, be respectful</span>
              </span>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="card bg-red-50/80 border-red-200 p-4">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="card-gradient p-6">
          <div className="flex justify-between items-center">
            <Link to="/" className="btn btn-secondary">
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting || !content.trim() || !selectedTopicId}
              className="btn btn-gradient btn-lg flex items-center space-x-2"
            >
              {submitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Share Thoughts</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
