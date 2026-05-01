import { useState } from "react";

interface UseAsyncState<T> {
	data: T | null;
	loading: boolean;
	error: string | null;
}

interface UseAsyncReturn<T> extends UseAsyncState<T> {
	setData: (data: T | null) => void;
	setError: (error: string | null) => void;
	execute: (asyncFn: () => Promise<T>) => Promise<void>;
}

/**
 * Custom hook for managing async operation state
 */
export function useAsync<T>(initialData: T | null = null): UseAsyncReturn<T> {
	const [state, setState] = useState<UseAsyncState<T>>({
		data: initialData,
		loading: false,
		error: null,
	});

	const execute = async (asyncFn: () => Promise<T>) => {
		setState((prev) => ({ ...prev, loading: true, error: null }));

		try {
			const data = await asyncFn();
			setState({ data, loading: false, error: null });
		} catch (err: any) {
			const errorMessage = err.message || "An unexpected error occurred";
			setState({ data: null, loading: false, error: errorMessage });
			throw err;
		}
	};

	const setData = (data: T | null) => {
		setState((prev) => ({ ...prev, data }));
	};

	const setError = (error: string | null) => {
		setState((prev) => ({ ...prev, error }));
	};

	return {
		...state,
		setData,
		setError,
		execute,
	};
}
