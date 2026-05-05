import { createZodDto } from 'nestjs-zod';
import { UpdateRoomSchema } from './room.schema';

export class UpdateRoomDto extends createZodDto(UpdateRoomSchema) {}
