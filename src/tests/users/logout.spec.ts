import createJWKSMock from "mock-jwks";
import request from "supertest";
import { jwtDecode } from "jwt-decode";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import app from "../../app";
import { extractAuthTokensFromCookies } from "../utils";
import { Roles } from "../../constants";
import { UserResponseBody } from "../../types";
import { RefreshToken } from "../../entity/RefreshToken";
import { JwtPayload } from "jsonwebtoken";

describe("POST /auth/logout", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    const endpoint = "/auth/logout";
    const registrationUserData = {
        firstName: "Sourav",
        lastName: "Yadav",
        email: " sourav@mern.space ",
        password: "password",
    };

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5500");
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("All fields provided", () => {
        it("should return 200 status code", async () => {
            const response = await request(app)
                .post("/auth/register")
                .send(registrationUserData);

            const responseBody = response.body as UserResponseBody;

            const responseCookies = (response.headers["set-cookie"] ||
                []) as string[];

            const { refreshToken } =
                extractAuthTokensFromCookies(responseCookies);

            const accessToken = jwks.token({
                sub: String(responseBody.id),
                role: Roles.CUSTOMER,
            });

            const logoutResponse = await request(app)
                .post(endpoint)
                .set("Cookie", [
                    `accessToken=${accessToken};`,
                    `refreshToken=${refreshToken};`,
                ])
                .send();

            expect(logoutResponse.statusCode).toBe(200);
        });

        it("should clear the access and refresh token cookie", async () => {
            const response = await request(app)
                .post("/auth/register")
                .send(registrationUserData);

            const responseBody = response.body as UserResponseBody;

            const responseCookies = (response.headers["set-cookie"] ||
                []) as string[];

            const { refreshToken } =
                extractAuthTokensFromCookies(responseCookies);

            const accessToken = jwks.token({
                sub: String(responseBody.id),
                role: Roles.CUSTOMER,
            });

            const logoutResponse = await request(app)
                .post(endpoint)
                .set("Cookie", [
                    `accessToken=${accessToken};`,
                    `refreshToken=${refreshToken};`,
                ])
                .send();

            const logoutResponseCookies = (logoutResponse.headers[
                "set-cookie"
            ] || []) as string[];

            const {
                accessToken: logoutResponseAccessToken,
                refreshToken: logoutResponseRefreshtoken,
            } = extractAuthTokensFromCookies(logoutResponseCookies);

            expect(logoutResponseAccessToken).toHaveLength(0);
            expect(logoutResponseRefreshtoken).toHaveLength(0);
        });

        it("should delete the refresh token from the database", async () => {
            const response = await request(app)
                .post("/auth/register")
                .send(registrationUserData);

            const responseBody = response.body as UserResponseBody;

            const responseCookies = (response.headers["set-cookie"] ||
                []) as string[];

            const { refreshToken } =
                extractAuthTokensFromCookies(responseCookies);

            const accessToken = jwks.token({
                sub: String(responseBody.id),
                role: Roles.CUSTOMER,
            });

            await request(app)
                .post(endpoint)
                .set("Cookie", [
                    `accessToken=${accessToken};`,
                    `refreshToken=${refreshToken};`,
                ])
                .send();

            const parsedRefreshToken = jwtDecode<JwtPayload>(refreshToken);

            if (!parsedRefreshToken.jti) {
                throw new Error("Refresh token does not have a jti");
            }

            const refreshTokenInDb = await connection
                .getRepository(RefreshToken)
                .findOne({
                    where: {
                        id: Number(parsedRefreshToken.jti),
                    },
                });

            expect(refreshTokenInDb).toBeNull();
        });
    });
});
