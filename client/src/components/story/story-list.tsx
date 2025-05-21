import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StoryCard } from "@/components/story/story-card";
import { Pagination } from "@/components/common/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Story } from "@shared/schema";

interface StoryListProps {
  title?: string;
  type?: string;
}

export function StoryList({ title = "Top Stories", type }: StoryListProps) {
  const [page, setPage] = useState(1);
  const [sortOption, setSortOption] = useState<string>("newest");
  
  const queryKey = type 
    ? [`/api/stories?page=${page}&type=${type}&sortBy=${sortOption}`] 
    : [`/api/stories?page=${page}&sortBy=${sortOption}`];
  
  const storiesQuery = useQuery({
    queryKey,
    staleTime: 60000, // 1 minute
  });

  useEffect(() => {
    // When type or sort option changes, reset to page 1
    setPage(1);
  }, [type, sortOption]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
  };

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "top", label: "Popular" },
    { value: "comments", label: "Most Comments" },
  ];

  return (
    <section className="container mx-auto px-4 py-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-darkText dark:text-lightText transition-dark">
          {title}
        </h1>
        <div className="flex space-x-2">
          <Select value={sortOption} onValueChange={handleSortChange}>
            <SelectTrigger className="bg-white dark:bg-gray-800 text-sm border border-gray-300 dark:border-gray-700 w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {storiesQuery.isLoading && (
          Array(10).fill(0).map((_, index) => (
            <div key={index} className="bg-white dark:bg-secondary rounded-lg shadow-sm p-4 transition-dark">
              <div className="flex">
                <div className="mr-4 flex flex-col items-center">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-4 w-8 mt-1" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </div>
          ))
        )}

        {storiesQuery.isSuccess && storiesQuery.data.stories.map((story: Story) => (
          <StoryCard 
            key={story.id} 
            story={story} 
            author={storiesQuery.data.authors?.[story.userId] || "unknown"}
          />
        ))}

        {storiesQuery.isSuccess && storiesQuery.data.stories.length === 0 && (
          <div className="bg-white dark:bg-secondary rounded-lg shadow-sm p-8 text-center transition-dark">
            <p className="text-darkText dark:text-lightText">No stories found</p>
          </div>
        )}

        {storiesQuery.isError && (
          <div className="bg-white dark:bg-secondary rounded-lg shadow-sm p-8 text-center transition-dark">
            <p className="text-red-500">Error loading stories. Please try again later.</p>
          </div>
        )}
      </div>

      {storiesQuery.isSuccess && storiesQuery.data.pagination && (
        <Pagination 
          currentPage={page}
          totalPages={storiesQuery.data.pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </section>
  );
}
