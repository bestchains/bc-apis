import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/health')
  health(): string {
    return this.appService.getHello();
  }

  // 1. 前端判断token不存在，调用/login
  @Get('/login')
  @Redirect()
  login() {
    const redirectUrl = this.appService.getOidcAuthUrl();
    return {
      url: redirectUrl,
      statusCode: 303,
    };
  }

  // 2. localhost:8000/?code 存在code时，就去调用/token?code
  // 3. 得到token，存入local storage
  @Get('/token')
  async token(@Query('code') code: string) {
    const token = await this.appService.getOidcToken(code);
    const { preferred_username } = this.appService.decodeToken(token.id_token);
    await this.appService.updateUserGroup({
      name: preferred_username,
      token: token.id_token,
      tokenType: token.token_type,
    });
    return token;
  }
}
