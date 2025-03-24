
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Search Flights" },
    { href: "/bookings", label: "Bookings" },
    { href: "/contact", label: "Contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        scrolled
          ? "bg-white/80 backdrop-blur-lg border-b border-gray-200/50 py-4"
          : "bg-transparent py-6"
      )}
    >
      <Container>
        <nav className="flex items-center justify-between">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-sky-600",
                  location.pathname === link.href
                    ? "text-sky-600"
                    : "text-gray-700"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login">
              <Button variant="outline" size="sm" className="rounded-full px-4">
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </nav>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden fixed inset-x-0 top-[65px] bg-white/95 backdrop-blur-lg transition-all duration-300 ease-in-out border-b border-gray-200/50 overflow-hidden",
            isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="flex flex-col py-4 px-4 space-y-4">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "py-2 text-sm font-medium hover:text-sky-600",
                  location.pathname === link.href
                    ? "text-sky-600"
                    : "text-gray-700"
                )}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/login">
              <Button variant="outline" size="sm" className="w-full mt-4">
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}
