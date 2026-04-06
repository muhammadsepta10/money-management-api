import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../database/redis.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redis: RedisService,
  ) {
    this.googleClient = new OAuth2Client(configService.get<string>('google.clientId'));
  }

  async loginWithGoogle(idToken: string) {
    let payload: any;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('google.clientId'),
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Invalid Google ID token');
    }

    if (!payload || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const { sub: googleId, email, name, picture } = payload;

    let user = await this.prisma.user.findUnique({ where: { googleId } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          googleId,
          email,
          displayName: name || email.split('@')[0],
          avatarUrl: picture || null,
        },
      });
      this.logger.log(`New user registered: ${email}`);
    }

    return this.generateTokens(user);
  }

  async refresh(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const blacklisted = await this.redis.get(`bl:${payload.jti}`);
    if (blacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }

    // Blacklist old refresh token
    const refreshTtl = this.configService.get<number>('jwt.refreshTtl', 604800);
    await this.redis.set(`bl:${payload.jti}`, '1', refreshTtl);

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateTokens(user);
  }

  async logout(accessToken: string) {
    try {
      const decoded = this.jwtService.decode(accessToken) as any;
      if (decoded?.jti) {
        const accessTtl = this.configService.get<number>('jwt.accessTtl', 900);
        await this.redis.set(`bl:${decoded.jti}`, '1', accessTtl);
      }
    } catch {
      // Token decode failure is non-critical for logout
    }
  }

  private generateTokens(user: { id: string; email: string }) {
    const accessJti = randomUUID();
    const refreshJti = randomUUID();

    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'access', jti: accessJti },
      {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.accessExpiresIn', '15m'),
      },
    );

    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh', jti: refreshJti },
      {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn', '7d'),
      },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get<string>('jwt.accessExpiresIn', '15m'),
    };
  }
}
