import { expressjwt, GetVerificationKey } from "express-jwt";
import { Request } from "express";
import jwksClient from "jwks-rsa";
import { Config } from "../config";
import { authCookie } from "../types";

export default expressjwt({
    secret: jwksClient.expressJwtSecret({
        jwksUri: Config.JWKS_URI!,
        cache: true,
        rateLimit: true,
    }) as GetVerificationKey,
    algorithms: ["RS256"],

    getToken(req: Request) {
        const authHeaders = req.headers.authorization;

        if (authHeaders && authHeaders.split(" ")[1] !== "undefined") {
            const token = authHeaders.split(" ")[1];

            if (token) {
                return token;
            }
        }

        const { accessToken } = req.cookies as authCookie;

        return accessToken;
    },
});
