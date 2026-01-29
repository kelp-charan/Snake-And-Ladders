import { Inject, Injectable } from '@nestjs/common';

import { User } from '../../utils/entities/users/user.entity';

@Injectable()
export class UserService {

    constructor(@Inject('USER_REPOSITORY') private userRepository: typeof User) {}

    async createUser(username: string, password: string): Promise<User> {
        const response = await this.userRepository.create({ username, password });
        return response;
    }

    async findUserByUsername(username: string): Promise<User | null> {
        
        return await this.userRepository.findOne({ where: { username } });
    }

}
