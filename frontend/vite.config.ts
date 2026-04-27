import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	return {
		plugins: [react(), tailwindcss()],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
		build: {
			sourcemap: false,
			chunkSizeWarningLimit: 600,
			rollupOptions: {
				output: {
					manualChunks: {
						vendor: ["react", "react-dom"],
						router: ["react-router-dom"],
						query: ["@tanstack/react-query"],
						charts: ["chart.js", "react-chartjs-2"],
						markdown: ["react-markdown", "remark-gfm"],
					},
				},
			},
		},
		define: {
			// Expose NODE_ENV so libraries can tree-shake dev-only code
			"process.env.NODE_ENV": JSON.stringify(mode),
		},
	};
});
