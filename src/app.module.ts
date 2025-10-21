import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { OpenaiController } from './app.controller';
import { OpenaiService } from './app.service';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }),], // Aseguramos que ConfigModule esté disponible
  controllers: [OpenaiController],
  providers: [OpenaiService],
})
export class OpenaiModule { }
