import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/UserService";

import { validationResult } from "express-validator";
import { Logger } from "winston";
import createHttpError from "http-errors";

export class UserController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}

    async create(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return res.json({ errors: result.array() });
        }

        const { firstName, lastName, email, password, tenantId, role } =
            req.body;

        this.logger.info("Requesting to create a user", req.body);

        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role,
                tenantId,
            });

            this.logger.info("User has been created!", { id: user.id });

            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
        }
    }

    async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.userService.getAll();

            res.json(users);
        } catch (error) {
            next(error);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;

        if (isNaN(Number(userId))) {
            next(createHttpError(400, "Invalid url params"));
        }

        this.logger.info("Requesting to getting a user By ID");

        try {
            const user = await this.userService.findById(Number(userId));

            if (!user) {
                next(createHttpError(404, "User not found"));
            }

            this.logger.info("User is found", { id: user?.id });

            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);

        if (!result.isEmpty()) {
            res.json({ errors: result.array() });
        }

        const { firstName, lastName, role } = req.body;
        const userId = req.params.id;

        if (isNaN(Number(userId))) {
            next(createHttpError(400, "Invalid url Params"));
        }

        this.logger.info("Requesting to update a user!", req.body);

        try {
            await this.userService.update(Number(userId), {
                firstName,
                lastName,
                role,
            });

            this.logger.info("User has been updated!", { id: userId });

            res.json({ id: userId });
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;

        if (isNaN(Number(userId))) {
            next(createHttpError(400, "Invalid url params"));
        }

        this.logger.info("Requesting to delete a user By ID");

        try {
            await this.userService.delete(Number(userId));

            this.logger.info("User has been deleted!", { id: userId });

            res.json({ id: userId });
        } catch (error) {
            next(error);
        }
    }
}
