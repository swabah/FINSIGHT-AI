/// <reference types="vitest" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	return {
		plugins: [
			react(),
			tailwindcss(),
			VitePWA({
				registerType: "autoUpdate",
				includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
				manifest: {
					name: "Finsight AI",
					short_name: "Finsight",
					description: "Finsight AI - AI Financial Assistant",
					theme_color: "#ffffff",
					icons: [
						{
							src: "pwa-192x192.png",
							sizes: "192x192",
							type: "image/png"
						},
						{
							src: "pwa-512x512.png",
							sizes: "512x512",
							type: "image/png"
						},
						{
							src: "pwa-512x512.png",
							sizes: "512x512",
							type: "image/png",
							purpose: "any maskable"
						}
					]
				}
			})
		],
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
					manualChunks(id) {
						if (id.includes("node_modules")) {
							if (
								id.includes("/react-markdown/") ||
								id.includes("/remark-gfm/") ||
								id.includes("/remark-") ||
								id.includes("/rehype-") ||
								id.includes("/unified/") ||
								id.includes("/mdast") ||
								id.includes("/hast") ||
								id.includes("/micromark") ||
								id.includes("/vfile")
							) {
								return "markdown";
							}
							if (
								id.includes("/chart.js/") ||
								id.includes("/react-chartjs-2/")
							) {
								return "charts";
							}
							if (id.includes("/@tanstack/react-query/")) {
								return "query";
							}
							if (id.includes("/react-router") || id.includes("/react-router-dom/")) {
								return "router";
							}
							if (
								id.includes("/react/") ||
								id.includes("/react-dom/") ||
								id.includes("/scheduler/")
							) {
								return "vendor";
							}
						}
					},
				},
			},
		},
		define: {
			// Expose NODE_ENV so libraries can tree-shake dev-only code
			"process.env.NODE_ENV": JSON.stringify(mode),
		},
		test: {
			globals: true,
			environment: "jsdom",
			setupFiles: "./src/setupTests.ts",
			css: true,
		},
	};
});
