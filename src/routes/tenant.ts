import express from "express";

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

router.post("/", authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
    tenantController.create(req, res, next),
);

router.get("/", (req, res, next) =>
    tenantController.getTenants(req, res, next),
);

router.get("/:id", authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
    tenantController.getTenantByID(req, res, next),
);

router.patch("/:id", (req, res, next) =>
    tenantController.updateTenant(req, res, next),
);

router.delete("/:id", (req, res, next) =>
    tenantController.deleteTenant(req, res, next),
);

export default router;
