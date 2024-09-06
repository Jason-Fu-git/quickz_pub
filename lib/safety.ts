import 'server-only';
import crypto from 'crypto';

const secret = process.env.SECRET_KEY || '3a25d5294b3ccba85955dda811b62134425f3e2d';

export function encryptQuiz(userid: number, quizid: number) {
  const data = `${userid}:${quizid}`;
  const salt = crypto.randomBytes(16).toString('hex');
  const key = crypto.pbkdf2Sync(secret, salt, 1000, 32, 'sha512');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${salt}.${iv.toString('hex')}.${encrypted}`;
}

export function decryptQuiz(token: string) {
  const [salt, iv, encrypted] = token.split('.');
  const key = crypto.pbkdf2Sync(secret, salt, 1000, 32, 'sha512');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted.split(':');
}

