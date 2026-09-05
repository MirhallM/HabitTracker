import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { HabitsService } from './habits.service.js';
import { HabitsController } from './habits.controller.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [HabitsController],
  providers: [HabitsService],
  exports: [HabitsService],
})
export class HabitsModule {}
