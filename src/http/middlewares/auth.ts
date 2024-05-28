import fastifyPlugin from "fastify-plugin";
import type { FastifyInstance } from "fastify";

import { UnauthenticatedError } from "../routes/_errors/unauthenticated";
import { BadRequestError } from "../routes/_errors";

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
	app.addHook("preHandler", async (request) => {
		request.getCurrentUserId = async () => {
			if (!request.headers.authorization) {
				throw new UnauthenticatedError(
					"Você precisa se autenticar para realizar essa ação",
				);
			}

			try {
				const { sub } = await request.jwtVerify<{ sub: string }>();
				return sub;
			} catch (error) {
				throw new BadRequestError("Token inválido");
			}
		};
	});
});
