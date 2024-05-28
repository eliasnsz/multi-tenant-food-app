import { env } from "@/shared/env";
import fastify from "fastify";

export const app = fastify();

app
	.listen({
		port: env.PORT,
		host: env.HOST,
	})
	.then(() => console.log("🚀 Server running on 0.0.0.0:3333"));
