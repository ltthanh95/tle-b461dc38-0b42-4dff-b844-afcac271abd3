import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Role } from '../role/role.entity';


@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  resource!: string;

  @Column()
  action!: string; 

  @ManyToOne(() => Role, role => role.permissions)
  role!: Role;

  @Column()
  roleId!: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}