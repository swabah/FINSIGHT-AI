export interface Transaction {
	_id: string;
	user_id: string;
	amount: number;
	type: "income" | "expense";
	category: {
		_id: string;
		name: string;
		color_code: string;
	};
	date: string;
	description: string;
	formattedAmount: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateTransactionRequest {
	amount: number;
	type: "income" | "expense";
	category: string;
	date: string;
	description: string;
}

export interface UpdateTransactionRequest {
	amount?: number;
	type?: "income" | "expense";
	category?: string;
	date?: string;
	description?: string;
}

export interface TransactionsResponse {
	success: boolean;
	data: Transaction[];
}

export interface TransactionResponse {
	success: boolean;
	data: Transaction;
}

export interface Category {
	_id: string;
	name: string;
	type: "income" | "expense";
	color_code: string;
	icon: string;
}

export interface CategoriesResponse {
	success: boolean;
	data: Category[];
}
