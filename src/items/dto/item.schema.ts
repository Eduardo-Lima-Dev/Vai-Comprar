import { z } from 'zod';

export const CategoryEnum = z.enum([
  'COMIDA',
  'LIMPEZA',
  'HIGIENE',
  'DIA_A_DIA',
  'BEBIDAS',
  'OUTROS',
]);

export const CreateItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.string().min(1),
  category: CategoryEnum.default('OUTROS'),
});

export const UpdateItemSchema = CreateItemSchema.partial().extend({
  status: z.enum(['PENDING', 'PURCHASED']).optional(),
});
