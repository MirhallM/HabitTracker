import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { name: string; email: string; password: string }) {
    return this.prisma.user.create({
      data: { ...data, email: data.email.toLowerCase() },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async update(id: string, data: UpdateUserDto) {
    await this.findById(id);
    return this.prisma.user.update({ where: { id }, data });
  }

  // Quita el hash de contraseña antes de devolver el usuario al cliente
  toSafeUser<T extends { password: string }>(user: T) {
    const { password: _password, ...safe } = user;
    return safe;
  }
}
