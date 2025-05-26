import { Router } from "express";
import { z } from "zod";
import { prisma } from "../index";
import { AppError } from "../middleware/errorHandler";
import crypto from "crypto";

const router = Router();

// Validation schemas
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

// Helper function to calculate comment score for sorting
const calculateScore = (
  upvotes: number,
  downvotes: number,
  createdAt: Date
): number => {
  const totalVotes = upvotes + downvotes;
  if (totalVotes === 0) return 0;

  const ratio = upvotes / totalVotes;
  const hoursSinceComment =
    (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);

  // Score decreases over time, increases with positive vote ratio
  return (
    (ratio * Math.log(totalVotes + 1)) / Math.pow(hoursSinceComment + 2, 1.8)
  );
};

// POST /api/comments/:id/vote - Vote on a comment
router.post("/:id/vote", async (req, res, next) => {
  try {
    const commentId = req.params.id;
    const validatedData = voteSchema.parse(req.body);
    const userId = generateAnonymousUserId(req.ip || "unknown");

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      const error = new Error("Comment not found") as AppError;
      error.statusCode = 404;
      error.code = "COMMENT_NOT_FOUND";
      throw error;
    }

    // Check if user already voted
    const existingVote = await prisma.commentVote.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
    });

    let upvoteDelta = 0;
    let downvoteDelta = 0;

    if (existingVote) {
      if (existingVote.type === validatedData.type.toUpperCase()) {
        // Same vote type - remove vote
        await prisma.commentVote.delete({
          where: { id: existingVote.id },
        });

        if (validatedData.type === "upvote") {
          upvoteDelta = -1;
        } else {
          downvoteDelta = -1;
        }
      } else {
        // Different vote type - update vote
        await prisma.commentVote.update({
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
      await prisma.commentVote.create({
        data: {
          commentId,
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

    // Update comment vote counts
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        upvotes: { increment: upvoteDelta },
        downvotes: { increment: downvoteDelta },
      },
    });

    // Calculate and update score
    const newScore = calculateScore(
      updatedComment.upvotes,
      updatedComment.downvotes,
      updatedComment.createdAt
    );

    await prisma.comment.update({
      where: { id: commentId },
      data: { score: newScore },
    });

    res.json({
      upvotes: updatedComment.upvotes,
      downvotes: updatedComment.downvotes,
      score: newScore,
    });
  } catch (error) {
    next(error);
  }
});

export { router as commentsRouter };
