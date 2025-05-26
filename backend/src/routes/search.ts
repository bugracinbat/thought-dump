import { Router } from "express";
import { prisma } from "../index";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// GET /api/search - Comprehensive search across posts and topics
router.get("/", async (req, res, next) => {
  try {
    const query = req.query.q as string;
    const type = (req.query.type as string) || "all"; // all, posts, topics
    const sortBy = (req.query.sortBy as string) || "relevance";
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;

    if (!query || query.trim().length === 0) {
      return res.json({
        posts: [],
        topics: [],
        total: 0,
        page,
        limit,
        hasMore: false,
      });
    }

    const searchTerm = query.trim();
    let posts: any[] = [];
    let topics: any[] = [];

    // Search posts if requested
    if (type === "all" || type === "posts") {
      const postWhere = {
        isModerated: false,
        OR: [
          {
            content: {
              contains: searchTerm,
            },
          },
          {
            authorNickname: {
              contains: searchTerm,
            },
          },
          {
            topic: {
              name: {
                contains: searchTerm,
              },
            },
          },
        ],
      };

      // Build order clause for posts
      let postOrderBy: any;
      switch (sortBy) {
        case "trending":
          postOrderBy = { score: "desc" };
          break;
        case "oldest":
          postOrderBy = { createdAt: "asc" };
          break;
        case "newest":
          postOrderBy = { createdAt: "desc" };
          break;
        default: // relevance
          postOrderBy = { createdAt: "desc" }; // For now, use newest as relevance
      }

      posts = await prisma.post.findMany({
        where: postWhere,
        include: {
          topic: true,
          _count: {
            select: {
              votes: true,
              comments: true,
            },
          },
        },
        orderBy: postOrderBy,
        take: type === "posts" ? limit : Math.ceil(limit / 2),
        skip: type === "posts" ? skip : 0,
      });

      // Add relevance scoring for posts
      posts = posts.map((post) => {
        let relevanceScore = 0;
        const lowerContent = post.content.toLowerCase();
        const lowerQuery = searchTerm.toLowerCase();
        const lowerTopic = post.topic.name.toLowerCase();
        const lowerAuthor = (post.authorNickname || "").toLowerCase();

        // Exact matches get higher scores
        if (lowerContent.includes(lowerQuery)) relevanceScore += 10;
        if (lowerTopic.includes(lowerQuery)) relevanceScore += 8;
        if (lowerAuthor.includes(lowerQuery)) relevanceScore += 5;

        // Boost score based on engagement
        relevanceScore += post.upvotes * 0.1;
        relevanceScore += post._count.comments * 0.2;

        return {
          ...post,
          relevanceScore,
          commentCount: post._count.comments,
        };
      });

      // Sort by relevance if requested
      if (sortBy === "relevance") {
        posts.sort((a, b) => b.relevanceScore - a.relevanceScore);
      }
    }

    // Search topics if requested
    if (type === "all" || type === "topics") {
      const topicWhere = {
        isActive: true,
        OR: [
          {
            name: {
              contains: searchTerm,
            },
          },
          {
            description: {
              contains: searchTerm,
            },
          },
        ],
      };

      topics = await prisma.topic.findMany({
        where: topicWhere,
        take: type === "topics" ? limit : Math.ceil(limit / 2),
        skip: type === "topics" ? skip : 0,
      });

      // Add relevance scoring for topics
      topics = topics.map((topic: any) => {
        let relevanceScore = 0;
        const lowerName = topic.name.toLowerCase();
        const lowerDescription = (topic.description || "").toLowerCase();
        const lowerQuery = searchTerm.toLowerCase();

        // Exact matches get higher scores
        if (lowerName.includes(lowerQuery)) relevanceScore += 15;
        if (lowerDescription.includes(lowerQuery)) relevanceScore += 8;

        // Boost score based on activity
        relevanceScore += topic.postCount * 0.1;

        return {
          ...topic,
          relevanceScore,
        };
      });

      // Sort topics
      switch (sortBy) {
        case "trending":
          topics.sort((a, b) => b.postCount - a.postCount);
          break;
        case "newest":
          topics.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case "oldest":
          topics.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          break;
        default: // relevance
          topics.sort((a, b) => b.relevanceScore - a.relevanceScore);
      }
    }

    const total = posts.length + topics.length;
    const hasMore = total >= limit;

    res.json({
      posts,
      topics,
      total,
      page,
      limit,
      hasMore,
      query: searchTerm,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/search/suggestions - Get search suggestions
router.get("/suggestions", async (req, res, next) => {
  try {
    const query = req.query.q as string;
    const limit = Math.min(parseInt(req.query.limit as string) || 5, 10);

    if (!query || query.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const searchTerm = query.trim();

    // Get topic suggestions
    const topicSuggestions = await prisma.topic.findMany({
      where: {
        isActive: true,
        name: {
          contains: searchTerm,
        },
      },
      select: {
        name: true,
        slug: true,
        postCount: true,
      },
      orderBy: { postCount: "desc" },
      take: limit,
    });

    // Get recent popular search terms (this would require a search_logs table in a real app)
    // For now, we'll just return topic suggestions
    const suggestions = topicSuggestions.map((topic: any) => ({
      text: topic.name,
      type: "topic",
      slug: topic.slug,
      count: topic.postCount,
    }));

    res.json({ suggestions });
  } catch (error) {
    next(error);
  }
});

export default router;
