import { useState } from "react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ChevronUp, Reply, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Comment as CommentType } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface CommentProps {
  comment: CommentType & { children: CommentType[] };
  storyId: number;
  level: number;
}

export function Comment({ comment, storyId, level }: CommentProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [points, setPoints] = useState(comment.points);
  
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
  
  const upvoteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/vote", { commentId: comment.id });
    },
    onSuccess: () => {
      setPoints(points + 1);
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
  
  const replyMutation = useMutation({
    mutationFn: async (text: string) => {
      return apiRequest("POST", "/api/comments", {
        text,
        storyId,
        parentId: comment.id
      });
    },
    onSuccess: () => {
      setReplyText("");
      setIsReplying(false);
      queryClient.invalidateQueries({ queryKey: [`/api/stories/${storyId}`] });
      toast({
        title: "Reply posted",
        description: "Your reply has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post reply",
      });
    }
  });
  
  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to vote on comments",
        variant: "default",
      });
      return;
    }
    
    if (hasVoted) {
      toast({
        description: "You've already voted on this comment",
        variant: "default",
      });
      return;
    }
    
    upvoteMutation.mutate();
  };
  
  const handleReply = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to reply to comments",
        variant: "default",
      });
      return;
    }
    
    setIsReplying(!isReplying);
  };
  
  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyText.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Reply cannot be empty",
      });
      return;
    }
    
    replyMutation.mutate(replyText);
  };
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  return (
    <div className="text-darkText dark:text-lightText transition-dark">
      <div className="flex items-start space-x-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className={`text-gray-400 hover:text-primary mt-1 transition-dark ${hasVoted ? 'text-primary' : ''}`} 
          onClick={handleUpvote}
          disabled={upvoteMutation.isPending || hasVoted}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <Link href={`/user/${comment.userId}`}>
              <a className="font-medium text-primary hover:underline">User-{comment.userId}</a>
            </Link>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 transition-dark">{timeAgo}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 transition-dark">{points} points</span>
          </div>
          
          {!isCollapsed && (
            <div className="mb-2">
              <p>{comment.text}</p>
            </div>
          )}
          
          <div className="flex items-center space-x-4 text-xs">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto py-1 px-2 text-gray-500 dark:text-gray-400 hover:text-primary transition-dark" 
              onClick={handleReply}
            >
              <Reply className="h-3 w-3 mr-1" />
              reply
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto py-1 px-2 text-gray-500 dark:text-gray-400 hover:text-primary transition-dark" 
              onClick={toggleCollapse}
            >
              {isCollapsed ? (
                <><ChevronRight className="h-3 w-3 mr-1" />expand</>
              ) : (
                <><ChevronDown className="h-3 w-3 mr-1" />collapse</>
              )}
            </Button>
          </div>
          
          {isReplying && (
            <div className="mt-4">
              <form className="space-y-3" onSubmit={handleSubmitReply}>
                <Textarea 
                  placeholder="Write your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={replyMutation.isPending}
                  className="min-h-[100px]"
                />
                <div className="flex space-x-2 justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsReplying(false)}
                    disabled={replyMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    size="sm"
                    disabled={replyMutation.isPending}
                  >
                    {replyMutation.isPending ? "Posting..." : "Post Reply"}
                  </Button>
                </div>
              </form>
            </div>
          )}
          
          {!isCollapsed && comment.children && comment.children.length > 0 && (
            <div className="mt-4 ml-5 comment-thread">
              {comment.children.map((childComment) => (
                <Comment 
                  key={childComment.id} 
                  comment={childComment} 
                  storyId={storyId} 
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
