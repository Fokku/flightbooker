
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/FadeIn";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative pt-28 lg:pt-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white"></div>
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-br from-blue-50/80 via-sky-100/30 to-transparent"></div>
      </div>
      
      <Container className="relative">
        <div className="max-w-[800px] mx-auto text-center">
          <FadeIn className="space-y-4" delay={100}>
            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-sky-100 text-sky-700">
              Explore the world with ease
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 text-balance">
              <span className="inline-block">Your journey begins with </span>
              <span className="inline-block text-sky-600 relative">
                SkyGlobe
                <svg
                  className="absolute -bottom-1 left-0 w-full h-3 text-sky-200 -z-10"
                  viewBox="0 0 200 9"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                >
                  <path d="M0 8.5C50 3.5 150 3.5 200 8.5C125 8.5 75 8.5 0 8.5Z" />
                </svg>
              </span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto text-balance">
              Discover amazing destinations around the globe with our intuitive booking platform. Experience seamless travel planning and exclusive flight deals.
            </p>
          </FadeIn>

          <FadeIn className="mt-10 flex flex-col sm:flex-row gap-4 justify-center" delay={300}>
            <Link to="/search">
              <Button size="lg" className="rounded-full px-8 py-6 button-bounce shadow-lg shadow-sky-500/20">
                Search Flights
              </Button>
            </Link>
            <Link to="/globe">
              <Button size="lg" variant="outline" className="rounded-full px-8 py-6 button-bounce">
                Explore Destinations
              </Button>
            </Link>
          </FadeIn>

          <FadeIn className="mt-16 relative" delay={500}>
            <div className="relative mx-auto rounded-xl overflow-hidden shadow-2xl max-w-4xl">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 rounded-xl"></div>
              <img
                src="https://images.unsplash.com/photo-1488085061387-422e29b40080?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80"
                alt="Travel destinations"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 glass px-6 py-4 rounded-full flex items-center gap-4 shadow-lg">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium">Trusted by over 10,000 travelers worldwide</span>
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
