import axios from "axios";

const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		console.error("Request error:", error);
		return Promise.reject(error);
	},
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		// Handle specific error codes
		if (error.response) {
			switch (error.response.status) {
				case 401:
					// Unauthorized - clear token and redirect to login
					console.error("Unauthorized access - redirecting to login");
					localStorage.removeItem("token");
					localStorage.removeItem("user");
					window.location.href = "/login";
					break;
				case 403:
					console.error("Forbidden access");
					break;
				case 404:
					console.error("Resource not found");
					break;
				case 500:
					console.error("Server error");
					break;
				default:
					console.error("API Error:", error.response.data);
			}
		} else if (error.request) {
			// Request was made but no response received
			console.error(
				"No response from server. Please check if backend is running.",
			);
		} else {
			// Something else happened
			console.error("Error:", error.message);
		}

		return Promise.reject(error);
	},
);

export default api;
