
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/FadeIn";
import { Airplane } from "lucide-react";

export function Globe() {
  const [isLoaded, setIsLoaded] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Simulating the 3D globe loading process
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <section className="py-24 section-padding overflow-hidden relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50 to-white"></div>
      </div>
      
      <Container>
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <FadeIn className="flex-1" delay={100}>
            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-sky-100 text-sky-700">
              Visual exploration
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              Discover destinations on our interactive globe
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Explore the world in 3D and find your next adventure. Rotate, zoom, and select destinations directly on our interactive globe.
            </p>
            
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" className="rounded-full button-bounce">
                <Airplane className="mr-2 h-4 w-4" />
                Explore Now
              </Button>
              <Button variant="outline" size="lg" className="rounded-full button-bounce">
                Popular Destinations
              </Button>
            </div>
            
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {['New York', 'Tokyo', 'London', 'Sydney', 'Paris', 'Dubai'].map((city, index) => (
                <Button 
                  key={city} 
                  variant="ghost" 
                  className="justify-start text-gray-600 hover:text-sky-600"
                >
                  {city}
                </Button>
              ))}
            </div>
          </FadeIn>
          
          <FadeIn className="flex-1 min-h-[400px]" delay={300}>
            <div ref={canvasRef} className="relative w-full h-[400px] sm:h-[500px] rounded-2xl overflow-hidden shadow-xl">
              {/* This would be replaced with an actual WebGL globe in a real implementation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px]">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-sky-600 animate-spin-slow opacity-80"></div>
                    <div className="absolute inset-2 rounded-full bg-blue-100"></div>
                    <div className="absolute inset-[10%] rounded-full bg-gradient-to-r from-blue-500 via-sky-400 to-blue-600 opacity-80"></div>
                    
                    {/* Continents simplified */}
                    <div className="absolute top-[25%] left-[15%] w-[20%] h-[15%] bg-green-700/40 rounded-full"></div>
                    <div className="absolute top-[30%] left-[45%] w-[25%] h-[20%] bg-green-700/40 rounded-full"></div>
                    <div className="absolute top-[60%] left-[35%] w-[15%] h-[10%] bg-green-700/40 rounded-full"></div>
                    <div className="absolute top-[20%] right-[20%] w-[15%] h-[15%] bg-green-700/40 rounded-full"></div>
                    <div className="absolute bottom-[25%] right-[25%] w-[20%] h-[15%] bg-green-700/40 rounded-full"></div>
                    
                    {/* Flight paths */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <svg width="100%" height="100%" viewBox="0 0 100 100">
                        <path 
                          d="M30,30 Q50,10 70,40" 
                          fill="none" 
                          stroke="white" 
                          strokeWidth="0.5" 
                          strokeDasharray="1 1"
                        />
                        <path 
                          d="M20,50 Q50,20 80,50" 
                          fill="none" 
                          stroke="white" 
                          strokeWidth="0.5" 
                          strokeDasharray="1 1"
                        />
                        <path 
                          d="M40,70 Q60,40 70,60" 
                          fill="none" 
                          stroke="white" 
                          strokeWidth="0.5" 
                          strokeDasharray="1 1"
                        />
                      </svg>
                    </div>
                    
                    {/* Animated planes */}
                    <div className="absolute top-[30%] left-[40%] transform -translate-y-1/2 -translate-x-1/2 text-white animate-pulse-subtle">
                      <Airplane className="h-3 w-3 rotate-45" />
                    </div>
                    <div className="absolute top-[50%] right-[30%] transform -translate-y-1/2 -translate-x-1/2 text-white animate-pulse-subtle" style={{ animationDelay: '1s' }}>
                      <Airplane className="h-3 w-3 -rotate-45" />
                    </div>
                  </div>
                </div>
                
                {!isLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white">
                    <div className="w-12 h-12 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin"></div>
                  </div>
                )}
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent bottom-0 h-24 pointer-events-none"></div>
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
