# NestJS Auth, OTP, and SMTP

This project is a NestJS application that provides user authentication, OTP (One Time Password) verification, and email sending functionalities. It uses PostgreSQL for the database, JWT for authentication, and an SMTP server for email sending.

## Table of Contents

- Prerequisites
- Installation
- Configuration
- Running the Application
- Endpoints
- Project Structure
- License

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14 or higher)
- npm (v6 or higher) or Yarn (v1.22 or higher)
- PostgreSQL database

### TypeORM

TypeORM is an [ORM](https://en.wikipedia.org/wiki/Object%E2%80%93relational_mapping) (Object-Relational Mapping) library that can run in Node.js and can be used with TypeScript and JavaScript (ES5+). It supports the Active Record and Data Mapper patterns, unlike all other JavaScript ORMs currently in existence, which means you can write high-quality, loosely coupled, scalable, maintainable applications most efficiently.

### PostgreSQL

PostgreSQL is a powerful, open-source object-relational database system that uses and extends the SQL language combined with many features that safely store and scale the most complicated data workloads.

## Requirements

- Node.js (version >= 16)
- npm (or Yarn)
- PostgreSQL
- (OPTIONAL) Docker and Postman

## Installation

> 1. Clone the repository:

```
git clone https://github.com/jimmy-ramani-0912/NestJS-OTP-Auth-Email
```

> 2. Install the dependencies:

Using npm:

```
npm install
```

## Configuration

> 1. Set up environment variables:

Create a .env file in the root of the project and add the following environment variables:

```
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=
POSTGRES_DB=Nest-Auth-OTP-SMTP
JWT_SECRET=
MAIL_HOST=smtp.gmail.com
SMTP_USERNAME=mailto:yourmail@gmail.com
SMTP_PASSWORD=
MAIL_PORT=587
```

### How to Create an SMTP Password for Your Google Account

To use Google's SMTP server for sending emails in your application, you need to create an App Password in your Google account. Follow these steps to generate the SMTP password:

> STEP-1 : Sign in to your Google Account:

- Open your web browser and go to Google Account. Sign in with your Google credentials.

> STEP-2 : Navigate to Security Settings:

- In the left sidebar, click on "Security".

> STEP-3 : Set Up 2-Step Verification:

- Scroll down to the "Signing in to Google" section.
- Click on "2-Step Verification" and follow the on-screen instructions to set it up. You may need to verify your identity through a code sent to your phone or another method.

> STEP-4 : Create an App Password:

- Once 2-Step Verification is set up, go back to the "Security" section.
- In the "Signing in to Google" section, you will now see an option for "App passwords". Click on it.
- You might need to sign in again to your Google account for security purposes.
- In the "App passwords" section, choose the App Name.
- Click on "Generate".

> STEP-5 : Save the App Password:

- A 16-character App Password will be generated. Copy this password and save it securely. This is your SMTP password that you will use in your application.

> STEP-6 : Use the App Password in Your Application:

- Update your .env file in your NestJS project with the new SMTP password:

```
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password
```

Replace your-email@gmail.com with your Google account email and your-16-character-app-password with the generated App Password.

> 2. Configure ormconfig.json:

Create a ormconfig.json file in the root of the project with the following content:

```
{
"type": "postgres",
"host": "localhost",
"port": 5432,
"username": "postgres",
"password": "",
"database": "Nest-Auth-OTP-SMTP",
"entities": ["dist/**/*.entity{.ts,.js}"],
"synchronize": true
}
```

> 3. Update nest-cli.json:

Ensure your nest-cli.json includes the configuration to watch email templates:

```
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "assets": [
      {
        "include": "email/templates/**/*",
        "watchAssets": true
      }
    ]
  }
}
```

## Running the Application

> Build the application:

Using npm:

```
npm run build
```

> Run the application:

Using npm:

```
npm run start
```

## Endpoints

Here are some of the main endpoints provided by this application:

- User Registration: POST /auth/register
- User Login: POST /auth/login
- Forgot Password: POST /users/forgot-password
- Reset Password: POST /users/reset-password
- Request OTP: POST /otp/request
- Verify OTP: POST /otp/verify

## Project Structure

```
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── registration.dto.ts
│   └── strategy/
│       └── jwt.strategy.ts
├── users/
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   ├── forgot-password.dto.ts
│   │   └── reset-password.dto.ts
│   ├── entities/
│   │   └── user.entity.ts
│   ├── users.controller.ts
│   ├── users.module.ts
│   └── users.service.ts
├── otp/
│   ├── dto/
│   │   ├── otp-request.dto.ts
│   │   └── otp-verify.dto.ts
│   ├── entities/
│   │   └── otp.entity.ts
│   ├── otp.controller.ts
│   ├── otp.module.ts
│   └── otp.service.ts
├── email/
│   ├── dto/
│   │   └── mail.dto.ts
│   ├── templates/
│   │   └── otp.hbs
│   ├── email.controller.ts
│   ├── email.module.ts
│   └── email.service.ts
├── app.module.ts
└── main.ts
```
