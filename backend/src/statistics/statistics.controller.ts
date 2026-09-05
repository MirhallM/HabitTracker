import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { StatisticsService } from './statistics.service.js';

@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('summary')
  summary(@CurrentUser() user: { userId: string }) {
    return this.statisticsService.summary(user.userId);
  }

  @Get('weekly')
  weekly(@CurrentUser() user: { userId: string }) {
    return this.statisticsService.weekly(user.userId);
  }

  @Get('monthly')
  monthly(@CurrentUser() user: { userId: string }) {
    return this.statisticsService.monthly(user.userId);
  }
}
