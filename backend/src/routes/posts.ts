import { Router } from "express";
import { z } from "zod";
import { prisma } from "../index";
import { AppError } from "../middleware/errorHandler";
import crypto from "crypto";

const router = Router();

// Validation schemas
const createPostSchema = z.object({
  content: z.string().min(1).max(5000),
  topicId: z.string(),
  authorNickname: z.string().optional(),
});

const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  authorNickname: z.string().optional(),
  parentId: z.string().optional(),
});

const voteSchema = z.object({
  type: z.enum(["upvote", "downvote"]),
});

// Helper function to generate anonymous user ID from IP
const generateAnonymousUserId = (ip: string): string => {
  const secret = process.env.HASH_SECRET || "default-secret";
  return crypto
    .createHash("sha256")
    .update(ip + secret)
    .digest("hex");
};

// Helper function to calculate post score for trending
const calculateScore = (
  upvotes: number,
  downvotes: number,
  createdAt: Date
): number => {
  const totalVotes = upvotes + downvotes;
  if (totalVotes === 0) return 0;

  const ratio = upvotes / totalVotes;
  const hoursSincePost = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);

  // Score decreases over time, increases with positive vote ratio
  return (ratio * Math.log(totalVotes + 1)) / Math.pow(hoursSincePost + 2, 1.8);
};

// GET /api/posts - Fetch posts with pagination and sorting
router.get("/", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const sortBy = (req.query.sortBy as string) || "newest";
    const topicId = req.query.topicId as string;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isModerated: false, // Don't show moderated posts to regular users
    };

    if (topicId) {
      where.topicId = topicId;
    }

    if (search) {
      where.OR = [
        {
          content: {
            contains: search,
          },
        },
        {
          authorNickname: {
            contains: search,
          },
        },
        {
          topic: {
            name: {
              contains: search,
            },
          },
        },
      ];
    }

    // Build order clause
    let orderBy: any;
    switch (sortBy) {
      case "trending":
        orderBy = { score: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      default: // newest
        orderBy = { createdAt: "desc" };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          topic: true,
          _count: {
            select: {
              votes: true,
              comments: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    // Map the response to include commentCount
    const postsWithCommentCount = posts.map((post) => ({
      ...post,
      commentCount: post._count.comments,
    }));

    res.json({
      posts: postsWithCommentCount,
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/posts - Create a new post
router.post("/", async (req, res, next) => {
  try {
    const validatedData = createPostSchema.parse(req.body);

    // Verify topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: validatedData.topicId },
    });

    if (!topic) {
      const error = new Error("Topic not found") as AppError;
      error.statusCode = 404;
      error.code = "TOPIC_NOT_FOUND";
      throw error;
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        content: validatedData.content,
        topicId: validatedData.topicId,
        authorNickname: validatedData.authorNickname || "Anonymous",
      },
      include: {
        topic: true,
      },
    });

    // Update topic post count
    await prisma.topic.update({
      where: { id: validatedData.topicId },
      data: { postCount: { increment: 1 } },
    });

    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

// POST /api/posts/:id/vote - Vote on a post
router.post("/:id/vote", async (req, res, next) => {
  try {
    const postId = req.params.id;
    const validatedData = voteSchema.parse(req.body);
    const userId = generateAnonymousUserId(req.ip || "unknown");

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      const error = new Error("Post not found") as AppError;
      error.statusCode = 404;
      error.code = "POST_NOT_FOUND";
      throw error;
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    let upvoteDelta = 0;
    let downvoteDelta = 0;

    if (existingVote) {
      if (existingVote.type === validatedData.type.toUpperCase()) {
        // Same vote type - remove vote
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });

        if (validatedData.type === "upvote") {
          upvoteDelta = -1;
        } else {
          downvoteDelta = -1;
        }
      } else {
        // Different vote type - update vote
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { type: validatedData.type.toUpperCase() as any },
        });

        if (validatedData.type === "upvote") {
          upvoteDelta = 1;
          downvoteDelta = -1;
        } else {
          upvoteDelta = -1;
          downvoteDelta = 1;
        }
      }
    } else {
      // New vote
      await prisma.vote.create({
        data: {
          postId,
          userId,
          type: validatedData.type.toUpperCase() as any,
        },
      });

      if (validatedData.type === "upvote") {
        upvoteDelta = 1;
      } else {
        downvoteDelta = 1;
      }
    }

    // Update post vote counts
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        upvotes: { increment: upvoteDelta },
        downvotes: { increment: downvoteDelta },
      },
    });

    // Calculate and update score
    const newScore = calculateScore(
      updatedPost.upvotes,
      updatedPost.downvotes,
      updatedPost.createdAt
    );

    await prisma.post.update({
      where: { id: postId },
      data: { score: newScore },
    });

    res.json({
      upvotes: updatedPost.upvotes,
      downvotes: updatedPost.downvotes,
      score: newScore,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/posts/:id - Get single post
router.get("/:id", async (req, res, next) => {
  try {
    const postId = req.params.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        topic: true,
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      const error = new Error("Post not found") as AppError;
      error.statusCode = 404;
      error.code = "POST_NOT_FOUND";
      throw error;
    }

    // Map the response to include commentCount
    const postWithCommentCount = {
      ...post,
      commentCount: post._count.comments,
    };

    res.json(postWithCommentCount);
  } catch (error) {
    next(error);
  }
});

// GET /api/posts/:id/comments - Get comments for a post
router.get("/:id/comments", async (req, res, next) => {
  try {
    const postId = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const sortBy = (req.query.sortBy as string) || "newest";

    const skip = (page - 1) * limit;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      const error = new Error("Post not found") as AppError;
      error.statusCode = 404;
      error.code = "POST_NOT_FOUND";
      throw error;
    }

    // Build order clause
    let orderBy: any;
    switch (sortBy) {
      case "trending":
        orderBy = { score: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      default: // newest
        orderBy = { createdAt: "desc" };
    }

    const where = {
      postId,
      isModerated: false, // Don't show moderated comments
    };

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.comment.count({ where }),
    ]);

    res.json({
      comments,
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/posts/:id/comments - Create a comment on a post
router.post("/:id/comments", async (req, res, next) => {
  try {
    const postId = req.params.id;
    const validatedData = createCommentSchema.parse(req.body);

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      const error = new Error("Post not found") as AppError;
      error.statusCode = 404;
      error.code = "POST_NOT_FOUND";
      throw error;
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        postId,
        authorNickname: validatedData.authorNickname || "Anonymous",
        parentId: validatedData.parentId,
      },
    });

    // Update post comment count
    await prisma.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    });

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

export { router as postsRouter };
