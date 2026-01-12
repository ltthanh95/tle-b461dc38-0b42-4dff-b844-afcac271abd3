jest.mock('../role/role.entity', () => ({ Role: class Role {} }));
jest.mock('../permission/permission.entity', () => ({ Permission: class Permission {} }));
jest.mock('../org/org.entity', () => ({ Organization: class Organization {} }));
jest.mock('../task/task.entity', () => ({ Task: class Task {} }));
jest.mock('../user/user.entity', () => ({ User: class User {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { UsersService } from '../user/user.service.js';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedpassword',
    name: 'Test User',
    roleId: 'role1',
    organizationId: 'org1',
    role: { id: 'role1', name: 'Admin' },
    organization: { id: 'org1', name: 'Test Org' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access token and user when credentials are valid', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('access_token', 'test-token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('test@example.com');
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create user and return user without password', async () => {
      const newUser = { ...mockUser };
      jest.spyOn(usersService, 'create').mockResolvedValue(newUser as any);

      const result = await service.register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        roleId: 'role1',
        organizationId: 'org1',
      });

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('test@example.com');
    });
  });
});