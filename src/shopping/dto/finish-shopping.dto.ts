import { createZodDto } from 'nestjs-zod';
import { FinishShoppingSchema } from './shopping.schema';

export class FinishShoppingDto extends createZodDto(FinishShoppingSchema) {}
