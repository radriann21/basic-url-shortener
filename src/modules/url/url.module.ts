import { Module } from "@nestjs/common";
import { UrlService } from "./url.service.js";
import { UrlController } from "./url.controller.js"
import { UrlRepository } from "./repositories/url.repository.js";
import { ConfigModule } from "@nestjs/config"

@Module({
  imports: [ConfigModule],
  controllers: [UrlController],
  providers: [UrlService, UrlRepository]
})
export class URLModule {}
