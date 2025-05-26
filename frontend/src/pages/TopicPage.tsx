import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PostList } from "../components/PostList";
import { FeedToggle } from "../components/FeedToggle";
import { LoadingSpinner } from "../components/LoadingSpinner";
import type { Topic, Post } from "@/types";

export function TopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedType, setFeedType] = useState<"chronological" | "trending">(
    "chronological"
  );

  useEffect(() => {
    const fetchTopicAndPosts = async () => {
      if (!slug) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch topic details
        const topicResponse = await fetch(`/api/topics/${slug}`);
        if (!topicResponse.ok) {
          throw new Error("Topic not found");
        }
        const topicData = await topicResponse.json();
        setTopic(topicData);

        // Fetch posts for this topic
        const sortBy = feedType === "trending" ? "trending" : "newest";
        const postsResponse = await fetch(
          `/api/topics/${slug}/posts?sortBy=${sortBy}&limit=20`
        );
        if (!postsResponse.ok) {
          throw new Error("Failed to fetch posts");
        }
        const postsData = await postsResponse.json();
        setPosts(postsData.posts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTopicAndPosts();
  }, [slug, feedType]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-12">
        <p className="text-primary-600 mb-4">Topic not found</p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
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

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary-900">{topic.name}</h1>
          {topic.description && (
            <p className="text-primary-600 mt-1">{topic.description}</p>
          )}
          <p className="text-sm text-primary-500 mt-1">
            {topic.postCount} {topic.postCount === 1 ? "post" : "posts"}
          </p>
        </div>

        <Link
          to="/create"
          state={{ topicId: topic.id }}
          className="btn btn-primary"
        >
          New Post
        </Link>
      </div>

      {/* Feed Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary-900">Posts</h2>
        <div className="flex items-center space-x-1 bg-primary-100 rounded-lg p-1">
          <button
            onClick={() => setFeedType("chronological")}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              feedType === "chronological"
                ? "bg-white text-primary-700 shadow-sm"
                : "text-primary-600 hover:text-primary-700"
            }`}
          >
            Latest
          </button>

          <button
            onClick={() => setFeedType("trending")}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              feedType === "trending"
                ? "bg-white text-primary-700 shadow-sm"
                : "text-primary-600 hover:text-primary-700"
            }`}
          >
            Trending
          </button>
        </div>
      </div>

      {/* Posts */}
      <PostList posts={posts} />
    </div>
  );
}
