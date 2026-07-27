import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

export type UserProfileResponse = {
  id: string;
  name: string;
  email: string;
  baseCurrency: string;
  monthlySpendLimit: number | null;
};

const BCRYPT_SALT_ROUNDS = 10;

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
      if (dto.monthlySpendLimit !== undefined)
        user.monthlySpendLimit = dto.monthlySpendLimit;
      const saved = await this.userRepo.save(user);
      return this.toProfileResponse(saved);
    } catch {
      throw new InternalServerErrorException('Failed to update profile');
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const currentPasswordMatches = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!currentPasswordMatches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    try {
      user.passwordHash = await bcrypt.hash(
        dto.newPassword,
        BCRYPT_SALT_ROUNDS,
      );
      await this.userRepo.save(user);
    } catch {
      throw new InternalServerErrorException('Failed to change password');
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
