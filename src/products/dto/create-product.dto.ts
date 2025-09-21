import { IsString, IsNumber, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProductDto {
  @ApiProperty({ example: "iPhone 15", description: "Product name" })
  @IsString()
  name: string;

  @ApiProperty({
    example: "Latest Apple smartphone with A17 chip",
    description: "Product description",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1299.99, description: "Price of the product" })
  @IsNumber()
  price: number;

  @ApiProperty({
    example: 1,
    description: "ID of the user who owns this product",
  })
  @IsNumber()
  userId: number;

  @ApiProperty({
    example: 2,
    description: "ID of the category this product belongs to",
  })
  @IsNumber()
  categoryId: number;
}
