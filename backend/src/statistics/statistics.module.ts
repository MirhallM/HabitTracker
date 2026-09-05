import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { StatisticsService } from './statistics.service.js';
import { StatisticsController } from './statistics.controller.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
