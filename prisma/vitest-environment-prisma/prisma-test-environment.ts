import "dotenv/config";
import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import type { Environment } from "vitest";
import { env } from "@/shared/env";

export const prisma = new PrismaClient({
	datasources: { db: { url: env.DATABASE_URL } },
});

function generateDatabaseURL(schema: string) {
	const url = new URL(env.DATABASE_URL);

	url.searchParams.set("schema", schema);

	return url.toString();
}

export default (<Environment>{
	name: "prisma",
	transformMode: "web",
	setup() {
		const schema = randomUUID();
		const databaseURL = generateDatabaseURL(schema);

		process.env.DATABASE_URL = databaseURL;

		execSync("npx prisma migrate deploy");

		return {
			async teardown() {
				await prisma.$executeRawUnsafe(
					`DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
				);
				await prisma.$disconnect();
			},
		};
	},
});
