import type { Request, Response } from "express";
import mongoose from "mongoose";
import Transaction from "../models/Transaction";

// @desc    Get analytics stats for dashboard
// @route   GET /api/analytics/stats
// @access  Private
export const getAnalyticsStats = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		console.log("📊 Fetching analytics stats...");
		
		if (!req.user || !req.user._id) {
			console.warn("⚠️ No user ID found in request");
			res.status(401).json({
				success: false,
				message: "User context missing",
			});
			return;
		}

		const userId = req.user._id;
		const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

		// Calculate date ranges
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
		const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

		console.log(`🔍 Stats for User: ${userId}, Range: ${startOfMonth.toISOString()} to ${endOfMonth.toISOString()}`);

		// 1. Monthly Stats Aggregation (Current Month)
		const monthlyStats = await Transaction.aggregate([
			{
				$match: {
					user_id: userObjectId,
					date: { $gte: startOfMonth, $lte: endOfMonth },
				},
			},
			{
				$group: {
					_id: "$type",
					total: { $sum: "$amount" },
				},
			},
		]);

		// Process monthly stats
		let income = 0;
		let expenses = 0;
		monthlyStats.forEach((stat) => {
			if (stat._id === "income") income = stat.total;
			else if (stat._id === "expense") expenses = stat.total;
		});

		// 2. Expense by Category Aggregation (Current Month)
		const categoryBreakdown = await Transaction.aggregate([
			{
				$match: {
					user_id: userObjectId,
					type: "expense",
					date: { $gte: startOfMonth, $lte: endOfMonth },
				},
			},
			{
				$lookup: {
					from: "categories",
					localField: "category",
					foreignField: "_id",
					as: "categoryInfo",
				},
			},
			{ $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
			{
				$group: {
					_id: { $ifNull: ["$categoryInfo.name", "Uncategorized"] },
					total: { $sum: "$amount" },
					color: { $first: { $ifNull: ["$categoryInfo.color_code", "#6b7280"] } },
				},
			},
			{ $sort: { total: -1 } },
		]);

		// 3. Monthly Trend Aggregation (Last 6 Months)
		const monthlyTrend = await Transaction.aggregate([
			{
				$match: {
					user_id: userObjectId,
					date: { $gte: sixMonthsAgo },
				},
			},
			{
				$group: {
					_id: {
						year: { $year: "$date" },
						month: { $month: "$date" },
						type: "$type",
					},
					total: { $sum: "$amount" },
				},
			},
			{
				$sort: { "_id.year": 1, "_id.month": 1 },
			},
		]);

		// Process monthly trend into structured format
		const trendMap: Record<string, { income: number; expenses: number }> = {};

		// Initialize trend map for last 6 months
		for (let i = 5; i >= 0; i--) {
			const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
			trendMap[key] = { income: 0, expenses: 0 };
		}

		// Fill in data
		monthlyTrend.forEach((item) => {
			const key = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
			if (trendMap[key]) {
				if (item._id.type === "income") trendMap[key].income = item.total;
				else if (item._id.type === "expense") trendMap[key].expenses = item.total;
			}
		});

		const formattedTrend = Object.keys(trendMap)
			.sort()
			.map((month) => ({
				month,
				income: trendMap[month].income,
				expenses: trendMap[month].expenses,
			}));

		const formattedCategories = categoryBreakdown.map((cat) => ({
			category: cat._id,
			amount: cat.total,
			color: cat.color,
		}));

		console.log("✅ Stats fetched successfully");

		res.status(200).json({
			success: true,
			data: {
				currentMonth: {
					income,
					expenses,
					balance: income - expenses,
				},
				categoryBreakdown: formattedCategories,
				monthlyTrend: formattedTrend,
			},
		});
	} catch (error: any) {
		console.error("❌ Analytics stats error:", error);
		res.status(500).json({
			success: false,
			message: "Critical error in analytics aggregation",
			error: process.env.NODE_ENV === 'development' ? error.message : undefined,
		});
	}
};
