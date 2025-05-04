import axios from "axios";

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const { access } = JSON.parse(user);
        if (access) {
          config.headers.Authorization = `Bearer ${access}`;
        }
      } catch (error) {
        console.error("Error parsing user from localStorage", error);
      }
    }

    // Check if the request contains FormData and adjust the Content-Type header
    if (config.data instanceof FormData) {
      // Remove the Content-Type header so that the browser can set it automatically
      // with the correct boundary for multipart/form-data
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh and common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh the token yet
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const user = JSON.parse(localStorage.getItem("user"));

        if (user && user.refresh) {
          // Try to refresh the token
          const response = await axios.post(
            `${
              import.meta.env.VITE_API_URL || "http://localhost:8000/api"
            }/users/auth/token/refresh/`,
            { refresh: user.refresh }
          );

          if (response.data.access) {
            // Update access token in localStorage
            user.access = response.data.access;
            localStorage.setItem("user", JSON.stringify(user));

            // Update the Authorization header
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;

            // Retry the original request
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error("Token refresh failed", refreshError);
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // If token refresh failed or other error occurred
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
