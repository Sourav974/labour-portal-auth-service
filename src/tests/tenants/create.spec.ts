import request from "supertest";
import app from "../../app";

import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";

describe("POST /tenants", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        if (connection && typeof connection.destroy === "function") {
            await connection.destroy();
        }
    });

    describe("Given all fields", () => {
        it("should return 201 status code", async () => {
            const tenantData = {
                name: "Tenant name",
                address: "Tenant address",
            };

            const response = await request(app)
                .post("/tenants")
                .send(tenantData);

            expect(response.statusCode).toBe(201);
        });
    });
});
