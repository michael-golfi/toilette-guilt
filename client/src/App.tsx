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
// import SubmitForm from "@/pages/SubmitForm";
import About from "@/pages/About";
import { Suspense, useEffect } from "react";
import { initGA } from "./lib/analytics";
import AnalyticsWrapper from "./components/AnalyticsWrapper";
import { BusinessRegistration } from "./pages/BusinessRegistration";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";

const GA_MEASUREMENT_ID = 'G-4BT2M0NZQ8';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/find-restrooms" component={FindRestrooms} />
      <Route path="/restroom/:id" component={RestroomDetail} />
      <Route path="/articles" component={Articles} />
      <Route path="/article/:id" component={ArticleDetail} />
      <Route path="/business-registration" component={BusinessRegistration} />
      <Route path="/about" component={About} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Initialize Google Analytics
    initGA(GA_MEASUREMENT_ID);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AnalyticsWrapper>
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <Header />
            <main className="min-h-screen">
              <Router />
            </main>
            <Footer />
            <Toaster />
          </Suspense>
        </AnalyticsWrapper>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
