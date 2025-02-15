import { Request } from "express";

export interface userData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    tenantId?: number;
}

export interface LimitedUserData {
    firstName: string;
    lastName: string;
    role: string;
}

export interface RegisterUserRequest extends Request {
    body: userData;
}

export interface AuthRequest extends Request {
    auth: {
        sub: string;
        role: string;
        id?: string;
    };
}

export interface UserResponseBody {
    id: number;
    role: string;
}

export interface IRefreshTokenPayload {
    id: string;
}

export interface authCookie {
    accessToken: string;
    refreshToken: string;
}

export interface ITenant {
    name: string;
    address: string;
}

export interface CreateTenantRequest extends Request {
    body: ITenant;
}
