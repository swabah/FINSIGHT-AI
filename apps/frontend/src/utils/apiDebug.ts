/**
 * API Debug Utility
 * Use this to test all API endpoints
 * Run in browser console: import('./src/utils/apiDebug.ts')
 */

const API_BASE_URL = "http://localhost:5000/api";

interface TestResult {
	endpoint: string;
	method: string;
	status: "success" | "error";
	message: string;
	data?: any;
}

class APIDebugger {
	private token: string | null = null;
	private results: TestResult[] = [];

	setToken(token: string) {
		this.token = token;
		console.log("✅ Token set:", token.substring(0, 20) + "...");
	}

	getAuthHeaders() {
		return {
			"Content-Type": "application/json",
			...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
		};
	}

	async test(
		endpoint: string,
		method: string = "GET",
		data?: any,
	): Promise<TestResult> {
		const url = `${API_BASE_URL}${endpoint}`;
		console.log(`\n🧪 Testing: ${method} ${endpoint}`);

		try {
			const response = await fetch(url, {
				method,
				headers: this.getAuthHeaders(),
				...(data ? { body: JSON.stringify(data) } : {}),
			});

			const result = await response.json();

			const testResult: TestResult = {
				endpoint,
				method,
				status: response.ok ? "success" : "error",
				message: result.message || `Status: ${response.status}`,
				data: result,
			};

			this.results.push(testResult);

			if (response.ok) {
				console.log(`✅ Success:`, result);
			} else {
				console.log(`❌ Error:`, result);
			}

			return testResult;
		} catch (error: any) {
			const testResult: TestResult = {
				endpoint,
				method,
				status: "error",
				message: error.message || "Network error",
			};

			this.results.push(testResult);
			console.error(`❌ Network Error:`, error.message);

			return testResult;
		}
	}

	async testAll() {
		console.log("🚀 Starting API Debug Tests...\n");
		this.results = [];

		// Test 1: Health Check
		await this.test("/health");

		// Test 2: Register (if no token)
		if (!this.token) {
			console.log("\n📝 Testing Registration...");
			await this.test("/auth/register", "POST", {
				username: `testuser_${Date.now()}`,
				email: `test${Date.now()}@example.com`,
				password: "password123",
			});
		}

		// Test 3: Login
		console.log("\n🔐 Testing Login...");
		const loginResult = await this.test("/auth/login", "POST", {
			email: "test@example.com",
			password: "password123",
		});

		// If login successful, extract token
		if (loginResult.status === "success" && loginResult.data?.data?.token) {
			this.setToken(loginResult.data.data.token);

			// Test 4: Get User Profile
			console.log("\n👤 Testing Get Profile...");
			await this.test("/auth/me");

			// Test 5: Get Categories
			console.log("\n📂 Testing Get Categories...");
			await this.test("/transactions/categories");

			// Test 6: Get Transactions
			console.log("\n💰 Testing Get Transactions...");
			await this.test("/transactions");

			// Test 7: Create Transaction
			console.log("\n➕ Testing Create Transaction...");
			await this.test("/transactions", "POST", {
				type: "expense",
				amount: 50.0,
				description: "Test transaction",
				category: "food",
				date: new Date().toISOString().split("T")[0],
			});

			// Test 8: Get Analytics
			console.log("\n📊 Testing Get Analytics...");
			await this.test("/analytics/stats");

			// Test 9: Chat
			console.log("\n💬 Testing Chat...");
			await this.test("/chat", "POST", {
				query: "What is my total spending?",
			});

			// Test 10: Chat History
			console.log("\n📜 Testing Chat History...");
			await this.test("/chat/history");
		}

		// Print summary
		this.printSummary();
	}

	printSummary() {
		console.log("\n" + "=".repeat(60));
		console.log("📊 API TEST SUMMARY");
		console.log("=".repeat(60));

		const successCount = this.results.filter(
			(r) => r.status === "success",
		).length;
		const errorCount = this.results.filter((r) => r.status === "error").length;

		console.log(`\n✅ Success: ${successCount}`);
		console.log(`❌ Errors: ${errorCount}`);
		console.log(`📝 Total: ${this.results.length}`);

		console.log("\n" + "-".repeat(60));
		this.results.forEach((result, index) => {
			const icon = result.status === "success" ? "✅" : "❌";
			console.log(`${index + 1}. ${icon} ${result.method} ${result.endpoint}`);
			console.log(`   ${result.message}`);
		});
		console.log("-".repeat(60));
	}
}

// Create global instance
const apiDebugger = new APIDebugger();

// Make it available in browser console
(window as any).apiDebug = apiDebugger;

console.log("🔧 API Debugger loaded!");
console.log("Usage:");
console.log("  apiDebugger.testAll()                    - Test all endpoints");
console.log("  apiDebugger.setToken('your-token')       - Set auth token");
console.log(
	"  apiDebugger.test('/endpoint', 'GET')    - Test specific endpoint",
);
console.log("\nExample:");
console.log("  await apiDebugger.testAll()");

export default apiDebugger;
