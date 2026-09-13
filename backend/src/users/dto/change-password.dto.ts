import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  // Sin MinLength: la contraseña actual se valida contra el hash, no contra
  // una regla. Exigirle 8 caracteres delataría el formato de la guardada.
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8, {
    message: 'La nueva contraseña debe tener al menos 8 caracteres',
  })
  newPassword: string;
}
