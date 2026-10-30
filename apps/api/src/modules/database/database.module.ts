import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { prismaClientProvider } from './prisma-client.provider';

@Module({
  providers: [prismaClientProvider, DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
