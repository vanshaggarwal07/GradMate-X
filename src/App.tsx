import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import FindMentor from "./pages/FindMentor";
import BecomeMentor from "./pages/BecomeMentor";
import CareerOpportunities from "./pages/CareerOpportunities";
import GetReferrals from "./pages/GetReferrals";
import OneOnOne from "./pages/OneOnOne";
import AlumniEvents from "./pages/AlumniEvents";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/find-mentor" element={<FindMentor />} />
            <Route path="/become-mentor" element={<BecomeMentor />} />
            <Route path="/career-opportunities" element={<CareerOpportunities />} />
            <Route path="/get-referrals" element={<GetReferrals />} />
            <Route path="/one-on-one" element={<OneOnOne />} />
            <Route path="/alumni-events" element={<AlumniEvents />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
