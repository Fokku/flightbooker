
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, CheckCircle, Plane, Calendar, Users, CreditCard } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SlideUp } from "@/components/animations/SlideUp";

interface BookingDetails {
  id: number;
  flight_number: string;
  departure: string;
  arrival: string;
  date: string;
  time: string;
  passengers: number;
  total_price: number;
  booking_date: string;
  status: string;
}

export default function BookingConfirmation() {
  const [isLoading, setIsLoading] = useState(true);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the booking ID from the URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const bookingId = queryParams.get('id');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/booking-confirmation" + location.search } } });
      return;
    }

    if (!bookingId) {
      toast.error("Booking ID is required");
      navigate("/bookings");
      return;
    }

    async function fetchBooking() {
      try {
        const response = await fetch(`/backend/api/bookings/details.php?id=${bookingId}`);
        const data = await response.json();

        if (data.status) {
          setBooking(data.data);
        } else {
          toast.error(data.message || "Failed to load booking details");
          navigate("/bookings");
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
        toast.error("An unexpected error occurred. Please try again.");
        navigate("/bookings");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBooking();
  }, [isAuthenticated, navigate, bookingId, location.search]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString: string) => {
    const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
    const date = new Date(`2000-01-01T${timeString}`);
    return date.toLocaleTimeString(undefined, options);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">Loading booking details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-16">
        <Container className="max-w-3xl">
          <SlideUp>
            <div className="text-center mb-8">
              <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
              <p className="text-muted-foreground">
                Your booking has been confirmed and is ready. We've sent you an email with all the details.
              </p>
            </div>
            
            <Card className="mb-8 shadow-lg">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span>Booking Details</span>
                  <span className="text-sm font-medium px-3 py-1 bg-green-100 text-green-800 rounded-full">
                    {booking.status === 'confirmed' ? 'Confirmed' : booking.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center">
                      <Plane className="h-5 w-5 mr-2 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Flight</p>
                        <p className="font-medium">{booking.flight_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-medium">{formatDate(booking.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Passengers</p>
                        <p className="font-medium">{booking.passengers}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <div className="mb-4 md:mb-0">
                        <p className="text-sm text-muted-foreground">From</p>
                        <p className="font-medium text-lg">{booking.departure}</p>
                        <p>{formatTime(booking.time)}</p>
                      </div>
                      <div className="hidden md:flex items-center px-4">
                        <div className="w-24 h-0.5 bg-gray-300 relative">
                          <div className="absolute -top-2 -right-2">
                            <Plane className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">To</p>
                        <p className="font-medium text-lg">{booking.arrival}</p>
                        <p>Arrival time</p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-primary" />
                      <span className="text-muted-foreground">Total paid:</span>
                    </div>
                    <span className="font-bold text-lg">{formatCurrency(booking.total_price)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-4 bg-gray-50 rounded-b-lg">
                <Button variant="outline" className="sm:flex-1" onClick={() => window.print()}>
                  Print details
                </Button>
                <Button className="sm:flex-1" onClick={() => navigate("/bookings")}>
                  View all bookings
                </Button>
              </CardFooter>
            </Card>
            
            <div className="text-center">
              <p className="mb-4 text-muted-foreground">Need assistance with your booking?</p>
              <Button variant="outline" onClick={() => navigate("/contact")}>
                Contact Support
              </Button>
            </div>
          </SlideUp>
        </Container>
      </main>
      
      <Footer />
    </div>
  );
}
