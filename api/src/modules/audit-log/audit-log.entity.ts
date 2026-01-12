import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  userEmail!: string;

  @Column()
  action!: string;

  @Column()
  resource!: string;

  @Column({ nullable: true })
  resourceId!: string;

  @Column()
  method!: string;

  @Column()
  endpoint!: string;

  @Column({ nullable: true })
  ipAddress!: string;

  @Column('simple-json', { nullable: true })
  metadata: any;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}