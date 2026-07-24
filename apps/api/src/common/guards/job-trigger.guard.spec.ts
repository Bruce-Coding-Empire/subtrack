import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JobTriggerGuard } from './job-trigger.guard';

function buildGuard(secret: string | undefined): JobTriggerGuard {
  const configService = {
    get: (): string | undefined => secret,
    // Narrowed stub — the guard only calls get(); a full ConfigService needs a
    // Nest context this pure unit test deliberately avoids.
  } as unknown as ConfigService;
  return new JobTriggerGuard(configService);
}

function buildContext(headers: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ headers }) }),
    // Narrowed stub — the guard only reads request headers via switchToHttp().
  } as unknown as ExecutionContext;
}

describe('JobTriggerGuard', () => {
  it('allows a request whose x-job-key matches the secret', () => {
    const guard = buildGuard('correct-secret');
    const context = buildContext({ 'x-job-key': 'correct-secret' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects a wrong key', () => {
    const guard = buildGuard('correct-secret');
    const context = buildContext({ 'x-job-key': 'wrong-secret' });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rejects a key of a different length', () => {
    const guard = buildGuard('correct-secret');
    const context = buildContext({ 'x-job-key': 'short' });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rejects a missing header', () => {
    const guard = buildGuard('correct-secret');
    const context = buildContext({});

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rejects an array-valued header', () => {
    const guard = buildGuard('correct-secret');
    const context = buildContext({
      'x-job-key': ['correct-secret', 'correct-secret'],
    });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rejects every request when JOB_TRIGGER_SECRET is not configured', () => {
    const guard = buildGuard(undefined);
    const context = buildContext({ 'x-job-key': 'anything' });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
