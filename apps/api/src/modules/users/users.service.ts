import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

export type UserProfileResponse = {
  id: string;
  name: string;
  email: string;
  baseCurrency: string;
  monthlySpendLimit: number | null;
};

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

  async getProfile(userId: string): Promise<UserProfileResponse> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return this.toProfileResponse(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateUserDto,
  ): Promise<UserProfileResponse> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    try {
      if (dto.name !== undefined) user.name = dto.name;
      if (dto.baseCurrency !== undefined) user.baseCurrency = dto.baseCurrency;
      const saved = await this.userRepo.save(user);
      return this.toProfileResponse(saved);
    } catch {
      throw new InternalServerErrorException('Failed to update profile');
    }
  }

  private toProfileResponse(user: User): UserProfileResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      baseCurrency: user.baseCurrency,
      monthlySpendLimit: user.monthlySpendLimit,
    };
  }
}
