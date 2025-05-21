import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Story } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

export default function Submit() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to submit a story.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>
                Please log in to submit a story
              </AlertDescription>
            </Alert>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => navigate("/")}>
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Submit a Story</CardTitle>
          <CardDescription>
            Share an interesting link or start a discussion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <FormLabel>URL (optional if providing text)</FormLabel>
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
                    <FormLabel>Text (optional if providing URL)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Share your thoughts, question, or content..." 
                        rows={8} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end">
                <Button 
                  type="submit"
                  disabled={storyMutation.isPending}
                >
                  {storyMutation.isPending ? "Submitting..." : "Submit Story"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
