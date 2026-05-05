import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Room } from '@prisma/client';
import { ROOM_REQUEST_KEY } from '../constants';

type RequestWithRoom = Record<string, unknown> & {
  [ROOM_REQUEST_KEY]: Room;
};

export const CurrentRoom = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Room => {
    const req = ctx.switchToHttp().getRequest<RequestWithRoom>();
    return req[ROOM_REQUEST_KEY];
  },
);
