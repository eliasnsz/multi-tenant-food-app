import { prisma } from "@/infra/prisma-client";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

export async function requestPasswordRecovery(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		"/password/recover",
		{
			schema: {
				body: z.object({
					email: z.string().email(),
				}),
				response: {
					201: z.null(),
				},
			},
		},
		async (request, reply) => {
			const { email } = request.body;

			const userFromEmail = await prisma.user.findUnique({
				where: { email },
			});

			if (!userFromEmail) {
				return reply.status(201).send();
			}

			const token = await prisma.token.create({
				data: {
					type: "PASSWORD_RECOVERY",
					userId: userFromEmail.id,
				},
			});

			// todo: SEND TOKEN TO USER EMAIL

			return reply.status(201).send();
		},
	);
}
