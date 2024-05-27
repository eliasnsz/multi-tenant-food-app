import "dotenv/config";
import "dotenv-expand/config";
import z from "zod";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["test", "development", "production"])
		.default("development"),

	HOST: z.string().default("0.0.0.0"),
	PORT: z.coerce.number().default(3333),

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
