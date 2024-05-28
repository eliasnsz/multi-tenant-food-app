import { prisma } from "@/infra/prisma-client";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { UnauthorizedError } from "../_errors";
import { hash } from "bcryptjs";

export async function resetPassword(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		"/password/reset/:tokenId",
		{
			schema: {
				params: z.object({
					tokenId: z.string(),
				}),
				body: z.object({
					newPassword: z.string().min(8),
				}),
				response: {
					204: z.null(),
				},
			},
		},
		async (request, reply) => {
			const [{ newPassword }, { tokenId }] = [request.body, request.params];

			const passwordRecoveryToken = await prisma.token.findUnique({
				where: { id: tokenId },
			});

			if (!passwordRecoveryToken) {
				throw new UnauthorizedError("Token inválido");
			}

			const passwordHash = await hash(newPassword, 6);

			await prisma.$transaction([
				prisma.user.update({
					where: { id: passwordRecoveryToken.userId },
					data: { passwordHash },
				}),
				prisma.token.delete({
					where: { id: passwordRecoveryToken.id },
				}),
			]);

			return reply.status(204).send();
		},
	);
}
