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
npm install --save @nestjs/config @nestjs/typeorm typeorm pg class-validator class-transformer @nestjs-modules/mailer
```

- _@nestjs/config_: NestJS module for configuration
- _@nestjs/typeorm_: NestJS module for TypeORM
- _typeorm_: ORM for NodeJS
- _pg_: Postgres driver for NodeJS
- _class-validator_: Allows you to use decorator-based validation for class properties
- _class-transformer_: Enables transforming plain objects to class instances and vice versa, essential for applying validation rules to incoming request data
- _@nestjs-modules/mailer_: A robust and flexible email sending module for NestJS, supporting multiple transport protocols and templating engines.
- _speakeasy_: A package for generating and verifying secure one-time passwords (OTPs) using TOTP and HOTP algorithms.

> Database Connection

- create an `.env` in the root of your project

```
POSTGRES_HOST = localhost
POSTGRES_PORT = 5432
POSTGRES_USER = postgres
POSTGRES_PASSWORD =
POSTGRES_DB =
JWT_SECRET =
MAIL_HOST = smtp.gmail.com
SMTP_USERNAME = mailto:yourmail@gmail.com
SMTP_PASSWORD =
MAIL_PORT = 587
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
  synchronize: true, // Make sure its 'false' in production
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
