import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Story } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SubmitStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title cannot exceed 100 characters"),
  url: z.string().url("Please enter a valid URL").or(z.string().length(0)),
  text: z.string().max(40000, "Text cannot exceed 40000 characters"),
  type: z.string().default("story"),
}).refine(data => data.url !== "" || data.text !== "", {
  message: "Either URL or text must be provided",
  path: ["text"]
});

type FormValues = z.infer<typeof formSchema>;

export function SubmitStoryModal({ isOpen, onClose }: SubmitStoryModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      url: "",
      text: "",
      type: "story"
    }
  });
  
  const storyMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      return apiRequest<Story>("POST", "/api/stories", values);
    },
    onSuccess: (data: Story) => {
      toast({
        title: "Success",
        description: "Your story has been submitted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      onClose();
      navigate(`/story/${data.id}`);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit story",
      });
    }
  });
  
  const onSubmit = (values: FormValues) => {
    // Handle form type based on fields
    if (values.url && !values.text) {
      values.type = "story";
    } else if (!values.url && values.text) {
      if (values.title.toLowerCase().startsWith("ask sn:")) {
        values.type = "ask";
      } else if (values.title.toLowerCase().startsWith("show sn:")) {
        values.type = "show";
      }
    }
    
    storyMutation.mutate(values);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Submit a Story</DialogTitle>
          <DialogDescription>
            Share an interesting link or start a discussion
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter a descriptive title" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/article" 
                      type="url" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Text (optional if URL provided)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Share your thoughts, question, or content..." 
                      rows={6} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={storyMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={storyMutation.isPending}
              >
                {storyMutation.isPending ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
