import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
  import { AuditLogService } from '../audit-log.service';
  
  @Injectable()
  export class AuditInterceptor implements NestInterceptor {
    constructor(private auditLogService: AuditLogService) {}
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
  
      // only log authenticated requests
      if (!user) {
        return next.handle();
      }
  
      const method = request.method;
      const endpoint = request.url;
      const ipAddress = request.ip || request.connection.remoteAddress;
  
      // determine action and resource from method and path
      const action = this.mapMethodToAction(method);
      const resource = this.extractResource(endpoint);
      const resourceId = request.params.id || null;
  
      return next.handle().pipe(
        tap(() => {
          // log after successful request
          this.auditLogService.create({
            userId: user.userId,
            userEmail: user.email,
            action,
            resource,
            resourceId,
            method,
            endpoint,
            ipAddress,
            metadata: {
              body: this.sanitizeBody(request.body),
              query: request.query,
            },
          });
        }),
      );
    }
  
    private mapMethodToAction(method: string): string {
        const map = {
          GET: 'READ',
          POST: 'CREATE',
          PUT: 'UPDATE',
          PATCH: 'UPDATE',
          DELETE: 'DELETE',
        } as const
      
        if (method in map) {
          return map[method as keyof typeof map]
        }
      
        return 'UNKNOWN'
      }
  
    private extractResource(endpoint: string): string {
      const parts = endpoint.split('/').filter(p => p && p !== 'api');
      if (parts.length > 0) {
        return parts[0].replace(/s$/, '');
      }
      return 'unknown';
    }
  
    private sanitizeBody(body: any): any {
      if (!body) return null;
      const sanitized = { ...body };
      delete sanitized.password;
      return sanitized;
    }
  }