import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationTarget,
} from './schemas/notification.schema';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    private readonly gateway: NotificationsGateway,
  ) {}

  /**
   * Send & save real-time notification to a specific user
   */
  async notifyUser(data: {
    userId: string;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'alert' | 'credit';
    metadata?: Record<string, any>;
  }) {
    const doc = await this.notificationModel.create({
      title: data.title,
      message: data.message,
      target: NotificationTarget.USER,
      userId: data.userId,
      type: data.type || 'info',
      metadata: data.metadata || {},
    });

    // Emit live WebSocket notification without refresh
    this.gateway.sendUserNotification(data.userId, doc);
    return doc;
  }

  /**
   * Send & save real-time notification to Admin panel
   */
  async notifyAdmin(data: {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'alert' | 'lead';
    metadata?: Record<string, any>;
  }) {
    const doc = await this.notificationModel.create({
      title: data.title,
      message: data.message,
      target: NotificationTarget.ADMIN,
      type: data.type || 'info',
      metadata: data.metadata || {},
    });

    // Emit live WebSocket notification to admin room without refresh
    this.gateway.sendAdminNotification(doc);
    return doc;
  }

  /**
   * Broadcast platform-wide notification to everyone
   */
  async broadcastAnnouncement(title: string, message: string) {
    const doc = await this.notificationModel.create({
      title,
      message,
      target: NotificationTarget.ALL,
      type: 'info',
    });

    this.gateway.broadcastNotification(doc);
    return doc;
  }

  /**
   * Get unread notifications for a user
   */
  async getUserNotifications(userId: string) {
    return this.notificationModel
      .find({
        $or: [{ userId }, { target: NotificationTarget.ALL }],
      })
      .sort({ createdAt: -1 })
      .limit(30)
      .exec();
  }

  /**
   * Get notifications for admin
   */
  async getAdminNotifications() {
    return this.notificationModel
      .find({
        $or: [{ target: NotificationTarget.ADMIN }, { target: NotificationTarget.ALL }],
      })
      .sort({ createdAt: -1 })
      .limit(30)
      .exec();
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string) {
    return this.notificationModel.findByIdAndUpdate(id, { isRead: true }, { new: true });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllUserAsRead(userId: string) {
    return this.notificationModel.updateMany(
      { $or: [{ userId }, { target: NotificationTarget.ALL }] },
      { isRead: true },
    );
  }

  /**
   * Mark all notifications as read for admin
   */
  async markAllAdminAsRead() {
    return this.notificationModel.updateMany(
      { $or: [{ target: NotificationTarget.ADMIN }, { target: NotificationTarget.ALL }] },
      { isRead: true },
    );
  }
}
