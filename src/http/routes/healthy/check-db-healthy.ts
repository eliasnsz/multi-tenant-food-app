import { prisma } from "@/infra/prisma-client";
import type { FastifyInstance } from "fastify";
import { env } from "@/shared/env";

export async function checkDbHealthy(app: FastifyInstance) {
	app.get("/api/status", async (request, reply) => {
		const databaseUsage = await prisma.$queryRaw`
            SELECT
                pg_database_size('food-app') / (1024 * 1024) AS capacidade_total_mb,
                sum(pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename))) / (1024 * 1024) AS quantidade_utilizada_mb
            FROM
                pg_tables
            WHERE
                schemaname != 'pg_catalog'
                AND schemaname != 'information_schema';
        `;

		// Extrair os valores do objeto resultante da consulta
		const { capacidade_total_mb, quantidade_utilizada_mb } = databaseUsage[0];

		// Retornar capacidade total e quantidade utilizada em MB
		return {
			database_max_capacity: `${Number(capacidade_total_mb).toFixed(2)}MB`,
			database_use: `${Number(quantidade_utilizada_mb).toFixed(2)}MB`,
		};
	});
}
