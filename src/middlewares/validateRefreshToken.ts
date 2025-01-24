import { expressjwt } from "express-jwt";
import { Config } from "../config";
import { Request } from "express";
import { authCookie, IRefreshTokenPayload } from "../types";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entity/RefreshToken";
import logger from "../config/logger";

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ["HS256"],

    getToken(req: Request) {
        const { refreshToken } = req.cookies as authCookie;

        return refreshToken;
    },

    async isRevoked(req: Request, token) {
        // console.log("token", token);
        try {
            const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
            const refreshToken = await refreshTokenRepo.findOne({
                where: {
                    id: Number((token?.payload as IRefreshTokenPayload).id),
                    user: { id: Number(token?.payload.sub) },
                },
            });

            return refreshToken === null;
        } catch (error) {
            logger.error("Error while getting the refresh token", {
                id: (token?.payload as IRefreshTokenPayload).id,
            });

            return true;
        }
    },
});
