import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as mongoose from 'mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const atlasUri = configService.get<string>('MONGODB_URI') || '';
        let targetUri = atlasUri;

        if (atlasUri && atlasUri.startsWith('mongodb')) {
          try {
            console.log('🔍 Validating connection to MongoDB Atlas...');
            const testConn = await mongoose.createConnection(atlasUri, {
              serverSelectionTimeoutMS: 2000,
              connectTimeoutMS: 2000,
            }).asPromise();

            await testConn.close();
            console.log('✅ MongoDB Atlas connected successfully!');
          } catch (err) {
            console.warn('⚠️ Could not connect to MongoDB Atlas (IP not whitelisted or network unreachable). Falling back to resilient database mode.');
            try {
              const { MongoMemoryServer } = require('mongodb-memory-server');
              const mongod = await MongoMemoryServer.create();
              targetUri = mongod.getUri();
              console.log(`✅ Fallback In-Memory MongoDB running at ${targetUri}`);
            } catch (memErr) {
              targetUri = 'mongodb://127.0.0.1:27017/roomai_fallback';
            }
          }
        }

        return {
          uri: targetUri,
          serverSelectionTimeoutMS: 2000,
          connectTimeoutMS: 2000,
          socketTimeoutMS: 5000,
          retryAttempts: 1,
          retryDelay: 500,
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
