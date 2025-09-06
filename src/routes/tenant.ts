import express, { RequestHandler } from "express";

import { TenantController } from "../controllers/TenantController";
import { TenantService } from "../services/TenantService";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import logger from "../config/logger";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";

const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.post(
    "/",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req, res, next) =>
        tenantController.create(req, res, next) as unknown as RequestHandler,
);

router.get(
    "/",
    (req, res, next) =>
        tenantController.getTenants(
            req,
            res,
            next,
        ) as unknown as RequestHandler,
);

router.get(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req, res, next) =>
        tenantController.getTenantByID(
            req,
            res,
            next,
        ) as unknown as RequestHandler,
);

router.patch(
    "/:id",
    (req, res, next) =>
        tenantController.updateTenant(
            req,
            res,
            next,
        ) as unknown as RequestHandler,
);

router.delete(
    "/:id",
    (req, res, next) =>
        tenantController.deleteTenant(
            req,
            res,
            next,
        ) as unknown as RequestHandler,
);

export default router;
