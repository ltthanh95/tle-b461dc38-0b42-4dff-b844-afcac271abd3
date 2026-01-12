import { IsEmail, IsNotEmpty, IsString, MinLength, IsUUID } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUUID()
  organizationId!: string;

  @IsUUID()
  roleId!: string;
}