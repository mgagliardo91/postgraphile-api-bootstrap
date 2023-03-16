--! Previous: -
--! Hash: sha1:3cadc3a22cfc3af2e5388ac368f4cf5d993486a1

CREATE SCHEMA IF NOT EXISTS private;

DO $$
BEGIN
IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'contxt') THEN
  CREATE SCHEMA IF NOT EXISTS contxt;
  CREATE TABLE contxt.organizations (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    slug character varying(255) NOT NULL
  );

  ALTER TABLE contxt.organizations
  ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);
  END IF;
END$$;

DROP TABLE IF EXISTS tenants;
CREATE TABLE tenants(
  slug TEXT PRIMARY KEY,
  legacy_id UUID UNIQUE,
  nionic_enabled BOOLEAN DEFAULT FALSE
);

COMMENT ON TABLE tenants IS E'@omit create,delete,upsert';
COMMENT ON COLUMN tenants.legacy_id IS E'@omit update';

CREATE OR REPLACE FUNCTION private.sync_tenants() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO public.tenants(slug, legacy_id)
  VALUES (NEW.slug, NEW.id)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
end;
$$;

DROP TRIGGER IF EXISTS after_insert_or_update_trigger ON contxt.organizations;
CREATE TRIGGER after_insert_or_update_trigger
	BEFORE INSERT OR UPDATE ON contxt.organizations
	FOR EACH ROW
	EXECUTE FUNCTION private.sync_tenants();

INSERT INTO tenants(slug, legacy_id)
SELECT slug, id FROM contxt.organizations;
