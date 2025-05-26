import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
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
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/"
          className="p-2 rounded-md text-primary-600 hover:text-primary-700 hover:bg-primary-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <h1 className="text-2xl font-bold text-primary-900">
          Share Your Thoughts
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Topic Selection */}
        <div>
          <label
            htmlFor="topic"
            className="block text-sm font-medium text-primary-700 mb-2"
          >
            Topic *
          </label>
          <select
            id="topic"
            value={selectedTopicId}
            onChange={(e) => setSelectedTopicId(e.target.value)}
            className="input"
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
        <div>
          <label
            htmlFor="nickname"
            className="block text-sm font-medium text-primary-700 mb-2"
          >
            Nickname (optional)
          </label>
          <input
            type="text"
            id="nickname"
            value={authorNickname}
            onChange={(e) => setAuthorNickname(e.target.value)}
            placeholder="Anonymous"
            className="input"
            maxLength={50}
          />
          <p className="text-xs text-primary-500 mt-1">
            Leave blank to post anonymously
          </p>
        </div>

        {/* Content */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-primary-700 mb-2"
          >
            Your Thoughts *
          </label>
          <TextareaAutosize
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your raw, unfiltered thoughts..."
            className="input resize-none"
            minRows={4}
            maxRows={20}
            maxLength={5000}
            required
          />
          <div className="flex justify-between text-xs text-primary-500 mt-1">
            <span>Be authentic, be respectful</span>
            <span>{content.length}/5000</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end space-x-3">
          <Link to="/" className="btn btn-secondary">
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting || !content.trim() || !selectedTopicId}
            className="btn btn-primary flex items-center space-x-2"
          >
            {submitting ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>{submitting ? "Posting..." : "Post"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
