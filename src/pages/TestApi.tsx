import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { bookingsApi, authApi } from "@/lib/api";

interface ApiResponse {
  status: boolean;
  message: string;
  data?: unknown;
}

export default function TestApi() {
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testUserBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await bookingsApi.getUserBookings();
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const testSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.checkSession();
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Container className="pt-24 pb-16">
        <h1 className="text-3xl font-bold mb-8">API Test Page</h1>

        <div className="space-y-4">
          <div className="flex space-x-4">
            <Button onClick={testUserBookings} disabled={loading}>
              Test User Bookings API
            </Button>
            <Button onClick={testSession} disabled={loading}>
              Test Session API
            </Button>
          </div>

          {loading && <div className="animate-pulse">Loading...</div>}

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">
              Error: {error}
            </div>
          )}

          {response && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Response:</h2>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
