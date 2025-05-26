import { create } from "zustand";
import type { Post, Topic, PostsResponse, FeedType } from "@/types";

interface AppState {
  // Posts state
  allPosts: Post[]; // Store all posts
  posts: Post[]; // Filtered posts based on feedType
  loading: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
  feedType: FeedType;

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

const initialState = {
  allPosts: [],
  posts: [],
  loading: false,
  error: null,
  currentPage: 1,
  hasMore: true,
  feedType: "chronological" as FeedType,
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
