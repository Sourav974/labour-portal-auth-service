import { NextFunction, Response } from "express";
import { AuthRequest, RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";

import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";

import { TokenService } from "../services/TokenService";
// import { AppDataSource } from "../config/data-source";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService,
    ) {}

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { firstName, lastName, email, password } = req.body;

        // if (!email) {
        //     const err = createHttpError(400, "Email is required!");
        //     next(err);
        //     return;
        // }

        this.logger.debug("New request to a user", {
            firstName,
            lastName,
            email,
            password: "******",
        });

        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });

            this.logger.info("User has been registered", {
                id: user.id,
            });

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            // Generate Access Token
            const accessToken = this.tokenService.generateAccessToken(payload);

            // Persist Refresh Token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            // Generate Refresh Token
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1h
                httpOnly: true,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1h
                httpOnly: true,
            });

            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }

    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { email, password } = req.body;

        // if (!email) {
        //     const err = createHttpError(400, "Email is required!");
        //     next(err);
        //     return;
        // }

        this.logger.debug("New login request to a user", {
            email,
            password: "******",
        });

        try {
            const user = await this.userService.findByEmail(email);

            if (!user) {
                const err = createHttpError(401, "Invalid Email or Password");
                next(err);
                return;
            }

            // Password comparing

            const passwordMatch = await this.credentialService.passwordCompare(
                password,
                user.password,
            );

            if (!passwordMatch) {
                const err = createHttpError(401, "Invalid Email or Password");
                next(err);
                return;
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            // Generate Access Token
            const accessToken = this.tokenService.generateAccessToken(payload);

            // Persist Refresh Token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            // Generate Refresh Token
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1h
                httpOnly: true,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1h
                httpOnly: true,
            });

            this.logger.info("User has been logged in", { id: user.id });

            res.json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }

    async self(req: AuthRequest, res: Response) {
        const user = await this.userService.findById(Number(req.auth.sub));

        return res.json({ ...user, password: undefined });
    }
}
