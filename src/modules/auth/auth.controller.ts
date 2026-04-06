import { Controller, Post, Delete, Body, Req, UseGuards, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { GoogleLoginDto, RefreshTokenDto, TokenResponseDto } from './auth.dto';
import { GoogleLoginPipe, RefreshTokenPipe } from './auth.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  @ApiOperation({ summary: 'Login or register with Google ID token' })
  @UsePipes(new GoogleLoginPipe())
  async loginWithGoogle(@Body() dto: GoogleLoginDto): Promise<TokenResponseDto> {
    return this.authService.loginWithGoogle(dto.idToken);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @UsePipes(new RefreshTokenPipe())
  async refresh(@Body() dto: RefreshTokenDto): Promise<TokenResponseDto> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Delete('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate token' })
  async logout(@Req() req: Request): Promise<{ message: string }> {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await this.authService.logout(token);
    }
    return { message: 'Logged out successfully' };
  }
}
