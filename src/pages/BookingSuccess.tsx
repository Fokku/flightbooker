import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Plane, Calendar } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { SlideUp } from "@/components/animations/SlideUp";

export default function BookingSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get the booking ID from the URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const bookingId = queryParams.get("id");

  useEffect(() => {
    // Redirect to bookings page if there's no booking ID
    if (!bookingId) {
      navigate("/bookings");
    }

    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, [bookingId, navigate]);

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
              <h1 className="text-3xl font-bold mb-2">Booking Successful!</h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your flight booking has been confirmed. A confirmation email has
                been sent to your registered email address.
              </p>
            </div>

            <Card className="mb-8 shadow-lg overflow-hidden">
              <div className="bg-primary text-white p-6 text-center">
                <Plane className="h-8 w-8 mx-auto mb-2" />
                <h2 className="text-xl font-semibold">
                  Thank you for choosing Flight Booker
                </h2>
                <p className="text-sm opacity-90">
                  Your booking ID: #{bookingId}
                </p>
              </div>

              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <p className="text-center text-sm">
                      Your booking details have been saved to your account. You
                      can view all your booking information in your account
                      dashboard.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                      <Calendar className="h-8 w-8 text-primary mr-3" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Next Steps
                        </p>
                        <p className="font-medium">
                          Check-in opens 24 hours before your flight
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                      <Plane className="h-8 w-8 text-primary mr-3" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Travel Documents
                        </p>
                        <p className="font-medium">
                          Print or download your e-ticket
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row gap-4 bg-gray-50 p-6">
                <Button
                  variant="outline"
                  className="sm:flex-1"
                  onClick={() =>
                    navigate(`/booking-confirmation?id=${bookingId}`)
                  }
                >
                  View Booking Details
                </Button>
                <Button
                  className="sm:flex-1"
                  onClick={() => navigate("/bookings")}
                >
                  My Bookings
                </Button>
              </CardFooter>
            </Card>

            <div className="text-center">
              <p className="mb-4 text-muted-foreground">
                Ready to plan another trip?
              </p>
              <Button
                variant="outline"
                className="rounded-full px-8"
                onClick={() => navigate("/search")}
              >
                Search More Flights
              </Button>
            </div>
          </SlideUp>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
