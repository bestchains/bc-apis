import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { GetTokenDto } from './common/models/get-token.dto';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/health')
  health(): string {
    return this.appService.getHello();
  }

  @Get('/login')
  @Redirect()
  login(@Query('redirect_uri') redirect_uri: string) {
    const redirectUrl = this.appService.getOidcAuthUrl(redirect_uri);
    return {
      url: redirectUrl,
      statusCode: 303,
    };
  }

  @Post('/token')
  async token(@Body() tokenDto: GetTokenDto) {
    return this.appService.getOidcToken(tokenDto);
  }

  @Get(['/bc', '/bc/*'])
  oidcLogin(@Res() res: Response) {
    res.render('bc-public/index');
  }

  @Get('/configuration')
  async configuration() {
    return this.appService.getClientConfiguration();
  }
}
