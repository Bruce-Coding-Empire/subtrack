import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@/modules/users/users.service';
import { User } from '@/modules/users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

type AuthResult = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; name: string; email: string; baseCurrency: string };
};

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    try {
      const existing = await this.usersService.findByEmail(dto.email);
      if (existing) {
        throw new ConflictException('Email already registered');
      }

      const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
      const user = await this.usersService.create({
        name: dto.name,
        email: dto.email,
        passwordHash,
      });

      return this.buildAuthResult(user);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    try {
      const user = await this.usersService.findByEmail(dto.email);
      if (!user) throw new UnauthorizedException('Invalid credentials');

      const passwordMatches = await bcrypt.compare(
        dto.password,
        user.passwordHash,
      );
      if (!passwordMatches)
        throw new UnauthorizedException('Invalid credentials');

      return this.buildAuthResult(user);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to log in');
    }
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(
        refreshToken,
        { secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET') },
      );

      const user = await this.usersService.findById(payload.sub);
      if (!user) throw new UnauthorizedException('Invalid refresh token');

      return { accessToken: this.signAccessToken(user) };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private buildAuthResult(user: User): AuthResult {
    return {
      accessToken: this.signAccessToken(user),
      refreshToken: this.signRefreshToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        baseCurrency: user.baseCurrency,
      },
    };
  }

  private signAccessToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.id, email: user.email },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      },
    );
  }

  private signRefreshToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );
  }
}
