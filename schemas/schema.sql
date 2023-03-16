--
-- PostgreSQL database dump
--

-- Dumped from database version 15.2 (Debian 15.2-1.pgdg110+1)
-- Dumped by pg_dump version 15.2 (Debian 15.2-1.pgdg110+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: private; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA private;


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: sync_tenants(); Type: FUNCTION; Schema: private; Owner: -
--

CREATE FUNCTION private.sync_tenants() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO public.tenants(slug, legacy_id)
  VALUES (NEW.slug, NEW.id)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
end;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: distributed_lock; Type: TABLE; Schema: private; Owner: -
--

CREATE TABLE private.distributed_lock (
    mutex character varying(36) NOT NULL,
    ts timestamp with time zone NOT NULL,
    node_id character varying(36) NOT NULL
);


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenants (
    slug text NOT NULL,
    legacy_id uuid,
    nionic_enabled boolean DEFAULT false
);


--
-- Name: TABLE tenants; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.tenants IS '@omit create,delete,upsert';


--
-- Name: COLUMN tenants.legacy_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tenants.legacy_id IS '@omit update';


--
-- Name: distributed_lock distributed_lock_pkey; Type: CONSTRAINT; Schema: private; Owner: -
--

ALTER TABLE ONLY private.distributed_lock
    ADD CONSTRAINT distributed_lock_pkey PRIMARY KEY (mutex);


--
-- Name: tenants tenants_legacy_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_legacy_id_key UNIQUE (legacy_id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (slug);


--
-- PostgreSQL database dump complete
--

