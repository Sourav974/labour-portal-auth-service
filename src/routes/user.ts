import express from "express";
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

router.post("/", authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
    userController.create(req, res, next),
);

router.get("/", (req, res, next) => userController.getUsers(req, res, next));

router.get("/:id", (req, res, next) => userController.getOne(req, res, next));

router.patch("/:id", (req, res, next) =>
    userController.updateUser(req, res, next),
);

router.delete(
    "/:id",
    authenticate,
    canAccess([Roles.ADMIN]),
    (req, res, next) => userController.deleteUser(req, res, next),
);

export default router;
