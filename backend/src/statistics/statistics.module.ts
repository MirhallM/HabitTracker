import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { HabitsModule } from '../habits/habits.module.js';
import { StatisticsService } from './statistics.service.js';
import { StatisticsController } from './statistics.controller.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), HabitsModule],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
