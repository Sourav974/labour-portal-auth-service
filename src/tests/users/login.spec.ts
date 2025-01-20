import request from "supertest";
import app from "../../app";

import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";

describe("POST auth/login", () => {
    let connection: DataSource;

    const registrationUserData = {
        firstName: "Sourav",
        lastName: "Yadav",
        email: " sourav@mern.space ",
        password: "password",
    };

    const userData = {
        email: "sourav@mern.space",
        password: "password",
    };
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    afterEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();

        await request(app).post("/auth/register").send(registrationUserData);
    });

    afterAll(async () => {
        if (connection && typeof connection.destroy === "function") {
            await connection.destroy();
        }
    });

    describe("Given all fields", () => {
        it("should return 200 status code", async () => {
            // Act

            const response = await request(app)
                .post("/auth/login")
                .send(userData);

            // Assert

            expect(response.statusCode).toBe(200);
        });

        it("should return json response", async () => {
            // Act

            const response = await request(app)
                .post("/auth/login")
                .send(userData);

            // Assert

            expect(response.headers["content-type"]).toEqual(
                expect.stringContaining("json"),
            );
        });

        it("should return the user id", async () => {
            // Act

            const response = await request(app)
                .post("/auth/login")
                .send(userData);

            // Assert

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(response.body.id).toBeDefined();
        });
    });
});
