import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import * as crypto from 'crypto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Token expires in 1 hour
    const user = await this.usersService.setResetPasswordToken(
      email,
      token,
      expires,
    );
    if (user) {
      // Send token to user's email
      // await this.mailService.sendResetPasswordMail(email, token);
      return { reset_token: token };
    }
    return { message: 'If email exists, reset token has been sent' };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: any) {
    const { token, newPassword } = body;
    const user = await this.usersService.resetPassword(token, newPassword);
    if (user) {
      return { message: 'Password successfully reset' };
    }
    return { message: 'Invalid or expired token' };
  }
}
