import { Router } from "express";
import { z } from "zod";
import { prisma } from "../index";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// Basic admin middleware (you can replace this with proper JWT auth later)
const requireAdmin = (req: any, res: any, next: any) => {
  // For now, just check for admin header - replace with proper auth
  const adminKey = req.headers["x-admin-key"];
  if (adminKey !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Apply admin middleware to all routes
router.use(requireAdmin);

// GET /api/admin/posts - Get all posts including moderated ones
router.get("/posts", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const includeModerated = req.query.includeModerated === "true";

    const skip = (page - 1) * limit;

    const where = includeModerated ? {} : { isModerated: false };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          topic: true,
          _count: {
            select: { votes: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    res.json({
      posts,
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/posts/:id/moderate - Moderate a post
router.post("/posts/:id/moderate", async (req, res, next) => {
  try {
    const postId = req.params.id;
    const { action } = req.body; // 'approve' or 'remove'

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      const error = new Error("Post not found") as AppError;
      error.statusCode = 404;
      error.code = "POST_NOT_FOUND";
      throw error;
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        isModerated: action === "remove",
        moderatedAt: new Date(),
        moderatedBy: "admin", // Replace with actual admin user ID
      },
    });

    // Update topic post count if removing
    if (action === "remove" && !post.isModerated) {
      await prisma.topic.update({
        where: { id: post.topicId },
        data: { postCount: { decrement: 1 } },
      });
    } else if (action === "approve" && post.isModerated) {
      await prisma.topic.update({
        where: { id: post.topicId },
        data: { postCount: { increment: 1 } },
      });
    }

    res.json(updatedPost);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/stats - Get platform statistics
router.get("/stats", async (req, res, next) => {
  try {
    const [totalPosts, totalTopics, totalVotes, moderatedPosts, recentPosts] =
      await Promise.all([
        prisma.post.count(),
        prisma.topic.count(),
        prisma.vote.count(),
        prisma.post.count({ where: { isModerated: true } }),
        prisma.post.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        }),
      ]);

    res.json({
      totalPosts,
      totalTopics,
      totalVotes,
      moderatedPosts,
      recentPosts,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/topics/:id/toggle - Toggle topic active status
router.post("/topics/:id/toggle", async (req, res, next) => {
  try {
    const topicId = req.params.id;

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      const error = new Error("Topic not found") as AppError;
      error.statusCode = 404;
      error.code = "TOPIC_NOT_FOUND";
      throw error;
    }

    const updatedTopic = await prisma.topic.update({
      where: { id: topicId },
      data: { isActive: !topic.isActive },
    });

    res.json(updatedTopic);
  } catch (error) {
    next(error);
  }
});

export { router as adminRouter };
