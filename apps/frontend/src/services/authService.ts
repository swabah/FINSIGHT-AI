import axios from "axios";
import type {
	LoginRequest,
	RegisterRequest,
	AuthResponse,
	UserProfileResponse,
} from "../types/auth";

const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
	try {
		const response = await axios.post(`${API_BASE_URL}/auth/login`, data, {
			headers: {
				"Content-Type": "application/json",
			},
		});
		return response.data;
	} catch (error: any) {
		const message =
			error.response?.data?.message || "Login failed. Please try again.";

		// If user not found, suggest registration
		if (error.response?.status === 401) {
			throw new Error(
				message + " If you don't have an account, please register first.",
			);
		}

		throw new Error(message);
	}
};

export const register = async (
	data: RegisterRequest,
): Promise<AuthResponse> => {
	try {
		const response = await axios.post(`${API_BASE_URL}/auth/register`, data, {
			headers: {
				"Content-Type": "application/json",
			},
		});
		return response.data;
	} catch (error: any) {
		throw new Error(
			error.response?.data?.message || "Registration failed. Please try again.",
		);
	}
};

export const getUserProfile = async (
	token: string,
): Promise<UserProfileResponse> => {
	try {
		const response = await axios.get(`${API_BASE_URL}/auth/me`, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});
		return response.data;
	} catch (error: any) {
		throw new Error(
			error.response?.data?.message || "Failed to fetch user profile.",
		);
	}
};

export const logout = (): void => {
	localStorage.removeItem("token");
	localStorage.removeItem("user");
};

export const setAuthData = (user: any): void => {
	if (user && user.token) {
		localStorage.setItem("token", user.token);
		localStorage.setItem("user", JSON.stringify(user));
	}
};

export const getAuthData = (): any => {
	try {
		const token = localStorage.getItem("token");
		const user = localStorage.getItem("user");
		if (token && user) {
			return { token, user: JSON.parse(user) };
		}
		return null;
	} catch (error) {
		console.error("Error parsing auth data:", error);
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		return null;
	}
};

export const isAuthenticated = (): boolean => {
	return !!localStorage.getItem("token");
};
