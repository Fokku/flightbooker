
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/container";
import { Globe } from "@/components/home/Globe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GlobePage() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const popularDestinations = [
    { name: "New York", code: "NYC", continent: "North America" },
    { name: "Tokyo", code: "TYO", continent: "Asia" },
    { name: "London", code: "LON", continent: "Europe" },
    { name: "Sydney", code: "SYD", continent: "Australia" },
    { name: "Paris", code: "PAR", continent: "Europe" },
    { name: "Dubai", code: "DXB", continent: "Asia" },
    { name: "Cape Town", code: "CPT", continent: "Africa" },
    { name: "Rio de Janeiro", code: "RIO", continent: "South America" },
    { name: "Barcelona", code: "BCN", continent: "Europe" },
    { name: "San Francisco", code: "SFO", continent: "North America" },
    { name: "Bangkok", code: "BKK", continent: "Asia" },
    { name: "Rome", code: "ROM", continent: "Europe" },
  ];
  
  const selectDestination = (city: string) => {
    setSelectedCity(city);
    toast.success(`${city} selected as your destination`);
  };
  
  const searchFlights = () => {
    if (selectedCity) {
      navigate(`/search?destination=${selectedCity}`);
    } else {
      toast.error("Please select a destination first");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <section className="py-12">
          <Container>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold tracking-tight mb-4">Select Your Destination</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore our interactive globe to discover destinations around the world or choose from our popular locations below.
              </p>
            </div>
            
            <Globe />
            
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">Popular Destinations</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {popularDestinations.map((city) => (
                  <Card 
                    key={city.code} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedCity === city.name ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => selectDestination(city.name)}
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {city.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground">{city.continent}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-center mt-12">
                <Button 
                  size="lg" 
                  onClick={searchFlights}
                  disabled={!selectedCity}
                >
                  {selectedCity 
                    ? `Search Flights to ${selectedCity}` 
                    : "Select a Destination First"}
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
