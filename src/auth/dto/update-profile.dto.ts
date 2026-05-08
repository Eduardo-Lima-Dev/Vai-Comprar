import { createZodDto } from 'nestjs-zod';
import { UpdateProfileSchema } from './auth.schema';

export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}
