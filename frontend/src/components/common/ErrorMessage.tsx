import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
	message: string;
	onRetry?: () => void;
	title?: string;
}

/**
 * Reusable error message component with optional retry button
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
	message,
	onRetry,
	title = "Error",
}) => {
	return (
		<div className="flex flex-col items-center justify-center p-8 space-y-4 max-w-lg mx-auto">
			<Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle className="font-bold">{title}</AlertTitle>
				<AlertDescription className="mt-2 text-sm">
					{message}
				</AlertDescription>
			</Alert>
			{onRetry && (
				<Button 
					onClick={onRetry}
					className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
				>
					Retry
				</Button>
			)}
		</div>
	);
};
