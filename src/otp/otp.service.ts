import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as speakeasy from 'speakeasy';
import { Otp } from './entities/otp.entity';
import { Repository } from 'typeorm';
import { EmailService } from '../email/email.service';
import { JwtService } from '@nestjs/jwt';

const OtpConfig: speakeasy.TotpOptions = {
  secret: null,
  step: 3600, // 1 hour
  digits: 6,
};

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
  ) {}

  async getSecret(): Promise<string> {
    const secret = speakeasy.generateSecret({ length: 20 });
    return secret.base32;
  }

  getOtp(secret: string): string {
    return speakeasy.totp({ ...OtpConfig, secret });
  }

  verifyOtp(secret: string, otp: string): boolean {
    return speakeasy.totp.verify({
      ...OtpConfig,
      secret: secret,
      token: otp,
      window: 3,
    });
  }

  async findOtpInfoByEmail(email: string): Promise<Otp> {
    const otpInfo = await this.otpRepository.findOne({ where: { email } });
    if (!otpInfo) {
      throw new NotFoundException('OTP not found');
    }
    return otpInfo;
  }

  async createOtp(email: string): Promise<void> {
    const secret = await this.getSecret();
    const otp = this.getOtp(secret);

    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    let otpData = await this.otpRepository.findOne({ where: { email } });
    if (otpData) {
      otpData.token = otp;
      otpData.secret = secret;
      otpData.expires = expiryDate;
    } else {
      otpData = this.otpRepository.create({
        email,
        token: otp,
        secret: secret,
        expires: expiryDate,
      });
    }

    await this.otpRepository.save(otpData);
    await this.sendOtpEmail(email, otp);
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const mailDto = {
      email,
      subject: 'Your OTP Code',
      template: './otp',
      context: { otp },
    };
    await this.emailService.sendEmail(mailDto);
  }

  async verifyOtpForEmail(email: string, otp: string): Promise<string> {
    const otpInfo = await this.findOtpInfoByEmail(email);
    if (new Date() > otpInfo.expires) {
      throw new BadRequestException('OTP has expired');
    }
    const isValid = this.verifyOtp(otpInfo.secret, otp);
    if (!isValid) {
      throw new BadRequestException('Invalid OTP');
    }

    const payload = { email };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });
    return token;
  }
}
