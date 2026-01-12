import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

export interface CreateAuditLogDto {
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  method: string;
  endpoint: string;
  ipAddress?: string;
  metadata?: any;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepo: Repository<AuditLog>,
  ) {}

  async create(data: CreateAuditLogDto): Promise<AuditLog> {
    const log = this.auditLogRepo.create(data);
    const saved = await this.auditLogRepo.save(log);
    console.log(`[AUDIT] ${data.userEmail} ${data.action} ${data.resource} ${data.resourceId || ''} via ${data.method} ${data.endpoint}`);

    return saved;
  }

  async findAll(): Promise<AuditLog[]> {
    return this.auditLogRepo.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async findByUser(userId: string): Promise<AuditLog[]> {
    return this.auditLogRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByResource(resource: string): Promise<AuditLog[]> {
    return this.auditLogRepo.find({
      where: { resource },
      order: { createdAt: 'DESC' },
    });
  }

  async findByAction(action: string): Promise<AuditLog[]> {
    return this.auditLogRepo.find({
      where: { action },
      order: { createdAt: 'DESC' },
    });
  }
}