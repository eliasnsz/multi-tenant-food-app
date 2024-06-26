import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { BadRequestError } from "./routes/_errors";
import { UnauthenticatedError } from "./routes/_errors/unauthenticated";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const globalErrorHandler: FastifyErrorHandler = async (
	error,
	request,
	reply,
) => {
	if (error instanceof ZodError) {
		return reply.status(400).send({
			name: "ValidationError",
			errors: error.flatten().fieldErrors,
			status: 400,
		});
	}

	if (error instanceof BadRequestError) {
		return reply.status(400).send({
			name: "BadRequestError",
			message: error.message,
			status: 400,
		});
	}

	if (error instanceof UnauthenticatedError) {
		return reply.status(401).send({
			name: "UnauthenticatedError",
			message: error.message,
			status: 401,
		});
	}

	console.error(error);

	reply
		.status(500)
		.send({ name: "InternalServerError", message: error.message, status: 500 });
};
