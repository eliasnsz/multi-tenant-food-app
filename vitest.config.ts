// @ts-ignore
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		globals: true,
		environmentMatchGlobs: [["src/**", "prisma"]],
		include: ["**/*.e2e-{test,spec}.{js,ts}"],
	},
});
