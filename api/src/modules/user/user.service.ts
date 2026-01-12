import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepo.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('email already exists');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const user = this.userRepo.create({
      ...createUserDto,
      password: hashedPassword,
    });
    
    return this.userRepo.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find({
      relations: ['organization', 'role'],
      select: ['id', 'email', 'name', 'organizationId', 'roleId', 'createdAt'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['organization', 'role'],
    });

    if (!user) {
      throw new NotFoundException(`user not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ 
      where: { email },
      relations: ['organization', 'role', 'role.permissions'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
    Object.assign(user, updateUserDto);
    
    return this.userRepo.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepo.remove(user);
  }
}