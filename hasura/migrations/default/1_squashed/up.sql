CREATE TABLE "public"."bills" ("id" text NOT NULL, "lastUpdate" timestamptz NOT NULL, "documentLink" text NOT NULL, "rawText" text NOT NULL, PRIMARY KEY ("id") , UNIQUE ("id"));
CREATE TABLE "public"."descriptions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "billD" text NOT NULL, "simplified_long" text NOT NULL, "simplified_short" text NOT NULL, "tags" text NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("billD") REFERENCES "public"."bills"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("id"));
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."arguments" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "billID" text NOT NULL, "position" text NOT NULL, "argument" text NOT NULL, "parent" uuid NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("billID") REFERENCES "public"."bills"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("id"));
CREATE EXTENSION IF NOT EXISTS pgcrypto;
alter table "public"."descriptions" add constraint "descriptions_billD_key" unique ("billD");
alter table "public"."arguments" rename column "parent" to "parentID";
alter table "public"."arguments" alter column "parentID" drop not null;
alter table "public"."arguments" add column "createdAt" timestamptz
 null default now();
alter table "public"."arguments" alter column "createdAt" set not null;
