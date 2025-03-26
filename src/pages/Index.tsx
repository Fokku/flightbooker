import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { Globe } from "@/components/home/Globe";
import { SearchFlights } from "@/components/home/SearchFlights";
import { Navbar } from "@/components/layout/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Globe />
        <SearchFlights />
      </main>
      <footer className="bg-gray-50 py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500 text-sm">
            <p>
              © {new Date().getFullYear()} Flight Booker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
