
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/animations/FadeIn";
import { Globe, Search, Calendar, User, Ticket } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Interactive Globe",
    description: "Explore destinations visually on our interactive 3D globe. Discover routes and find your next adventure with just a few clicks.",
  },
  {
    icon: Search,
    title: "Smart Search",
    description: "Find the perfect flights with our intelligent search algorithm that considers price, duration, and convenience.",
  },
  {
    icon: Calendar,
    title: "Flexible Dates",
    description: "Our calendar view helps you find the best deals by comparing prices across different dates.",
  },
  {
    icon: User,
    title: "Personalized Experience",
    description: "Get recommendations based on your previous searches and travel history for a tailored booking experience.",
  },
  {
    icon: Ticket,
    title: "Easy Booking Management",
    description: "Manage your bookings, check in online, and receive updates about your upcoming flights all in one place.",
  },
];

export function Features() {
  return (
    <section className="py-20 section-padding overflow-hidden">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeIn>
            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-sky-100 text-sky-700">
              Effortless travel planning
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              Designed for modern travelers
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Our platform combines elegant design with powerful features to make your travel planning experience seamless and enjoyable.
            </p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FadeIn 
              key={index} 
              delay={index * 100} 
              className="group relative"
            >
              <div className="p-6 h-full rounded-2xl border border-gray-200 hover:border-sky-200 glass hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-sky-100 text-sky-600 mb-5 group-hover:bg-sky-600 group-hover:text-white transition-colors duration-300">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
