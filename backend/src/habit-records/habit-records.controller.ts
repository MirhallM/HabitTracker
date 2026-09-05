import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { HabitRecordsService } from './habit-records.service.js';
import { CreateRecordDto } from './dto/create-record.dto.js';

@Controller('habits/:habitId/records')
@UseGuards(JwtAuthGuard)
export class HabitRecordsController {
  constructor(private readonly recordsService: HabitRecordsService) {}

  @Post()
  create(
    @CurrentUser() user: { userId: string },
    @Param('habitId') habitId: string,
    @Body() dto: CreateRecordDto,
  ) {
    return this.recordsService.create(user.userId, habitId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: { userId: string },
    @Param('habitId') habitId: string,
  ) {
    return this.recordsService.findAllForHabit(user.userId, habitId);
  }
}
