import axios from "axios";
import type {
	CreateTransactionRequest,
	UpdateTransactionRequest,
	TransactionsResponse,
	TransactionResponse,
	CategoriesResponse,
} from "../types/transaction";

const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const fetchTransactions = async (
	token: string,
): Promise<TransactionsResponse> => {
	try {
		const response = await axios.get(`${API_BASE_URL}/transactions`, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});
		return response.data;
	} catch (error: any) {
		console.error("Fetch transactions error:", error);
		throw new Error(
			error.response?.data?.message || "Failed to fetch transactions.",
		);
	}
};

export const createTransaction = async (
	data: CreateTransactionRequest,
	token: string,
): Promise<TransactionResponse> => {
	try {
		const response = await axios.post(`${API_BASE_URL}/transactions`, data, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});
		return response.data;
	} catch (error: any) {
		console.error("Create transaction error:", error);
		throw new Error(
			error.response?.data?.message || "Failed to create transaction.",
		);
	}
};

export const updateTransaction = async (
	id: string,
	data: UpdateTransactionRequest,
	token: string,
): Promise<TransactionResponse> => {
	try {
		const response = await axios.put(
			`${API_BASE_URL}/transactions/${id}`,
			data,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			},
		);
		return response.data;
	} catch (error: any) {
		console.error("Update transaction error:", error);
		throw new Error(
			error.response?.data?.message || "Failed to update transaction.",
		);
	}
};

export const deleteTransaction = async (
	id: string,
	token: string,
): Promise<void> => {
	try {
		await axios.delete(`${API_BASE_URL}/transactions/${id}`, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});
	} catch (error: any) {
		console.error("Delete transaction error:", error);
		throw new Error(
			error.response?.data?.message || "Failed to delete transaction.",
		);
	}
};

export const fetchCategories = async (
	token: string,
): Promise<CategoriesResponse> => {
	try {
		const response = await axios.get(
			`${API_BASE_URL}/transactions/categories`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			},
		);
		return response.data;
	} catch (error: any) {
		console.error("Fetch categories error:", error);
		throw new Error(
			error.response?.data?.message || "Failed to fetch categories.",
		);
	}
};

export const createCategory = async (
	data: { name: string; color_code?: string },
	token: string,
): Promise<any> => {
	try {
		const response = await axios.post(
			`${API_BASE_URL}/transactions/categories`,
			data,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			},
		);
		return response.data;
	} catch (error: any) {
		throw new Error(
			error.response?.data?.message || "Failed to create category.",
		);
	}
};

export const updateCategory = async (
	id: string,
	data: { name: string; color_code?: string },
	token: string,
): Promise<any> => {
	try {
		const response = await axios.put(
			`${API_BASE_URL}/transactions/categories/${id}`,
			data,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			},
		);
		return response.data;
	} catch (error: any) {
		throw new Error(
			error.response?.data?.message || "Failed to update category.",
		);
	}
};

export const deleteCategory = async (
	id: string,
	token: string,
): Promise<any> => {
	try {
		const response = await axios.delete(
			`${API_BASE_URL}/transactions/categories/${id}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			},
		);
		return response.data;
	} catch (error: any) {
		throw new Error(
			error.response?.data?.message || "Failed to delete category.",
		);
	}
};
