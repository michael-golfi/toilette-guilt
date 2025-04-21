import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import FindRestrooms from "@/pages/FindRestrooms";
import RestroomDetail from "@/pages/RestroomDetail";
import Articles from "@/pages/Articles";
import ArticleDetail from "@/pages/ArticleDetail";
import SubmitForm from "@/pages/SubmitForm";
import About from "@/pages/About";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/find-restrooms" component={FindRestrooms} />
      <Route path="/restroom/:id" component={RestroomDetail} />
      <Route path="/articles" component={Articles} />
      <Route path="/article/:id" component={ArticleDetail} />
      <Route path="/submit-listing" component={SubmitForm} />
      <Route path="/about" component={About} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Header />
        <main className="min-h-screen">
          <Router />
        </main>
        <Footer />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
