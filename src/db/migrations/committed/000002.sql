--! Previous: sha1:3cadc3a22cfc3af2e5388ac368f4cf5d993486a1
--! Hash: sha1:c6721d2a335b023f289945015b6d23afba10430b

ALTER TABLE tenants ADD name TEXT NULL;

UPDATE tenants AS t SET name = o.name
FROM contxt.organizations o
WHERE o.slug = t.slug
;

ALTER TABLE tenants ALTER COLUMN name SET NOT NULL;

CREATE OR REPLACE FUNCTION private.sync_tenants() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO public.tenants(slug, legacy_id, name)
  VALUES (NEW.slug, NEW.id, NEW.name)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
end;
$$;

DROP TRIGGER IF EXISTS after_insert_or_update_trigger ON contxt.organizations;
CREATE TRIGGER after_insert_or_update_trigger
	BEFORE INSERT OR UPDATE ON contxt.organizations
	FOR EACH ROW
	EXECUTE FUNCTION private.sync_tenants();
