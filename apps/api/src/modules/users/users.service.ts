import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepo.findOne({ where: { email } });
    } catch {
      throw new InternalServerErrorException('Failed to look up user');
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      return await this.userRepo.findOne({ where: { id } });
    } catch {
      throw new InternalServerErrorException('Failed to look up user');
    }
  }

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<User> {
    try {
      const user = this.userRepo.create(data);
      return await this.userRepo.save(user);
    } catch {
      throw new InternalServerErrorException('Failed to create user');
    }
  }
}
