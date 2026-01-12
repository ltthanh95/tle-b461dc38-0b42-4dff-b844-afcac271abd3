import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsArray()
  permissions?: Array<{
    resource: string;
    action: string;
  }>;
}