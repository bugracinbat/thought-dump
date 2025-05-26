import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Hash, Plus, TrendingUp } from "lucide-react";
import { PostList } from "../components/PostList";
import { FeedToggle } from "../components/FeedToggle";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useStore } from "../store/useStore";
import type { Topic, Post } from "@/types";

export function TopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { feedType } = useStore();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          `/api/topics/${slug}/posts?sortBy=${sortBy}&limit=50`
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
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="card-gradient p-12 max-w-md mx-auto">
          <p className="text-red-600 mb-6 font-medium">{error}</p>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-16">
        <div className="card-gradient p-12 max-w-md mx-auto">
          <p className="text-primary-600 mb-6">Topic not found</p>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="card-gradient p-6">
        <div className="flex items-start space-x-4">
          <Link to="/" className="btn btn-ghost p-2 mt-1">
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <Hash className="h-8 w-8 text-accent-500" />
              <h1 className="text-3xl font-bold text-accent-600">
                {topic.name}
              </h1>
              {topic.postCount > 10 && (
                <TrendingUp className="h-6 w-6 text-pink-500" />
              )}
            </div>

            {topic.description && (
              <p className="text-primary-600 text-lg mb-3 leading-relaxed">
                {topic.description}
              </p>
            )}

            <div className="flex items-center space-x-4 text-sm text-primary-500">
              <span className="flex items-center space-x-1">
                <span className="font-medium">{topic.postCount}</span>
                <span>{topic.postCount === 1 ? "post" : "posts"}</span>
              </span>
              <span>•</span>
              <span>Active discussions</span>
            </div>
          </div>

          <Link
            to="/create"
            state={{ topicId: topic.id }}
            className="btn btn-gradient btn-lg flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>New Post</span>
          </Link>
        </div>
      </div>

      {/* Feed Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-1 h-8 bg-gradient-accent rounded-full"></div>
          <h2 className="text-2xl font-bold text-primary-900">Posts</h2>
        </div>
        <FeedToggle />
      </div>

      {/* Posts */}
      <PostList posts={posts} />
    </div>
  );
}
