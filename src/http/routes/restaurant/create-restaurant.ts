import { auth } from "@/http/middlewares/auth";
import { prisma } from "@/infra/prisma-client";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { BadRequestError } from "../_errors";

export async function createRestaurant(app: FastifyInstance) {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(auth)
		.post(
			"/restaurants",
			{
				schema: {
					body: z.object({
						name: z.string(),
						subdomain: z
							.string()
							.max(63)
							.refine(
								(value) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(value),
								{
									message:
										"O subdomínio deve ser conter somente letras, números e hifens",
								},
							),
					}),
					response: {
						201: z.object({
							restaurantId: z.string(),
						}),
					},
				},
			},
			async (request, reply) => {
				const userId = await request.getCurrentUserId();
				const { name, subdomain } = request.body;

				const userAlreadyIsRestaurantOwner = await prisma.member.findFirst({
					where: {
						userId,
						role: "ADMIN",
					},
				});

				if (userAlreadyIsRestaurantOwner) {
					throw new BadRequestError("Você só pode ter um restaurante");
				}

				const anotherRestaurantWithSameSubdomain =
					await prisma.restaurant.findUnique({
						where: { subdomain },
					});

				if (anotherRestaurantWithSameSubdomain) {
					throw new BadRequestError(
						"Já existe um restaurante com esse subdomínio",
					);
				}

				const restaurant = await prisma.restaurant.create({
					data: {
						name,
						subdomain,
						members: {
							create: {
								userId,
								role: "ADMIN",
							},
						},
					},
				});

				return reply.status(201).send({ restaurantId: restaurant.id });
			},
		);
}
