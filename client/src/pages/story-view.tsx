import { useRoute } from "wouter";
import { StoryDetail } from "@/components/story/story-detail";

export default function StoryView() {
  const [match, params] = useRoute<{ id: string }>("/story/:id");
  
  if (!match || !params.id) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white dark:bg-secondary rounded-lg shadow-md p-6 transition-dark">
          <p className="text-center text-red-500">Story not found</p>
        </div>
      </div>
    );
  }
  
  const storyId = parseInt(params.id, 10);
  
  return <StoryDetail storyId={storyId} />;
}
