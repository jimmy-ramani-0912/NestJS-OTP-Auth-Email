import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistrationDto } from './dto/registration.dto';
import { OtpService } from '../otp/otp.service';
import { OtpRequestDto } from '../otp/dto/otp-request.dto';
import { OtpVerifyDto } from '../otp/dto/otp-verify.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private otpService: OtpService,
  ) {}

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      message: 'Login successful',
      ...result,
    };
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async register(@Body() registrationDto: RegistrationDto) {
    const result = await this.authService.register(registrationDto);
    return {
      message: 'Registration successful',
      ...result,
    };
  }

  @Post('otp-request')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async requestOtp(@Body() otpRequestDto: OtpRequestDto) {
    try {
      await this.otpService.createOtp(otpRequestDto.email);
      return { message: 'OTP sent successfully' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('otp-verify')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async verifyOtp(@Body() otpVerifyDto: OtpVerifyDto) {
    try {
      const token = await this.otpService.verifyOtpForEmail(
        otpVerifyDto.email,
        otpVerifyDto.otp,
      );
      return { message: 'OTP verified successfully', token };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
