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
client.interceptors.response.use(
  (response) => response, // Remove .data here to keep consistency, OR keep it if you prefer
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    // Return the FULL error object so components can access error.response.data
    return Promise.reject(error); 
  }
);

export default client;