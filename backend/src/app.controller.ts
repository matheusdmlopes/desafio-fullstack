import { Controller, Get, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from './@shared/guards/jwtAuth.guard'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): any {
    return this.appService.getHello()
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard)
  async getAnalytics(): Promise<any> {
    return await this.appService.getComplexAnalytics()
  }
}
