import { useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Autocomplete } from "@/components/ui/autocomplete";
import { FadeIn } from "@/components/animations/FadeIn";
import { Calendar, ArrowRight, Users, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { countriesAndCities } from "@/data/countries";

export function SearchFlights() {
  const [trip, setTrip] = useState<"roundtrip" | "oneway">("roundtrip");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    departure: "",
    destination: "",
    departureDate: "",
    returnDate: "",
    passengers: 1,
  });

  const handleChange = (field: string, value: string | number) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    // Navigate to search page with the search parameters
    navigate("/search", { state: { searchParams } });
  };

  return (
    <section className="py-20 section-padding">
      <Container>
        <FadeIn>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-sky-100 text-sky-700">
                Find your flight
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                Search for the perfect flight
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Enter your travel details to find available flights
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <div className="flex gap-4 mb-6">
                <Button
                  type="button"
                  variant={trip === "roundtrip" ? "default" : "outline"}
                  onClick={() => setTrip("roundtrip")}
                  className="rounded-full"
                >
                  Round Trip
                </Button>
                <Button
                  type="button"
                  variant={trip === "oneway" ? "default" : "outline"}
                  onClick={() => setTrip("oneway")}
                  className="rounded-full"
                >
                  One Way
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    From
                  </label>
                  <Autocomplete
                    options={countriesAndCities}
                    value={searchParams.departure}
                    onChange={(value) => handleChange("departure", value)}
                    placeholder="City or airport"
                    className="rounded-lg h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    To
                  </label>
                  <div className="relative">
                    <Autocomplete
                      options={countriesAndCities}
                      value={searchParams.destination}
                      onChange={(value) => handleChange("destination", value)}
                      placeholder="City or airport"
                      className="rounded-lg h-12"
                    />
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-sky-100 p-1 rounded-full text-sky-600">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Departure
                  </label>
                  <div className="relative">
                    <Input
                      type="date"
                      className="rounded-lg h-12"
                      value={searchParams.departureDate}
                      onChange={(e) =>
                        handleChange("departureDate", e.target.value)
                      }
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                </div>
                {trip === "roundtrip" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Return
                    </label>
                    <div className="relative">
                      <Input
                        type="date"
                        className="rounded-lg h-12"
                        value={searchParams.returnDate}
                        onChange={(e) =>
                          handleChange("returnDate", e.target.value)
                        }
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Passengers
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      defaultValue={1}
                      min={1}
                      max={10}
                      className="rounded-lg h-12"
                      value={searchParams.passengers}
                      onChange={(e) =>
                        handleChange(
                          "passengers",
                          parseInt(e.target.value) || 1
                        )
                      }
                    />
                    <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  className="w-full py-6 rounded-xl button-bounce text-lg"
                  onClick={handleSearch}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Search Flights
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
