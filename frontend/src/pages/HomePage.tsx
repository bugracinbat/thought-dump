import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { PostList } from "../components/PostList";
import { TopicList } from "../components/TopicList";
import { FeedToggle } from "../components/FeedToggle";
import { LoadingSpinner } from "../components/LoadingSpinner";

export function HomePage() {
  const {
    posts,
    loading,
    error,
    feedType,
    topics,
    topicsLoading,
    setPosts,
    setLoading,
    setError,
    setTopics,
    setTopicsLoading,
  } = useStore();

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const sortBy = feedType === "trending" ? "trending" : "newest";
        const response = await fetch(`/api/posts?sortBy=${sortBy}&limit=20`);

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data = await response.json();
        setPosts(data.posts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [feedType, setPosts, setLoading, setError]);

  // Fetch topics
  useEffect(() => {
    const fetchTopics = async () => {
      setTopicsLoading(true);

      try {
        const response = await fetch("/api/topics");

        if (!response.ok) {
          throw new Error("Failed to fetch topics");
        }

        const data = await response.json();
        setTopics(data.topics);
      } catch (err) {
        console.error("Failed to fetch topics:", err);
      } finally {
        setTopicsLoading(false);
      }
    };

    fetchTopics();
  }, [setTopics, setTopicsLoading]);

  if (loading && posts.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary-900 mb-4">
          Welcome to Thought Dump
        </h1>
        <p className="text-lg text-primary-600 max-w-2xl mx-auto">
          A minimalist platform for anonymous discussion. Share your raw,
          unfiltered thoughts and discover what resonates with the community.
        </p>
      </div>

      {/* Topics Section */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-primary-900 mb-4">
          Browse Topics
        </h2>
        {topicsLoading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        ) : (
          <TopicList topics={topics} />
        )}
      </div>

      {/* Feed Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-primary-900">
            Latest Posts
          </h2>
          <FeedToggle />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <PostList posts={posts} />

        {loading && posts.length > 0 && (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="text-center py-8">
        <Link to="/create" className="btn btn-primary btn-lg">
          Share Your Thoughts
        </Link>
      </div>
    </div>
  );
}
