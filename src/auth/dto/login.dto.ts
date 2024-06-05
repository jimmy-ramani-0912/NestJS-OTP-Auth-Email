import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
    {
      message:
        'password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    },
  )
  password: string;
}
