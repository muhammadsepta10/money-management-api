import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'default-secret-change-me',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-me',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  accessTtl: parseInt(process.env.JWT_ACCESS_TTL || '900', 10),
  refreshTtl: parseInt(process.env.JWT_REFRESH_TTL || '604800', 10),
}));
