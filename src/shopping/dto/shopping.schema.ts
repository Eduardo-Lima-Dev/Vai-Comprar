import { z } from 'zod';

export const StartShoppingSchema = z.object({
  participantId: z.string().optional(),
});

export const FinishShoppingSchema = z.object({
  totalAmount: z.coerce.number().positive(),
  participantId: z.string().optional(),
});
