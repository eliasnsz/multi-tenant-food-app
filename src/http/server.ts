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
import { requestPasswordRecovery } from "./routes/auth/request-password-recovery";
import { resetPassword } from "./routes/auth/reset-password";
import { createRestaurant } from "./routes/restaurant/create-restaurant";
import { checkDbHealthy } from "./routes/healthy/check-db-healthy";

export const app = fastify();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.setErrorHandler(globalErrorHandler);

app.register(fastifyJwt, { secret: env.JWT_SECRET });

app.register(checkDbHealthy);

app.register(createAccount);
app.register(authenticateWithPassword);
app.register(requestPasswordRecovery);
app.register(resetPassword);

app.register(createRestaurant);

app
	.listen({
		port: env.PORT,
		host: env.HOST,
	})
	.then(
		() =>
			env.NODE_ENV !== "test" &&
			console.log(`🚀 Server running on ${env.HOST}:${env.PORT}`),
	);
