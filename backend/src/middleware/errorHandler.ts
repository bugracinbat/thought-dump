import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let code = err.code || "INTERNAL_ERROR";

  // Handle Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    statusCode = 400;
    code = "DATABASE_ERROR";

    // Handle specific Prisma error codes
    if ((err as any).code === "P2002") {
      message = "A record with this value already exists";
      code = "DUPLICATE_RECORD";
    } else if ((err as any).code === "P2025") {
      message = "Record not found";
      code = "NOT_FOUND";
      statusCode = 404;
    }
  }

  // Handle validation errors
  if (err.name === "ZodError") {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = "Invalid input data";
  }

  // Log error for debugging
  if (statusCode >= 500) {
    console.error("🚨 Server Error:", {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  }

  // Send error response
  res.status(statusCode).json({
    message,
    code,
    ...(process.env.NODE_ENV === "development" && {
      details: err.details,
      stack: err.stack,
    }),
  });
};
