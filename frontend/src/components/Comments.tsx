import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronUp,
  ChevronDown,
  Send,
  MessageSquare,
  User,
} from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { useStore } from "../store/useStore";
import { LoadingSpinner } from "./LoadingSpinner";
import type { Comment } from "@/types";

interface CommentsProps {
  postId: string;
}

export function Comments({ postId }: CommentsProps) {
  const {
    comments,
    commentsLoading,
    commentsError,
    setComments,
    addComment,
    setCommentsLoading,
    setCommentsError,
    updateCommentVotes,
  } = useStore();

  const [newComment, setNewComment] = useState("");
  const [authorNickname, setAuthorNickname] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const postComments = comments[postId] || [];
  const loading = commentsLoading[postId] || false;
  const error = commentsError[postId] || null;

  // Fetch comments when component mounts
  useEffect(() => {
    const fetchComments = async () => {
      if (postComments.length > 0) return; // Already loaded

      setCommentsLoading(postId, true);
      setCommentsError(postId, null);

      try {
        const response = await fetch(`/api/posts/${postId}/comments`);

        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }

        const data = await response.json();
        setComments(postId, data.comments || []);
      } catch (err) {
        setCommentsError(
          postId,
          err instanceof Error ? err.message : "Failed to load comments"
        );
      } finally {
        setCommentsLoading(postId, false);
      }
    };

    fetchComments();
  }, [
    postId,
    postComments.length,
    setComments,
    setCommentsLoading,
    setCommentsError,
  ]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment.trim(),
          authorNickname: authorNickname.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      const comment = await response.json();
      addComment(postId, comment);
      setNewComment("");
      setAuthorNickname("");
    } catch (err) {
      setCommentsError(
        postId,
        err instanceof Error ? err.message : "Failed to post comment"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoteComment = async (
    commentId: string,
    type: "upvote" | "downvote"
  ) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        throw new Error("Failed to vote on comment");
      }

      const data = await response.json();
      updateCommentVotes(
        postId,
        commentId,
        data.upvotes,
        data.downvotes,
        data.score
      );
    } catch (error) {
      console.error("Failed to vote on comment:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <div className="card-gradient p-6">
        <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-accent-500" />
          <span>Add a Comment</span>
        </h3>

        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="space-y-3">
            <label
              htmlFor={`nickname-${postId}`}
              className="flex items-center space-x-2 text-sm font-medium text-primary-700"
            >
              <User className="h-4 w-4 text-pink-500" />
              <span>Nickname (optional)</span>
            </label>
            <input
              type="text"
              id={`nickname-${postId}`}
              value={authorNickname}
              onChange={(e) => setAuthorNickname(e.target.value)}
              placeholder="Anonymous"
              className="input"
              maxLength={50}
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor={`comment-${postId}`}
              className="flex items-center space-x-2 text-sm font-medium text-primary-700"
            >
              <Send className="h-4 w-4 text-accent-500" />
              <span>Your Comment</span>
            </label>
            <TextareaAutosize
              id={`comment-${postId}`}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts on this post..."
              className="input resize-none"
              minRows={3}
              maxRows={10}
              maxLength={2000}
              required
            />
            <div className="flex justify-between text-xs text-primary-500">
              <span>Be respectful and constructive</span>
              <span>{newComment.length}/2000</span>
            </div>
          </div>

          {error && (
            <div className="card bg-red-50/80 border-red-200 p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="btn btn-primary btn-sm flex items-center space-x-2"
            >
              {submitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Post Comment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {postComments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-primary-300 mx-auto mb-3" />
            <p className="text-primary-500">No comments yet.</p>
            <p className="text-primary-400 text-sm">
              Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-primary-900 flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-accent-500" />
              <span>
                {postComments.length}{" "}
                {postComments.length === 1 ? "Comment" : "Comments"}
              </span>
            </h3>

            {postComments.map((comment, index) => (
              <div
                key={comment.id}
                className="card p-4 slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex space-x-4">
                  {/* Vote buttons */}
                  <div className="flex flex-col items-center space-y-1">
                    <button
                      onClick={() => handleVoteComment(comment.id, "upvote")}
                      className="vote-btn upvote group"
                      title="Upvote comment"
                    >
                      <ChevronUp className="h-4 w-4 transition-transform group-hover:scale-110" />
                    </button>

                    <span className="text-sm font-medium text-accent-600">
                      {comment.upvotes - comment.downvotes}
                    </span>

                    <button
                      onClick={() => handleVoteComment(comment.id, "downvote")}
                      className="vote-btn downvote group"
                      title="Downvote comment"
                    >
                      <ChevronDown className="h-4 w-4 transition-transform group-hover:scale-110" />
                    </button>
                  </div>

                  {/* Comment content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 text-sm text-primary-500 mb-2">
                      <span className="font-medium text-primary-600">
                        {comment.authorNickname || "Anonymous"}
                      </span>
                      <span className="w-1 h-1 bg-primary-300 rounded-full"></span>
                      <span>
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    <div className="prose prose-primary max-w-none">
                      <p className="text-primary-800 leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
