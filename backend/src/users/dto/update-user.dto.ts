import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

// ~1.5 MB de imagen real una vez decodificada. Un avatar redimensionado
// pesa unos 30 KB, así que sobra — es un tope contra payloads abusivos.
const MAX_AVATAR_CHARS = 2_000_000;

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^data:image\/(jpeg|png|webp);base64,/, {
    message: 'La imagen debe ser JPEG, PNG o WebP',
  })
  @MaxLength(MAX_AVATAR_CHARS, { message: 'La imagen es demasiado grande' })
  avatar?: string;
}
