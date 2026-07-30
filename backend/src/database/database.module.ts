import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        return {
          uri,
          connectionFactory: (connection: Connection) => {
            if (connection.readyState === 1) {
              console.log('✅ MongoDB Atlas Connected');
            }
            connection.on('connected', () => {
              console.log('✅ MongoDB Atlas Connected');
            });
            connection.on('error', (err) => {
              console.error('❌ MongoDB Atlas Connection Error:', err);
            });
            return connection;
          },
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
