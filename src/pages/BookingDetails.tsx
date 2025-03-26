import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { FadeIn } from "@/components/animations/FadeIn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Plane,
  Calendar,
  Clock,
  User,
  Ticket,
  Building,
  MapPin,
  Ban,
  Printer,
  Download,
  Share2,
  ShieldCheck,
  Utensils,
  Luggage,
  Wifi,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { bookingsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Booking {
  id: number;
  booking_id?: string;
  flight_id: number;
  flight_number: string;
  airline: string;
  departure: string;
  arrival: string;
  departure_date: string;
  departure_time: string;
  arrival_time: string;
  passengers: number;
  status: string;
  total_price: number;
  booking_date: string;
}

interface PassengerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export default function BookingDetailsPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Mock passenger details (in a real app, this would come from the API)
  const [passengers, setPassengers] = useState<PassengerDetails[]>([
    {
      firstName: user?.username || "Guest",
      lastName: "User",
      email: user?.email || "guest@example.com",
      phoneNumber: "+1234567890",
    },
  ]);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails(parseInt(bookingId));
    }
  }, [bookingId]);

  const fetchBookingDetails = async (id: number) => {
    setLoading(true);
    try {
      // In a real app, you'd call an API endpoint to get booking details
      // For now, we'll use the getUserBookings API and find the specific booking
      const response = await bookingsApi.getUserBookings();

      if (response.status && response.data) {
        const bookings = response.data as Booking[];
        const foundBooking = bookings.find((b) => b.id === id);

        if (foundBooking) {
          setBooking(foundBooking);
          // Generate mock passenger data based on the number of passengers
          if (foundBooking.passengers > 1) {
            const mockPassengers: PassengerDetails[] = [];
            mockPassengers.push({
              firstName: user?.username || "Guest",
              lastName: "User",
              email: user?.email || "guest@example.com",
              phoneNumber: "+1234567890",
            });

            // Add additional passengers
            for (let i = 1; i < foundBooking.passengers; i++) {
              mockPassengers.push({
                firstName: `Passenger ${i + 1}`,
                lastName: "Test",
                email: `passenger${i + 1}@example.com`,
                phoneNumber: `+1234567${i + 10}`,
              });
            }
            setPassengers(mockPassengers);
          }
        } else {
          toast.error("Booking not found");
          navigate("/bookings");
        }
      } else {
        toast.error(response.message || "Failed to fetch booking details");
        navigate("/bookings");
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
      toast.error("An error occurred while fetching booking details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    try {
      const response = await bookingsApi.cancel(booking.id);

      if (response.status) {
        toast.success("Booking cancelled successfully");
        setBooking({
          ...booking,
          status: "cancelled",
        });
        setCancelDialogOpen(false);
      } else {
        toast.error(response.message || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("An error occurred while cancelling your booking");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-sky-100 text-sky-800";
    }
  };

  const printBoardingPass = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-24 pb-16">
          <Container>
            <div className="flex justify-center items-center py-16">
              <Clock className="h-8 w-8 animate-spin text-sky-600" />
              <span className="ml-2 text-gray-600">
                Loading booking details...
              </span>
            </div>
          </Container>
        </main>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-24 pb-16">
          <Container>
            <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100 text-center max-w-md mx-auto">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
              <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
              <p className="text-gray-600 mb-6">
                The booking you're looking for doesn't exist or you don't have
                permission to view it.
              </p>
              <Button
                className="w-full rounded-lg button-bounce"
                onClick={() => navigate("/bookings")}
              >
                Back to My Bookings
              </Button>
            </div>
          </Container>
        </main>
      </div>
    );
  }

  const departureDate = new Date(booking.departure_date);
  const isPastFlight = departureDate < new Date();
  const isCancelled = booking.status.toLowerCase() === "cancelled";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 pb-16">
        <Container>
          <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                className="mr-4"
                onClick={() => navigate("/bookings")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Bookings
              </Button>
              <h1 className="text-2xl font-bold">Booking Details</h1>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={printBoardingPass}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download E-Ticket
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <FadeIn delay={100}>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-6">
              <div className="p-6">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                  <div>
                    <div className="flex items-center">
                      <div className="bg-sky-100 rounded-lg p-3 mr-4">
                        <Plane className="h-6 w-6 text-sky-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{booking.airline}</h2>
                        <p className="text-gray-500">
                          Booking Reference:{" "}
                          <span className="font-medium">
                            {booking.booking_id || booking.id}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`${getStatusColor(
                      booking.status
                    )} text-sm font-medium px-3 py-1 rounded-full uppercase`}
                  >
                    {booking.status || "confirmed"}
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-5 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500">
                        Departure
                      </p>
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-sky-600 mr-2 mt-0.5" />
                        <div>
                          <p className="font-bold text-lg">
                            {booking.departure}
                          </p>
                          <p className="text-gray-600">
                            {formatDate(booking.departure_date)}
                          </p>
                          <p className="text-sky-600 font-medium">
                            {booking.departure_time}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="relative h-0.5 w-full bg-gray-300 my-2">
                        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-sky-600"></div>
                        <Plane className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 h-6 w-6 text-sky-600" />
                        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-sky-600"></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500">
                        Arrival
                      </p>
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-sky-600 mr-2 mt-0.5" />
                        <div>
                          <p className="font-bold text-lg">{booking.arrival}</p>
                          <p className="text-gray-600">
                            {formatDate(booking.departure_date)}
                          </p>
                          <p className="text-sky-600 font-medium">
                            {booking.arrival_time}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Flight</p>
                    <div className="flex items-center">
                      <Plane className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="font-semibold">{booking.flight_number}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">
                      Passengers
                    </p>
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="font-semibold">{booking.passengers}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Class</p>
                    <div className="flex items-center">
                      <Ticket className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="font-semibold">Economy</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">
                      Total Price
                    </p>
                    <div className="flex items-center">
                      <Ticket className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="font-semibold text-sky-600">
                        ${booking.total_price}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <Tabs defaultValue="details" className="px-6 py-4">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Flight Details</TabsTrigger>
                  <TabsTrigger value="passengers">Passengers</TabsTrigger>
                  <TabsTrigger value="services">Services</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Flight Information</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <Plane className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <p className="font-medium">Aircraft Type</p>
                            <p className="text-gray-600">
                              Boeing 787 Dreamliner
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <p className="font-medium">Duration</p>
                            <p className="text-gray-600">2h 35m</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <Building className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <p className="font-medium">Terminal</p>
                            <p className="text-gray-600">
                              Terminal 3, Gate B12
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <Luggage className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <p className="font-medium">Baggage Allowance</p>
                            <p className="text-gray-600">
                              1 x 23kg checked, 1 x 8kg cabin
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">
                        Booking Information
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <p className="font-medium">Booking Date</p>
                            <p className="text-gray-600">
                              {new Date(
                                booking.booking_date
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <ShieldCheck className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <p className="font-medium">Travel Insurance</p>
                            <p className="text-gray-600">Included</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <p className="font-medium">Checked In</p>
                            <p className="text-gray-600">
                              {isPastFlight ? "Yes" : "Not yet available"}
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <p className="font-medium">Special Requirements</p>
                            <p className="text-gray-600">None</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="passengers">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Passenger Information</h3>

                    <div className="space-y-4">
                      {passengers.map((passenger, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-gray-200 p-4"
                        >
                          <div className="flex items-center mb-2">
                            <User className="h-5 w-5 text-gray-400 mr-2" />
                            <h4 className="font-medium">
                              Passenger {index + 1}: {passenger.firstName}{" "}
                              {passenger.lastName}
                            </h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Email</p>
                              <p>{passenger.email}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Phone</p>
                              <p>{passenger.phoneNumber}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Seat</p>
                              <p>
                                {["12A", "12B", "12C", "12D"][index] ||
                                  "Not assigned"}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Meal Preference</p>
                              <p>Regular</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="services">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Included Services</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>Standard seat selection</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>Complimentary snacks & beverages</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>Personal item (under seat)</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>Carry-on bag (overhead bin)</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">
                        Additional Services
                      </h3>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <X className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-500">
                            Premium seat (+$35)
                          </span>
                        </li>
                        <li className="flex items-center">
                          <X className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-500">
                            Extra baggage (+$50)
                          </span>
                        </li>
                        <li className="flex items-center">
                          <X className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-500">
                            Priority boarding (+$15)
                          </span>
                        </li>
                        <li className="flex items-center">
                          <X className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-500">
                            In-flight Wi-Fi (+$12)
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </FadeIn>

          {!isPastFlight && !isCancelled && (
            <FadeIn delay={200} className="flex justify-end">
              <Button
                variant="destructive"
                onClick={() => setCancelDialogOpen(true)}
              >
                <Ban className="h-4 w-4 mr-2" />
                Cancel Booking
              </Button>
            </FadeIn>
          )}

          {isCancelled && (
            <FadeIn
              delay={200}
              className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 flex items-start"
            >
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">This booking has been cancelled</p>
                <p className="text-sm">
                  If you need to make further changes, please contact customer
                  support.
                </p>
              </div>
            </FadeIn>
          )}
        </Container>
      </main>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Please note our cancellation policy:
          </p>
          <ul className="text-sm text-gray-500 list-disc ml-5 space-y-1">
            <li>
              Cancellations made more than 24 hours before departure will
              receive a full refund.
            </li>
            <li>
              Cancellations made within 24 hours of departure may be subject to
              a cancellation fee.
            </li>
          </ul>
          <DialogFooter className="flex space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              Keep Booking
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking}>
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
