import { StoryList } from "@/components/story/story-list";

export default function NewStories() {
  return (
    <div className="container mx-auto px-4">
      <StoryList title="New Stories" sortOption="newest" />
    </div>
  );
}
