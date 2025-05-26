import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { PostList } from "../components/PostList";
import { TopicList } from "../components/TopicList";
import { FeedToggle } from "../components/FeedToggle";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Sparkles, TrendingUp, Clock } from "lucide-react";

export function HomePage() {
  const {
    posts,
    loading,
    error,
    feedType,
    topics,
    topicsLoading,
    setAllPosts,
    setLoading,
    setError,
    setTopics,
    setTopicsLoading,
  } = useStore();

  // Fetch posts - only run once on mount
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        // Always fetch all posts sorted by newest first
        const response = await fetch(`/api/posts?sortBy=newest&limit=50`);

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data = await response.json();
        setAllPosts(data.posts); // Use setAllPosts instead of setPosts
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [setAllPosts, setLoading, setError]); // Add proper dependencies

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
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="card-gradient p-8 md:p-12 text-center relative">
          <div className="absolute inset-0 bg-gradient-radial from-accent-500/10 via-transparent to-transparent"></div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="h-8 w-8 text-gradient animate-pulse" />
              <h1 className="text-4xl md:text-5xl font-bold text-gradient">
                Welcome to Thought Dump
              </h1>
              <Sparkles className="h-8 w-8 text-gradient-pink animate-pulse" />
            </div>
            <p className="text-lg md:text-xl text-primary-600 max-w-3xl mx-auto leading-relaxed">
              A minimalist platform for anonymous discussion. Share your raw,
              unfiltered thoughts and discover what resonates with the
              community.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/create" className="btn btn-gradient btn-lg">
                <Sparkles className="h-5 w-5 mr-2" />
                Share Your Thoughts
              </Link>
              <div className="flex items-center space-x-4 text-sm text-primary-500">
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Trending discussions</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Real-time updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Topics Section */}
      <div className="slide-up">
        <div className="card-gradient p-6 md:p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-1 h-8 bg-gradient-accent rounded-full"></div>
            <h2 className="text-2xl font-bold text-primary-900">
              Browse Topics
            </h2>
            <Sparkles className="h-5 w-5 text-gradient-pink" />
          </div>
          {topicsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <TopicList topics={topics} />
          )}
        </div>
      </div>

      {/* Feed Section */}
      <div className="space-y-6 slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-1 h-8 bg-gradient-pink rounded-full"></div>
            <h2 className="text-2xl font-bold text-primary-900">
              Latest Posts
            </h2>
          </div>
          <FeedToggle />
        </div>

        {error && (
          <div className="card bg-red-50/80 border-red-200 p-4">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <PostList posts={posts} />

        {loading && posts.length > 0 && (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="slide-up">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-gradient p-6 text-center">
            <div className="text-3xl font-bold text-accent-600 mb-2">
              {posts.length}+
            </div>
            <div className="text-primary-600">Active Discussions</div>
          </div>
          <div className="card-gradient p-6 text-center">
            <div className="text-3xl font-bold text-pink-600 mb-2">
              {topics.length}+
            </div>
            <div className="text-primary-600">Topic Categories</div>
          </div>
          <div className="card-gradient p-6 text-center">
            <div className="text-3xl font-bold text-accent-600 mb-2">24/7</div>
            <div className="text-primary-600">Community Active</div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center py-12 slide-up">
        <div className="card-gradient p-8 md:p-12">
          <h3 className="text-2xl font-bold text-primary-900 mb-4">
            Ready to join the conversation?
          </h3>
          <p className="text-primary-600 mb-6 max-w-md mx-auto">
            Share your thoughts anonymously and connect with like-minded
            individuals.
          </p>
          <Link to="/create" className="btn btn-primary btn-lg">
            <Sparkles className="h-5 w-5 mr-2" />
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
