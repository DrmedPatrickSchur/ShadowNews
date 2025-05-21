import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ChevronUp } from "lucide-react";
import { Comment } from "@/components/story/comment";
import { Story, Comment as CommentType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface StoryDetailProps {
  storyId: number;
}

export function StoryDetail({ storyId }: StoryDetailProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [hasVoted, setHasVoted] = useState(false);

  const storyQuery = useQuery({
    queryKey: [`/api/stories/${storyId}`],
  });

  const upvoteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/vote", { storyId });
    },
    onSuccess: () => {
      setHasVoted(true);
      queryClient.invalidateQueries({ queryKey: [`/api/stories/${storyId}`] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upvote",
      });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async (text: string) => {
      return apiRequest("POST", "/api/comments", {
        text,
        storyId,
        parentId: null
      });
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: [`/api/stories/${storyId}`] });
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post comment",
      });
    }
  });

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to vote on stories",
        variant: "default",
      });
      return;
    }
    
    if (hasVoted) {
      toast({
        description: "You've already voted on this story",
        variant: "default",
      });
      return;
    }
    
    upvoteMutation.mutate();
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to post comments",
        variant: "default",
      });
      return;
    }
    
    if (!commentText.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Comment cannot be empty",
      });
      return;
    }
    
    commentMutation.mutate(commentText);
  };

  // Extract hostname from URL
  const getHostname = (url: string | null) => {
    if (!url) return null;
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace(/^www\./, "");
    } catch (e) {
      return null;
    }
  };

  if (storyQuery.isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white dark:bg-secondary rounded-lg shadow-md p-6 mb-8 transition-dark">
          <div className="mb-6">
            <div className="flex">
              <div className="mr-4 flex flex-col items-center">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-8 mt-1" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <Skeleton className="h-6 w-1/4 mb-4" />
          <Skeleton className="h-32 w-full mb-6" />
          
          <div className="space-y-6">
            {Array(5).fill(0).map((_, index) => (
              <div key={index} className="flex space-x-3">
                <Skeleton className="h-4 w-4" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-1/3 mb-1" />
                  <Skeleton className="h-16 w-full mb-2" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (storyQuery.isError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white dark:bg-secondary rounded-lg shadow-md p-6 mb-8 transition-dark">
          <p className="text-red-500 text-center">Error loading story. Please try again later.</p>
        </div>
      </div>
    );
  }

  const { story, comments, author } = storyQuery.data;
  const hostname = getHostname(story.url || null);
  const timeAgo = formatDistanceToNow(new Date(story.createdAt), { addSuffix: true });

  // Organize comments into a tree structure
  const commentMap = new Map<number, CommentType & { children: CommentType[] }>();
  const rootComments: (CommentType & { children: CommentType[] })[] = [];

  comments.forEach((comment: CommentType) => {
    commentMap.set(comment.id, { ...comment, children: [] });
  });

  comments.forEach((comment: CommentType) => {
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.children.push(commentMap.get(comment.id)!);
      }
    } else {
      rootComments.push(commentMap.get(comment.id)!);
    }
  });

  return (
    <section className="container mx-auto px-4 py-6">
      <div className="bg-white dark:bg-secondary rounded-lg shadow-md p-6 mb-8 transition-dark">
        {/* Story Header */}
        <div className="mb-6">
          <div className="flex">
            {/* Upvote button */}
            <div className="mr-4 flex flex-col items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className={`text-gray-400 hover:text-primary transition-dark ${hasVoted ? 'text-primary' : ''}`} 
                onClick={handleUpvote}
                disabled={upvoteMutation.isPending || hasVoted}
              >
                <ChevronUp className="h-5 w-5" />
              </Button>
              <span className="text-sm font-semibold text-darkText dark:text-lightText my-1 transition-dark">
                {story.points}
              </span>
            </div>
                
            {/* Story content */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-darkText dark:text-lightText mb-2 transition-dark">
                {story.title}
              </h1>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 transition-dark">
                Posted by{" "}
                <Link href={`/user/${story.userId}`}>
                  <a className="hover:text-primary transition-dark">{author}</a>
                </Link>{" "}
                {timeAgo}{" "}
                {story.url && (
                  <>
                    |{" "}
                    <a 
                      href={story.url} 
                      className="text-primary hover:underline" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {hostname}
                    </a>
                  </>
                )}
              </div>
                  
              {/* Story text content */}
              {story.text && (
                <div className="prose dark:prose-invert max-w-none my-4 text-darkText dark:text-lightText transition-dark">
                  {story.text}
                </div>
              )}
            </div>
          </div>
        </div>
              
        {/* Comments Section */}
        <Separator className="my-6" />
        
        <div className="pt-6">
          <h2 className="text-xl font-bold text-darkText dark:text-lightText mb-4 transition-dark">
            Comments
          </h2>
                  
          {/* Comment form */}
          <div className="mb-6">
            <form className="space-y-4" onSubmit={handleSubmitComment}>
              <div>
                <Textarea 
                  className="w-full" 
                  rows={4} 
                  placeholder="Add your comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={commentMutation.isPending || !user}
                />
              </div>
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={commentMutation.isPending || !user}
                >
                  {commentMutation.isPending ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </form>
          </div>
                  
          {/* Comments list */}
          <div className="space-y-6">
            {rootComments.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No comments yet. Be the first to comment!
              </p>
            )}
            
            {rootComments.map((comment) => (
              <Comment 
                key={comment.id} 
                comment={comment} 
                storyId={storyId} 
                level={0} 
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
