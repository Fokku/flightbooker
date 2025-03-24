
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plane, Calendar, Clock, User, Ticket } from "lucide-react";

const BookingsPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Mock booking data
  const bookings = [
    {
      id: "BK-12345",
      flightNumber: "SG1234",
      airline: "SkyGlobe Airways",
      departure: "New York (JFK)",
      arrival: "Los Angeles (LAX)",
      departureDate: "May 15, 2023",
      departureTime: "08:00 AM",
      arrivalTime: "11:30 AM",
      passengers: 2,
      status: "confirmed",
      price: 598,
    },
    {
      id: "BK-12346",
      flightNumber: "OA5678",
      airline: "Ocean Airlines",
      departure: "Los Angeles (LAX)",
      arrival: "New York (JFK)",
      departureDate: "May 22, 2023",
      departureTime: "10:15 AM",
      arrivalTime: "07:45 PM",
      passengers: 2,
      status: "confirmed",
      price: 698,
    },
  ];

  const pastBookings = [
    {
      id: "BK-11111",
      flightNumber: "SE9012",
      airline: "Star Express",
      departure: "Chicago (ORD)",
      arrival: "Miami (MIA)",
      departureDate: "March 10, 2023",
      departureTime: "06:30 AM",
      arrivalTime: "10:15 AM",
      passengers: 1,
      status: "completed",
      price: 299,
    },
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-24 pb-16">
          <Container>
            <FadeIn className="max-w-md mx-auto">
              <div className="flex items-center mb-8">
                <Button variant="ghost" className="mr-2">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-2xl font-bold">My Bookings</h1>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100 text-center">
                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Ticket className="h-8 w-8 text-sky-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Sign in to view your bookings</h2>
                <p className="text-gray-600 mb-6">
                  Please sign in to your account to view and manage your flight bookings.
                </p>
                <Button 
                  className="w-full rounded-lg button-bounce"
                  onClick={() => setIsLoggedIn(true)}
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
          <div className="flex items-center mb-8">
            <Button variant="ghost" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">My Bookings</h1>
          </div>

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="mb-6 bg-white">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="space-y-6">
              {bookings.map((booking, index) => (
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
                          <p className="font-semibold">{booking.airline}</p>
                          <p className="text-sm text-gray-500">Booking #{booking.id}</p>
                        </div>
                      </div>
                      <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full uppercase">
                        {booking.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-medium">{booking.departureDate}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Flight</p>
                          <p className="font-medium">{booking.flightNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Passengers</p>
                          <p className="font-medium">{booking.passengers}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Ticket className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="font-medium text-sky-600">${booking.price}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-lg font-bold">{booking.departureTime}</p>
                          <p className="text-sm text-gray-500">{booking.departure}</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="relative w-16 sm:w-32 h-px bg-gray-300 my-2">
                            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-2 h-2 rounded-full bg-sky-600"></div>
                            <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-2 h-2 rounded-full bg-sky-600"></div>
                          </div>
                        </div>
                        <div>
                          <p className="text-lg font-bold">{booking.arrivalTime}</p>
                          <p className="text-sm text-gray-500">{booking.arrival}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" className="flex-1 sm:flex-none rounded-lg text-sm">
                          Manage
                        </Button>
                        <Button className="flex-1 sm:flex-none rounded-lg text-sm">
                          Check-in
                        </Button>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </TabsContent>
            
            <TabsContent value="past" className="space-y-6">
              {pastBookings.map((booking, index) => (
                <FadeIn
                  key={booking.id}
                  className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300"
                  delay={100 + index * 100}
                >
                  <div className="p-6 opacity-70">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="bg-gray-100 rounded-lg p-2 mr-4">
                          <Plane className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{booking.airline}</p>
                          <p className="text-sm text-gray-500">Booking #{booking.id}</p>
                        </div>
                      </div>
                      <div className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full uppercase">
                        {booking.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-medium">{booking.departureDate}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Flight</p>
                          <p className="font-medium">{booking.flightNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Passengers</p>
                          <p className="font-medium">{booking.passengers}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Ticket className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="font-medium">${booking.price}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-lg font-bold">{booking.departureTime}</p>
                          <p className="text-sm text-gray-500">{booking.departure}</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="relative w-16 sm:w-32 h-px bg-gray-300 my-2">
                            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-2 h-2 rounded-full bg-gray-400"></div>
                            <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-2 h-2 rounded-full bg-gray-400"></div>
                          </div>
                        </div>
                        <div>
                          <p className="text-lg font-bold">{booking.arrivalTime}</p>
                          <p className="text-sm text-gray-500">{booking.arrival}</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full sm:w-auto rounded-lg text-sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </TabsContent>
          </Tabs>
        </Container>
      </main>
    </div>
  );
};

export default BookingsPage;
