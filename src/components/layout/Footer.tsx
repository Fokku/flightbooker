
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plane, Twitter, Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200/80">
      <Container>
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1 - About */}
          <div className="space-y-4">
            <Logo />
            <p className="text-gray-600 text-sm">
              Your trusted partner for booking flights worldwide. We provide seamless booking experiences with the best prices.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-sky-600">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-sky-600">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-sky-600">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-sky-600 text-sm">Home</Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-600 hover:text-sky-600 text-sm">Search Flights</Link>
              </li>
              <li>
                <Link to="/globe" className="text-gray-600 hover:text-sky-600 text-sm">Destinations</Link>
              </li>
              <li>
                <Link to="/bookings" className="text-gray-600 hover:text-sky-600 text-sm">My Bookings</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-sky-600 text-sm">Contact Us</Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3 - Contact */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Contact Information</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-sky-600 mr-2 mt-0.5" />
                <span className="text-gray-600 text-sm">123 Airport Road, City, Country</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 text-sky-600 mr-2 mt-0.5" />
                <span className="text-gray-600 text-sm">+1 (234) 567-8900</span>
              </li>
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-sky-600 mr-2 mt-0.5" />
                <span className="text-gray-600 text-sm">info@skyglobe.com</span>
              </li>
            </ul>
          </div>
          
          {/* Column 4 - Newsletter */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Newsletter</h3>
            <p className="text-gray-600 text-sm mb-4">Subscribe to get special offers and travel updates.</p>
            <div className="flex space-x-2">
              <Input type="email" placeholder="Your email" className="max-w-[200px]" />
              <Button size="sm">
                <Plane className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="py-6 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} SkyGlobe. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
