import { Repository } from "typeorm";
import { ITenant } from "../types";
import { Tenant } from "../entity/Tenant";

export class TenantService {
    constructor(private tenantRepository: Repository<Tenant>) {}

    async create(tenantData: ITenant) {
        return await this.tenantRepository.save(tenantData);
    }

    async getTenants() {
        return await this.tenantRepository.find();
    }

    async getOne(tenantId: number) {
        return await this.tenantRepository.findOne({
            where: {
                id: tenantId,
            },
        });
    }

    async update(tenantId: number, tenantData: ITenant) {
        return await this.tenantRepository.update(tenantId, tenantData);
    }

    async delete(tenantId: number) {
        await this.tenantRepository.delete(tenantId);
    }
}
