import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { UrlService } from "./url.service.js";
import { longUrlSchema, type longUrlSchemaType } from "./dto/url.dto.js";

@Controller('url')
export class UrlController {

  constructor(private readonly URLService: UrlService){}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  getLongUrl(@Body({ schema: longUrlSchema }) longUrlSchema: longUrlSchemaType) {
    return this.URLService.createShortUrl(longUrlSchema)
  }
}
