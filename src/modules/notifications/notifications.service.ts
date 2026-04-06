import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private enabled = false;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const serviceAccountPath = this.configService.get<string>(
      'FIREBASE_SERVICE_ACCOUNT',
    );
    if (serviceAccountPath) {
      try {
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPath),
          });
        }
        this.enabled = true;
        this.logger.log('Firebase Admin initialized');
      } catch (err) {
        this.logger.warn('Firebase Admin init failed, push disabled', err);
      }
    } else {
      this.logger.warn(
        'FIREBASE_SERVICE_ACCOUNT not set — push notifications disabled',
      );
    }
  }

  async sendToUser(fcmToken: string, title: string, body: string) {
    if (!this.enabled || !fcmToken) return;

    try {
      await admin.messaging().send({
        token: fcmToken,
        notification: { title, body },
      });
    } catch (err) {
      this.logger.warn(`FCM send failed for token ${fcmToken.slice(0, 8)}...`, err);
    }
  }
}
