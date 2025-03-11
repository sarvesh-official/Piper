import { Request, Response, NextFunction } from "express";

// Define an extended request type to include Clerk authentication data
interface AuthenticatedRequest extends Request {
  auth?: { userId?: string };
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return 
  }
  next();
};