import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  karma: integer("karma").default(0).notNull(),
  about: text("about"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url"),
  text: text("text"),
  points: integer("points").default(0).notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  type: text("type").default("story").notNull(), // can be "story", "ask", "show", "job"
  commentCount: integer("comment_count").default(0).notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  storyId: integer("story_id").notNull().references(() => stories.id),
  parentId: integer("parent_id").references((): any => comments.id),
  points: integer("points").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  storyId: integer("story_id").references(() => stories.id),
  commentId: integer("comment_id").references(() => comments.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  karma: true,
  createdAt: true,
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  points: true,
  createdAt: true,
  commentCount: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  points: true,
  createdAt: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;

// Extended schemas for validation
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = insertUserSchema
  .extend({
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginCredentials = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
