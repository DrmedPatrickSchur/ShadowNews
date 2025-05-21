import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertStorySchema, 
  insertCommentSchema, 
  insertVoteSchema,
  loginSchema,
  registerSchema 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import bcrypt from "bcrypt";
import session from "express-session";
import MemoryStore from "memorystore";

// Extend the session data type to include userId
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "shadow-news-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 86400000 }, // 1 day
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );
  
  // Error handler helper
  const handleError = (res: Response, error: unknown) => {
    console.error("API Error:", error);
    if (error instanceof ZodError) {
      return res.status(400).json({ error: fromZodError(error).message });
    }
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Unknown error occurred" });
  };

  // Authentication check middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    next();
  };

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already taken" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        username: userData.username,
        password: hashedPassword,
        email: userData.email
      });
      
      // Set session
      req.session.userId = user.id;
      
      // Return user (without password)
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByUsername(credentials.username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      // Check password
      const passwordMatch = await bcrypt.compare(credentials.password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      // Set session
      req.session.userId = user.id;
      
      // Return user (without password)
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ error: "User not found" });
      }
      
      // Return user (without password)
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      handleError(res, error);
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Return user (without password)
      const { password, ...userWithoutPassword } = user;
      
      // Get user's stories
      const stories = await storage.getStoriesByUser(userId);
      
      // Get user's comments
      const comments = await storage.getCommentsByUser(userId);
      
      res.json({
        user: userWithoutPassword,
        stories,
        comments
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  // Story routes
  app.get("/api/stories", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 30;
      const type = req.query.type as string | undefined;
      const sortBy = req.query.sortBy as string || 'newest';
      
      const stories = await storage.getStories(page, limit, type, sortBy);
      const totalStories = await storage.getStoryCount(type);
      const totalPages = Math.ceil(totalStories / limit);
      
      res.json({
        stories,
        pagination: {
          page,
          limit,
          totalPages,
          totalItems: totalStories
        }
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/stories/featured", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 2;
      const stories = await storage.getFeaturedStories(limit);
      res.json(stories);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/stories/:id", async (req, res) => {
    try {
      const storyId = parseInt(req.params.id);
      const story = await storage.getStory(storyId);
      
      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }
      
      // Get comments for the story
      const comments = await storage.getComments(storyId);
      
      // Get author info
      const author = await storage.getUser(story.userId);
      let authorName = "unknown";
      if (author) {
        authorName = author.username;
      }
      
      res.json({
        story,
        comments,
        author: authorName
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/stories", requireAuth, async (req, res) => {
    try {
      const storyData = insertStorySchema.parse(req.body);
      
      // Set user ID from session
      storyData.userId = req.session.userId!;
      
      // Either URL or text must be provided
      if (!storyData.url && !storyData.text) {
        return res.status(400).json({ error: "Either URL or text must be provided" });
      }
      
      const story = await storage.createStory(storyData);
      res.status(201).json(story);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Comment routes
  app.get("/api/stories/:storyId/comments", async (req, res) => {
    try {
      const storyId = parseInt(req.params.storyId);
      const comments = await storage.getComments(storyId);
      res.json(comments);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/comments", requireAuth, async (req, res) => {
    try {
      const commentData = insertCommentSchema.parse(req.body);
      
      // Set user ID from session
      commentData.userId = req.session.userId!;
      
      // Check if story exists
      const story = await storage.getStory(commentData.storyId);
      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }
      
      // If parentId is provided, check if parent comment exists
      if (commentData.parentId) {
        const parentComment = await storage.getComment(commentData.parentId);
        if (!parentComment) {
          return res.status(404).json({ error: "Parent comment not found" });
        }
      }
      
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Vote routes
  app.post("/api/vote", requireAuth, async (req, res) => {
    try {
      const voteData = insertVoteSchema.parse(req.body);
      
      // Set user ID from session
      voteData.userId = req.session.userId!;
      
      // Either storyId or commentId must be provided
      if (!voteData.storyId && !voteData.commentId) {
        return res.status(400).json({ error: "Either storyId or commentId must be provided" });
      }
      
      // Check if user already voted
      const existingVote = await storage.getVote(
        voteData.userId, 
        voteData.storyId || undefined, 
        voteData.commentId || undefined
      );
      
      if (existingVote) {
        return res.status(400).json({ error: "Already voted" });
      }
      
      // Check if target exists
      if (voteData.storyId) {
        const story = await storage.getStory(voteData.storyId);
        if (!story) {
          return res.status(404).json({ error: "Story not found" });
        }
      } else if (voteData.commentId) {
        const comment = await storage.getComment(voteData.commentId);
        if (!comment) {
          return res.status(404).json({ error: "Comment not found" });
        }
      }
      
      const vote = await storage.createVote(voteData);
      res.status(201).json(vote);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete("/api/vote", requireAuth, async (req, res) => {
    try {
      const { storyId, commentId } = req.body;
      
      // Either storyId or commentId must be provided
      if (!storyId && !commentId) {
        return res.status(400).json({ error: "Either storyId or commentId must be provided" });
      }
      
      await storage.removeVote(req.session.userId!, storyId || undefined, commentId || undefined);
      res.json({ success: true });
    } catch (error) {
      handleError(res, error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
