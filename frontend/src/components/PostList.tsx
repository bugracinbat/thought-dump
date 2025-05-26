import { formatDistanceToNow } from "date-fns";
import { ChevronUp, ChevronDown, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import type { Post } from "@/types";
import { useStore } from "../store/useStore";

interface PostListProps {
  posts: Post[];
}

export function PostList({ posts }: PostListProps) {
  const { updatePostVotes } = useStore();

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
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-primary-300 mx-auto mb-4" />
        <p className="text-primary-500">
          No posts yet. Be the first to share your thoughts!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <article key={post.id} className="card p-6">
          <div className="flex space-x-4">
            {/* Vote buttons */}
            <div className="flex flex-col items-center space-y-1">
              <button
                onClick={() => handleVote(post.id, "upvote")}
                className="vote-btn upvote"
                title="Upvote"
              >
                <ChevronUp className="h-4 w-4" />
              </button>

              <span className="text-sm font-medium text-primary-700">
                {post.upvotes - post.downvotes}
              </span>

              <button
                onClick={() => handleVote(post.id, "downvote")}
                className="vote-btn downvote"
                title="Downvote"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Post content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 text-sm text-primary-500 mb-2">
                <Link
                  to={`/topics/${post.topic?.slug}`}
                  className="font-medium hover:text-primary-700"
                >
                  {post.topic?.name}
                </Link>
                <span>•</span>
                <span>by {post.authorNickname || "Anonymous"}</span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              <div className="prose prose-primary max-w-none">
                <p className="text-primary-800 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
