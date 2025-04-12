import { 
  users, 
  type User, 
  type InsertUser, 
  articles, 
  type Article, 
  type InsertArticle,
  analysisResults,
  type AnalysisResult,
  type InsertAnalysisResult,
  type Criteria,
  type FactCheck
} from "@shared/schema";

// Storage interface for the application
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Article operations
  getArticle(id: number): Promise<Article | undefined>;
  getArticleByUrl(url: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  
  // Analysis results operations
  getAnalysisResult(id: number): Promise<AnalysisResult | undefined>;
  getAnalysisResultByArticleId(articleId: number): Promise<AnalysisResult | undefined>;
  createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult>;
  getLatestAnalysisResult(): Promise<AnalysisResult | undefined>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private articles: Map<number, Article>;
  private analysisResults: Map<number, AnalysisResult>;
  private userIdCounter: number;
  private articleIdCounter: number;
  private analysisResultIdCounter: number;

  constructor() {
    this.users = new Map();
    this.articles = new Map();
    this.analysisResults = new Map();
    this.userIdCounter = 1;
    this.articleIdCounter = 1;
    this.analysisResultIdCounter = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Article operations
  async getArticle(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }
  
  async getArticleByUrl(url: string): Promise<Article | undefined> {
    return Array.from(this.articles.values()).find(
      (article) => article.url === url
    );
  }
  
  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = this.articleIdCounter++;
    const now = new Date();
    
    const article: Article = { 
      ...insertArticle, 
      id, 
      analyzedAt: now 
    };
    
    this.articles.set(id, article);
    return article;
  }
  
  // Analysis results operations
  async getAnalysisResult(id: number): Promise<AnalysisResult | undefined> {
    return this.analysisResults.get(id);
  }
  
  async getAnalysisResultByArticleId(articleId: number): Promise<AnalysisResult | undefined> {
    return Array.from(this.analysisResults.values()).find(
      (result) => result.articleId === articleId
    );
  }
  
  async createAnalysisResult(insertResult: InsertAnalysisResult): Promise<AnalysisResult> {
    const id = this.analysisResultIdCounter++;
    const now = new Date();
    
    const result: AnalysisResult = {
      ...insertResult,
      id,
      analyzedAt: now
    };
    
    this.analysisResults.set(id, result);
    return result;
  }
  
  async getLatestAnalysisResult(): Promise<AnalysisResult | undefined> {
    if (this.analysisResults.size === 0) {
      return undefined;
    }
    
    // Get all results and sort by analyzedAt (most recent first)
    const results = Array.from(this.analysisResults.values()).sort(
      (a, b) => b.analyzedAt.getTime() - a.analyzedAt.getTime()
    );
    
    return results[0];
  }
}

// Create and export a storage instance
export const storage = new MemStorage();
