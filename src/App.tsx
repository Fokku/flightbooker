import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Bookings from "./pages/Bookings";
import BookingDetails from "./pages/BookingDetails";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import VerifyRegistration from "./pages/VerifyRegistration";
import GlobePage from "./pages/GlobePage";
import Profile from "./pages/Profile";
import BookingForm from "./pages/BookingForm";
import BookingConfirmation from "./pages/BookingConfirmation";
import BookingSuccess from "./pages/BookingSuccess";
import NotFound from "./pages/NotFound";
import TestApi from "./pages/TestApi";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<Search />} />
            <Route path="/globe" element={<GlobePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route
              path="/verify-registration"
              element={<VerifyRegistration />}
            />
            <Route path="/contact" element={<Contact />} />
            <Route path="/test-api" element={<TestApi />} />

            {/* Protected routes */}
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/bookings/:bookingId"
              element={
                <ProtectedRoute>
                  <BookingDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/booking"
              element={
                <ProtectedRoute>
                  <BookingForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/booking-confirmation"
              element={
                <ProtectedRoute>
                  <BookingConfirmation />
                </ProtectedRoute>
              }
            />

            <Route
              path="/booking-success"
              element={
                <ProtectedRoute>
                  <BookingSuccess />
                </ProtectedRoute>
              }
            />

            {/* Admin routes would go here */}

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
