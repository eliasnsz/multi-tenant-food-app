import { hash } from "bcryptjs";
import supertest from "supertest";
import { app } from "@/http/server";
import { prisma } from "@/infra/prisma-client";
import { faker } from "@faker-js/faker/locale/pt_BR";

interface Props {
	name?: string;
	email?: string;
}

export async function createAndAuthenticateUser(props?: Props) {
	const user = await prisma.user.create({
		data: {
			email: props?.email ?? faker.internet.email(),
			name: props?.name ?? faker.person.fullName(),
			passwordHash: await hash("12345678", 6),
		},
	});

	const {
		body: { token },
	} = await supertest(app.server).post("/sessions/password").send({
		email: user.email,
		password: "12345678",
	});

	return { user, token };
}
