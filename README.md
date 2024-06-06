# Building a Secure Authentication System with NestJS, PostgreSQL, and TypeORM: A Comprehensive Guide

The combination of **NestJS**, **TypeORM**, and **PostgreSQL** provides a scalable, and efficient stack for developing web services. This article gives a general outline of constructing a basic, yet operational web service using these tools. We will look into the fundamentals of each element, and their collaboration, and guide you through a straightforward example to kickstart your project.

## Introduction to the Stack

### NestJS

NestJS is a framework for building efficient, scalable [Node.js](https://nodejs.org/en) server-side applications. It uses progressive JavaScript, is built with and fully supports [TypeScript](https://www.typescriptlang.org/) (yet still enables developers to code in pure JavaScript) and combines elements of OOP (Object Oriented Programming), FP (Functional Programming), and FRP (Functional Reactive Programming).

### TypeORM

TypeORM is an [ORM](https://en.wikipedia.org/wiki/Object%E2%80%93relational_mapping) (Object-Relational Mapping) library that can run in Node.js and can be used with TypeScript and JavaScript (ES5+). It supports the Active Record and Data Mapper patterns, unlike all other JavaScript ORMs currently in existence, which means you can write high-quality, loosely coupled, scalable, maintainable applications most efficiently.

### PostgreSQL

PostgreSQL is a powerful, open-source object-relational database system that uses and extends the SQL language combined with many features that safely store and scale the most complicated data workloads.

## Requirements

- Node.js (version >= 16)
- npm (or Yarn)
- PostgreSQL
- (OPTIONAL) Docker and Postman

## STEP 1 : Setting Up the Project

> Create a new NestJS project

```
npm i -g @nestjs/cli nest new project-name
```

Navigate into your project directory before proceeding.

> Install TypeORM and PostgreSQL

```
npm install --save @nestjs/config @nestjs/typeorm typeorm pg class-validator class-transformer
```

- _@nestjs/config_: NestJS module for configuration
- _@nestjs/typeorm_: NestJS module for TypeORM
- _typeorm_: ORM for NodeJS
- _pg_: Postgres driver for NodeJS
- _class-validator_: Allows you to use decorator-based validation for class properties.
- _class-transformer_: Enables transforming plain objects to class instances and vice versa, essential for applying validation rules to incoming request data.

> Database Connection

- create an `.env` in the root of your project

```
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=jimmy@246
POSTGRES_DB=crud-rest-api
JWT_SECRET='my-name-is-jimmy-ramani'
```

- create an typeormconfig.ts file to configure TypeORM with PostgreSQL

```
import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({ path: '.env' });

const config = {
  type: 'postgres',
  host: `${process.env.POSTGRES_HOST}`,
  port: `${process.env.POSTGRES_PORT}`,
  username: `${process.env.POSTGRES_USER}`,
  password: `${process.env.POSTGRES_PASSWORD}`,
  database: `${process.env.POSTGRES_DB}`,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: true,
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
```

- Add `app.setGlobalPrefix('api/v1'); in main.ts` (OPTIONAL)

  - It adds the prefix api/v1 to every route registered in the application.
  - This means all API endpoints will be accessible under the api/v1 path.

- Add `app.enableCors(); in main.ts` (OPTIONAL)

  - Allows requests from frontend applications on different domains to access the API endpoints.
  - Improves security by controlling which origins (domains or subdomains) can make requests to the API.

## STEP 2 : Integrate Config into Nestjs

- To add the typeorm.ts into the main root module, which is mostly named as app.module.ts

```
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import typeorm from './config/typeormconfig';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('typeorm'),
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

In the AppModule, NestJS uses ConfigModule to globally load application configurations, including TypeORM options defined in config/typeorm.ts. The TypeOrmModule.forRootAsync method fetches TypeORM configuration asynchronously via ConfigService, enabling seamless integration with the application's configuration.

## STEP 3 : Creating User Entity and Repository

> Create User Entity:

Generate a new module, service, and controller for users:

```
nest generate module users
nest generate service users
nest generate controller users
```

> Define User Entity:

define your user entity:

```
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true })
  resetPasswordExpires: Date;
}
```

## STEP 4 : Implementing Authentication :

> 1. Install Passport and JWT Dependencies:

```
npm install --save @nestjs/passport @nestjs/jwt passport passport-jwt bcrypt
npm install --save-dev @types/passport-jwt @types/bcrypt
```

- _@nestjs/passport_ : Provides integration between NestJS and Passport, a popular authentication middleware for Node.js. It simplifies the implementation of various authentication strategies in NestJS applications.
- _@nestjs/jwt_ : Adds support for JWT (JSON Web Tokens) in NestJS applications. It helps in creating, signing, and verifying JWTs, which are often used for securing APIs through token-based authentication.
- _passport_ : A general authentication middleware for Node.js. It is designed to authenticate requests and is extremely flexible and modular, allowing the use of various authentication strategies.
- _passport-jwt_ : A Passport strategy for authenticating with a JSON Web Token. This module lets you authenticate endpoints using a JWT, making it ideal for securing RESTful APIs.
- _bcrypt_ : A library for hashing and comparing passwords using the bcrypt algorithm. It is widely used for securing user passwords before storing them in a database.
- _@types/passport-jwt_ : TypeScript type definitions for the passport-jwt module. These types help ensure type safety and better development experience when using passport-jwt in a TypeScript project.
- _@types/bcrypt_ : TypeScript type definitions for the bcrypt module. These types provide type information and help with type safety when using bcrypt in a TypeScript project.

> 2. Create Auth Module:

Generate a new module, service, and controller for authentication:

```
nest generate module auth
nest generate service auth
nest generate controller auth
```

> 3. Configure JWT Strategy:

configure the JWT strategy

```
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: `${process.env.JWT_SECRET}`,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
```

> 4. Configure Auth Module:

configure the authentication module:

```
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: `${process.env.JWT_SECRET}`,
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
```

> 5. Implement Login & Registration Dto:

Login Dto :

```
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
```

Registration Dto :

```
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class RegistrationDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
```

> 6. Implement Auth Service:

implement the authentication logic:

```
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

```

> 7. Add Login and Register Endpoints:

add endpoints for login and register:

```
import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistrationDto } from './dto/registration.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
}
```

## STEP 5 : Implementing Forgot Password and Reset Password

> 1. Implement Create User, Forget Passoword & Reset Passoword Dto:

Create User Dto :

```
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
```

Forget Passoword Dto :

```
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
```

Reset Passoword Dto :

```
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}
```

> 2. configure the users module:

```
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: `${process.env.JWT_SECRET}`,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
```

> 3. Add Forgot Password Method in Users Service:

```
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
```

> 4. Add Forgot Password and Reset Password Endpoints:

add endpoints for forgot and reset password:

```
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
```

<img alt="Register User" src="public/images/register.png">

<img alt="Login User" src="public/images/login.png">

<img alt="Forget Password" src="public/images/forgot-password.png">

<img alt="Reset Password" src="public/images/reset-password.png">
