import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import RoutePlanner from "./pages/RoutePlanner";
import WeatherOverview from "./pages/WeatherOverview";
import RecentRoutesPage from "./pages/RecentRoutesPage";
import Settings from "./pages/Settings";
import TermsOfService from "./pages/TermsOfService";  // ADD THIS
import PrivacyPolicy from "./pages/PrivacyPolicy";    // ADD THIS
import FAQ from "./pages/FAQ";                        // ADD THIS
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/planner" element={<RoutePlanner />} />
          <Route path="/weather" element={<WeatherOverview />} />
          <Route path="/routes" element={<RecentRoutesPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/terms" element={<TermsOfService />} />      {/* ADD */}
          <Route path="/privacy" element={<PrivacyPolicy />} />     {/* ADD */}
          <Route path="/faq" element={<FAQ />} />                   {/* ADD */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
