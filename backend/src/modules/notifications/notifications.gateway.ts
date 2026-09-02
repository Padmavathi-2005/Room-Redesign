import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to notifications gateway: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_user_room')
  handleJoinUserRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    if (data?.userId) {
      const room = `user_${data.userId}`;
      client.join(room);
      this.logger.log(`Client ${client.id} joined user room: ${room}`);
      return { status: 'joined', room };
    }
  }

  @SubscribeMessage('join_admin_room')
  handleJoinAdminRoom(@ConnectedSocket() client: Socket) {
    client.join('admin_room');
    this.logger.log(`Client ${client.id} joined admin notification room`);
    return { status: 'joined', room: 'admin_room' };
  }

  /**
   * Emit real-time notification to a specific user
   */
  sendUserNotification(userId: string, notification: any) {
    const room = `user_${userId}`;
    this.server.to(room).emit('new_notification', notification);
    this.logger.log(`Emitted real-time notification to ${room}`);
  }

  /**
   * Emit real-time notification to all logged-in admin users
   */
  sendAdminNotification(notification: any) {
    this.server.to('admin_room').emit('new_admin_notification', notification);
    this.logger.log(`Emitted real-time admin notification to admin_room`);
  }

  /**
   * Broadcast notification to all connected clients
   */
  broadcastNotification(notification: any) {
    this.server.emit('broadcast_notification', notification);
    this.logger.log(`Broadcasted real-time notification platform-wide`);
  }
}
