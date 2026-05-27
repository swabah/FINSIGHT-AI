export const getMonthlyData = (transactions: any[]) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Get last 6 months
  const now = new Date();
  const labels: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(`${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`);
  }

  const incomeData = [0, 0, 0, 0, 0, 0];
  const expenseData = [0, 0, 0, 0, 0, 0];

  transactions.forEach((t) => {
    const date = new Date(t.date);
    const monthDiff = (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth();
    
    if (monthDiff >= 0 && monthDiff < 6) {
      const index = 5 - monthDiff;
      if (t.type === "income") {
        incomeData[index] += t.amount;
      } else if (t.type === "expense") {
        expenseData[index] += t.amount;
      }
    }
  });

  return { labels, incomeData, expenseData };
};

export const getCategoryData = (transactions: any[], type: "expense" | "income" = "expense") => {
  const categoriesMap: Record<string, { total: number, color: string }> = {};

  transactions.forEach((t) => {
    if (t.type !== type) return;

    const catName = typeof t.category === "object" ? t.category.name : (t.category || "Uncategorized");
    const catColor = typeof t.category === "object" ? t.category.color_code : "#888888";

    if (!categoriesMap[catName]) {
      categoriesMap[catName] = { total: 0, color: catColor };
    }
    categoriesMap[catName].total += t.amount;
  });

  // Sort by total descending
  const sortedCategories = Object.entries(categoriesMap)
    .sort((a, b) => b[1].total - a[1].total);

  return {
    labels: sortedCategories.map((c) => c[0]),
    data: sortedCategories.map((c) => c[1].total),
    colors: sortedCategories.map((c) => c[1].color),
  };
};
