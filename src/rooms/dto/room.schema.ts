import { z } from 'zod';

export const CreateRoomSchema = z.object({
  name: z.string().min(1).max(80),
  plannedDate: z.coerce.date().optional(),
});

export const UpdateRoomSchema = CreateRoomSchema.partial();
