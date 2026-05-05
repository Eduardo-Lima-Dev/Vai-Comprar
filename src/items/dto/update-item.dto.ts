import { createZodDto } from 'nestjs-zod';
import { UpdateItemSchema } from './item.schema';

export class UpdateItemDto extends createZodDto(UpdateItemSchema) {}
