import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { QuestionsModule } from './questions/questions.module';
import { JwtGlobalModule } from './auth/jwt.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { CronModule } from './crons/cron.module';
import { BooksModule } from './books/books.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
      entities: [join(__dirname, '**', '*.entity.{ts,js}')]
    }),
    MailerModule.forRoot({
      transport: {
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        }
      }
    }),
    ScheduleModule.forRoot(),
    JwtGlobalModule,
    UsersModule,
    QuestionsModule,
    CronModule,
    BooksModule
  ]
})
export class AppModule {}
