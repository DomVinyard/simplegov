CREATE TABLE "public"."descriptions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "billID" text NOT NULL, "simplified_long" text NOT NULL, "simplified_short" text NOT NULL, "tags" text NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("billID") REFERENCES "public"."bills"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("id"));
CREATE EXTENSION IF NOT EXISTS pgcrypto;
