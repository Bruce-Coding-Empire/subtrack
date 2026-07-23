import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH_BYTES = 12;

export function encrypt(plainText: string, keyHex: string): string {
  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv(ALGORITHM, Buffer.from(keyHex, 'hex'), iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [iv, authTag, encrypted].map((buf) => buf.toString('hex')).join(':');
}

export function decrypt(cipherText: string, keyHex: string): string {
  const [ivHex, authTagHex, dataHex] = cipherText.split(':');
  const decipher = createDecipheriv(
    ALGORITHM,
    Buffer.from(keyHex, 'hex'),
    Buffer.from(ivHex, 'hex'),
  );
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}
