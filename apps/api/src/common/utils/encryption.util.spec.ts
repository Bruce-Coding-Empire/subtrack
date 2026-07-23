import { randomBytes } from 'crypto';
import { decrypt, encrypt } from './encryption.util';

describe('encrypt / decrypt', () => {
  const key = randomBytes(32).toString('hex');

  it('round-trips a plaintext value', () => {
    const cipherText = encrypt('ya29.a0-example-access-token', key);
    expect(decrypt(cipherText, key)).toBe('ya29.a0-example-access-token');
  });

  it('produces a different ciphertext each call (random IV)', () => {
    const first = encrypt('same-input', key);
    const second = encrypt('same-input', key);
    expect(first).not.toBe(second);
  });

  it('fails to decrypt with the wrong key', () => {
    const cipherText = encrypt('secret', key);
    const wrongKey = randomBytes(32).toString('hex');
    expect(() => decrypt(cipherText, wrongKey)).toThrow();
  });
});
