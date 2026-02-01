import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signUp(username: string, password: string) {
    try {
      const user = await this.userService.createUser(username, password);
      return { message: 'User created successfully', user };
    } catch (err) {
      console.log('Error: ', err.message);

      return { message: 'Error creating user', error: err.message };
    }
  }

  async login(username: string, password: string) {
    const user = await this.userService.findUserByUsername(username);

    if (!user) {
      return { message: 'User not found' };
    }

    if (user.password !== password) {
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
