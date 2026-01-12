import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  resource!: string;

  @IsString()
  @IsNotEmpty()
  action!: string;

  @IsUUID()
  roleId!: string;
}