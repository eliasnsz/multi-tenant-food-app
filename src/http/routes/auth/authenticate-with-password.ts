import { prisma } from "@/infra/prisma-client";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { BadRequestError } from "../_errors";
import { compare } from "bcryptjs";

export async function authenticateWithPassword(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().route({
		method: "POST",
		url: "/sessions/password",
		schema: {
			body: z.object({
				email: z.string().email(),
				password: z.string(),
			}),
			response: {
				201: z.object({
					token: z.string(),
				}),
			},
		},
		handler: async (request, reply) => {
			const { email, password } = request.body;

			const userFromEmail = await prisma.user.findUnique({
				where: { email },
			});

			if (!userFromEmail) {
				throw new BadRequestError("Email ou senha incorretos");
			}

			const passwordMatches = await compare(
				password,
				userFromEmail.passwordHash,
			);

			if (!passwordMatches) {
				throw new BadRequestError("Email ou senha incorretos");
			}

			return reply.status(200).send({ token: "token..." });
		},
	});
}
