import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from "bcrypt";
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signUp(username: string, password: string) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.userService.createUser(username, hashedPassword);
      return { message: 'User created successfully', user };
    } catch (err) {
      Logger.log('Error: ', err.message);

      return { message: 'Error creating user', error: err.message };
    }
  }

  async login(username: string, password: string) {
    const user = await this.userService.findUserByUsername(username);

    if (!user) {
      return { message: 'User not found' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { message: 'Invalid credentials' };
    }

    const payload = {
      sub: user.id,
      username: user.username,
    };

    return {
      message: 'Login successful',
      user,
      token: this.generateJwtToken(payload),
    };
  }

  generateJwtToken(payload: { sub: string; username: string }) {
    return this.jwtService.sign(payload);
  }
}
