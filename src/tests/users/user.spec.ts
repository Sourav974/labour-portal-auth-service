import request from "supertest";
import app from "../../app";

import createJWKSMock from "mock-jwks";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { User } from "../../entity/User";
import { Roles } from "../../constants";
import { UserResponseBody } from "../../types";
import { extractAuthTokensFromCookies, isJwt } from "../utils";

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

        // await request(app).post("/auth/register").send(registrationUserData);
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

        it("should not return the password", async () => {
            //regitser the user
            // generate the token
            // set cookie
            // assert
            // check password should not included

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
                .set("Cookie", `accessToken=${accessToken}`)
                .send();

            expect(response.body).not.toHaveProperty("password");
        });

        it("should return 401 status code when token does not exists", async () => {
            const userRepo = connection.getRepository(User);
            await userRepo.save({
                ...registrationUserData,
                role: Roles.CUSTOMER,
            });

            const repsonse = await request(app).get("/auth/self").send();

            expect(repsonse.statusCode).toBe(401);
        });

        it("should send new access token when refresh token is provided", async () => {
            // getting the refresh token from the cookie
            // then check that refresh token in the DB
            // then verify the signature of refresh token
            // if everything alright then return the refresh token

            const response = await request(app)
                .post("/auth/register")
                .send(registrationUserData);

            const responseBody = response.body as UserResponseBody;

            const userRepo = connection.getRepository(User);
            const user = await userRepo.findOne({
                where: {
                    id: responseBody.id,
                },
            });

            if (!user) {
                throw new Error("User not found");
            }

            const cookie = (response.headers["set-cookie"] || []) as string[];

            const { refreshToken } = extractAuthTokensFromCookies(cookie);

            const accessToken = jwks.token({
                sub: String(responseBody.id),
                role: user.role,
            });

            const refreshResponse = await request(app)
                .post("/auth/refresh")
                .set("Cookie", [`refreshToken=${refreshToken}`])
                .send();

            const cookies = (refreshResponse.headers["set-cookie"] ||
                []) as string[];

            const { accessToken: newAccessToken } =
                extractAuthTokensFromCookies(cookies);

            expect(accessToken.length).toBeGreaterThan(0);
            expect(accessToken).not.toBe(newAccessToken);
            expect(isJwt(accessToken)).toBe(true);
        });
    });
});
