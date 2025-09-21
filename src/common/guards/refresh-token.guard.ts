import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { JwtPayload } from "../types";
import * as jwt from "jsonwebtoken";

interface RequestWithUser extends Request {
  cookies: { [key: string]: string };
  user?: JwtPayload & { refreshToken?: string };
}

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const refreshToken = request.cookies?.refreshToken;

    if (!refreshToken) {
      throw new ForbiddenException("Refresh token not found");
    }

    try {
      const decoded = jwt.decode(refreshToken) as any;
      const role = decoded?.role;

      const jwtConfigByRole = {
        client: process.env.CLIENT_REFRESH_TOKEN_KEY,
        superadmin: process.env.SUPERADMIN_REFRESH_TOKEN_KEY,
        admin: process.env.ADMIN_REFRESH_TOKEN_KEY,
      };

      const secret = jwtConfigByRole[role];
      if (!secret) {
        throw new ForbiddenException(`JWT config not found for role: ${role}`);
      }

      const verified = jwt.verify(refreshToken, secret) as JwtPayload;

      request.user = { ...verified, refreshToken };

      return true;
    } catch (error) {
      console.error("Refresh token validation error:", error);
      throw new ForbiddenException("Invalid refresh token");
    }
  }
}
