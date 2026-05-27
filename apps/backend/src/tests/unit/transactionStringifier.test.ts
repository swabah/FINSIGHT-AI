/**
 * Unit Tests — transactionStringifier.ts
 *
 * Tests the pure date-formatting logic and the string output format
 * without hitting MongoDB (Transaction.find is mocked).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock mongoose and the Transaction model before importing the module ──────
vi.mock("../../models/Transaction.js", () => ({
	default: {
		find: vi.fn(),
	},
}));
vi.mock("mongoose", () => ({
	default: { Types: { ObjectId: class { constructor(id: string) { return id; } } },
	},
}));

import Transaction from "../../models/Transaction.js";
import { stringifyTransactions } from "../../utils/transactionStringifier.js";

// Helper: build a mock lean transaction
const makeTx = (overrides: Partial<{
	amount: number;
	type: "income" | "expense";
	date: Date;
	description: string;
	category: { name: string };
}> = {}) => ({
	amount: 500,
	type: "expense" as const,
	date: new Date(),
	description: "Coffee",
	category: { name: "Food" },
	...overrides,
});

describe("transactionStringifier — unit", () => {
	beforeEach(() => vi.clearAllMocks());

	// ── formatDate logic via output strings ──────────────────────────────────

	it('formats a transaction dated today with "today"', async () => {
		(Transaction.find as any).mockReturnValue({
			populate: vi.fn().mockReturnThis(),
			sort: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue([makeTx({ date: new Date() })]),
		});

		const result = await stringifyTransactions("user123");
		expect(result[0]).toContain("today");
	});

	it('formats a transaction dated yesterday with "yesterday"', async () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);

		(Transaction.find as any).mockReturnValue({
			populate: vi.fn().mockReturnThis(),
			sort: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue([makeTx({ date: yesterday })]),
		});

		const result = await stringifyTransactions("user123");
		expect(result[0]).toContain("yesterday");
	});

	it("formats a transaction from 4 days ago with '<N> days ago'", async () => {
		const pastDate = new Date();
		pastDate.setDate(pastDate.getDate() - 4);

		(Transaction.find as any).mockReturnValue({
			populate: vi.fn().mockReturnThis(),
			sort: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue([makeTx({ date: pastDate })]),
		});

		const result = await stringifyTransactions("user123");
		expect(result[0]).toContain("4 days ago");
	});

	it("formats an older transaction with absolute locale date", async () => {
		const oldDate = new Date("2024-01-15");

		(Transaction.find as any).mockReturnValue({
			populate: vi.fn().mockReturnThis(),
			sort: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue([makeTx({ date: oldDate })]),
		});

		const result = await stringifyTransactions("user123");
		// Should contain the year or month name as a locale date
		expect(result[0]).toMatch(/January|2024/);
	});

	// ── Output format ────────────────────────────────────────────────────────

	it('outputs "spent" for expense transactions', async () => {
		(Transaction.find as any).mockReturnValue({
			populate: vi.fn().mockReturnThis(),
			sort: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue([
				makeTx({ type: "expense", amount: 250, description: "Lunch", category: { name: "Food" } }),
			]),
		});

		const result = await stringifyTransactions("user123");
		expect(result[0]).toContain("spent ₹250.00");
		expect(result[0]).toContain("Food");
		expect(result[0]).toContain("Lunch");
	});

	it('outputs "received" for income transactions', async () => {
		(Transaction.find as any).mockReturnValue({
			populate: vi.fn().mockReturnThis(),
			sort: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue([
				makeTx({ type: "income", amount: 5000, description: "Salary", category: { name: "Income" } }),
			]),
		});

		const result = await stringifyTransactions("user123");
		expect(result[0]).toContain("received ₹5000.00");
		expect(result[0]).toContain("Income");
		expect(result[0]).toContain("Salary");
	});

	it("formats amount to 2 decimal places", async () => {
		(Transaction.find as any).mockReturnValue({
			populate: vi.fn().mockReturnThis(),
			sort: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue([makeTx({ amount: 99.9 })]),
		});

		const result = await stringifyTransactions("user123");
		expect(result[0]).toContain("₹99.90");
	});

	it('falls back to "Unknown" when category is missing', async () => {
		(Transaction.find as any).mockReturnValue({
			populate: vi.fn().mockReturnThis(),
			sort: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue([
				makeTx({ category: undefined as any }),
			]),
		});

		const result = await stringifyTransactions("user123");
		expect(result[0]).toContain("Unknown");
	});

	// ── Edge cases ───────────────────────────────────────────────────────────

	it("returns empty array when no transactions found", async () => {
		(Transaction.find as any).mockReturnValue({
			populate: vi.fn().mockReturnThis(),
			sort: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue([]),
		});

		const result = await stringifyTransactions("user123");
		expect(result).toEqual([]);
	});

	it("returns empty array on DB error (graceful fallback)", async () => {
		(Transaction.find as any).mockReturnValue({
			populate: vi.fn().mockReturnThis(),
			sort: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			lean: vi.fn().mockRejectedValue(new Error("DB error")),
		});

		const result = await stringifyTransactions("user123");
		expect(result).toEqual([]);
	});

	it("respects custom limit parameter", async () => {
		const limitFn = vi.fn().mockReturnThis();
		(Transaction.find as any).mockReturnValue({
			populate: vi.fn().mockReturnThis(),
			sort: vi.fn().mockReturnThis(),
			limit: limitFn,
			lean: vi.fn().mockResolvedValue([]),
		});

		await stringifyTransactions("user123", 25);
		expect(limitFn).toHaveBeenCalledWith(25);
	});
});
