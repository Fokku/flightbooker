import { useState, FormEvent, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Autocomplete } from "@/components/ui/autocomplete";
import { FadeIn } from "@/components/animations/FadeIn";
import {
  ArrowLeft,
  Calendar,
  Users,
  Search,
  Filter,
  Plane,
  ArrowDownUp,
  SlidersHorizontal,
} from "lucide-react";
import { flightsApi, FlightSearchParams } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { countriesAndCities } from "@/data/countries";

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

const SearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize searchParams with values from location state, if available
  const [searchParams, setSearchParams] = useState<FlightSearchParams>(() => {
    // Check if we have searchParams from the home page
    if (location.state && location.state.searchParams) {
      const homeSearchParams = location.state.searchParams;
      return {
        departure: homeSearchParams.departure || "",
        destination: homeSearchParams.destination || "",
        departureDate: homeSearchParams.departureDate || "",
        returnDate: homeSearchParams.returnDate || "",
        passengers: homeSearchParams.passengers || 1,
        class: "economy",
      };
    }

    // Default values
    return {
      departure: "",
      destination: "",
      departureDate: "",
      returnDate: "",
      passengers: 1,
      class: "economy",
    };
  });

  // Add sort and filter states
  const [sortBy, setSortBy] = useState<"price" | "duration" | "departure">(
    "price"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [filterParams, setFilterParams] = useState({
    minPrice: "",
    maxPrice: "",
    directFlights: false,
    airlines: [] as string[],
  });

  // Get unique airlines from flights
  const uniqueAirlines = [...new Set(flights.map((flight) => flight.airline))];

  // Load all flights when the component mounts
  useEffect(() => {
    loadAllFlights();
  }, []);

  // Add useEffect to trigger search when parameters are present
  useEffect(() => {
    // If we have search parameters from the home page, perform search
    if (
      location.state &&
      location.state.searchParams &&
      (location.state.searchParams.departure ||
        location.state.searchParams.destination)
    ) {
      handleSearch();
    } else {
      // Otherwise, load all flights as before
      loadAllFlights();
    }
  }, [location.state]);

  // Function to load all flights
  const loadAllFlights = async () => {
    setLoading(true);
    try {
      console.log("Loading all flights");
      const response = await flightsApi.search({} as FlightSearchParams);
      console.log("All flights response:", response);

      if (response.status) {
        if (
          response.data &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          setFlights(response.data as Flight[]);
        } else {
          // No flights found, but API call was successful
          setFlights([]);
        }
        setSearched(true);
      } else {
        setErrorMessage(response.message || "Error loading flights");
        setFlights([]);
      }
    } catch (error) {
      console.error("Error loading all flights:", error);
      setErrorMessage(
        "An error occurred while loading flights. Please try again."
      );
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error message when user changes inputs
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleSearch = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    // Reset states
    setErrorMessage(null);
    setFlights([]);

    // Check if at least one search parameter is provided
    const hasAtLeastOneParameter =
      searchParams.departure ||
      searchParams.destination ||
      searchParams.departureDate;

    if (!hasAtLeastOneParameter) {
      // If no parameters, just load all flights
      loadAllFlights();
      return;
    }

    setLoading(true);

    try {
      console.log("Searching with parameters:", searchParams);
      const response = await flightsApi.search(searchParams);
      console.log("Search response:", response);

      if (response.status) {
        if (
          response.data &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          setFlights(response.data as Flight[]);
        } else {
          // No flights found, but API call was successful
          setFlights([]);
        }
        setSearched(true);
      } else {
        setErrorMessage(response.message || "Error searching for flights");
        setFlights([]);
      }
    } catch (error) {
      console.error("Flight search error:", error);
      setErrorMessage(
        "An error occurred while searching for flights. Please try again."
      );
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFlight = (flight: Flight) => {
    navigate("/booking", { state: { flight } });
  };

  // Add a new function to handle sorting
  const handleSort = (sortField: "price" | "duration" | "departure") => {
    if (sortBy === sortField) {
      // Toggle sort order if the same field is clicked
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new sort field and default to ascending
      setSortBy(sortField);
      setSortOrder("asc");
    }
  };

  // Add a function to apply filters
  const applyFilters = () => {
    // Filter the flights based on the filter parameters
    let filteredFlights = [...flights];

    // Apply price filters
    if (filterParams.minPrice) {
      filteredFlights = filteredFlights.filter(
        (flight) => flight.price >= Number(filterParams.minPrice)
      );
    }

    if (filterParams.maxPrice) {
      filteredFlights = filteredFlights.filter(
        (flight) => flight.price <= Number(filterParams.maxPrice)
      );
    }

    // Apply direct flights filter
    if (filterParams.directFlights) {
      filteredFlights = filteredFlights.filter((flight) => flight.stops === 0);
    }

    // Apply airline filters
    if (filterParams.airlines.length > 0) {
      filteredFlights = filteredFlights.filter((flight) =>
        filterParams.airlines.includes(flight.airline)
      );
    }

    // Sort the filtered flights
    filteredFlights.sort((a, b) => {
      if (sortBy === "price") {
        return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
      } else if (sortBy === "duration") {
        // Convert duration strings (e.g. "2h 30m") to minutes for comparison
        const getDurationInMinutes = (duration: string) => {
          const matches = duration.match(/(\d+)h\s*(?:(\d+)m)?/);
          if (!matches) return 0;
          const hours = parseInt(matches[1]) || 0;
          const minutes = parseInt(matches[2]) || 0;
          return hours * 60 + minutes;
        };

        const aDuration = getDurationInMinutes(a.duration);
        const bDuration = getDurationInMinutes(b.duration);

        return sortOrder === "asc"
          ? aDuration - bDuration
          : bDuration - aDuration;
      } else {
        // 'departure'
        // Compare departure times
        return sortOrder === "asc"
          ? a.departureTime.localeCompare(b.departureTime)
          : b.departureTime.localeCompare(a.departureTime);
      }
    });

    return filteredFlights;
  };

  // Get the filtered and sorted flights
  const filteredAndSortedFlights = applyFilters();

  // Handle filter input changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name === "directFlights") {
        setFilterParams((prev) => ({
          ...prev,
          directFlights: checked,
        }));
      } else if (name.startsWith("airline-")) {
        const airline = name.replace("airline-", "");
        setFilterParams((prev) => {
          if (checked) {
            return {
              ...prev,
              airlines: [...prev.airlines, airline],
            };
          } else {
            return {
              ...prev,
              airlines: prev.airlines.filter((a) => a !== airline),
            };
          }
        });
      }
    } else {
      setFilterParams((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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

                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSearch} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      From
                    </label>
                    <Autocomplete
                      options={countriesAndCities}
                      value={searchParams.departure}
                      onChange={(value) =>
                        setSearchParams((prev) => ({
                          ...prev,
                          departure: value,
                        }))
                      }
                      placeholder="City or airport"
                      className="rounded-lg"
                      name="departure"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      To
                    </label>
                    <Autocomplete
                      options={countriesAndCities}
                      value={searchParams.destination}
                      onChange={(value) =>
                        setSearchParams((prev) => ({
                          ...prev,
                          destination: value,
                        }))
                      }
                      placeholder="City or airport"
                      className="rounded-lg"
                      name="destination"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Departure Date
                    </label>
                    <div className="relative">
                      <Input
                        type="date"
                        name="departureDate"
                        value={searchParams.departureDate}
                        onChange={handleInputChange}
                        className="rounded-lg"
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Return Date
                    </label>
                    <div className="relative">
                      <Input
                        type="date"
                        name="returnDate"
                        value={searchParams.returnDate}
                        onChange={handleInputChange}
                        className="rounded-lg"
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Passengers
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        name="passengers"
                        value={searchParams.passengers}
                        onChange={handleInputChange}
                        min={1}
                        className="rounded-lg"
                      />
                      <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-lg button-bounce"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                    ) : (
                      <Filter className="h-4 w-4 mr-2" />
                    )}
                    {loading ? "Searching..." : "Filter Flights"}
                  </Button>
                </form>
              </div>
            </FadeIn>

            {/* Flight results */}
            <div className="lg:col-span-3 space-y-6">
              <FadeIn
                className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                delay={200}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {searched &&
                      searchParams.departure &&
                      searchParams.destination
                        ? `${searchParams.departure} to ${searchParams.destination}`
                        : "All Available Flights"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {loading
                        ? "Searching for flights..."
                        : searched
                        ? `${
                            searchParams.departureDate
                              ? searchParams.departureDate
                              : "All dates"
                          } · ${flights.length} flights found`
                        : "Fill in the search form to filter flights"}
                    </p>
                  </div>
                  {flights.length > 0 && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                      >
                        Sort: Price
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                      >
                        Filter
                      </Button>
                    </div>
                  )}
                </div>
              </FadeIn>

              {/* Filter and sort row */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="text-xs flex items-center"
                  >
                    <SlidersHorizontal className="h-3 w-3 mr-1" />
                    Filters
                  </Button>

                  <div className="flex items-center text-sm text-gray-500">
                    {flights.length > 0 && (
                      <span className="ml-2">
                        {filteredAndSortedFlights.length} flights found
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={sortBy === "price" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSort("price")}
                    className="text-xs flex items-center"
                  >
                    Price
                    {sortBy === "price" && (
                      <ArrowDownUp
                        className={`h-3 w-3 ml-1 ${
                          sortOrder === "asc" ? "rotate-0" : "rotate-180"
                        }`}
                      />
                    )}
                  </Button>
                  <Button
                    variant={sortBy === "duration" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSort("duration")}
                    className="text-xs flex items-center"
                  >
                    Duration
                    {sortBy === "duration" && (
                      <ArrowDownUp
                        className={`h-3 w-3 ml-1 ${
                          sortOrder === "asc" ? "rotate-0" : "rotate-180"
                        }`}
                      />
                    )}
                  </Button>
                  <Button
                    variant={sortBy === "departure" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSort("departure")}
                    className="text-xs flex items-center"
                  >
                    Departure
                    {sortBy === "departure" && (
                      <ArrowDownUp
                        className={`h-3 w-3 ml-1 ${
                          sortOrder === "asc" ? "rotate-0" : "rotate-180"
                        }`}
                      />
                    )}
                  </Button>
                </div>
              </div>

              {/* Additional filters panel (show/hide) */}
              {showFilters && (
                <div className="bg-white rounded-xl p-4 mb-4 shadow-md border border-gray-100">
                  <h3 className="text-sm font-semibold mb-3">
                    Additional Filters
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">
                        Price Range
                      </label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="number"
                          name="minPrice"
                          placeholder="Min"
                          value={filterParams.minPrice}
                          onChange={handleFilterChange}
                          className="rounded-lg text-xs h-8"
                        />
                        <span className="text-gray-400">-</span>
                        <Input
                          type="number"
                          name="maxPrice"
                          placeholder="Max"
                          value={filterParams.maxPrice}
                          onChange={handleFilterChange}
                          className="rounded-lg text-xs h-8"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">
                        Flight Type
                      </label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="directFlights"
                          name="directFlights"
                          checked={filterParams.directFlights}
                          onChange={handleFilterChange}
                          className="rounded text-sky-600 mr-2"
                        />
                        <label
                          htmlFor="directFlights"
                          className="text-xs text-gray-700"
                        >
                          Direct flights only
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">
                        Airlines
                      </label>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {uniqueAirlines.map((airline) => (
                          <div key={airline} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`airline-${airline}`}
                              name={`airline-${airline}`}
                              checked={filterParams.airlines.includes(airline)}
                              onChange={handleFilterChange}
                              className="rounded text-sky-600 mr-2"
                            />
                            <label
                              htmlFor={`airline-${airline}`}
                              className="text-xs text-gray-700"
                            >
                              {airline}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Flight results */}
              {searched &&
                !loading &&
                filteredAndSortedFlights.length === 0 && (
                  <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Plane className="h-8 w-8 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">
                      No flights found
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your search criteria or checking different
                      dates.
                    </p>
                  </div>
                )}

              {filteredAndSortedFlights.map((flight, index) => (
                <FadeIn
                  key={flight.id}
                  className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-sky-100 transition-all duration-300 group hover-scale"
                  delay={300 + index * 100}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-500">
                        {flight.airline}
                      </span>
                      <span className="text-sm font-medium text-gray-500">
                        Flight {flight.flightNumber}
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="flex flex-1 items-center gap-4">
                        <div className="flex-1">
                          <p className="text-2xl font-bold">
                            {flight.departureTime}
                          </p>
                          <p className="text-sm text-gray-500">
                            {flight.departure}
                          </p>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="text-sm font-medium text-gray-500">
                            {flight.duration}
                          </div>
                          <div className="relative w-24 md:w-36 h-px bg-gray-300 my-2">
                            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-2 h-2 rounded-full bg-sky-600"></div>
                            {flight.stops > 0 && (
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-400"></div>
                            )}
                            <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-2 h-2 rounded-full bg-sky-600"></div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {flight.stops === 0
                              ? "Nonstop"
                              : `${flight.stops} stop in ${flight.stopCity}`}
                          </div>
                        </div>

                        <div className="flex-1 text-right">
                          <p className="text-2xl font-bold">
                            {flight.arrivalTime}
                          </p>
                          <p className="text-sm text-gray-500">
                            {flight.arrival}
                          </p>
                        </div>
                      </div>

                      <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-2">
                        <p className="text-2xl font-bold text-sky-600">
                          ${flight.price}
                        </p>
                        <Button
                          className="w-full md:w-auto rounded-lg button-bounce"
                          onClick={() => handleSelectFlight(flight)}
                        >
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
