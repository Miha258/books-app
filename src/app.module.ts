import { Module, OnApplicationBootstrap } from '@nestjs/common';
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
import { createConnection } from 'mysql2/promise';
import { BillingsModule } from './billings/billings.module';
import { PaynamentModule } from './paynament/paynament.module';
import * as fs from 'node:fs/promises';
import { ServeStaticModule } from '@nestjs/serve-static';

async function ensureDatabaseExists() {
  const connection = await createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
  });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_DATABASE}\`;`);
  await connection.end();
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        await ensureDatabaseExists();
        return {
          type: 'mysql',
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT, 10) || 3306,
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          autoLoadEntities: true,
          synchronize: true,
          entities: [join(__dirname, '**', '*.entity.{ts,js}')]
        };
      },
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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'files'),
      serveRoot: '/files',
      exclude: ['/api/(.*)'],
    }),
    ScheduleModule.forRoot(),
    JwtGlobalModule,
    UsersModule,
    QuestionsModule,
    CronModule,
    BooksModule,
    BillingsModule,
    PaynamentModule,
  ]
})
export class AppModule implements OnApplicationBootstrap {
  constructor() {}

  async onApplicationBootstrap() {
    const directoriesToCreate = ['books', 'media', 'pdf', 'voice', 'avatar'];
    for (const dir of directoriesToCreate) {
      try {
        await fs.access(`files/${dir}`);
      } catch (error) {
        await fs.mkdir(`files/${dir}`, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    }
  }
}