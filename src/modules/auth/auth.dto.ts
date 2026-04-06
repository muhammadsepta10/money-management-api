import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginDto {
  @ApiProperty({ description: 'Google ID token from google_sign_in SDK' })
  idToken: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token to exchange for new token pair' })
  refreshToken: string;
}

export class TokenResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  refreshToken: string;

  @ApiProperty({ example: '15m' })
  expiresIn: string;
}
