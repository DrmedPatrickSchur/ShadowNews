import { useState } from "react";
import { StoryList } from "@/components/story/story-list";
import { FeaturedStories } from "@/components/common/featured-stories";
import { Button } from "@/components/ui/button";
import { SubmitStoryModal } from "@/components/story/submit-story-modal";
import { useAuth } from "@/hooks/use-auth";

interface HomeProps {
  type?: string;
}

export default function Home({ type }: HomeProps) {
  const { user } = useAuth();
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  
  let pageTitle = "Top Stories";
  if (type === "ask") pageTitle = "Ask ShadowNews";
  if (type === "show") pageTitle = "Show ShadowNews";
  if (type === "job") pageTitle = "Jobs";
  
  return (
    <div className="container mx-auto px-4">
      <StoryList title={pageTitle} type={type} />
      
      {/* Submission CTA Banner */}
      <div className="bg-gradient-to-r from-primary to-accent text-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold mb-2">Have something interesting to share?</h2>
            <p className="text-white text-opacity-90">Submit your story and join the conversation.</p>
          </div>
          <Button 
            variant="secondary"
            onClick={() => setSubmitModalOpen(true)}
          >
            Submit a Story
          </Button>
        </div>
      </div>
      
      {/* Featured Stories */}
      <FeaturedStories />
      
      <SubmitStoryModal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
      />
    </div>
  );
}
