
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string) {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      return null;
    }

    const valid = await bcrypt.compare(pass, user.password);

    if (!valid) {
      return null;
    }

    return {
      id: user.user_id,
      username: user.username,
    };
  }

  async login(user: { id: number; username: string }) {
    const payload = {
      sub: user.id,
      username: user.username,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      access_token: accessToken,
    };
  }

  async logout(_userId: number) {
    return { message: 'Logout successful' };
  }

  async refreshTokens(_refreshToken: string) {
    throw new UnauthorizedException(
      'Refresh token is not configured yet',
    );
  }
}
