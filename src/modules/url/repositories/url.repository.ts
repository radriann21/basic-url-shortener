import { Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import type { Database } from '../../../database/database.types.js';
import { urls } from '../../../database/schema.js';

@Injectable()
export class UrlRepository {
  constructor(@InjectDrizzle() private readonly db: Database) {}

  /**
   * Returns the inserted row, or `undefined` when the slug is already taken, so
   * the caller decides whether to retry.
   */
  async createUrlRegister(data: {
    longUrl: string;
    slug: string;
    expiresAt: Date | undefined;
  }) {
    const [row] = await this.db
      .insert(urls)
      .values({
        long_url: data.longUrl,
        slug: data.slug,
        expires_at: data.expiresAt ?? null,
      })
      .onConflictDoNothing({ target: urls.slug })
      .returning({ id: urls.id, slug: urls.slug });

    return row;
  }
}
