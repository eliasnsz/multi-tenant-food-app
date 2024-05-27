import fastify from "fastify";

export const app = fastify();

app.get("/", () => "Hello, world");

app
	.listen({
		port: 3333,
		host: "0.0.0.0",
	})
	.then(() => console.log("🚀 Server running on 0.0.0.0:3333"));
