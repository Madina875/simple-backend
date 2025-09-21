import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ApiTags } from "@nestjs/swagger";
import { RoleGuard } from "../common/guards/role.guard";
import { AuthGuard } from "../common/guards/jwt-auth.guard";
import { SelfOrRoleGuard } from "../common/guards/self-role.guard";
import { GetCurrentUserId } from "../common/decorators";

@ApiTags("users")
@Controller("users")
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @UseGuards(AuthGuard, RoleGuard(["admin", "superadmin"]))
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard, RoleGuard(["admin", "superadmin"]))
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard, SelfOrRoleGuard(["admin", "superadmin"]))
  @Get(":id")
  findOne(@Param("id") id: string, @GetCurrentUserId() currentUserId: number) {
    return this.usersService.findOne(+id);
  }

  @UseGuards(AuthGuard, SelfOrRoleGuard(["admin", "superadmin"]))
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetCurrentUserId() currentUserId: number
  ) {
    return this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(AuthGuard, RoleGuard(["admin", "superadmin"]))
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.usersService.remove(+id);
  }

  @UseGuards(AuthGuard)
  @Get("me")
  me(@GetCurrentUserId() userId: number) {
    return this.usersService.findOne(userId);
  }
}
