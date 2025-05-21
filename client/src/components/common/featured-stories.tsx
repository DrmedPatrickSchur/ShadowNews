import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Story } from "@shared/schema";

export function FeaturedStories() {
  const featuredStoriesQuery = useQuery({
    queryKey: ["/api/stories/featured"],
  });

  if (featuredStoriesQuery.isLoading) {
    return (
      <section className="mb-8">
        <h2 className="text-xl font-bold text-darkText dark:text-lightText mb-6 transition-dark">Featured Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array(2).fill(0).map((_, index) => (
            <div key={index} className="bg-white dark:bg-secondary rounded-lg shadow-sm overflow-hidden transition-dark">
              <Skeleton className="w-full h-48" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-3" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (featuredStoriesQuery.isError || !featuredStoriesQuery.data || featuredStoriesQuery.data.length === 0) {
    return null;
  }

  const featuredStories = featuredStoriesQuery.data;

  // Mock images for featured stories (in a real app, these would be from a real source)
  const images = [
    "https://images.unsplash.com/photo-1550439062-609e1531270e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
  ];

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-darkText dark:text-lightText mb-6 transition-dark">Featured Stories</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featuredStories.map((story: Story, index: number) => (
          <div key={story.id} className="bg-white dark:bg-secondary rounded-lg shadow-sm overflow-hidden transition-dark">
            <img 
              src={index < images.length ? images[index] : images[0]} 
              alt="Featured story illustration" 
              className="w-full h-48 object-cover object-center" 
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-darkText dark:text-lightText mb-2 transition-dark">
                <Link href={`/story/${story.id}`}>
                  <a className="hover:text-primary transition-dark">{story.title}</a>
                </Link>
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 transition-dark">
                {story.text ? story.text.substring(0, 100) + (story.text.length > 100 ? '...' : '') : 'Click to read the full story.'}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400 transition-dark">
                  Posted by <Link href={`/user/${story.userId}`}><a className="hover:text-primary">User-{story.userId}</a></Link>
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 transition-dark">{story.points} points</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
