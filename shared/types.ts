// Shared types for the Thought Dump platform

export interface Post {
  id: string;
  content: string;
  topicId: string;
  topic?: Topic;
  authorId?: string; // Optional for anonymous posts
  authorNickname?: string; // Anonymous nickname
  createdAt: Date;
  updatedAt: Date;
  upvotes: number;
  downvotes: number;
  score: number; // Calculated field for trending
  isModerated: boolean;
  moderatedAt?: Date;
  moderatedBy?: string;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Vote {
  id: string;
  postId: string;
  userId?: string; // For anonymous, this might be IP-based hash
  type: "upvote" | "downvote";
  createdAt: Date;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: "admin" | "moderator";
  createdAt: Date;
  isActive: boolean;
}

// API Request/Response types
export interface CreatePostRequest {
  content: string;
  topicId: string;
  authorNickname?: string;
}

export interface CreateTopicRequest {
  name: string;
  slug: string;
  description?: string;
}

export interface VoteRequest {
  type: "upvote" | "downvote";
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface TopicsResponse {
  topics: Topic[];
}

// Query parameters for posts
export interface PostsQuery {
  page?: number;
  limit?: number;
  sortBy?: "newest" | "trending" | "oldest";
  topicId?: string;
  search?: string;
}

// Error response
export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

// Feed types
export type FeedType = "chronological" | "trending";

// Post creation form data
export interface PostFormData {
  content: string;
  topicId: string;
  authorNickname: string;
}

// Topic creation form data
export interface TopicFormData {
  name: string;
  description: string;
}
