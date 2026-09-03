import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';

// Sin controller todavía — llega con Auth en el siguiente paso.
@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
