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
					name: z
						.string({ message: "Campo obrigatório" })
						.refine((name) => /^\s*\S+(?:\s+\S+)+\s*$/.test(name), {
							message: "Por favor, insira nome e sobrenome",
						}),
					email: z
						.string({ message: "Campo obrigatório" })
						.email({ message: "Email inválido" }),
					password: z
						.string({ message: "Campo obrigatório" })
						.min(8, { message: "A senha deve conter no mínimo 8 caracteres" }),
				}),
			},
		},
		async (request, reply) => {
			const { name, email, password } = request.body;

			const userWithSameEmail = await prisma.user.findUnique({
				where: { email },
			});

			if (userWithSameEmail) {
				throw new BadRequestError("Já existe um usuário com esse email");
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
