import request from "supertest";
import app from "../../app";

import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { User } from "../../entity/User";
import { Roles } from "../../constants";
// import { truncateTables } from "../utils";

describe("POST auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // await truncateTables(connection);
        await connection.dropDatabase();
        await connection.synchronize();
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
            // expect(users[0].password).toBe(userData.password);
        });

        it.todo("should return an id of the created user");

        it("should assign a customer role", async () => {
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
            const user = await userRepository.find();

            expect(user[0]).toHaveProperty("role");
            expect(user[0].role).toBe(Roles.CUSTOMER);
        });

        it("should have hashed password", async () => {
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
            const user = await userRepository.find();

            expect(user[0].password).not.toBe(userData.password);
            expect(user[0].password).toHaveLength(60);
            expect(user[0].password).toMatch(/^\$2b\$\d+\$/);
        });

        it("should have unique email", async () => {
            // Arrange

            const userData = {
                firstName: "Sourav",
                lastName: "Yadav",
                email: "sourav.mern.space",
                password: "secret",
            };

            const userRepository = connection.getRepository(User);
            const user = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });

            // Act

            const response = await request(app)
                .post("/auth/register")
                .send(user);
            const users = await userRepository.find();

            // Assert

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });
    });

    describe("Missing Fields", () => {
        it("should return 400 is email is missing", async () => {
            // Arrange

            const userData = {
                firstName: "Sourav",
                lastName: "Yadav",
                email: "",
                password: "secret",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert

            const userRepository = connection.getRepository(User);
            const user = await userRepository.find();

            expect(user).toHaveLength(0);

            expect(response.statusCode).toBe(400);
        });
    });

    describe("Fields are not in proper format", () => {
        it("should trim the email field", async () => {
            const userData = {
                firstName: "Sourav",
                lastName: "Yadav",
                email: " sourav.mern.space ",
                password: "secret",
            };

            // Act

            await request(app).post("/auth/register").send(userData);

            // Assert

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            const user = users[0];

            expect(user.email).toBe("sourav.mern.space");
        });
    });
});
