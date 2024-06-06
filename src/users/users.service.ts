import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(user);
    return this.usersRepository.save(newUser);
  }

  async setResetPasswordToken(email: string, token: string, expires: Date) {
    const user = await this.findOneByEmail(email);
    if (user) {
      user.resetPasswordToken = token;
      user.resetPasswordExpires = expires;
      return this.usersRepository.save(user);
    }
    return null;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { newPassword, token } = resetPasswordDto;
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.findOneByEmail(decoded.email);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.resetPasswordToken !== token) {
        throw new ForbiddenException('Invalid reset token');
      }
      if (user.resetPasswordExpires < new Date()) {
        throw new BadRequestException('Reset token has expired');
      }
      user.password = bcrypt.hashSync(newPassword, 10);
      return this.usersRepository.save(user);
    } catch (error) {
      return null;
    }
  }
}
