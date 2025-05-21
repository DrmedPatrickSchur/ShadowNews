import { 
  users, type User, type InsertUser,
  stories, type Story, type InsertStory,
  comments, type Comment, type InsertComment,
  votes, type Vote, type InsertVote
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserKarma(userId: number, karma: number): Promise<User | undefined>;

  // Story methods
  getStories(page: number, limit: number, type?: string, sortBy?: string): Promise<Story[]>;
  getFeaturedStories(limit: number): Promise<Story[]>;
  getStory(id: number): Promise<Story | undefined>;
  createStory(story: InsertStory): Promise<Story>;
  updateStoryPoints(storyId: number, points: number): Promise<Story | undefined>;
  getStoriesByUser(userId: number): Promise<Story[]>;
  getStoryCount(type?: string): Promise<number>;

  // Comment methods
  getComments(storyId: number): Promise<Comment[]>;
  getComment(id: number): Promise<Comment | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateCommentPoints(commentId: number, points: number): Promise<Comment | undefined>;
  getCommentsByUser(userId: number): Promise<Comment[]>;
  getCommentCount(storyId: number): Promise<number>;

  // Vote methods
  getVote(userId: number, storyId?: number, commentId?: number): Promise<Vote | undefined>;
  createVote(vote: InsertVote): Promise<Vote>;
  removeVote(userId: number, storyId?: number, commentId?: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private stories: Map<number, Story>;
  private comments: Map<number, Comment>;
  private votes: Map<number, Vote>;
  private userIdCounter: number;
  private storyIdCounter: number;
  private commentIdCounter: number;
  private voteIdCounter: number;

  constructor() {
    this.users = new Map();
    this.stories = new Map();
    this.comments = new Map();
    this.votes = new Map();
    this.userIdCounter = 1;
    this.storyIdCounter = 1;
    this.commentIdCounter = 1;
    this.voteIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      karma: 0, 
      createdAt,
      email: insertUser.email || null,
      about: insertUser.about || null 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserKarma(userId: number, karma: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, karma };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Story methods
  async getStories(page: number = 1, limit: number = 30, type?: string, sortBy: string = 'newest'): Promise<Story[]> {
    let filteredStories = Array.from(this.stories.values());
    
    if (type) {
      filteredStories = filteredStories.filter(story => story.type === type);
    }
    
    // Sort stories
    if (sortBy === 'newest') {
      filteredStories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sortBy === 'top') {
      filteredStories.sort((a, b) => b.points - a.points);
    } else if (sortBy === 'comments') {
      filteredStories.sort((a, b) => b.commentCount - a.commentCount);
    }
    
    const offset = (page - 1) * limit;
    return filteredStories.slice(offset, offset + limit);
  }

  async getFeaturedStories(limit: number = 2): Promise<Story[]> {
    // Get stories with most points
    const allStories = Array.from(this.stories.values());
    return [...allStories].sort((a, b) => b.points - a.points).slice(0, limit);
  }

  async getStory(id: number): Promise<Story | undefined> {
    return this.stories.get(id);
  }

  async createStory(insertStory: InsertStory): Promise<Story> {
    const id = this.storyIdCounter++;
    const createdAt = new Date();
    const story: Story = { 
      ...insertStory, 
      id, 
      points: 0, 
      createdAt,
      commentCount: 0,
      type: insertStory.type || 'story',
      text: insertStory.text || null,
      url: insertStory.url || null
    };
    this.stories.set(id, story);
    return story;
  }

  async updateStoryPoints(storyId: number, points: number): Promise<Story | undefined> {
    const story = await this.getStory(storyId);
    if (!story) return undefined;
    
    const updatedStory = { ...story, points };
    this.stories.set(storyId, updatedStory);
    return updatedStory;
  }

  async getStoriesByUser(userId: number): Promise<Story[]> {
    return Array.from(this.stories.values()).filter(
      (story) => story.userId === userId
    );
  }

  async getStoryCount(type?: string): Promise<number> {
    if (type) {
      return Array.from(this.stories.values()).filter(
        (story) => story.type === type
      ).length;
    }
    return this.stories.size;
  }

  // Comment methods
  async getComments(storyId: number): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(
      (comment) => comment.storyId === storyId
    );
  }

  async getComment(id: number): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const createdAt = new Date();
    const comment: Comment = { 
      ...insertComment, 
      id, 
      points: 0, 
      createdAt,
      parentId: insertComment.parentId || null
    };
    this.comments.set(id, comment);

    // Update story comment count
    const story = await this.getStory(insertComment.storyId);
    if (story) {
      await this.updateStoryCommentCount(story.id, story.commentCount + 1);
    }

    return comment;
  }

  async updateCommentPoints(commentId: number, points: number): Promise<Comment | undefined> {
    const comment = await this.getComment(commentId);
    if (!comment) return undefined;
    
    const updatedComment = { ...comment, points };
    this.comments.set(commentId, updatedComment);
    return updatedComment;
  }

  async getCommentsByUser(userId: number): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(
      (comment) => comment.userId === userId
    );
  }

  async getCommentCount(storyId: number): Promise<number> {
    return Array.from(this.comments.values()).filter(
      (comment) => comment.storyId === storyId
    ).length;
  }

  private async updateStoryCommentCount(storyId: number, count: number): Promise<Story | undefined> {
    const story = await this.getStory(storyId);
    if (!story) return undefined;
    
    const updatedStory = { ...story, commentCount: count };
    this.stories.set(storyId, updatedStory);
    return updatedStory;
  }

  // Vote methods
  async getVote(userId: number, storyId?: number, commentId?: number): Promise<Vote | undefined> {
    return Array.from(this.votes.values()).find(
      (vote) => vote.userId === userId && 
                (storyId !== undefined ? vote.storyId === storyId : true) &&
                (commentId !== undefined ? vote.commentId === commentId : true)
    );
  }

  async createVote(insertVote: InsertVote): Promise<Vote> {
    const id = this.voteIdCounter++;
    const createdAt = new Date();
    const vote: Vote = { 
      ...insertVote, 
      id, 
      createdAt,
      storyId: insertVote.storyId || null,
      commentId: insertVote.commentId || null
    };
    this.votes.set(id, vote);

    // Update story points
    if (insertVote.storyId) {
      const story = await this.getStory(insertVote.storyId);
      if (story) {
        await this.updateStoryPoints(story.id, story.points + 1);
      }
    }

    // Update comment points
    if (insertVote.commentId) {
      const comment = await this.getComment(insertVote.commentId);
      if (comment) {
        await this.updateCommentPoints(comment.id, comment.points + 1);
      }
    }

    // Update user karma
    if (insertVote.storyId) {
      const story = await this.getStory(insertVote.storyId);
      if (story) {
        const author = await this.getUser(story.userId);
        if (author && author.id !== insertVote.userId) {
          await this.updateUserKarma(author.id, author.karma + 1);
        }
      }
    } else if (insertVote.commentId) {
      const comment = await this.getComment(insertVote.commentId);
      if (comment) {
        const author = await this.getUser(comment.userId);
        if (author && author.id !== insertVote.userId) {
          await this.updateUserKarma(author.id, author.karma + 1);
        }
      }
    }

    return vote;
  }

  async removeVote(userId: number, storyId?: number, commentId?: number): Promise<void> {
    const vote = await this.getVote(userId, storyId, commentId);
    if (!vote) return;

    this.votes.delete(vote.id);

    // Update story points
    if (vote.storyId) {
      const story = await this.getStory(vote.storyId);
      if (story) {
        await this.updateStoryPoints(story.id, Math.max(0, story.points - 1));
      }
    }

    // Update comment points
    if (vote.commentId) {
      const comment = await this.getComment(vote.commentId);
      if (comment) {
        await this.updateCommentPoints(comment.id, Math.max(0, comment.points - 1));
      }
    }

    // Update user karma
    if (vote.storyId) {
      const story = await this.getStory(vote.storyId);
      if (story) {
        const author = await this.getUser(story.userId);
        if (author && author.id !== userId) {
          await this.updateUserKarma(author.id, Math.max(0, author.karma - 1));
        }
      }
    } else if (vote.commentId) {
      const comment = await this.getComment(vote.commentId);
      if (comment) {
        const author = await this.getUser(comment.userId);
        if (author && author.id !== userId) {
          await this.updateUserKarma(author.id, Math.max(0, author.karma - 1));
        }
      }
    }
  }
}

export const storage = new MemStorage();
