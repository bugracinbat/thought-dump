import { formatDistanceToNow } from "date-fns";
import { ChevronUp, ChevronDown, MessageSquare, Hash } from "lucide-react";
import { Link } from "react-router-dom";
import type { Post } from "@/types";
import { useStore } from "../store/useStore";

interface PostListProps {
  posts: Post[];
}

export function PostList({ posts }: PostListProps) {
  const { updatePostVotes, feedType } = useStore();

  const handleVote = async (postId: string, type: "upvote" | "downvote") => {
    try {
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        throw new Error("Failed to vote");
      }

      const data = await response.json();
      updatePostVotes(postId, data.upvotes, data.downvotes, data.score);
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="card-gradient p-12 max-w-md mx-auto">
          <MessageSquare className="h-16 w-16 text-accent-500 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-primary-900 mb-2">
            No posts yet
          </h3>
          <p className="text-primary-600 mb-6">
            Be the first to share your thoughts and start the conversation!
          </p>
          <Link to="/create" className="btn btn-primary btn-md">
            Create First Post
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div key={feedType} className="space-y-6 fade-in">
      {posts.map((post, index) => (
        <article
          key={post.id}
          className="post-card p-6 slide-up"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div className="flex space-x-6">
            {/* Vote buttons */}
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={() => handleVote(post.id, "upvote")}
                className="vote-btn upvote group"
                title="Upvote"
              >
                <ChevronUp className="h-5 w-5 transition-transform group-hover:scale-110" />
              </button>

              <div className="text-center">
                <span className="text-lg font-bold text-accent-600">
                  {post.upvotes - post.downvotes}
                </span>
                <div className="text-xs text-primary-500">votes</div>
              </div>

              <button
                onClick={() => handleVote(post.id, "downvote")}
                className="vote-btn downvote group"
                title="Downvote"
              >
                <ChevronDown className="h-5 w-5 transition-transform group-hover:scale-110" />
              </button>
            </div>

            {/* Post content */}
            <div className="flex-1 min-w-0">
              {/* Post metadata */}
              <div className="flex items-center flex-wrap gap-3 text-sm text-primary-500 mb-4">
                <Link to={`/topics/${post.topic?.slug}`} className="topic-tag">
                  <Hash className="h-3 w-3 mr-1" />
                  {post.topic?.name}
                </Link>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-primary-600">
                    {post.authorNickname || "Anonymous"}
                  </span>
                  <span className="w-1 h-1 bg-primary-300 rounded-full"></span>
                  <span>
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>

              {/* Post content */}
              <div className="prose prose-primary max-w-none">
                <p className="text-primary-800 leading-relaxed whitespace-pre-wrap text-base">
                  {post.content}
                </p>
              </div>

              {/* Post stats */}
              <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-border-primary/30">
                <div className="flex items-center space-x-2 text-sm text-primary-500">
                  <ChevronUp className="h-4 w-4 text-green-500" />
                  <span>{post.upvotes} upvotes</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-primary-500">
                  <ChevronDown className="h-4 w-4 text-red-500" />
                  <span>{post.downvotes} downvotes</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-primary-500">
                  <MessageSquare className="h-4 w-4" />
                  <span>Discussion</span>
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
