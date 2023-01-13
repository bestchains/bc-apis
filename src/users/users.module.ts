import { Module } from '@nestjs/common';
import { UsersLoader } from './users.loader';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService, UsersLoader],
  exports: [UsersLoader],
})
export class UsersModule {}
