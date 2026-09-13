import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { User } from '@prisma/client';
import { UsersService } from '../users/users.service.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing)
      throw new ConflictException('Ya existe una cuenta con ese correo');

    // El hash vive en UsersService: es el mismo que usa el cambio de
    // contraseña, así que la sal se genera en un solo lugar.
    const { password, salt } = await this.usersService.hashPassword(
      dto.password,
    );
    const user = await this.usersService.create({ ...dto, password, salt });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches)
      throw new UnauthorizedException('Credenciales inválidas');

    return this.buildAuthResponse(user);
  }

  // Devuelve el usuario completo (sin password ni salt) en vez de solo
  // id/email/name, para que el frontend reciba siempre la misma forma
  // de objeto ya sea del login o de GET /users/me.
  private buildAuthResponse(user: User) {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });
    return { accessToken, user: this.usersService.toSafeUser(user) };
  }
}
