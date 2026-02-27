import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Inject the token automatically

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle global errors (e.g., 401 Unauthorized)
// client.js
client.interceptors.response.use(
  (response) => response, 
  (error) => {
    // Check if the request was specifically for login
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem("token");
      // Only redirect if we aren't already trying to log in
      window.location.href = "/login";
    }
    return Promise.reject(error); 
  }
);

export default client;