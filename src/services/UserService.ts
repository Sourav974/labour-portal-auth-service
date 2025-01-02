import { Repository } from "typeorm";
// import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import { userData } from "../types";
import createHttpError from "http-errors";

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({ firstName, lastName, email, password }: userData) {
        try {
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                password,
            });
        } catch (err) {
            const error = createHttpError(
                500,
                "Failed store data in the database",
            );
            throw error;
        }
    }
}
