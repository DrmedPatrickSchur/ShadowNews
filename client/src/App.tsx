import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Home from "@/pages/home";
import NewStories from "@/pages/new";
import StoryView from "@/pages/story-view";
import UserProfile from "@/pages/user-profile";
import Submit from "@/pages/submit";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Home />
      </Route>
      <Route path="/new">
        <NewStories />
      </Route>
      <Route path="/story/:id">
        <StoryView />
      </Route>
      <Route path="/user/:id">
        <UserProfile />
      </Route>
      <Route path="/submit">
        <Submit />
      </Route>
      <Route path="/ask">
        <Home type="ask" />
      </Route>
      <Route path="/show">
        <Home type="show" />
      </Route>
      <Route path="/jobs">
        <Home type="job" />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow pb-8">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
