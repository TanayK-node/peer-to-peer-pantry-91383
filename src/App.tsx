import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RatingPrompt } from "@/components/RatingPrompt";
import Index from "./pages/Index";
import Listings from "./pages/Listings";
import ProductDetail from "./pages/ProductDetail";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import EditProduct from "./pages/EditProduct";
import Chats from "./pages/Chats";
import ChatDetail from "./pages/ChatDetail";
import Search from "./pages/Search";
import Auth from "./pages/Auth";
import Sell from "./pages/Sell";
import Account from "./pages/Account";
import HowItWorks from "./pages/HowItWorks";
import ContactUs from "./pages/ContactUs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RatingPrompt />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/product/:id/edit" element={<EditProduct />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="/chat/:conversationId" element={<ChatDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/account" element={<Account />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/contact-us" element={<ContactUs />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
