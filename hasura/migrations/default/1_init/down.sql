
alter table "public"."arguments" alter column "createdAt" drop not null;

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."arguments" add column "createdAt" timestamptz
--  null default now();

alter table "public"."arguments" alter column "parentID" set not null;

alter table "public"."arguments" rename column "parentID" to "parent";

alter table "public"."descriptions" drop constraint "descriptions_billID_key";

DROP TABLE "public"."arguments";

DROP TABLE "public"."descriptions";

DROP TABLE "public"."bills";
