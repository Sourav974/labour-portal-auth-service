jest.setTimeout(20000);
import request from "supertest";
import app from "../../app";

import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";

import { isJwt } from "../utils";

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

    beforeEach(async () => {
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

        it("should return 401 if email does not exist", async () => {
            // Arrange
            const payload = { ...userData, email: "sourav@gmal.com" };

            // Act

            const response = await request(app)
                .post("/auth/login")
                .send(payload);

            expect(response.statusCode).toBe(401);
        });

        it("should return 401 if password is incorrect", async () => {
            // Arrange
            const payload = { ...userData, password: "abc12345567" };

            // Act

            const response = await request(app)
                .post("/auth/login")
                .send(payload);

            // Assert

            expect(response.statusCode).toBe(401);
        });

        it("should return access and refresh token in a cookie", async () => {
            /*
            accessToken=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzIyMzgwMDk4LCJleHAiOjE3MjIzODM2OTgsImlzcyI6ImF1dGgtc2VydmljZSJ9.ge8AggIZ26bJN4GsKxks5CTpSHU6nX7byMVEWDLRKcoCTXiHhkO64sTpTPswRVXTdESTLiqKGr_AfEi5Ma-E5_yHm8ljzUxHj0_rcLVbztHEWns8enqREnGoK_QzwluN0EUuzHs_4y6PY6krrJAjRoUncTO6WmL9zakBHigaThGpXHejRPuRldE3nMRWHeLTcFOtVtUADWdSiZ2cy2FrjnilAKNryBqvguWkByI3ZIwf-PhfTF4ID2ZkJwSi2e2XMIiTskaO_E90ohMoOugkmplVFbHvfSX6SnghmyoU1qlR6PP6e_SaQEj9fXS9qQgA3zeAs87t9sK39ycKx7M8nw; 
            Path=/; Domain=localhost; HttpOnly; 
            Expires=Tue, 30 Jul 2024 23:54:58 GMT;

             [
      'accessToken=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzM3MzcwOTM0LCJleHAiOjE3MzczNzQ1MzQsImlzcyI6ImF1dGgtc2VyaXZjZSJ9.aK6EIgOG2omRENWVZCrQMFLrlQyYxvsSAc0VyXRUIv6Z6dEaJ3o7oippxw47xUFmJGBGV2URb4eU_K99WxBi5kqitADgFsJG10Pejmj7IU_UK3JmiJl_DQKOKEQxsTLgDvVCzDyYjXooMf4LzRgKVDLbW2XnEGylMH3LGDgUOSiDZAHTBEN3eHUJDcroThaVkjdOz4nrF_eYuCHqdmfPqNy0iL3xAWHidSepF7vVbFtg1m8-fVswOt4hSIqfVzQLUpKvY2oC3FwH_cIDB2dZ7Ci6Q14Q9QM-WCoBmn9QlFoYID9CNio2ACU7Cz_lihBceZhzQGS0rdWteGhzlnRkTA; Max-Age=3600; Domain=localhost; Path=/; Expires=Mon, 20 Jan 2025 12:02:14 GMT; HttpOnly; SameSite=Strict',

      'refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6ImN1c3RvbWVyIiwiaWQiOiIyIiwiaWF0IjoxNzM3MzcwOTM0LCJleHAiOjE3Njg5Mjg1MzQsImlzcyI6ImF1dGgtc2Vydml
      jZSIsImp0aSI6IjIifQ.a3UwJ77THavknMfeXNFy55ocsRCcUCfy3FWnaM6O4L8;
       Max-Age=31536000;
        Domain=localhost;
        Path=/; 
        Expires=Tue, 20 Jan 2026 11:02:14 GMT;
         HttpOnly; SameSite=Strict'
    ]
             */

            // Act

            const response = await request(app)
                .post("/auth/login")
                .send(userData);

            const cookies = (response.headers["set-cookie"] || []) as string[];

            // Assert

            let accessToken: string = "";
            let refreshToken: string = "";

            cookies.forEach((cookie) => {
                if (cookie.includes("accessToken")) {
                    accessToken = cookie.split(";")[0].split("=")[1];
                } else if (cookie.includes("refreshToken")) {
                    refreshToken = cookie.split(";")[0].split("=")[1];
                }
            });

            expect(accessToken.length).toBeGreaterThan(0);
            expect(refreshToken.length).toBeGreaterThan(0);
            expect(isJwt(accessToken)).toBe(true);
            expect(isJwt(refreshToken)).toBe(true);
        });
    });
});
