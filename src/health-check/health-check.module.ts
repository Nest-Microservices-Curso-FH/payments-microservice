import { Module } from '@nestjs/common';
import { HeathCheckController } from './heath-check.controller';

@Module({
  controllers: [HeathCheckController],
})
export class HealthCheckModule {}
