import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, AlertCircle, Code } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { authApi, devUtils } from "@/lib/api";

interface RegistrationData {
  username: string;
  email: string;
  password: string;
}

const verifyRegistrationSchema = z.object({
  otp: z
    .string()
    .min(6, { message: "OTP must be 6 digits" })
    .max(6, { message: "OTP must be 6 digits" })
    .regex(/^\d+$/, { message: "OTP must contain only numbers" }),
});

type VerifyRegistrationFormValues = z.infer<typeof verifyRegistrationSchema>;

export default function VerifyRegistration() {
  const [isLoading, setIsLoading] = useState(false);
  const [registrationData, setRegistrationData] =
    useState<RegistrationData | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm<VerifyRegistrationFormValues>({
    resolver: zodResolver(verifyRegistrationSchema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    // Check if registration data was provided in state
    const data = location.state?.registrationData as RegistrationData;
    if (data && data.email && data.username && data.password) {
      setRegistrationData(data);
    } else {
      // If no registration data was provided, redirect to register
      navigate("/register");
      toast.error("Please complete the registration form first");
    }
  }, [location.state, navigate]);

  async function onSubmit(data: VerifyRegistrationFormValues) {
    if (!registrationData) {
      toast.error("Registration data not found. Please try again.");
      navigate("/register");
      return;
    }

    setIsLoading(true);

    try {
      // First verify the OTP
      const verifyResult = await authApi.verifyPreRegistrationOTP(
        registrationData.email,
        data.otp
      );

      if (verifyResult.status) {
        // If OTP verification is successful, complete the registration
        const registerResult = await authApi.registerWithVerification(
          registrationData.username,
          registrationData.email,
          registrationData.password,
          data.otp
        );

        if (registerResult.status) {
          toast.success("Registration successful! You can now log in.");
          navigate("/login");
        } else {
          toast.error(registerResult.message || "Registration failed");
        }
      } else {
        toast.error(verifyResult.message || "Invalid verification code");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function resendOTP() {
    if (!registrationData) {
      toast.error("Registration data not found. Please try again.");
      navigate("/register");
      return;
    }

    setIsLoading(true);

    try {
      const result = await authApi.resendRegistrationOTP(
        registrationData.email
      );

      if (result.status) {
        toast.success("Verification code resent to your email");
      } else {
        toast.error(result.message || "Failed to resend verification code");
      }
    } catch (error) {
      console.error("Resend error:", error);
      toast.error("Failed to resend verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function fillOtpFromDev() {
    if (!registrationData) {
      toast.error("Registration data not found. Please try again.");
      return;
    }

    try {
      setIsLoading(true);
      const result = await devUtils.getOTP(
        registrationData.email,
        "pre_registration"
      );

      if (result.status && result.data) {
        // Add proper type casting
        const otpData = result.data as { otp: string };
        if (otpData.otp) {
          form.setValue("otp", otpData.otp);
          toast.success("OTP filled for development testing");
        } else {
          toast.error("OTP data is missing");
        }
      } else {
        toast.error(result.message || "Failed to retrieve OTP");
      }
    } catch (error) {
      console.error("Dev OTP error:", error);
      toast.error("Failed to retrieve OTP for development");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Container className="max-w-md w-full">
          <Card className="shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl text-center">
                Verify Your Email
              </CardTitle>
              <CardDescription className="text-center">
                {registrationData && (
                  <>
                    Please enter the verification code sent to{" "}
                    {registrationData.email}
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>One Step Away!</AlertTitle>
                <AlertDescription>
                  We've sent a 6-digit code to your email address. Enter it
                  below to complete your registration.
                </AlertDescription>
              </Alert>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter 6-digit code"
                            {...field}
                            maxLength={6}
                          />
                        </FormControl>
                        <FormDescription>
                          Check your inbox or spam folder for the verification
                          code
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Complete Registration"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col items-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={resendOTP}
                disabled={isLoading}
              >
                <Mail className="h-4 w-4 mr-2" />
                Resend Code
              </Button>
              <div className="mt-4">
                {process.env.NODE_ENV === "development" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fillOtpFromDev}
                    disabled={isLoading}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Dev: Get OTP
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
