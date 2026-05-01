import axios from "axios";
import type { AnalyticsResponse } from "../types/analytics";

const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const fetchAnalyticsStats = async (
	token: string,
): Promise<AnalyticsResponse> => {
	try {
		const response = await axios.get(`${API_BASE_URL}/analytics/stats`, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});
		return response.data;
	} catch (error: any) {
		console.error("Fetch analytics error:", error);
		throw new Error(
			error.response?.data?.message || "Failed to fetch analytics data.",
		);
	}
};
