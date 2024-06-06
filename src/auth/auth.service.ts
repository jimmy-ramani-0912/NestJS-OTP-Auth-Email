import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegistrationDto } from './dto/registration.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('Email not found');
    }
    if (!bcrypt.compareSync(pass, user.password)) {
      throw new BadRequestException('Incorrect password');
    }
    const { password, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.validateUser(email, password);
    const payload = { username: user.email, sub: user.id };
    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerUserDto: RegistrationDto) {
    const { password, email } = registerUserDto;
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = await this.usersService.create({
      email,
      password: hashedPassword,
    });

    const payload = { username: newUser.email, sub: newUser.id };
    return {
      user: newUser,
      access_token: this.jwtService.sign(payload),
    };
  }
}
