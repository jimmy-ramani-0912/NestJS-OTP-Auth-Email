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
