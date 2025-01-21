import request from "supertest";
import app from "../../app";

import createJWKSMock from "mock-jwks";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { User } from "../../entity/User";
import { Roles } from "../../constants";

describe("POST auth/self", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    const registrationUserData = {
        firstName: "Sourav",
        lastName: "Yadav",
        email: " sourav@mern.space ",
        password: "password",
    };

    // const userData = {
    //     email: "sourav@mern.space",
    //     password: "password",
    // };
    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5500");
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();

        await request(app).post("/auth/register").send(registrationUserData);
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        if (connection && typeof connection.destroy === "function") {
            await connection.destroy();
        }
    });

    describe("Given all fields", () => {
        it("should return 200 status code", async () => {
            // Act

            const accessToken = jwks.token({
                sub: "1",
                role: Roles.CUSTOMER,
            });

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", `accessToken=${accessToken}`)
                .send();

            // Assert
            expect(response.statusCode).toBe(200);
        });

        it("should return the user data", async () => {
            // Register User
            // Generate Token
            // Add token to cookie
            // Assert
            // Check if user id matches with registered user

            const userRepo = connection.getRepository(User);
            const data = await userRepo.save({
                ...registrationUserData,
                role: Roles.CUSTOMER,
            });

            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });

            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();

            expect((response.body as Record<string, string>).id).toBe(data.id);
        });
    });
});
