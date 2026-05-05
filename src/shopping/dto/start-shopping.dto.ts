import { createZodDto } from 'nestjs-zod';
import { StartShoppingSchema } from './shopping.schema';

export class StartShoppingDto extends createZodDto(StartShoppingSchema) {}
