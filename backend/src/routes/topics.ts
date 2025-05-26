import { Router } from "express";
import { z } from "zod";
import { prisma } from "../index";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// Validation schema
const createTopicSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

// Helper function to create slug from name
const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// GET /api/topics - Get all topics
router.get("/", async (req, res, next) => {
  try {
    const topics = await prisma.topic.findMany({
      where: { isActive: true },
      orderBy: [{ postCount: "desc" }, { name: "asc" }],
    });

    res.json({ topics });
  } catch (error) {
    next(error);
  }
});

// GET /api/topics/:slug - Get topic by slug
router.get("/:slug", async (req, res, next) => {
  try {
    const slug = req.params.slug;

    const topic = await prisma.topic.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!topic) {
      const error = new Error("Topic not found") as AppError;
      error.statusCode = 404;
      error.code = "TOPIC_NOT_FOUND";
      throw error;
    }

    res.json(topic);
  } catch (error) {
    next(error);
  }
});

// GET /api/topics/:slug/posts - Get posts by topic
router.get("/:slug/posts", async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const sortBy = (req.query.sortBy as string) || "newest";

    const skip = (page - 1) * limit;

    // Find topic first
    const topic = await prisma.topic.findUnique({
      where: { slug },
    });

    if (!topic) {
      const error = new Error("Topic not found") as AppError;
      error.statusCode = 404;
      error.code = "TOPIC_NOT_FOUND";
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

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          topicId: topic.id,
          isModerated: false,
        },
        include: {
          topic: true,
          _count: {
            select: { votes: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.post.count({
        where: {
          topicId: topic.id,
          isModerated: false,
        },
      }),
    ]);

    res.json({
      topic,
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

// POST /api/topics - Create a new topic (admin only for now)
router.post("/", async (req, res, next) => {
  try {
    const validatedData = createTopicSchema.parse(req.body);

    const slug = createSlug(validatedData.name);

    // Check if topic with same name or slug exists
    const existingTopic = await prisma.topic.findFirst({
      where: {
        OR: [{ name: validatedData.name }, { slug }],
      },
    });

    if (existingTopic) {
      const error = new Error(
        "Topic with this name already exists"
      ) as AppError;
      error.statusCode = 409;
      error.code = "TOPIC_EXISTS";
      throw error;
    }

    const topic = await prisma.topic.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description,
      },
    });

    res.status(201).json(topic);
  } catch (error) {
    next(error);
  }
});

export { router as topicsRouter };
