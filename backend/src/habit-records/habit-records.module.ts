import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { HabitsModule } from '../habits/habits.module.js';
import { HabitRecordsService } from './habit-records.service.js';
import { HabitRecordsController } from './habit-records.controller.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), HabitsModule],
  controllers: [HabitRecordsController],
  providers: [HabitRecordsService],
  exports: [HabitRecordsService],
})
export class HabitRecordsModule {}
