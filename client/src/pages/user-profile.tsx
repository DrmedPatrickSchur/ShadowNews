import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, MessageSquare, FileText, Award } from "lucide-react";
import { Story, Comment } from "@shared/schema";

export default function UserProfile() {
  const [match, params] = useRoute<{ id: string }>("/user/:id");
  
  const userId = match && params.id ? parseInt(params.id, 10) : null;
  
  const profileQuery = useQuery<{
    user: { 
      id: number;
      username: string;
      karma: number;
      about: string | null;
      createdAt: string;
    };
    stories: any[];
    comments: any[];
  }>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  if (!match || !userId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-500">User not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileQuery.isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="mt-6">
              <Skeleton className="h-10 w-full" />
              <div className="mt-6 space-y-4">
                {Array(5).fill(0).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileQuery.isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-500">Error loading user profile. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profileQuery.data || !profileQuery.data.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-500">User data not available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user, stories, comments } = profileQuery.data;
  const joinDate = formatDistanceToNow(new Date(user.createdAt), { addSuffix: true });

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {user.username}
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Joined {joinDate} • <Award className="h-4 w-4 ml-2" /> {user.karma} karma
          </CardDescription>
        </CardHeader>

        <CardContent>
          {user.about && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">About</h3>
              <p className="text-gray-600 dark:text-gray-400">{user.about}</p>
            </div>
          )}

          <Separator className="my-6" />

          <Tabs defaultValue="stories">
            <TabsList className="mb-6">
              <TabsTrigger value="stories" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Stories ({stories.length})
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments ({comments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stories">
              {stories.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No stories submitted yet
                </p>
              ) : (
                <div className="space-y-4">
                  {stories.map((story: Story) => (
                    <div key={story.id} className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
                      <h3 className="font-medium mb-1">
                        <Link 
                          href={`/story/${story.id}`}
                          className="text-darkText dark:text-lightText hover:text-primary dark:hover:text-primary transition-dark"
                        >
                          {story.title}
                        </Link>
                        {story.url && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                            ({new URL(story.url).hostname.replace(/^www\./, "")})
                          </span>
                        )}
                      </h3>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })} • {story.points} points • {story.commentCount} comments
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="comments">
              {comments.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No comments submitted yet
                </p>
              ) : (
                <div className="space-y-6">
                  {comments.map((comment: Comment) => (
                    <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
                      <div className="text-sm mb-2">{comment.text}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                        <span>•</span>
                        <span>{comment.points} points</span>
                        <span>•</span>
                        <Link 
                          href={`/story/${comment.storyId}`}
                          className="text-primary hover:underline"
                        >
                          View discussion
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full">Back to Home</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
