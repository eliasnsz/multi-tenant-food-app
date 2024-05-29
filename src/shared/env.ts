import dotenv from "dotenv";
import "dotenv-expand/config";
import z from "zod";

if (["development", "test"].includes(process.env.NODE_ENV as string)) {
	dotenv.config({ path: ".env.development" });
} else {
	dotenv.config({ path: ".env" });
}

const envSchema = z.object({
	NODE_ENV: z
		.enum(["test", "development", "production"])
		.default("development"),

	HOST: z.string().default("0.0.0.0"),
	PORT: z.coerce.number().default(3333),

	JWT_SECRET: z.string(),

	POSTGRES_PASSWORD: z.string(),
	POSTGRES_USER: z.string(),
	POSTGRES_HOST: z.string().default("localhost"),
	POSTGRES_DB: z.string(),
	POSTGRES_PORT: z.coerce.number().default(5432),
	DATABASE_URL: z.string().url(),
});

const result = envSchema.safeParse(process.env);

if (result.error) {
	throw new Error(`INVALID ENVIRONMENT VARIABLES: ${result.error.message}`);
}

export const env = result.data;
