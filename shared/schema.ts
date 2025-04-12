import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// News article analysis schema
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  source: text("source").notNull(),
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
});

export const insertArticleSchema = createInsertSchema(articles).pick({
  url: true,
  title: true,
  content: true,
  source: true,
});

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

// Analysis results schema
export const analysisResults = pgTable("analysis_results", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").notNull(),
  credibilityScore: integer("credibility_score").notNull(), // 0-100
  classification: text("classification").notNull(), // 'reliable', 'potentially_misleading', 'likely_false'
  confidence: integer("confidence").notNull(), // 0-100
  criteria: jsonb("criteria").notNull(), // Structured analysis criteria
  factChecks: jsonb("fact_checks").notNull(), // Fact checks performed
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
});

export const insertAnalysisResultSchema = createInsertSchema(analysisResults).pick({
  articleId: true,
  credibilityScore: true,
  classification: true,
  confidence: true,
  criteria: true,
  factChecks: true,
});

export type InsertAnalysisResult = z.infer<typeof insertAnalysisResultSchema>;
export type AnalysisResult = typeof analysisResults.$inferSelect;

// Analysis request schema for API
export const analysisRequestSchema = z.object({
  url: z.string().url().optional(),
  title: z.string().min(1).optional(),
  content: z.string().min(1),
  source: z.string().optional(),
});

export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;

// Shared types for the analysis response
export const criteriaSchema = z.object({
  name: z.string(),
  rating: z.enum(["high", "medium", "low"]),
  description: z.string(),
  status: z.enum(["good", "warning", "bad"]),
});

export const factCheckSchema = z.object({
  claim: z.string(),
  verdict: z.enum(["verified", "misleading", "false"]),
  explanation: z.string(),
});

export const recommendationSchema = z.string();

export const analysisResponseSchema = z.object({
  id: z.number().optional(),
  articleId: z.number().optional(),
  url: z.string().optional(),
  title: z.string().optional(),
  source: z.string().optional(),
  credibilityScore: z.number(),
  classification: z.enum(["reliable", "potentially_misleading", "likely_false"]),
  confidence: z.number(),
  criteria: z.array(criteriaSchema),
  factChecks: z.array(factCheckSchema),
  recommendations: z.array(recommendationSchema),
  analyzedAt: z.string().optional(),
});

export type Criteria = z.infer<typeof criteriaSchema>;
export type FactCheck = z.infer<typeof factCheckSchema>;
export type Recommendation = z.infer<typeof recommendationSchema>;
export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;
