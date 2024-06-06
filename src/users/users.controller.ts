import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forget-password.dto';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  @Post('forgot-password')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.usersService.findOneByEmail(email);
    if (user) {
      const payload = { email: user.email, sub: user.id };
      const token = this.jwtService.sign(payload, { expiresIn: '1h' });
      const expires = new Date();
      expires.setHours(expires.getHours() + 1);
      await this.usersService.setResetPasswordToken(email, token, expires);
      return { reset_token: token };
    }
    return { message: 'If email exists, reset token has been sent' };
  }

  @Post('reset-password')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.resetPassword(resetPasswordDto);
    if (user) {
      return { message: 'Password successfully reset' };
    }
    throw new BadRequestException('Invalid or expired token');
  }
}
