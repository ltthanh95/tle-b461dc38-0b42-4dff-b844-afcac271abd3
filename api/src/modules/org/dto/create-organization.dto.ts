import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}