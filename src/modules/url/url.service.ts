import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type longUrlSchemaType } from './dto/url.dto.js';
import { UrlRepository } from './repositories/url.repository.js';
import { generateSlug } from './utils/slug.js';

const MAX_SLUG_ATTEMPTS = 3;

@Injectable()
export class UrlService {
  private readonly logger = new Logger(UrlService.name);

  constructor(
    private readonly urlRepository: UrlRepository,
    private readonly config: ConfigService,
  ) {}

  async createShortUrl(url: longUrlSchemaType) {
    for (let attempt = 1; attempt <= MAX_SLUG_ATTEMPTS; attempt += 1) {
      const row = await this.urlRepository.createUrlRegister({
        longUrl: url.url,
        slug: generateSlug(),
        expiresAt: url.expiresAt,
      });

      if (row) {
        return {
          slug: row.slug,
          shortUrl: `${this.config.getOrThrow<string>('webUrl')}/${row.slug}`,
        };
      }

      this.logger.warn(
        `Slug collision, retrying (${attempt}/${MAX_SLUG_ATTEMPTS})`,
      );
    }

    throw new InternalServerErrorException('No se pudo generar un slug libre.');
  }
}
