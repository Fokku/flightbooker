import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Loader2,
  Plane,
  Calendar,
  Users,
  CreditCard,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SlideUp } from "@/components/animations/SlideUp";
import { bookingsApi } from "@/lib/api";

interface Flight {
  id: number;
  airline: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  stops: number;
  stopCity?: string;
}

interface PassengerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface BookingFormData {
  flightId: number;
  passengers: PassengerInfo[];
  seatClass: string;
  paymentMethod: string;
  totalPrice: number;
}

export default function BookingForm() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [numPassengers, setNumPassengers] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    flightId: 0,
    passengers: [{ firstName: "", lastName: "", email: "", phoneNumber: "" }],
    seatClass: "economy",
    paymentMethod: "credit_card",
    totalPrice: 0,
  });

  // Add a scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Ensure the form is visible after loading
  useEffect(() => {
    // Force any pending animations to complete after the form loads
    if (!isLoading && flight) {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
        document.querySelectorAll(".animate-in").forEach((el) => {
          (el as HTMLElement).style.opacity = "1";
          (el as HTMLElement).style.transform = "translateY(0)";
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, flight]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast.error("Please log in to book a flight");
      navigate("/login", {
        state: { from: { pathname: "/booking" + location.search } },
      });
      return;
    }

    // Get flight data from location state
    const flightData = location.state?.flight as Flight;
    if (!flightData) {
      toast.error("Flight information is missing");
      navigate("/search");
      return;
    }

    setFlight(flightData);
    setFormData((prev) => ({
      ...prev,
      flightId: flightData.id,
      totalPrice: flightData.price,
    }));
    setIsLoading(false);
  }, [isAuthenticated, navigate, location]);

  const handlePassengerChange = (
    index: number,
    field: keyof PassengerInfo,
    value: string
  ) => {
    const updatedPassengers = [...formData.passengers];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value,
    };
    setFormData({ ...formData, passengers: updatedPassengers });
  };

  const updatePassengerCount = (count: number) => {
    const newCount = Math.max(1, Math.min(9, count));
    setNumPassengers(newCount);

    const currentPassengers = [...formData.passengers];
    const updatedPassengers = Array(newCount)
      .fill(null)
      .map((_, i) => {
        return (
          currentPassengers[i] || {
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
          }
        );
      });

    setFormData({
      ...formData,
      passengers: updatedPassengers,
      totalPrice: flight ? flight.price * newCount : 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    let isValid = true;
    formData.passengers.forEach((passenger, index) => {
      if (
        !passenger.firstName ||
        !passenger.lastName ||
        !passenger.email ||
        !passenger.phoneNumber
      ) {
        toast.error(`Please fill in all fields for passenger ${index + 1}`);
        isValid = false;
      }
    });

    if (!isValid) return;

    setIsLoading(true);
    try {
      // Format data for the API to match backend expectations
      const bookingData = {
        flight_id: formData.flightId.toString(), // Backend expects a string
        passengers: numPassengers,
        customer_name: `${formData.passengers[0].firstName} ${formData.passengers[0].lastName}`,
        customer_email: formData.passengers[0].email,
        customer_phone: formData.passengers[0].phoneNumber,
        seat_class: formData.seatClass,
        payment_method: formData.paymentMethod,
      };

      // Use the generic apiPost instead of the typed bookingsApi.create
      // since our data doesn't match the BookingData interface perfectly
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/api/bookings/create.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important for cookies/sessions
          body: JSON.stringify(bookingData),
        }
      );

      const result = await response.json();

      if (result.status && result.data) {
        toast.success("Booking created successfully!");
        // Redirect to booking success page
        const bookingId = result.data.id || result.data.booking_id;
        navigate(`/booking-success?id=${bookingId}`);
      } else {
        toast.error(result.message || "Failed to create booking");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("An error occurred while creating your booking");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">
              Loading booking form...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!flight) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-grow py-16 pb-32 lg:pb-16">
        <Container className="max-w-4xl">
          <SlideUp className="mb-6" delay={100}>
            <div className="flex items-center mb-8 sticky top-0 bg-gray-50 py-4 z-20">
              <Button
                variant="ghost"
                className="mr-2"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Button>
              <h1 className="text-2xl font-bold">Complete Your Booking</h1>
            </div>
          </SlideUp>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Flight Summary */}
            <div className="lg:col-span-1 order-1 lg:order-1">
              <Card className="shadow-md lg:sticky lg:top-28 max-h-[calc(100vh-140px)] overflow-auto">
                <CardHeader className="bg-primary/5 sticky top-0 z-10">
                  <CardTitle className="text-lg">Flight Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Plane className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Airline
                        </span>
                      </div>
                      <span className="font-medium">{flight.airline}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Flight
                        </span>
                      </div>
                      <span className="font-medium">{flight.flightNumber}</span>
                    </div>

                    <div className="flex flex-col p-3 bg-gray-50 rounded-md">
                      <div className="flex justify-between mb-2">
                        <div>
                          <p className="font-bold">{flight.departureTime}</p>
                          <p className="text-sm text-muted-foreground">
                            {flight.departure}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{flight.arrivalTime}</p>
                          <p className="text-sm text-muted-foreground">
                            {flight.arrival}
                          </p>
                        </div>
                      </div>
                      <div className="text-center text-sm text-muted-foreground">
                        {flight.duration}{" "}
                        {flight.stops === 0
                          ? "• Nonstop"
                          : `• ${flight.stops} stop`}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Passengers
                        </span>
                      </div>
                      <span className="font-medium">{numPassengers}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Price per person
                        </span>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(flight.price)}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between font-bold">
                        <span>Total Price</span>
                        <span className="text-lg text-primary">
                          {formatCurrency(formData.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick navigation for mobile */}
              <div className="lg:hidden mt-4 p-4 bg-white rounded-lg shadow-md">
                <h3 className="text-sm font-medium mb-3">Quick Navigation</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() =>
                      document
                        .getElementById("passenger-info")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Passengers
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() =>
                      document
                        .getElementById("travel-class")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    <Plane className="h-3 w-3 mr-1" />
                    Class
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() =>
                      document
                        .getElementById("payment-method")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    <CreditCard className="h-3 w-3 mr-1" />
                    Payment
                  </Button>
                </div>
              </div>

              {/* Mobile "Return to top" button that appears when scrolling */}
              <div className="lg:hidden mt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={scrollToTop}
                >
                  <ArrowLeft className="h-4 w-4 mr-2 rotate-90" />
                  Return to top
                </Button>
              </div>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-2 order-2 lg:order-2 relative">
              <form onSubmit={handleSubmit} id="booking-form">
                <div className="mb-6">
                  <Card className="shadow-md scroll-mt-20" id="passenger-info">
                    <CardHeader className="bg-primary/5 sticky top-20 z-10">
                      <CardTitle className="text-lg">
                        Passenger Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="mb-4">
                        <Label htmlFor="passengerCount">
                          Number of Passengers
                        </Label>
                        <div className="flex items-center mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-10 px-3"
                            onClick={() =>
                              updatePassengerCount(numPassengers - 1)
                            }
                            disabled={numPassengers <= 1}
                          >
                            -
                          </Button>
                          <div className="w-16 mx-2 text-center">
                            {numPassengers}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-10 px-3"
                            onClick={() =>
                              updatePassengerCount(numPassengers + 1)
                            }
                            disabled={numPassengers >= 9}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {formData.passengers.map((passenger, index) => (
                          <div
                            key={index}
                            className="p-4 border border-gray-200 rounded-md"
                          >
                            <h3 className="font-medium mb-3">
                              Passenger {index + 1}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`firstName-${index}`}>
                                  First Name
                                </Label>
                                <Input
                                  id={`firstName-${index}`}
                                  value={passenger.firstName}
                                  onChange={(e) =>
                                    handlePassengerChange(
                                      index,
                                      "firstName",
                                      e.target.value
                                    )
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor={`lastName-${index}`}>
                                  Last Name
                                </Label>
                                <Input
                                  id={`lastName-${index}`}
                                  value={passenger.lastName}
                                  onChange={(e) =>
                                    handlePassengerChange(
                                      index,
                                      "lastName",
                                      e.target.value
                                    )
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor={`email-${index}`}>Email</Label>
                                <Input
                                  id={`email-${index}`}
                                  type="email"
                                  value={passenger.email}
                                  onChange={(e) =>
                                    handlePassengerChange(
                                      index,
                                      "email",
                                      e.target.value
                                    )
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor={`phone-${index}`}>
                                  Phone Number
                                </Label>
                                <Input
                                  id={`phone-${index}`}
                                  value={passenger.phoneNumber}
                                  onChange={(e) =>
                                    handlePassengerChange(
                                      index,
                                      "phoneNumber",
                                      e.target.value
                                    )
                                  }
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mb-6">
                  <Card className="shadow-md scroll-mt-20" id="travel-class">
                    <CardHeader className="bg-primary/5 sticky top-20 z-10">
                      <CardTitle className="text-lg">Travel Class</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <RadioGroup
                        value={formData.seatClass}
                        onValueChange={(value) =>
                          setFormData({ ...formData, seatClass: value })
                        }
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="economy" id="economy" />
                          <Label htmlFor="economy">Economy</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="business" id="business" />
                          <Label htmlFor="business">
                            Business Class (+ $150)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="first" id="first" />
                          <Label htmlFor="first">First Class (+ $300)</Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>
                </div>

                <div className="mb-6">
                  <Card className="shadow-md scroll-mt-20" id="payment-method">
                    <CardHeader className="bg-primary/5 sticky top-20 z-10">
                      <CardTitle className="text-lg">Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <RadioGroup
                        value={formData.paymentMethod}
                        onValueChange={(value) =>
                          setFormData({ ...formData, paymentMethod: value })
                        }
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="credit_card"
                            id="credit_card"
                          />
                          <Label htmlFor="credit_card">Credit Card</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="paypal" id="paypal" />
                          <Label htmlFor="paypal">PayPal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="bank_transfer"
                            id="bank_transfer"
                          />
                          <Label htmlFor="bank_transfer">Bank Transfer</Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>
                </div>

                {/* Fixed bottom actions bar on mobile - add extra padding at the bottom */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-md flex justify-between lg:hidden z-20">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    form="booking-form"
                    className="px-8 button-bounce"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Confirm Booking</>
                    )}
                  </Button>
                </div>

                {/* Desktop actions - hidden on mobile */}
                <div className="justify-end mt-6 hidden lg:flex mb-16">
                  <Button
                    type="button"
                    variant="outline"
                    className="mr-2"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="px-8 button-bounce"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Confirm Booking</>
                    )}
                  </Button>
                </div>

                {/* Mobile spacer to prevent content from being hidden behind fixed button */}
                <div className="h-24 lg:hidden"></div>
              </form>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
