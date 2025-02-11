import { NextFunction, Request, Response } from "express";
import { TenantService } from "../services/TenantService";
import { CreateTenantRequest } from "../types";
import { Logger } from "winston";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}

    async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const { name, address } = req.body;

        this.logger.debug("Request for creating a tenant ", req.body);

        try {
            const tenant = await this.tenantService.create({ name, address });

            this.logger.info("Tenant has been created", { id: tenant.id });

            res.status(201).json({ id: tenant.id });
        } catch (error) {
            next(error);
        }
    }

    async getTenants(req: Request, res: Response, next: NextFunction) {
        try {
            const tenants = await this.tenantService.getTenants();

            this.logger.info("All tenant have been fetched");

            res.json(tenants);
        } catch (error) {
            next(error);
        }
    }

    async getTenantByID(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;
        try {
            const tenant = await this.tenantService.getOne(Number(tenantId));

            if (!tenant) {
                next(createHttpError(400, "Tenant does not found"));
            }

            this.logger.info("Tenant has been fetched");

            res.json(tenant);
        } catch (error) {
            next(error);
        }
    }

    async updateTenant(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { name, address } = req.body;
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, "Invalid url name"));
        }

        this.logger.info("Request for updating a tenant", req.body);
        try {
            await this.tenantService.update(Number(tenantId), {
                name,
                address,
            });

            this.logger.info("Tenant has been updated ", { id: tenantId });

            res.json({ id: tenantId });
        } catch (error) {
            next(error);
        }
    }

    async deleteTenant(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, "Invalid url params"));
        }

        this.logger.info("Request for deleting a tenant", req.body);

        try {
            await this.tenantService.delete(Number(tenantId));

            this.logger.info("Tenant has been deleted", {
                id: Number(tenantId),
            });

            res.json({ id: tenantId });
        } catch (error) {
            next(error);
        }
    }
}
