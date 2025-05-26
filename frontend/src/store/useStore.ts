import { create } from "zustand";
import type { Post, Topic, PostsResponse, FeedType } from "@/types";

interface AppState {
  // Posts state
  posts: Post[];
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
  setPosts: (posts: Post[]) => void;
  addPosts: (posts: Post[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentPage: (page: number) => void;
  setHasMore: (hasMore: boolean) => void;
  setFeedType: (feedType: FeedType) => void;

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

const initialState = {
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

export const useStore = create<AppState>((set) => ({
  ...initialState,

  setPosts: (posts) => set({ posts }),
  addPosts: (newPosts) =>
    set((state) => ({
      posts: [...state.posts, ...newPosts],
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setHasMore: (hasMore) => set({ hasMore }),
  setFeedType: (feedType) => set({ feedType, posts: [], currentPage: 1 }),

  setTopics: (topics) => set({ topics }),
  setTopicsLoading: (topicsLoading) => set({ topicsLoading }),
  setSelectedTopic: (selectedTopic) => set({ selectedTopic }),

  updatePostVotes: (postId, upvotes, downvotes, score) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId ? { ...post, upvotes, downvotes, score } : post
      ),
    })),

  reset: () => set(initialState),
}));
