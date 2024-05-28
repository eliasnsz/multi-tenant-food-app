import { prisma } from "@/infra/prisma-client";
import { compare } from "bcryptjs";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { BadRequestError } from "../_errors";

export async function authenticateWithPassword(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		"/sessions/password",
		{
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
		},
		async (request, reply) => {
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

			const token = await reply.jwtSign(
				{
					sub: userFromEmail.id,
				},
				{
					sign: {
						expiresIn: "7d",
					},
				},
			);

			return reply.status(200).send({ token });
		},
	);
}
