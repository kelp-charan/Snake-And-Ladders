import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../utils/database/database.module';
import { userProviders } from '../../utils/entities/users/user.providers';
import { UserService } from './user.service';

@Module({
  imports: [DatabaseModule],
  providers: [UserService, ...userProviders],
  exports: [UserService]
})
export class UserModule {}
