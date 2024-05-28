import fastifyPlugin from "fastify-plugin";
import type { FastifyInstance } from "fastify";

import { UnauthorizedError } from "../routes/_errors/unauthorized";

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
	app.addHook("preHandler", async (request) => {
		request.getCurrentUserId = async () => {
			try {
				const { sub } = await request.jwtVerify<{ sub: string }>();
				return sub;
			} catch (error) {
				throw new UnauthorizedError("Token inválido");
			}
		};
	});
});
