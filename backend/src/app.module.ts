import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { HabitsModule } from './habits/habits.module.js';
import { HabitRecordsModule } from './habit-records/habit-records.module.js';
import { StatisticsModule } from './statistics/statistics.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    HabitsModule,
    HabitRecordsModule,
    StatisticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
