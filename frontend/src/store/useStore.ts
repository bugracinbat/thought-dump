import { create } from "zustand";
import type {
  Post,
  Topic,
  PostsResponse,
  FeedType,
  Comment,
  CommentsResponse,
} from "@/types";

interface AppState {
  // Posts state
  allPosts: Post[]; // Store all posts
  posts: Post[]; // Filtered posts based on feedType
  loading: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
  feedType: FeedType;

  // Comments state
  comments: Record<string, Comment[]>; // Comments by postId
  commentsLoading: Record<string, boolean>; // Loading state by postId
  commentsError: Record<string, string | null>; // Error state by postId
  showComments: Record<string, boolean>; // Show/hide comments by postId

  // Topics state
  topics: Topic[];
  topicsLoading: boolean;
  selectedTopic: Topic | null;

  // Actions
  setAllPosts: (posts: Post[]) => void; // Set all posts and update filtered posts
  setPosts: (posts: Post[]) => void;
  addPosts: (posts: Post[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentPage: (page: number) => void;
  setHasMore: (hasMore: boolean) => void;
  setFeedType: (feedType: FeedType) => void; // Updated to filter existing posts

  // Comment actions
  setComments: (postId: string, comments: Comment[]) => void;
  addComment: (postId: string, comment: Comment) => void;
  setCommentsLoading: (postId: string, loading: boolean) => void;
  setCommentsError: (postId: string, error: string | null) => void;
  toggleComments: (postId: string) => void;
  updateCommentVotes: (
    postId: string,
    commentId: string,
    upvotes: number,
    downvotes: number,
    score: number
  ) => void;

  setTopics: (topics: Topic[]) => void;
  setTopicsLoading: (loading: boolean) => void;
  setSelectedTopic: (topic: Topic | null) => void;

  // Vote on post
  updatePostVotes: (
    postId: string,
    upvotes: number,
    downvotes: number,
    score: number
  ) => void;

  // Clear store
  reset: () => void;
}

// Helper function to sort posts based on feed type
const sortPosts = (posts: Post[], feedType: FeedType): Post[] => {
  const sortedPosts = [...posts];

  if (feedType === "trending") {
    // Sort by score (upvotes - downvotes) descending, then by recent activity
    return sortedPosts.sort((a, b) => {
      const scoreA = a.upvotes - a.downvotes;
      const scoreB = b.upvotes - b.downvotes;

      if (scoreA !== scoreB) {
        return scoreB - scoreA; // Higher score first
      }

      // If scores are equal, sort by creation date (newer first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } else {
    // Chronological: sort by creation date (newer first)
    return sortedPosts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
};

// Helper function to sort comments
const sortComments = (comments: Comment[]): Comment[] => {
  return [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

const initialState = {
  allPosts: [],
  posts: [],
  loading: false,
  error: null,
  currentPage: 1,
  hasMore: true,
  feedType: "chronological" as FeedType,
  comments: {},
  commentsLoading: {},
  commentsError: {},
  showComments: {},
  topics: [],
  topicsLoading: false,
  selectedTopic: null,
};

export const useStore = create<AppState>((set, get) => ({
  ...initialState,

  setAllPosts: (allPosts) => {
    const { feedType } = get();
    const sortedPosts = sortPosts(allPosts, feedType);
    set({ allPosts, posts: sortedPosts });
  },

  setPosts: (posts) => set({ posts }),

  addPosts: (newPosts) =>
    set((state) => {
      const updatedAllPosts = [...state.allPosts, ...newPosts];
      const sortedPosts = sortPosts(updatedAllPosts, state.feedType);
      return {
        allPosts: updatedAllPosts,
        posts: sortedPosts,
      };
    }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setHasMore: (hasMore) => set({ hasMore }),

  setFeedType: (feedType) => {
    const { allPosts } = get();
    const sortedPosts = sortPosts(allPosts, feedType);
    set({ feedType, posts: sortedPosts });
  },

  // Comment actions
  setComments: (postId, comments) =>
    set((state) => ({
      comments: {
        ...state.comments,
        [postId]: sortComments(comments),
      },
    })),

  addComment: (postId, comment) =>
    set((state) => {
      const existingComments = state.comments[postId] || [];
      const updatedComments = sortComments([comment, ...existingComments]);

      // Also update the post's comment count
      const updatedAllPosts = state.allPosts.map((post) =>
        post.id === postId
          ? { ...post, commentCount: (post.commentCount || 0) + 1 }
          : post
      );
      const sortedPosts = sortPosts(updatedAllPosts, state.feedType);

      return {
        comments: {
          ...state.comments,
          [postId]: updatedComments,
        },
        allPosts: updatedAllPosts,
        posts: sortedPosts,
      };
    }),

  setCommentsLoading: (postId, loading) =>
    set((state) => ({
      commentsLoading: {
        ...state.commentsLoading,
        [postId]: loading,
      },
    })),

  setCommentsError: (postId, error) =>
    set((state) => ({
      commentsError: {
        ...state.commentsError,
        [postId]: error,
      },
    })),

  toggleComments: (postId) =>
    set((state) => ({
      showComments: {
        ...state.showComments,
        [postId]: !state.showComments[postId],
      },
    })),

  updateCommentVotes: (postId, commentId, upvotes, downvotes, score) =>
    set((state) => {
      const postComments = state.comments[postId] || [];
      const updatedComments = postComments.map((comment) =>
        comment.id === commentId
          ? { ...comment, upvotes, downvotes, score }
          : comment
      );

      return {
        comments: {
          ...state.comments,
          [postId]: updatedComments,
        },
      };
    }),

  setTopics: (topics) => set({ topics }),
  setTopicsLoading: (topicsLoading) => set({ topicsLoading }),
  setSelectedTopic: (selectedTopic) => set({ selectedTopic }),

  updatePostVotes: (postId, upvotes, downvotes, score) =>
    set((state) => {
      const updatedAllPosts = state.allPosts.map((post) =>
        post.id === postId ? { ...post, upvotes, downvotes, score } : post
      );
      const sortedPosts = sortPosts(updatedAllPosts, state.feedType);

      return {
        allPosts: updatedAllPosts,
        posts: sortedPosts,
      };
    }),

  reset: () => set(initialState),
}));
