alter table "public"."bills" add column "govData" jsonb
 not null default '{}';
