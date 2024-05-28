import { app } from "@/http/server";
import { prisma } from "@/infra/prisma-client";
import { createAndAuthenticateUser } from "@/infra/tests/utils/create-and-authenticate-user";
import type { Role } from "@prisma/client";
import supertest from "supertest";

beforeAll(async () => {
	await app.ready();
});

describe("Create Restaurant - E2E", async () => {
	const { token: access_token, user } = await createAndAuthenticateUser();

	it("should be able to create a restaurant", async () => {
		const response = await supertest(app.server)
			.post("/restaurants")
			.set("Authorization", `Bearer ${access_token}`)
			.send({
				name: "Some Restaurant",
				subdomain: "some-restaurant",
			});

		const databaseRestaurantsCount = await prisma.restaurant.count();

		expect(response.statusCode).toBe(201);
		expect(response.body).toStrictEqual({
			restaurantId: expect.any(String),
		});
		expect(databaseRestaurantsCount).toStrictEqual(1);
	});

	it("should not be able to create a restaurant if already have one", async () => {
		const response = await supertest(app.server)
			.post("/restaurants")
			.set("Authorization", `Bearer ${access_token}`)
			.send({
				name: "Some Restaurant",
				subdomain: "some-restaurant",
			});

		const databaseRestaurantsCount = await prisma.restaurant.count();

		expect(response.statusCode).toBe(400);
		expect(response.body).toStrictEqual({
			name: "BadRequestError",
			message: "Você só pode ter um restaurante",
			status: 400,
		});
		expect(databaseRestaurantsCount).toStrictEqual(1);
	});

	it("should not be able to create a restaurant if are not authenticated", async () => {
		const response = await supertest(app.server).post("/restaurants").send({
			name: "Some Restaurant",
			subdomain: "some-restaurant",
		});

		const databaseRestaurantsCount = await prisma.restaurant.count();

		expect(response.statusCode).toBe(401);
		expect(response.body).toStrictEqual({
			name: "UnauthenticatedError",
			message: "Você deve estar autenticado para realizar essa ação",
			status: 401,
		});
		expect(databaseRestaurantsCount).toStrictEqual(1);
	});

	it("should not be able to create a restaurant with invalid subdomain", async () => {
		const { token: another_access_token } = await createAndAuthenticateUser();

		const response = await supertest(app.server)
			.post("/restaurants")
			.set("Authorization", `Bearer ${another_access_token}`)
			.send({
				name: "Some Restaurant",
				subdomain: "some restaurant", // must be alphanumeric
			});

		const databaseRestaurantsCount = await prisma.restaurant.count();

		expect(response.statusCode).toBe(400);
		expect(response.body).toStrictEqual({
			name: "ValidationError",
			errors: {
				subdomain: expect.arrayContaining([
					"O subdomínio deve ser conter somente letras, números e hifens",
				]),
			},
			status: 400,
		});
		expect(databaseRestaurantsCount).toStrictEqual(1);
	});

	it("should not be able to create a restaurant without provide a name", async () => {
		const { token: another_access_token } = await createAndAuthenticateUser();

		const response = await supertest(app.server)
			.post("/restaurants")
			.set("Authorization", `Bearer ${another_access_token}`)
			.send({
				name: "",
				subdomain: "another-some-restaurant",
			});

		const databaseRestaurantsCount = await prisma.restaurant.count();

		expect(response.statusCode).toBe(400);
		expect(response.body).toStrictEqual({
			name: "ValidationError",
			errors: {
				name: expect.arrayContaining(["Campo obrigatório"]),
			},
			status: 400,
		});
		expect(databaseRestaurantsCount).toStrictEqual(1);
	});

	test("the user who creates the restaurant must be automatically placed as admin", async () => {
		const { token: another_access_token, user } =
			await createAndAuthenticateUser();

		const response = await supertest(app.server)
			.post("/restaurants")
			.set("Authorization", `Bearer ${another_access_token}`)
			.send({
				name: "Another Restaurant",
				subdomain: "another-restaurant",
			});

		const databaseRestaurantsCount = await prisma.restaurant.count();

		const userOnRestaurant = await prisma.member.findUniqueOrThrow({
			where: {
				userId_restaurantId: {
					userId: user.id,
					restaurantId: response.body.restaurantId,
				},
			},
		});

		expect(response.statusCode).toBe(201);
		expect(databaseRestaurantsCount).toStrictEqual(2);
		expect(userOnRestaurant.role).toBe<Role>("ADMIN");
	});
});

afterAll(async () => {
	await app.close();
});
