import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { Task } from '../task/task.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @ManyToOne(() => Organization, org => org.children, { nullable: true })
  parent!: Organization;

  @Column({ nullable: true })
  parentId!: string;

  @OneToMany(() => Organization, org => org.parent)
  children!: Organization[];

  @OneToMany(() => User, user => user.organization)
  users!: User[];

  @OneToMany(() => Task, task => task.organization)
  tasks!: Task[];

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}