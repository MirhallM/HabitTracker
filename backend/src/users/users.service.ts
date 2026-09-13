import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';
import type { ChangePasswordDto } from './dto/change-password.dto.js';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Único lugar donde se hashea una contraseña. AuthService lo usa al
  // registrar y changePassword al actualizarla, para que la sal explícita
  // que pide el curso se genere siempre igual.
  async hashPassword(plain: string) {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const password = await bcrypt.hash(plain, salt);
    return { password, salt };
  }

  create(data: {
    name: string;
    email: string;
    password: string;
    salt: string;
  }) {
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

  // Verificar la contraseña actual es lo que impide que un token robado
  // sirva para secuestrar la cuenta cambiándole la contraseña.
  async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await this.findById(id);

    const matches = await bcrypt.compare(dto.currentPassword, user.password);
    if (!matches) {
      throw new UnauthorizedException('La contraseña actual no es correcta');
    }

    const isSame = await bcrypt.compare(dto.newPassword, user.password);
    if (isSame) {
      throw new BadRequestException(
        'La nueva contraseña debe ser distinta de la actual',
      );
    }

    const { password, salt } = await this.hashPassword(dto.newPassword);
    await this.prisma.user.update({
      where: { id },
      data: { password, salt },
    });

    return { updated: true };
  }

  // Quita el hash y la sal antes de devolver el usuario al cliente
  toSafeUser<T extends { password: string; salt: string }>(user: T) {
    const { password: _password, salt: _salt, ...safe } = user;
    return safe;
  }
}
