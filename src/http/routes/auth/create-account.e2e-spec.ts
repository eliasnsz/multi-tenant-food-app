import { app } from "@/http/server";
import { prisma } from "@/infra/prisma-client";
import { compare } from "bcryptjs";
import supertest from "supertest";

beforeAll(async () => {
	await app.ready();
});

describe("Create Account - E2E", async () => {
	it("should be able to create an account", async () => {
		const response = await supertest(app.server).post("/users").send({
			name: "John Doe",
			email: "johndoe@example.com",
			password: "12345678",
		});

		const databaseUsersCount = await prisma.user.count();

		expect(response.statusCode).toBe(201);
		expect(response.body).toStrictEqual({});
		expect(databaseUsersCount).toStrictEqual(1);
	});

	it("should not be able to create an account with existent email", async () => {
		const response = await supertest(app.server).post("/users").send({
			name: "John Doe",
			email: "johndoe@example.com",
			password: "12345678",
		});

		const databaseUsersCount = await prisma.user.count();

		expect(response.statusCode).toBe(400);
		expect(response.body).toStrictEqual({
			name: "BadRequestError",
			message: "Já existe um usuário com esse email",
			status: 400,
		});
		expect(databaseUsersCount).toStrictEqual(1);
	});

	it("should be able hash password correctly", async () => {
		await supertest(app.server).post("/users").send({
			name: "Another John Doe",
			email: "another-johndoe@example.com",
			password: "12345678",
		});

		const userOnDatabase = await prisma.user.findUnique({
			where: { email: "another-johndoe@example.com" },
		});

		const isHashed = await compare(
			"12345678",
			userOnDatabase?.passwordHash as string,
		);

		expect(isHashed).toBe(true);
	});

	it("should not be able create an account with invalid email", async () => {
		const response = await supertest(app.server).post("/users").send({
			name: "John Doe",
			email: "invalid@example",
			password: "12345678",
		});

		expect(response.statusCode).toBe(400);
		expect(response.body).toStrictEqual({
			name: "ValidationError",
			errors: { email: expect.arrayContaining(["Email inválido"]) },
			status: 400,
		});
	});

	it("should not be able create an account without provide a name", async () => {
		const response = await supertest(app.server).post("/users").send({
			name: "John",
			email: "another-john-doe-2@example.com",
			password: "12345678",
		});

		expect(response.statusCode).toBe(400);
		expect(response.body).toStrictEqual({
			name: "ValidationError",
			errors: {
				name: expect.arrayContaining(["Por favor, insira nome e sobrenome"]),
			},
			status: 400,
		});
	});

	it("should not be able create an account with small password", async () => {
		const response = await supertest(app.server).post("/users").send({
			name: "Another John Doe 2",
			email: "another-john-doe-2@example.com",
			password: "1234567",
		});

		expect(response.statusCode).toBe(400);
		expect(response.body).toStrictEqual({
			name: "ValidationError",
			errors: {
				password: expect.arrayContaining([
					"A senha deve conter no mínimo 8 caracteres",
				]),
			},
			status: 400,
		});
	});
});

afterAll(async () => {
	await app.close();
});
