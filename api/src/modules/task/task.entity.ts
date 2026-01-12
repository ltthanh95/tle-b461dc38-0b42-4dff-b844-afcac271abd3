import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { Organization } from '../org/org.entity';


@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ default: 'pending' })
  status!: string;

  @Column({ nullable: true })
  category!: string;

  @ManyToOne(() => User, user => user.tasks)
  user!: User;

  @Column()
  userId!: string;

  @ManyToOne(() => Organization, org => org.tasks)
  organization!: Organization;

  @Column()
  organizationId!: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}