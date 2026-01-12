import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RolesService } from './modules/role/role.service';
import { OrganizationsService } from './modules/org/org.service';
import { UsersService } from './modules/user/user.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const rolesService = app.get(RolesService);
  const orgsService = app.get(OrganizationsService);
  const usersService = app.get(UsersService);

  console.log('🌱 starting seed...');
  console.log('creating roles...');

  const ownerRole = await rolesService.create({
    name: 'Owner',
    permissions: [
      { resource: 'task', action: 'create' },
      { resource: 'task', action: 'read' },
      { resource: 'task', action: 'update' },
      { resource: 'task', action: 'delete' },
      { resource: 'audit-log', action: 'read' },
      { resource: 'user', action: 'create' },
      { resource: 'user', action: 'read' },
      { resource: 'user', action: 'update' },
      { resource: 'user', action: 'delete' },
    ],
  });

  const adminRole = await rolesService.create({
    name: 'Admin',
    permissions: [
      { resource: 'task', action: 'create' },
      { resource: 'task', action: 'read' },
      { resource: 'task', action: 'update' },
      { resource: 'task', action: 'delete' },
      { resource: 'audit-log', action: 'read' },
      { resource: 'user', action: 'read' },
    ],
  });

  const viewerRole = await rolesService.create({
    name: 'Viewer',
    permissions: [
      { resource: 'task', action: 'read' },
      { resource: 'user', action: 'read' },
    ],
  });

  console.log('✅ roles created');
  console.log('creating organizations...');

  const parentOrg = await orgsService.create({
    name: 'Company A',
  });

  const childOrg = await orgsService.create({
    name: 'Team B',
    parentId: parentOrg.id,
  });

  console.log('✅ organizations created');

  console.log('creating users...');

  await usersService.create({
    email: 'owner@company.com',
    password: 'password123',
    name: 'Owner User',
    organizationId: parentOrg.id,
    roleId: ownerRole.id,
  });

  await usersService.create({
    email: 'admin@company.com',
    password: 'password123',
    name: 'Admin User',
    organizationId: parentOrg.id,
    roleId: adminRole.id,
  });

  await usersService.create({
    email: 'viewer@company.com',
    password: 'password123',
    name: 'Viewer User',
    organizationId: childOrg.id,
    roleId: viewerRole.id,
  });

  console.log('✅ users created');

  console.log('\n🎉 seed completed!\n');
  console.log('test users:');
  console.log('- owner@company.com / password123 (Owner in Company A)');
  console.log('- admin@company.com / password123 (Admin in Company A)');
  console.log('- viewer@company.com / password123 (Viewer in Team B)');
  console.log('\norganization hierarchy:');
  console.log('- Company A (parent)');
  console.log('  └── Team B (child)');

  await app.close();
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ seed failed:', error);
    process.exit(1);
  });