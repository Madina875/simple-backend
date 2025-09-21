import { IsEmail, IsString, IsOptional, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  full_name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ enum: UserRole, default: UserRole.client })
  role: UserRole;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  confirm_password: string;

  @ApiProperty({ default: false, required: false })
  @IsBoolean()
  is_active?: boolean;
}
