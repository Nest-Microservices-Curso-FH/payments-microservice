import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class HeathCheckController {
  @Get()
  healthCheck() {
    return 'Payments Webhook is up and running!!!';
  }
}
