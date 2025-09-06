import express, { RequestHandler } from "express";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import { UserController } from "../controllers/UserController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService, logger);

router.post(
    "/",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req, res, next) =>
        userController.create(req, res, next) as unknown as RequestHandler,
);

router.get(
    "/",
    (req, res, next) =>
        userController.getUsers(req, res, next) as unknown as RequestHandler,
);

router.get(
    "/:id",
    (req, res, next) =>
        userController.getOne(req, res, next) as unknown as RequestHandler,
);

router.patch(
    "/:id",
    (req, res, next) =>
        userController.updateUser(req, res, next) as unknown as RequestHandler,
);

router.delete(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req, res, next) =>
        userController.deleteUser(req, res, next) as unknown as RequestHandler,
);

export default router;
