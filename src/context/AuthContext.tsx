import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<boolean | { needsVerification: boolean; email: string }>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  verifyEmail: (email: string, otp: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if session is valid on initial load and after refresh
  useEffect(() => {
    const checkSession = async () => {
      try {
        const result = await authApi.checkSession();

        if (result.status && result.data) {
          setUser(result.data as User);
          setIsAuthenticated(true);
        } else {
          // Clear any stored user data if session is invalid
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Session check error:", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // If session check fails, fall back to localStorage for user data
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Check if user data exists in localStorage as fallback
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (e) {
          console.error("Error parsing user data", e);
          localStorage.removeItem("user");
        }
      }
    }
  }, [isLoading, isAuthenticated]);

  const login = async (username: string, password: string) => {
    try {
      const result = await authApi.login(username, password);

      if (result.status) {
        setUser(result.data as User);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(result.data));
        return true;
      } else if (result.data && result.data.needsVerification) {
        toast.error("Please verify your email address");
        return {
          needsVerification: true,
          email: result.data.email,
        };
      } else {
        toast.error(result.message);
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to connect to the server. Please try again later.");
      return false;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const result = await authApi.register(username, email, password);

      if (result.status) {
        toast.success(result.message);
        return true;
      } else {
        toast.error(result.message);
        return false;
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to connect to the server. Please try again later.");
      return false;
    }
  };

  const verifyEmail = async (email: string, otp: string): Promise<boolean> => {
    try {
      const result = await authApi.verifyEmail(email, otp);

      if (result.status) {
        toast.success("Email verified successfully");
        return true;
      } else {
        toast.error(result.message || "Verification failed");
        return false;
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Failed to connect to the server. Please try again later.");
      return false;
    }
  };

  const logout = async (): Promise<boolean> => {
    try {
      const result = await authApi.logout();

      // Always clear local state regardless of server response
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("user");

      if (result.status) {
        return true;
      } else {
        toast.error(result.message);
        return false;
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(
        "Failed to connect to the server. Your session has been cleared locally."
      );

      // Still clear local state on error
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("user");

      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin: user?.role === "admin",
        login,
        register,
        verifyEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
