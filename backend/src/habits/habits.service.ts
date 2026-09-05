import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateHabitDto } from './dto/create-habit.dto.js';
import type { UpdateHabitDto } from './dto/update-habit.dto.js';

@Injectable()
export class HabitsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateHabitDto) {
    return this.prisma.habit.create({
      data: {
        ...dto,
        userId,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  findAllForUser(userId: string) {
    return this.prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneForUser(userId: string, habitId: string) {
    const habit = await this.prisma.habit.findUnique({
      where: { id: habitId },
    });
    if (!habit) throw new NotFoundException('Hábito no encontrado');
    if (habit.userId !== userId) {
      throw new ForbiddenException('Este hábito no te pertenece');
    }
    return habit;
  }

  async update(userId: string, habitId: string, dto: UpdateHabitDto) {
    await this.findOneForUser(userId, habitId); // valida dueño y existencia
    return this.prisma.habit.update({
      where: { id: habitId },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  setStatus(userId: string, habitId: string, active: boolean) {
    return this.update(userId, habitId, { active });
  }

  async remove(userId: string, habitId: string) {
    await this.findOneForUser(userId, habitId);
    await this.prisma.habit.delete({ where: { id: habitId } });
    return { deleted: true };
  }
}
