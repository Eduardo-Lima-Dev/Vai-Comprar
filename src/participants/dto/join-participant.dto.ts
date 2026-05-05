import { createZodDto } from 'nestjs-zod';
import { JoinParticipantSchema } from './participant.schema';

export class JoinParticipantDto extends createZodDto(JoinParticipantSchema) {}
