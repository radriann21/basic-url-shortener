CREATE TABLE "clicks" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "clicks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"url_id" bigint NOT NULL,
	"ip_address" inet,
	"user_agent" text,
	"referer" text,
	"country_code" varchar(3),
	"clicked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "urls" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "urls_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"long_url" text NOT NULL,
	"slug" varchar(10) NOT NULL CONSTRAINT "idx_urls_slug" UNIQUE,
	"expires_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_clicks_url_id" ON "clicks" ("url_id");--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_url_id_urls_id_fkey" FOREIGN KEY ("url_id") REFERENCES "urls"("id");