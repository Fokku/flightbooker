
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/animations/FadeIn";
import { ArrowLeft, Calendar, ArrowRight, Users, Search, Filter, Plane } from "lucide-react";

const SearchPage = () => {
  const [loading, setLoading] = useState(false);
  
  // Mock flight data
  const flights = [
    {
      id: 1,
      airline: "SkyGlobe Airways",
      flightNumber: "SG1234",
      departure: "New York (JFK)",
      arrival: "Los Angeles (LAX)",
      departureTime: "08:00 AM",
      arrivalTime: "11:30 AM",
      duration: "3h 30m",
      price: 299,
      stops: 0,
    },
    {
      id: 2,
      airline: "Ocean Airlines",
      flightNumber: "OA5678",
      departure: "New York (JFK)",
      arrival: "Los Angeles (LAX)",
      departureTime: "10:15 AM",
      arrivalTime: "02:00 PM",
      duration: "3h 45m",
      price: 259,
      stops: 0,
    },
    {
      id: 3,
      airline: "Star Express",
      flightNumber: "SE9012",
      departure: "New York (JFK)",
      arrival: "Los Angeles (LAX)",
      departureTime: "01:30 PM",
      arrivalTime: "07:15 PM",
      duration: "5h 45m",
      price: 199,
      stops: 1,
      stopCity: "Chicago (ORD)",
    },
  ];

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

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
            <h1 className="text-2xl font-bold">Search Flights</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Search filters */}
            <FadeIn className="lg:col-span-1" delay={100}>
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 h-fit">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </h2>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">From</label>
                    <Input placeholder="City or airport" className="rounded-lg" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">To</label>
                    <Input placeholder="City or airport" className="rounded-lg" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Departure Date</label>
                    <div className="relative">
                      <Input type="date" className="rounded-lg" />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Return Date</label>
                    <div className="relative">
                      <Input type="date" className="rounded-lg" />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Passengers</label>
                    <div className="relative">
                      <Input type="number" defaultValue={1} min={1} className="rounded-lg" />
                      <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                  </div>

                  <Button onClick={handleSearch} className="w-full rounded-lg button-bounce">
                    {loading ? (
                      <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Search
                  </Button>
                </div>
              </div>
            </FadeIn>

            {/* Flight results */}
            <div className="lg:col-span-3 space-y-6">
              <FadeIn className="bg-white rounded-xl p-6 shadow-md border border-gray-100" delay={200}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">New York to Los Angeles</h2>
                    <p className="text-sm text-gray-500">May 15, 2023 · 3 flights found</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-lg">
                      Sort: Price
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-lg">
                      Filter
                    </Button>
                  </div>
                </div>
              </FadeIn>

              {flights.map((flight, index) => (
                <FadeIn
                  key={flight.id}
                  className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-sky-100 transition-all duration-300 group hover-scale"
                  delay={300 + index * 100}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-500">{flight.airline}</span>
                      <span className="text-sm font-medium text-gray-500">Flight {flight.flightNumber}</span>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="flex flex-1 items-center gap-4">
                        <div className="flex-1">
                          <p className="text-2xl font-bold">{flight.departureTime}</p>
                          <p className="text-sm text-gray-500">{flight.departure}</p>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="text-sm font-medium text-gray-500">{flight.duration}</div>
                          <div className="relative w-24 md:w-36 h-px bg-gray-300 my-2">
                            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-2 h-2 rounded-full bg-sky-600"></div>
                            {flight.stops > 0 && (
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-400"></div>
                            )}
                            <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-2 h-2 rounded-full bg-sky-600"></div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {flight.stops === 0 ? "Nonstop" : `${flight.stops} stop in ${flight.stopCity}`}
                          </div>
                        </div>

                        <div className="flex-1 text-right">
                          <p className="text-2xl font-bold">{flight.arrivalTime}</p>
                          <p className="text-sm text-gray-500">{flight.arrival}</p>
                        </div>
                      </div>

                      <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-2">
                        <p className="text-2xl font-bold text-sky-600">${flight.price}</p>
                        <Button className="w-full md:w-auto rounded-lg button-bounce">
                          <Plane className="h-4 w-4 mr-2" />
                          Select
                        </Button>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
};

export default SearchPage;
