import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  mixin,
} from "@nestjs/common";

export function SelfOrRoleGuard(allowedRoles: string[] | "all") {
  @Injectable()
  class MixinSelfOrRoleGuard implements CanActivate {
    static ALL_ROLES = ["client", "admin", "superadmin"];

    canActivate(context: ExecutionContext): boolean {
      const req = context
        .switchToHttp()
        .getRequest<{ user: any; params: any; body: any }>();
      const user = req.user;
      if (!user) throw new ForbiddenException("User not found");

      const targetId = req.params.id || req.body.id;
      const allowed =
        allowedRoles === "all" ? MixinSelfOrRoleGuard.ALL_ROLES : allowedRoles;

      const isAllowedByRole = allowed.includes(user.role);
      const isSelf = String(user.id) === String(targetId);

      if (!isSelf && !isAllowedByRole) {
        throw new ForbiddenException("Access denied");
      }

      return true;
    }
  }

  return mixin(MixinSelfOrRoleGuard);
}
