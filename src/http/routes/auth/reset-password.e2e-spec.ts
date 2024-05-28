import { app } from "@/http/server";
import { prisma } from "@/infra/prisma-client";
import supertest from "supertest";

beforeAll(async () => {
	await app.ready();
});

describe("Reset password - E2E", async () => {
	it("should be able to reset the password", async () => {
		const user = {
			name: "John Doe",
			email: "johndoe@example.com",
			password: "12345678",
		};

		await supertest(app.server).post("/users").send(user);
		await supertest(app.server)
			.post("/password/recover")
			.send({ email: user.email });

		const passwordRecoveryToken = await prisma.token.findFirstOrThrow();

		const response = await supertest(app.server)
			.patch(`/password/reset/${passwordRecoveryToken.id}`)
			.send({
				newPassword: "new-password",
			});

		expect(response.statusCode).toBe(204);
		expect(response.body).toStrictEqual({});
	});

	it("should be able to authenticate with new password", async () => {
		const user = {
			name: "John Doe",
			email: "johndoe@example.com",
			password: "new-password",
		};

		const response = await supertest(app.server)
			.post("/sessions/password")
			.send({
				email: user.email,
				password: user.password,
			});

		expect(response.statusCode).toBe(201);
		expect(response.body).toStrictEqual({ token: expect.any(String) });
	});

	it("should not be able to authenticate with old password", async () => {
		const user = {
			name: "John Doe",
			email: "johndoe@example.com",
			password: "12345678",
		};

		const response = await supertest(app.server)
			.post("/sessions/password")
			.send({
				email: user.email,
				password: user.password,
			});

		expect(response.statusCode).toBe(400);
		expect(response.body).toMatchObject({
			message: "Email ou senha incorretos",
		});
	});
});

afterAll(async () => {
	await app.close();
});
