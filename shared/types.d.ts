export interface Post {
    id: string;
    content: string;
    topicId: string;
    topic?: Topic;
    authorId?: string;
    authorNickname?: string;
    createdAt: Date;
    updatedAt: Date;
    upvotes: number;
    downvotes: number;
    score: number;
    isModerated: boolean;
    moderatedAt?: Date;
    moderatedBy?: string;
    commentCount?: number;
}
export interface Comment {
    id: string;
    postId: string;
    content: string;
    authorId?: string;
    authorNickname?: string;
    createdAt: Date;
    updatedAt: Date;
    upvotes: number;
    downvotes: number;
    score: number;
    isModerated: boolean;
    moderatedAt?: Date;
    moderatedBy?: string;
    parentId?: string;
    replies?: Comment[];
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
    userId?: string;
    type: "upvote" | "downvote";
    createdAt: Date;
}
export interface CommentVote {
    id: string;
    commentId: string;
    userId?: string;
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
export interface CreatePostRequest {
    content: string;
    topicId: string;
    authorNickname?: string;
}
export interface CreateCommentRequest {
    content: string;
    postId: string;
    authorNickname?: string;
    parentId?: string;
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
export interface CommentsResponse {
    comments: Comment[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
export interface TopicsResponse {
    topics: Topic[];
}
export interface PostsQuery {
    page?: number;
    limit?: number;
    sortBy?: "newest" | "trending" | "oldest";
    topicId?: string;
    search?: string;
}
export interface CommentsQuery {
    page?: number;
    limit?: number;
    sortBy?: "newest" | "trending" | "oldest";
    postId: string;
}
export interface ApiError {
    message: string;
    code: string;
    details?: any;
}
export type FeedType = "chronological" | "trending";
export interface PostFormData {
    content: string;
    topicId: string;
    authorNickname: string;
}
export interface CommentFormData {
    content: string;
    authorNickname: string;
}
export interface TopicFormData {
    name: string;
    description: string;
}
//# sourceMappingURL=types.d.ts.map