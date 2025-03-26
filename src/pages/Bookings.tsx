import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Plane,
  Calendar,
  Clock,
  User,
  Ticket,
  Loader2,
  MapPin,
  ChevronRight,
  AlertCircle,
  ShieldCheck,
  Luggage,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { bookingsApi } from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

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

const BookingsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Split bookings into upcoming and past
  const currentDate = new Date();
  const upcomingBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.departure_date);
    return bookingDate >= currentDate;
  });

  const pastBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.departure_date);
    return bookingDate < currentDate;
  });

  // Fetch bookings on component mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      console.log("Fetching user bookings...");
      const response = await bookingsApi.getUserBookings();
      console.log("Bookings API response:", response);

      if (response.status && response.data) {
        console.log("Setting bookings data:", response.data);
        setBookings(response.data as Booking[]);
      } else {
        console.error("Failed to fetch bookings:", response.message);
        toast.error(response.message || "Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("An error occurred while fetching your bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    try {
      const response = await bookingsApi.cancel(bookingId);

      if (response.status) {
        toast.success("Booking cancelled successfully");
        // Refresh the bookings list
        fetchBookings();
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
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "confirmed") {
      return <Badge variant="success">{status}</Badge>;
    } else if (statusLower === "cancelled") {
      return <Badge variant="destructive">{status}</Badge>;
    } else if (statusLower === "completed") {
      return <Badge variant="secondary">{status}</Badge>;
    } else if (statusLower === "pending") {
      return <Badge variant="warning">{status}</Badge>;
    } else {
      return <Badge>{status}</Badge>;
    }
  };

  // Calculate estimated flight duration
  const calculateDuration = (departureTime: string, arrivalTime: string) => {
    try {
      const [depHours, depMinutes] = departureTime.split(":").map(Number);
      const [arrHours, arrMinutes] = arrivalTime.split(":").map(Number);

      let hoursDiff = arrHours - depHours;
      let minutesDiff = arrMinutes - depMinutes;

      // Handle negative minutes
      if (minutesDiff < 0) {
        minutesDiff += 60;
        hoursDiff -= 1;
      }

      // Handle negative hours (assuming same-day flight)
      if (hoursDiff < 0) {
        hoursDiff += 24;
      }

      return `${hoursDiff}h ${minutesDiff}m`;
    } catch (e) {
      return "~2h 30m";
    }
  };

  // Redirect to login page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-24 pb-16">
          <Container>
            <FadeIn className="max-w-md mx-auto">
              <div className="flex items-center mb-8">
                <Button
                  variant="ghost"
                  className="mr-2"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-2xl font-bold">My Bookings</h1>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100 text-center">
                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Ticket className="h-8 w-8 text-sky-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  Sign in to view your bookings
                </h2>
                <p className="text-gray-600 mb-6">
                  Please sign in to your account to view and manage your flight
                  bookings.
                </p>
                <Button
                  className="w-full rounded-lg button-bounce"
                  onClick={() =>
                    navigate("/login", { state: { from: "/bookings" } })
                  }
                >
                  Sign In
                </Button>
              </div>
            </FadeIn>
          </Container>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 pb-16">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button
                variant="ghost"
                className="mr-2"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">My Bookings</h1>
            </div>
            <Button onClick={() => navigate("/search")} className="rounded-lg">
              <Plane className="h-4 w-4 mr-2" /> Book New Flight
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
              <span className="ml-2 text-gray-600">
                Loading your bookings...
              </span>
            </div>
          ) : (
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="mb-6 bg-white">
                <TabsTrigger value="upcoming">
                  Upcoming ({upcomingBookings.length})
                </TabsTrigger>
                <TabsTrigger value="past">
                  Past ({pastBookings.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-6">
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map((booking, index) => (
                    <FadeIn
                      key={booking.id}
                      className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-sky-100 transition-all duration-300 hover-scale"
                      delay={100 + index * 100}
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="bg-sky-100 rounded-lg p-2 mr-4">
                              <Plane className="h-5 w-5 text-sky-600" />
                            </div>
                            <div>
                              <div className="flex items-center">
                                <p className="font-semibold mr-2">
                                  {booking.airline}
                                </p>
                                {getStatusBadge(booking.status || "confirmed")}
                              </div>
                              <p className="text-sm text-gray-500">
                                Booking #{booking.booking_id || booking.id} -{" "}
                                {formatDate(booking.booking_date)}
                              </p>
                            </div>
                          </div>
                          <div className="hidden md:flex items-center text-sm text-gray-500">
                            <ShieldCheck className="h-4 w-4 mr-1" />
                            <span>Travel Insurance Included</span>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-500">
                                Departure
                              </p>
                              <div className="flex items-start">
                                <MapPin className="h-4 w-4 text-sky-600 mr-2 mt-0.5" />
                                <div>
                                  <p className="font-bold">
                                    {booking.departure}
                                  </p>
                                  <div className="flex items-center text-sm">
                                    <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                                    <span className="text-gray-600 mr-2">
                                      {formatDate(booking.departure_date)}
                                    </span>
                                    <Clock className="h-3 w-3 text-gray-400 mr-1" />
                                    <span className="text-sky-600 font-medium">
                                      {booking.departure_time}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-center justify-center">
                              <div className="relative w-full h-px bg-gray-300 my-2">
                                <Plane className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 h-4 w-4 text-sky-600" />
                                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-2 h-2 rounded-full bg-sky-600"></div>
                                <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-2 h-2 rounded-full bg-sky-600"></div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {calculateDuration(
                                  booking.departure_time,
                                  booking.arrival_time
                                )}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-500">
                                Arrival
                              </p>
                              <div className="flex items-start">
                                <MapPin className="h-4 w-4 text-sky-600 mr-2 mt-0.5" />
                                <div>
                                  <p className="font-bold">{booking.arrival}</p>
                                  <div className="flex items-center text-sm">
                                    <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                                    <span className="text-gray-600 mr-2">
                                      {formatDate(booking.departure_date)}
                                    </span>
                                    <Clock className="h-3 w-3 text-gray-400 mr-1" />
                                    <span className="text-sky-600 font-medium">
                                      {booking.arrival_time}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Flight</p>
                              <p className="font-medium">
                                {booking.flight_number}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">
                                Passengers
                              </p>
                              <p className="font-medium">
                                {booking.passengers}{" "}
                                {booking.passengers === 1 ? "person" : "people"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Luggage className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Class</p>
                              <p className="font-medium">Economy</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Total</p>
                              <p className="font-medium text-sky-600">
                                ${booking.total_price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4 flex flex-wrap justify-between items-center gap-4">
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                            <span className="text-sm">
                              {new Date(booking.departure_date) <
                              new Date(Date.now() + 24 * 60 * 60 * 1000)
                                ? "Check-in available now"
                                : `Check-in opens 24 hours before departure`}
                            </span>
                          </div>

                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                              variant="outline"
                              className="flex-1 sm:flex-none rounded-lg text-sm"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="flex-1 sm:flex-none rounded-lg text-sm"
                              onClick={() =>
                                navigate(`/bookings/${booking.id}`)
                              }
                            >
                              Manage <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </FadeIn>
                  ))
                ) : (
                  <FadeIn className="bg-white rounded-xl p-8 shadow-md border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Plane className="h-8 w-8 text-sky-600" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">
                      No upcoming bookings
                    </h2>
                    <p className="text-gray-600 mb-6">
                      You don't have any upcoming flight bookings. Ready to plan
                      your next trip?
                    </p>
                    <Button
                      className="rounded-lg button-bounce"
                      onClick={() => navigate("/search")}
                    >
                      Book a Flight
                    </Button>
                  </FadeIn>
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-6">
                {pastBookings.length > 0 ? (
                  pastBookings.map((booking, index) => (
                    <FadeIn
                      key={booking.id}
                      className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-sky-100 transition-all duration-300 hover-scale"
                      delay={100 + index * 100}
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="bg-gray-100 rounded-lg p-2 mr-4">
                              <Plane className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <div className="flex items-center">
                                <p className="font-semibold mr-2">
                                  {booking.airline}
                                </p>
                                <Badge variant="secondary">Completed</Badge>
                              </div>
                              <p className="text-sm text-gray-500">
                                Booking #{booking.booking_id || booking.id} -{" "}
                                {formatDate(booking.booking_date)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-500">
                                Departure
                              </p>
                              <div className="flex items-start">
                                <MapPin className="h-4 w-4 text-gray-600 mr-2 mt-0.5" />
                                <div>
                                  <p className="font-bold">
                                    {booking.departure}
                                  </p>
                                  <div className="flex items-center text-sm">
                                    <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                                    <span className="text-gray-600 mr-2">
                                      {formatDate(booking.departure_date)}
                                    </span>
                                    <Clock className="h-3 w-3 text-gray-400 mr-1" />
                                    <span className="text-gray-600 font-medium">
                                      {booking.departure_time}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-center justify-center">
                              <div className="relative w-full h-px bg-gray-300 my-2">
                                <Plane className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 h-4 w-4 text-gray-600" />
                                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-2 h-2 rounded-full bg-gray-600"></div>
                                <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-2 h-2 rounded-full bg-gray-600"></div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {calculateDuration(
                                  booking.departure_time,
                                  booking.arrival_time
                                )}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-500">
                                Arrival
                              </p>
                              <div className="flex items-start">
                                <MapPin className="h-4 w-4 text-gray-600 mr-2 mt-0.5" />
                                <div>
                                  <p className="font-bold">{booking.arrival}</p>
                                  <div className="flex items-center text-sm">
                                    <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                                    <span className="text-gray-600 mr-2">
                                      {formatDate(booking.departure_date)}
                                    </span>
                                    <Clock className="h-3 w-3 text-gray-400 mr-1" />
                                    <span className="text-gray-600 font-medium">
                                      {booking.arrival_time}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Flight</p>
                              <p className="font-medium">
                                {booking.flight_number}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">
                                Passengers
                              </p>
                              <p className="font-medium">
                                {booking.passengers}{" "}
                                {booking.passengers === 1 ? "person" : "people"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Luggage className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Class</p>
                              <p className="font-medium">Economy</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Total</p>
                              <p className="font-medium text-gray-600">
                                ${booking.total_price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4 flex justify-end">
                          <Button
                            variant="outline"
                            className="w-full sm:w-auto rounded-lg text-sm"
                            onClick={() => navigate(`/bookings/${booking.id}`)}
                          >
                            View Details{" "}
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </FadeIn>
                  ))
                ) : (
                  <FadeIn className="bg-white rounded-xl p-8 shadow-md border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Calendar className="h-8 w-8 text-gray-500" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">
                      No past bookings
                    </h2>
                    <p className="text-gray-600 mb-6">
                      You don't have any past flight bookings. Book your first
                      flight with us!
                    </p>
                    <Button
                      className="rounded-lg button-bounce"
                      onClick={() => navigate("/search")}
                    >
                      Book a Flight
                    </Button>
                  </FadeIn>
                )}
              </TabsContent>
            </Tabs>
          )}
        </Container>
      </main>
    </div>
  );
};

export default BookingsPage;
