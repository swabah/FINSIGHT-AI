import Category from "../models/Category.js";

interface CategorySeed {
	name: string;
	type: "income" | "expense";
	color_code: string;
}

// Default categories as per SYNOPSIS.MD requirements
const defaultCategories: CategorySeed[] = [
	// Income Categories
	{ name: "Salary", type: "income", color_code: "#10b981" },
	{ name: "Freelance", type: "income", color_code: "#34d399" },
	{ name: "Investment", type: "income", color_code: "#6ee7b7" },
	{ name: "Gift", type: "income", color_code: "#a7f3d0" },
	{ name: "Other", type: "income", color_code: "#d1fae5" },

	// Expense Categories
	{ name: "Food", type: "expense", color_code: "#ef4444" },
	{ name: "Transport", type: "expense", color_code: "#f97316" },
	{ name: "Shopping", type: "expense", color_code: "#eab308" },
	{ name: "Bills", type: "expense", color_code: "#3b82f6" },
	{ name: "Entertainment", type: "expense", color_code: "#8b5cf6" },
	{ name: "Health", type: "expense", color_code: "#ec4899" },
	{ name: "Education", type: "expense", color_code: "#06b6d4" },
	{ name: "Other", type: "expense", color_code: "#6b7280" },
];

/**
 * Seed default categories into the database
 * Only inserts if categories don't already exist
 */
export const seedCategories = async (): Promise<void> => {
	try {
		const existingCount = await Category.countDocuments({ isDefault: true });

		if (existingCount > 0) {
			console.log(
				`✅ Default categories already exist (${existingCount} found)`,
			);
			return;
		}

		console.log("🌱 Seeding default categories...");

		const operations = defaultCategories.map((cat) => ({
			updateOne: {
				filter: { name: cat.name, type: cat.type },
				update: {
					$setOnInsert: {
						name: cat.name,
						type: cat.type,
						color_code: cat.color_code,
						isDefault: true,
					},
				},
				upsert: true,
			},
		}));

		await Category.bulkWrite(operations);

		console.log(
			`✅ Seeded ${defaultCategories.length} default categories (${defaultCategories.filter((c) => c.type === "income").length} income, ${defaultCategories.filter((c) => c.type === "expense").length} expense)`,
		);
	} catch (error) {
		console.error("❌ Error seeding categories:", error);
	}
};
