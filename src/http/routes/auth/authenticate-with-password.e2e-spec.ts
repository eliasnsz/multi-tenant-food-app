import { app } from "@/http/server";
import supertest from "supertest";

beforeAll(async () => {
	await app.ready();
});

describe("Authenticate with password - E2E", async () => {
	it("should be able to authenticate", async () => {
		const user = {
			name: "John Doe",
			email: "johndoe@example.com",
			password: "12345678",
		};

		await supertest(app.server).post("/users").send(user);

		const response = await supertest(app.server)
			.post("/sessions/password")
			.send({
				email: user.email,
				password: user.password,
			});

		expect(response.statusCode).toBe(201);
		expect(response.body).toStrictEqual({ token: expect.any(String) });
	});

	it("should not be able to authenticate with incorrect email", async () => {
		const user = {
			name: "John Doe",
			email: "incorrect@example.com",
			password: "12345678",
		};

		const response = await supertest(app.server)
			.post("/sessions/password")
			.send({
				email: user.email,
				password: user.password,
			});

		expect(response.statusCode).toBe(400);
		expect(response.body).toStrictEqual({
			name: "BadRequestError",
			message: "Email ou senha incorretos",
			status: 400,
		});
	});

	it("should not be able to authenticate with incorrect password", async () => {
		const user = {
			name: "John Doe",
			email: "johndoe@example.com",
			password: "incorrect-password",
		};

		const response = await supertest(app.server)
			.post("/sessions/password")
			.send({
				email: user.email,
				password: user.password,
			});

		expect(response.statusCode).toBe(400);
		expect(response.body).toStrictEqual({
			name: "BadRequestError",
			message: "Email ou senha incorretos",
			status: 400,
		});
	});
});

afterAll(async () => {
	await app.close();
});
