import { useState } from "react";

interface UseFormState {
	[key: string]: any;
}

interface UseFormReturn<T extends UseFormState> {
	formData: T;
	handleChange: (
		field: keyof T,
	) => (e: React.ChangeEvent<HTMLInputElement>) => void;
	setFormData: React.Dispatch<React.SetStateAction<T>>;
	resetForm: () => void;
}

/**
 * Custom hook for form state management
 */
export function useForm<T extends UseFormState>(
	initialState: T,
): UseFormReturn<T> {
	const [formData, setFormData] = useState<T>(initialState);

	const handleChange = (field: keyof T) => {
		return (e: React.ChangeEvent<HTMLInputElement>) => {
			const { value } = e.target;
			setFormData((prev) => ({
				...prev,
				[field]: value,
			}));
		};
	};

	const resetForm = () => {
		setFormData(initialState);
	};

	return {
		formData,
		handleChange,
		setFormData,
		resetForm,
	};
}
