import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { Permission } from '../permission/permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @OneToMany(() => User, user => user.role)
  users!: User[];

  @OneToMany(() => Permission, permission => permission.role)
  permissions!: Permission[];

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}