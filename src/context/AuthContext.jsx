import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";
import userService from "../services/userService";

// Create the authentication context
const AuthContext = createContext();

// Custom hook to easily use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);

  // Update role-based states when user changes
  useEffect(() => {
    // Debug log the current user state
    // console.log("User state updated:", user);

    if (user) {
      // Handle both direct role property and nested user.user.role structure
      const role = user.role || (user.user && user.user.role);
      // console.log("Detected role:", role);

      setIsAdmin(role === "ADMIN");
      setIsInstructor(role === "INSTRUCTOR");
    } else {
      setIsAdmin(false);
      setIsInstructor(false);
    }
  }, [user]);

  // Set up axios interceptors for handling auth tokens
  useEffect(() => {
    // Set the token in axios headers if it exists
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const { access } = JSON.parse(userData);
        if (access) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }

    // Interceptor for automatically handling 401 responses
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (
          error.response &&
          error.response.status === 401 &&
          isAuthenticated
        ) {
          try {
            const userData = localStorage.getItem("user");
            if (userData) {
              const { refresh } = JSON.parse(userData);
              // Try to refresh the token
              if (refresh) {
                try {
                  const response = await axios.post(
                    `${API_URL}/users/auth/token/refresh/`,
                    { refresh }
                  );

                  if (response.data.access) {
                    // Update access token in localStorage
                    const user = JSON.parse(localStorage.getItem("user"));
                    user.access = response.data.access;
                    localStorage.setItem("user", JSON.stringify(user));

                    // Update Authorization header
                    axios.defaults.headers.common[
                      "Authorization"
                    ] = `Bearer ${response.data.access}`;

                    // Retry the original request
                    const originalRequest = error.config;
                    return axios(originalRequest);
                  }
                } catch (refreshError) {
                  console.error("Token refresh failed:", refreshError);
                  // If refresh fails, log the user out
                  logout();
                  return Promise.reject(refreshError);
                }
              }
            }
          } catch (tokenError) {
            console.error("Error handling token refresh:", tokenError);
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    // Clean up interceptor when component unmounts
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [isAuthenticated]);

  // Load user on initial render if token exists
  useEffect(() => {
    const loadUser = async () => {
      const userData = localStorage.getItem("user");
      if (!userData) {
        setLoading(false);
        return;
      }

      try {
        // Set the token in axios headers
        const parsedUserData = JSON.parse(userData);
        // console.log("Parsed user data from localStorage:", parsedUserData);

        const { access } = parsedUserData;
        if (access) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;
        } else {
          throw new Error("No access token found");
        }

        // Fetch the current user's data
        const currentUserData = await userService.getCurrentUser();
        // console.log("Current user data from API:", currentUserData);

        setUser(currentUserData);
        setIsAuthenticated(true);
        setError(null);
      } catch (err) {
        console.error("Error loading user:", err);
        // If loading the user fails, clear the token and user state
        localStorage.removeItem("user");
        delete axios.defaults.headers.common["Authorization"];
        setUser(null);
        setIsAuthenticated(false);
        setError("Session expired. Please log in again.");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/users/auth/login/`, {
        email,
        password,
      });

      const { access, refresh, user: userData } = response.data;

      // Debug log
      // console.log("Login response user data:", userData);

      // Store the tokens and user data in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          access,
          refresh,
          user: userData,
        })
      );

      // Set the token in axios headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;

      // Update state
      setUser(userData);
      setIsAuthenticated(true);

      return userData;
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Failed to login. Please check your credentials."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}/users/auth/register/`,
        userData
      );

      const { access, refresh, user: registeredUser } = response.data;

      // Store the tokens and user data in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          access,
          refresh,
          user: registeredUser,
        })
      );

      // Set the token in axios headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;

      // Update state
      setUser(registeredUser);
      setIsAuthenticated(true);

      return response.data;
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Registration failed. Please try again."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Remove token from localStorage and axios headers
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];

    // Update state
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user info
  const updateUserInfo = (updatedUser) => {
    setUser(updatedUser);
  };

  // Provide auth context
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        updateUserInfo,
        isAdmin,
        isInstructor,
        debug: { user },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
