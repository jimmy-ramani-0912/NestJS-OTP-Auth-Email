import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailDto } from './dto/mail.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  async sendMailTest(@Body() mailDto: MailDto) {
    return await this.emailService.sendEmail(mailDto);
  }
}
