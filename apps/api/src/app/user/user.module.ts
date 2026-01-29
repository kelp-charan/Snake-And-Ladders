import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { DatabaseModule } from '../../utils/database/database.module';
import { userProviders } from '../../utils/entities/users/user.providers';

@Module({
  imports: [DatabaseModule],
  providers: [UserService, ...userProviders],
  exports: [UserService]
})
export class UserModule {}
