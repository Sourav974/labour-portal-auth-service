import request from "supertest";
import app from "../../app";

import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { User } from "../../entity/User";
import { truncateTables } from "../utils";

describe("POST auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await truncateTables(connection);
    });

    afterAll(async () => {
        if (connection && typeof connection.destroy === "function") {
            await connection.destroy();
        }
    });

    describe("Given all Filelds", () => {
        it("should return 201 status code", async () => {
            // AAA

            // Arrange

            const userData = {
                firstName: "Sourav",
                lastName: "Yadav",
                email: "sourav.mern.space",
                password: "secret",
            };

            // Act

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert

            expect(response.statusCode).toBe(201);
        });

        it("should return json response", async () => {
            // Arrange

            const userData = {
                firstName: "Sourav",
                lastName: "Yadav",
                email: "sourav.mern.space",
                password: "secret",
            };

            // Act

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert

            expect(response.headers["content-type"]).toEqual(
                expect.stringContaining("json"),
            );
        });

        it("should persist the user in the database", async () => {
            // Arrange

            const userData = {
                firstName: "Sourav",
                lastName: "Yadav",
                email: "sourav.mern.space",
                password: "secret",
            };

            // Act

            await request(app).post("/auth/register").send(userData);

            // Assert

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
            expect(users[0].password).toBe(userData.password);
        });
    });

    describe("Missing Fields", () => {});
});
