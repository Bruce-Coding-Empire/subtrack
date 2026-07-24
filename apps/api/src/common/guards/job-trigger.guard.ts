import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, timingSafeEqual } from 'crypto';
import type { Request } from 'express';

// Machine auth for POST /jobs/* — NOT a JWT. These endpoints have no user
// context (jobs iterate across all users deliberately), so JwtAuthGuard is the
// wrong shape: it would let any logged-in user fire global jobs.
@Injectable()
export class JobTriggerGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const secret = this.configService.get<string>('JOB_TRIGGER_SECRET');
    const request = context.switchToHttp().getRequest<Request>();
    const providedKey = request.headers['x-job-key'];

    if (!secret || typeof providedKey !== 'string') {
      throw new UnauthorizedException('Invalid job trigger key');
    }

    // Hash both sides before comparing: timingSafeEqual throws on unequal
    // lengths, and bailing early on length would itself leak via timing.
    const providedDigest = createHash('sha256').update(providedKey).digest();
    const secretDigest = createHash('sha256').update(secret).digest();

    if (!timingSafeEqual(providedDigest, secretDigest)) {
      throw new UnauthorizedException('Invalid job trigger key');
    }

    return true;
  }
}
