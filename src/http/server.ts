import fastify from "fastify";
import { env } from "../shared/env";

export const app = fastify();

app.get("/", () => "Hello, world");

app
	.listen({
		port: env.PORT,
		host: env.HOST,
	})
	.then(() => console.log("🚀 Server running on 0.0.0.0:3333"));
