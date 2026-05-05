import { z } from 'zod';

export const JoinParticipantSchema = z.object({
  name: z.string().min(1).max(120),
});
