import { Body, Controller, Get, Post, Query, Redirect } from '@nestjs/common';
import { AppService } from './app.service';
import { GetTokenDto } from './common/models/get-token.dto';

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
}
