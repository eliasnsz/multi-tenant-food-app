import { env } from "@/shared/env";
import fastify from "fastify";
import {
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod";
import { authenticateWithPassword } from "./routes/auth/authenticate-with-password";
import { createAccount } from "./routes/auth/create-account";
import fastifyJwt from "@fastify/jwt";
import { globalErrorHandler } from "./error-handler";

export const app = fastify();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.setErrorHandler(globalErrorHandler);

app.register(fastifyJwt, { secret: env.JWT_SECRET });

app.register(createAccount);
app.register(authenticateWithPassword);

app
	.listen({
		port: env.PORT,
		host: env.HOST,
	})
	.then(() => console.log("🚀 Server running on 0.0.0.0:3333"));
