import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

import { AuthDTO } from '../../utils/dtos/auth.dto';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('signup')
    async signUp(@Body() authDto: AuthDTO) {
        return this.authService.signUp(authDto.username, authDto.password);
    }

    @Post('signin')
    async signIn(@Body() authDto: AuthDTO) {
        return this.authService.login(authDto.username, authDto.password);
    }
}
