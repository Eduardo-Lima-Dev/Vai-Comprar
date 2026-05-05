import { createZodDto } from 'nestjs-zod';
import { CreateItemSchema } from './item.schema';

export class CreateItemDto extends createZodDto(CreateItemSchema) {}
