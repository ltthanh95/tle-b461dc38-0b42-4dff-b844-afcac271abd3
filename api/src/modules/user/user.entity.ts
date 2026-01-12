import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Organization } from '../org/org.entity';
import { Task } from '../task/task.entity';
import { Role } from '../role/role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string | undefined;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  name!: string;

  @ManyToOne(() => Organization, org => org.users)
  organization!: Organization;

  @Column()
  organizationId!: string;

  @ManyToOne(() => Role, role => role.users)
  role!: Role;

  @Column()
  roleId!: string;

  @OneToMany(() => Task, task => task.user)
  tasks!: Task[];

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}