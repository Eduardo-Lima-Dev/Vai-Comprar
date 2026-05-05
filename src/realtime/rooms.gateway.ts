import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/rooms',
  cors: { origin: '*' },
})
export class RoomsGateway {
  private readonly logger = new Logger(RoomsGateway.name);

  @WebSocketServer()
  server!: Server;

  emitToRoom(slug: string, event: string, payload: unknown): void {
    this.server.to(slug).emit(event, payload);
  }

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { slug?: string },
  ): { ok: boolean; error?: string } {
    const slug = body?.slug;
    if (!slug || typeof slug !== 'string') {
      return { ok: false, error: 'slug é obrigatório' };
    }
    void client.join(slug);
    this.logger.debug(`Cliente ${client.id} entrou na sala ${slug}`);
    return { ok: true };
  }
}
