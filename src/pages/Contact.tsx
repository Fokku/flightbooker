
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Phone, Mail, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      toast.success("Your message has been sent! We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    }, 1500);
  };

  // FAQ data
  const faqs = [
    {
      question: "What is the flight booking process?",
      answer: "Our flight booking process involves searching for flights, selecting your preferred option, entering passenger details, and making a secure payment. Once completed, you'll receive a confirmation email with your booking details."
    },
    {
      question: "How can I change or cancel my booking?",
      answer: "You can change or cancel your booking by logging into your account and navigating to the 'My Bookings' section. Please note that cancellation policies may vary depending on the fare type and airline."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept all major credit and debit cards, including Visa, Mastercard, and American Express. In select countries, we also offer alternative payment methods like PayPal and bank transfers."
    },
    {
      question: "Is my personal information safe?",
      answer: "Yes, we take data security seriously. All personal information is encrypted and stored securely in accordance with data protection regulations. We never share your information with third parties without your consent."
    },
  ];

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
            <h1 className="text-2xl font-bold">Contact Us</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FadeIn delay={100}>
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
                <h2 className="text-2xl font-bold mb-6">Get in touch</h2>
                <p className="text-gray-600 mb-8">
                  Have questions or need assistance? Fill out the form below and our team will get back to you as soon as possible.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Your Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      required
                      className="rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      className="rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-gray-700">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Enter subject"
                      required
                      className="rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-gray-700">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Enter your message"
                      required
                      className="rounded-lg min-h-[150px]"
                    />
                  </div>

                  <Button type="submit" className="w-full rounded-lg button-bounce" disabled={loading}>
                    {loading ? (
                      <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </div>
            </FadeIn>

            <div className="space-y-8">
              <FadeIn delay={200}>
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
                  <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-sky-100 p-3 rounded-full text-sky-600">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-gray-600">+1 (555) 123-4567</p>
                        <p className="text-sm text-gray-500">Mon-Fri from 8am to 8pm</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-sky-100 p-3 rounded-full text-sky-600">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-gray-600">support@skyglobe.com</p>
                        <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-sky-100 p-3 rounded-full text-sky-600">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Office</p>
                        <p className="text-gray-600">123 Aviation Way, Suite 400</p>
                        <p className="text-gray-600">San Francisco, CA 94158</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={300}>
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
                  <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                  
                  <div className="space-y-6">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border-b border-gray-100 pb-5 last:border-none">
                        <h3 className="text-lg font-medium mb-2">{faq.question}</h3>
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
};

export default ContactPage;
