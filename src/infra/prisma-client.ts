import { env } from "@/shared/env";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
	datasources: { db: { url: env.DATABASE_URL } },
});
