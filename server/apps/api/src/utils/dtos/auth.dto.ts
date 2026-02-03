import { IsNotEmpty, IsString } from 'class-validator';

export class AuthDTO {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
