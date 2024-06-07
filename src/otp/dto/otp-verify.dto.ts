import { IsEmail, IsNotEmpty } from 'class-validator';

export class OtpVerifyDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  otp: string;
}
