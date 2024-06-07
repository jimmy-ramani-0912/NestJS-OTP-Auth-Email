import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { MailDto } from './dto/mail.dto';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(mailDto: MailDto) {
    return await this.mailerService.sendMail({
      to: mailDto.email,
      subject: mailDto.subject,
      template: mailDto.template,
      context: mailDto.context,
    });
  }
}
