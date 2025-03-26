// API base URL is read from environment variable or uses the proxy configured in vite.config.ts
// When VITE_API_URL is not set (empty string), requests go through the Vite dev server proxy
// This is the preferred setup for local development to avoid CORS issues
const API_URL = import.meta.env.VITE_API_URL || "";

interface ApiResponse<T = unknown> {
  status: boolean;
  message: string;
  data?: T;
}

// Default options for fetch requests
const defaultOptions: RequestInit = {
  credentials: "include", // Important for cookies/sessions
  headers: {
    "Content-Type": "application/json",
  },
};

/**
 * Make a GET request to the API
 */
export async function apiGet<T = unknown>(
  endpoint: string
): Promise<ApiResponse<T>> {
  try {
    console.log(`Making GET request to ${API_URL}${endpoint}`);

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      ...defaultOptions,
    });

    const contentType = response.headers.get("content-type");
    console.log(
      `Response status: ${response.status}, Content-Type: ${contentType}`
    );

    if (!contentType || !contentType.includes("application/json")) {
      console.error("Response is not JSON, attempting to get text content");
      const textContent = await response.text();
      console.error("Non-JSON response received:", textContent);
      return {
        status: false,
        message: "Invalid response from server. Please try again later.",
      };
    }

    try {
      const jsonResponse = await response.json();
      console.log(`API response from ${endpoint}:`, jsonResponse);
      return jsonResponse;
    } catch (jsonError) {
      console.error("JSON parse error:", jsonError);
      return {
        status: false,
        message: "Error parsing server response. Please try again later.",
      };
    }
  } catch (error) {
    console.error("API GET Error:", error);
    return {
      status: false,
      message: "Network error. Please try again later.",
    };
  }
}

/**
 * Make a POST request to the API
 */
export async function apiPost<T = unknown, D = Record<string, unknown>>(
  endpoint: string,
  data: D
): Promise<ApiResponse<T>> {
  try {
    console.log(`Making POST request to ${endpoint} with data:`, data);

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      ...defaultOptions,
      body: JSON.stringify(data),
    });

    const contentType = response.headers.get("content-type");
    console.log(
      `Response status: ${response.status}, Content-Type: ${contentType}`
    );

    if (!contentType || !contentType.includes("application/json")) {
      console.error("Response is not JSON, attempting to get text content");
      const textContent = await response.text();
      console.error("Non-JSON response received:", textContent);
      return {
        status: false,
        message: "Invalid response from server. Please try again later.",
      };
    }

    try {
      const jsonResponse = await response.json();
      console.log(`API response from ${endpoint}:`, jsonResponse);
      return jsonResponse;
    } catch (jsonError) {
      console.error("JSON parse error:", jsonError);
      return {
        status: false,
        message: "Error parsing server response. Please try again later.",
      };
    }
  } catch (error) {
    console.error("API POST Error:", error);
    return {
      status: false,
      message: "Network error. Please try again later.",
    };
  }
}

/**
 * Make a PUT request to the API
 */
export async function apiPut<T = unknown, D = Record<string, unknown>>(
  endpoint: string,
  data: D
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      ...defaultOptions,
      body: JSON.stringify(data),
    });

    return await response.json();
  } catch (error) {
    console.error("API PUT Error:", error);
    return {
      status: false,
      message: "Network error. Please try again later.",
    };
  }
}

/**
 * Make a DELETE request to the API
 */
export async function apiDelete<T = unknown>(
  endpoint: string
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      ...defaultOptions,
    });

    return await response.json();
  } catch (error) {
    console.error("API DELETE Error:", error);
    return {
      status: false,
      message: "Network error. Please try again later.",
    };
  }
}

// Flight search parameters type
export interface FlightSearchParams {
  departure: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  class?: string;
}

// Booking data type
export interface BookingData {
  flightId: number;
  passengers: Array<{
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  }>;
  seatClass: string;
  paymentMethod: string;
  totalPrice: number;
}

// User profile data type
export interface UserProfileData {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
}

// Contact form data type
export interface ContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Specialized API functions for specific endpoints
export const authApi = {
  login: (username: string, password: string) =>
    apiPost("/api/auth/login.php", { username, password }),

  register: (username: string, email: string, password: string) =>
    apiPost("/api/auth/register.php", { username, email, password }),

  // This is a step that sends OTP before registering the account
  sendPreRegistrationOTP: (email: string, username?: string) =>
    apiPost("/api/auth/pre-register.php", { email, username }),

  // This verifies the OTP before registering the account
  verifyPreRegistrationOTP: (email: string, otp: string) =>
    apiPost("/api/auth/verify-pre-registration.php", { email, otp }),

  // This completes the registration with the verified OTP
  registerWithVerification: (
    username: string,
    email: string,
    password: string,
    otp: string
  ) =>
    apiPost("/api/auth/register-with-verification.php", {
      username,
      email,
      password,
      otp,
    }),

  // This resends an OTP for registration verification
  resendRegistrationOTP: (email: string) =>
    apiPost("/api/auth/resend-registration-otp.php", { email }),

  // This verifies email after registration (for existing accounts)
  verifyEmail: (email: string, otp: string) =>
    apiPost("/api/auth/verify-email.php", { email, otp }),

  logout: () => apiPost("/api/auth/logout.php", {}),

  checkSession: () => apiGet("/api/auth/check-session.php"),
};

export const flightsApi = {
  search: (params: FlightSearchParams) =>
    apiPost("/api/flights/search.php", params),
  getById: (id: number) => apiGet(`/api/flights/get.php?id=${id}`),
};

export const bookingsApi = {
  create: (bookingData: BookingData) =>
    apiPost("/api/bookings/create.php", bookingData),
  getUserBookings: () => apiGet("/api/bookings/user.php"),
  getById: (id: number) => apiGet(`/api/bookings/get.php?id=${id}`),
  cancel: (id: number) => apiPost("/api/bookings/cancel.php", { id }),
};

export const userApi = {
  getProfile: () => apiGet("/api/users/profile.php"),
  updateProfile: (data: UserProfileData) =>
    apiPost("/api/users/update.php", data),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiPost("/api/users/change-password.php", { currentPassword, newPassword }),
};

export const contactApi = {
  sendMessage: (data: ContactData) => apiPost("/api/contact/send.php", data),
};

// Development utilities - only use in development environment
export const devUtils = {
  // Get the latest OTP for a given email and type
  getOTP: (
    email: string,
    type: "pre_registration" | "registration" | "password_reset"
  ) =>
    apiGet(
      `/api/auth/dev-get-otp.php?email=${encodeURIComponent(
        email
      )}&type=${type}`
    ),
};

export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
  auth: authApi,
  flights: flightsApi,
  bookings: bookingsApi,
  user: userApi,
  contact: contactApi,
};
