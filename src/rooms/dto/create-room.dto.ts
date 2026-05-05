import { createZodDto } from 'nestjs-zod';
import { CreateRoomSchema } from './room.schema';

export class CreateRoomDto extends createZodDto(CreateRoomSchema) {}
