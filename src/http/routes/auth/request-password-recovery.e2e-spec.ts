import { app } from "@/http/server";
import { prisma } from "@/infra/prisma-client";
import supertest from "supertest";

beforeAll(async () => {
	await app.ready();
});

describe("Request password recovery - E2E", async () => {
	it("should be able to request password recovery", async () => {
		const user = {
			name: "John Doe",
			email: "johndoe@example.com",
			password: "12345678",
		};

		await supertest(app.server).post("/users").send(user);

		const response = await supertest(app.server)
			.post("/password/recover")
			.send({
				email: user.email,
			});

		const recoveryToken = await prisma.token.findFirstOrThrow();

		expect(response.statusCode).toBe(201);
		expect(response.body).toStrictEqual({});
		expect(recoveryToken.type).toEqual("PASSWORD_RECOVERY");
	});

	it("should return success status even if user does not exists", async () => {
		const user = {
			name: "Inexistent User",
			email: "inexistent-email@example.com",
			password: "12345678",
		};

		const response = await supertest(app.server)
			.post("/password/recover")
			.send({
				email: user.email,
			});

		const recoveryTokensCount = await prisma.token.count();

		expect(response.statusCode).toBe(201);
		expect(response.body).toStrictEqual({});
		expect(recoveryTokensCount).toStrictEqual(1);
	});
});

afterAll(async () => {
	await app.close();
});
