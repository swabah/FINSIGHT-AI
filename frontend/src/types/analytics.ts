export interface AnalyticsStats {
	currentMonth: {
		income: number;
		expenses: number;
		balance: number;
	};
	categoryBreakdown: {
		category: string;
		amount: number;
		color: string;
	}[];
	monthlyTrend: {
		month: string;
		income: number;
		expenses: number;
	}[];
}

export interface AnalyticsResponse {
	success: boolean;
	data: AnalyticsStats;
}
