import { prisma } from "@/infra/prisma-client";
import { hash } from "bcryptjs";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { BadRequestError } from "../_errors";

export async function createAccount(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		"/users",
		{
			schema: {
				body: z.object({
					name: z.string(),
					email: z.string().email(),
					password: z.string().min(8),
				}),
			},
		},
		async (request, reply) => {
			const { name, email, password } = request.body;

			const userWithSameEmail = await prisma.user.findUnique({
				where: { email },
			});

			if (userWithSameEmail) {
				throw new BadRequestError("Já existe um usuário com esse email.");
			}

			const hashedPassword = await hash(password, 6);

			await prisma.user.create({
				data: {
					name,
					email,
					passwordHash: hashedPassword,
				},
			});

			return reply.status(201).send();
		},
	);
}
