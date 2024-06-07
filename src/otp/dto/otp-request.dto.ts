import { IsEmail, IsNotEmpty } from 'class-validator';

export class OtpRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
