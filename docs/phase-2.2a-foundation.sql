-- LOCAL MIGRATION DRAFT: NOT APPLIED. CLI scaffolding pending (local CLI timed out).
-- Review against the actual schema before promotion to supabase/migrations.
-- No financial tables/functions or existing rows are changed.
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE public.upload_sessions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 seller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
 request_key uuid NOT NULL,
 state text NOT NULL DEFAULT 'open' CHECK (state IN ('open','uncertain','closed')),
 created_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL DEFAULT now() + interval '24 hours',
 UNIQUE(seller_id,request_key), UNIQUE(id,seller_id)
);
CREATE TABLE public.upload_assets (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 session_id uuid NOT NULL, seller_id uuid NOT NULL,
 file_key uuid NOT NULL, bucket text NOT NULL CHECK (bucket IN ('products','products-images')),
 path text NOT NULL, name text NOT NULL CHECK (length(name) BETWEEN 1 AND 255),
 size_bytes bigint NOT NULL CHECK (size_bytes BETWEEN 1 AND 4186112),
 mime text NOT NULL CHECK (mime IN ('application/pdf','application/zip','video/mp4','image/png','image/jpeg','image/webp')),
 sha256 text NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
 state text NOT NULL DEFAULT 'reserved' CHECK (state IN ('reserved','uncertain','verified')),
 verified_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(session_id,seller_id) REFERENCES public.upload_sessions(id,seller_id) ON DELETE RESTRICT,
 UNIQUE(session_id,file_key), UNIQUE(bucket,path), UNIQUE(id,seller_id),
 CHECK(path = seller_id::text || '/' || id::text),
 CHECK((state='verified') = (verified_at IS NOT NULL)),
 CHECK(bucket <> 'products-images' OR mime IN ('image/png','image/jpeg','image/webp'))
);
CREATE TABLE public.product_delivery_versions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
 seller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
 sequence integer NOT NULL CHECK(sequence > 0),
 delivery_kind text NOT NULL CHECK(delivery_kind IN ('pdf','ebook','bundle')),
 title text NOT NULL CHECK(length(btrim(title)) BETWEEN 1 AND 200), description text,
 state text NOT NULL DEFAULT 'draft' CHECK(state IN ('draft','published')),
 published_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(product_id,sequence), UNIQUE(id,seller_id), UNIQUE(id,product_id,seller_id),
 CHECK((state='published') = (published_at IS NOT NULL))
);
CREATE TABLE public.delivery_version_files (
 version_id uuid NOT NULL, seller_id uuid NOT NULL, asset_id uuid NOT NULL,
 position integer NOT NULL CHECK(position BETWEEN 0 AND 99),
 PRIMARY KEY(version_id,position), UNIQUE(version_id,asset_id),
 FOREIGN KEY(version_id,seller_id) REFERENCES public.product_delivery_versions(id,seller_id) ON DELETE RESTRICT,
 FOREIGN KEY(asset_id,seller_id) REFERENCES public.upload_assets(id,seller_id) ON DELETE RESTRICT
);
CREATE TABLE public.product_delivery_heads (
 product_id uuid PRIMARY KEY REFERENCES public.products(id) ON DELETE RESTRICT,
 seller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
 version_id uuid NOT NULL,
 revision integer NOT NULL CHECK(revision > 0),
 FOREIGN KEY(version_id,product_id,seller_id) REFERENCES public.product_delivery_versions(id,product_id,seller_id) ON DELETE RESTRICT
);
CREATE TABLE public.product_create_requests (
 seller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
 request_key uuid NOT NULL, payload jsonb NOT NULL,
 product_id uuid REFERENCES public.products(id) ON DELETE RESTRICT,
 checkout_id uuid REFERENCES public.products_checkout(id) ON DELETE RESTRICT,
 version_id uuid REFERENCES public.product_delivery_versions(id) ON DELETE RESTRICT,
 created_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz,
 PRIMARY KEY(seller_id,request_key), UNIQUE(product_id), UNIQUE(checkout_id),
 CHECK((completed_at IS NULL AND product_id IS NULL AND checkout_id IS NULL AND version_id IS NULL)
 OR (completed_at IS NOT NULL AND product_id IS NOT NULL AND checkout_id IS NOT NULL AND version_id IS NOT NULL))
);

-- No direct client access, including metadata/path SELECT. Service-only RPC boundary.
ALTER TABLE public.upload_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_delivery_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_version_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_delivery_heads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_create_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.upload_sessions,public.upload_assets,public.product_delivery_versions,
 public.delivery_version_files,public.product_delivery_heads,public.product_create_requests FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON public.upload_sessions,public.upload_assets,public.product_delivery_versions,
 public.delivery_version_files,public.product_delivery_heads,public.product_create_requests TO service_role;
REVOKE DELETE,TRUNCATE ON public.upload_sessions,public.upload_assets,public.product_delivery_versions,
 public.delivery_version_files,public.product_delivery_heads,public.product_create_requests FROM service_role;
CREATE INDEX foundation_assets_owner ON public.upload_assets(seller_id,session_id);
CREATE INDEX foundation_files_asset ON public.delivery_version_files(asset_id);
CREATE INDEX foundation_versions_owner ON public.product_delivery_versions(seller_id,product_id);

CREATE FUNCTION public.foundation_guard_version() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'FOUNDATION_IMMUTABLE'; END IF;
 IF TG_OP='UPDATE' AND (OLD.state='published' OR NEW.id<>OLD.id OR NEW.product_id<>OLD.product_id
   OR NEW.seller_id<>OLD.seller_id OR NEW.sequence<>OLD.sequence) THEN RAISE EXCEPTION 'FOUNDATION_IMMUTABLE'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.products WHERE id=NEW.product_id AND user_id=NEW.seller_id) THEN
   RAISE EXCEPTION 'FOUNDATION_FORBIDDEN'; END IF;
 IF NEW.state='published' THEN
   IF NOT EXISTS(SELECT 1 FROM public.delivery_version_files WHERE version_id=NEW.id) THEN RAISE EXCEPTION 'FOUNDATION_EMPTY'; END IF;
   IF (SELECT max(position)+1<>count(*) FROM public.delivery_version_files WHERE version_id=NEW.id) THEN
     RAISE EXCEPTION 'FOUNDATION_INVALID_FILES'; END IF;
   IF NEW.delivery_kind<>'bundle' AND (SELECT count(*) FROM public.delivery_version_files WHERE version_id=NEW.id)<>1 THEN
     RAISE EXCEPTION 'FOUNDATION_INVALID_FILES'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER foundation_version_guard BEFORE INSERT OR UPDATE OR DELETE ON public.product_delivery_versions
 FOR EACH ROW EXECUTE FUNCTION public.foundation_guard_version();

CREATE FUNCTION public.foundation_guard_file() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v public.product_delivery_versions; a public.upload_assets;
BEGIN
 IF TG_OP<>'INSERT' THEN RAISE EXCEPTION 'FOUNDATION_IMMUTABLE'; END IF;
 SELECT * INTO v FROM public.product_delivery_versions WHERE id=NEW.version_id FOR UPDATE;
 IF v.id IS NULL OR v.state<>'draft' OR v.seller_id<>NEW.seller_id THEN RAISE EXCEPTION 'FOUNDATION_IMMUTABLE'; END IF;
 SELECT * INTO a FROM public.upload_assets WHERE id=NEW.asset_id FOR UPDATE;
 IF a.id IS NULL OR a.seller_id<>NEW.seller_id OR a.state<>'verified' OR a.bucket<>'products' THEN RAISE EXCEPTION 'FOUNDATION_FORBIDDEN'; END IF;
 IF (v.delivery_kind='pdf' AND a.mime<>'application/pdf') OR
 (v.delivery_kind='ebook' AND a.mime NOT IN ('application/pdf','application/zip')) THEN RAISE EXCEPTION 'FOUNDATION_INVALID_FILES'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER foundation_file_guard BEFORE INSERT OR UPDATE OR DELETE ON public.delivery_version_files
 FOR EACH ROW EXECUTE FUNCTION public.foundation_guard_file();

CREATE FUNCTION public.foundation_guard_asset() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'FOUNDATION_IMMUTABLE'; END IF;
 IF (to_jsonb(NEW)-'state'-'verified_at') IS DISTINCT FROM (to_jsonb(OLD)-'state'-'verified_at')
 OR OLD.state='verified' THEN RAISE EXCEPTION 'FOUNDATION_IMMUTABLE'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER foundation_asset_guard BEFORE UPDATE OR DELETE ON public.upload_assets
 FOR EACH ROW EXECUTE FUNCTION public.foundation_guard_asset();

CREATE FUNCTION public.foundation_guard_head() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'FOUNDATION_IMMUTABLE'; END IF;
 IF TG_OP='UPDATE' AND (NEW.product_id<>OLD.product_id OR NEW.seller_id<>OLD.seller_id OR NEW.revision<>OLD.revision+1) THEN
   RAISE EXCEPTION 'FOUNDATION_CONFLICT'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.product_delivery_versions v JOIN public.products p ON p.id=v.product_id
 WHERE v.id=NEW.version_id AND v.product_id=NEW.product_id AND v.seller_id=NEW.seller_id
 AND p.user_id=NEW.seller_id AND v.state='published') THEN RAISE EXCEPTION 'FOUNDATION_FORBIDDEN'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER foundation_head_guard BEFORE INSERT OR UPDATE OR DELETE ON public.product_delivery_heads
 FOR EACH ROW EXECUTE FUNCTION public.foundation_guard_head();

CREATE FUNCTION public.foundation_guard_request() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'FOUNDATION_IMMUTABLE'; END IF;
 IF OLD.completed_at IS NOT NULL OR NEW.seller_id<>OLD.seller_id OR NEW.request_key<>OLD.request_key
 OR NEW.payload IS DISTINCT FROM OLD.payload OR NEW.created_at<>OLD.created_at THEN RAISE EXCEPTION 'FOUNDATION_IMMUTABLE'; END IF;
 IF NEW.completed_at IS NOT NULL AND NOT EXISTS(
   SELECT 1 FROM public.products p JOIN public.products_checkout c ON c.product_id=p.id
   JOIN public.product_delivery_versions v ON v.product_id=p.id
   WHERE p.id=NEW.product_id AND p.user_id=NEW.seller_id AND c.id=NEW.checkout_id AND c.user_id=NEW.seller_id
   AND v.id=NEW.version_id AND v.seller_id=NEW.seller_id) THEN RAISE EXCEPTION 'FOUNDATION_FORBIDDEN'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER foundation_request_guard BEFORE UPDATE OR DELETE ON public.product_create_requests
 FOR EACH ROW EXECUTE FUNCTION public.foundation_guard_request();

CREATE FUNCTION public.foundation_upload_session(p_actor uuid,p_key uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE s public.upload_sessions;
BEGIN
 INSERT INTO public.upload_sessions(seller_id,request_key) VALUES(p_actor,p_key) ON CONFLICT(seller_id,request_key) DO NOTHING;
 SELECT * INTO s FROM public.upload_sessions WHERE seller_id=p_actor AND request_key=p_key;
 RETURN to_jsonb(s);
END $$;

CREATE FUNCTION public.foundation_reserve_asset(p_actor uuid,p_session uuid,p_key uuid,p_file jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE s public.upload_sessions; a public.upload_assets; asset uuid:=gen_random_uuid();
BEGIN
 SELECT * INTO s FROM public.upload_sessions WHERE id=p_session AND seller_id=p_actor FOR UPDATE;
 IF s.id IS NULL THEN RAISE EXCEPTION 'FOUNDATION_FORBIDDEN'; END IF;
 SELECT * INTO a FROM public.upload_assets WHERE session_id=p_session AND file_key=p_key;
 IF a.id IS NOT NULL THEN
   IF a.name IS DISTINCT FROM p_file->>'name' OR a.size_bytes IS DISTINCT FROM (p_file->>'size')::bigint
   OR a.mime IS DISTINCT FROM p_file->>'mime' OR a.sha256 IS DISTINCT FROM p_file->>'sha256'
   OR a.bucket IS DISTINCT FROM p_file->>'bucket' THEN RAISE EXCEPTION 'FOUNDATION_CONFLICT'; END IF;
   RETURN to_jsonb(a);
 END IF;
 IF s.state<>'open' OR s.expires_at<=now() THEN RAISE EXCEPTION 'FOUNDATION_SESSION_CLOSED'; END IF;
 INSERT INTO public.upload_assets(id,session_id,seller_id,file_key,bucket,path,name,size_bytes,mime,sha256)
 VALUES(asset,p_session,p_actor,p_key,p_file->>'bucket',p_actor::text||'/'||asset::text,p_file->>'name',
 (p_file->>'size')::bigint,p_file->>'mime',p_file->>'sha256') RETURNING * INTO a;
 RETURN to_jsonb(a);
END $$;

-- Evidence supplied ONLY by the trusted server verifier, never by an HTTP caller.
CREATE FUNCTION public.foundation_confirm_asset(p_actor uuid,p_asset uuid,p_evidence jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE a public.upload_assets;
BEGIN
 SELECT * INTO a FROM public.upload_assets WHERE id=p_asset AND seller_id=p_actor FOR UPDATE;
 IF a.id IS NULL THEN RAISE EXCEPTION 'FOUNDATION_FORBIDDEN'; END IF;
 IF p_evidence->>'owner' IS DISTINCT FROM p_actor::text OR p_evidence->>'bucket' IS DISTINCT FROM a.bucket
 OR p_evidence->>'path' IS DISTINCT FROM a.path OR p_evidence->>'sha256' IS DISTINCT FROM a.sha256
 OR (p_evidence->>'size')::bigint IS DISTINCT FROM a.size_bytes OR p_evidence->>'mime' IS DISTINCT FROM a.mime THEN
   RAISE EXCEPTION 'FOUNDATION_EVIDENCE_MISMATCH'; END IF;
 IF a.state<>'verified' THEN UPDATE public.upload_assets SET state='verified',verified_at=now() WHERE id=a.id RETURNING * INTO a; END IF;
 RETURN to_jsonb(a);
END $$;

CREATE FUNCTION public.foundation_asset_status(p_actor uuid,p_asset uuid,p_uncertain boolean DEFAULT false) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE a public.upload_assets;
BEGIN
 SELECT * INTO a FROM public.upload_assets WHERE id=p_asset AND seller_id=p_actor FOR UPDATE;
 IF a.id IS NULL THEN RAISE EXCEPTION 'FOUNDATION_FORBIDDEN'; END IF;
 IF p_uncertain AND a.state='reserved' THEN UPDATE public.upload_assets SET state='uncertain' WHERE id=a.id RETURNING * INTO a; END IF;
 RETURN to_jsonb(a);
END $$;

CREATE FUNCTION public.foundation_new_draft(p_actor uuid,p_product uuid,p_kind text,p_title text,p_description text,p_assets uuid[]) RETURNS uuid
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v uuid; seq integer;
BEGIN
 PERFORM 1 FROM public.products WHERE id=p_product AND user_id=p_actor FOR UPDATE;
 IF NOT FOUND OR NOT EXISTS(SELECT 1 FROM public.product_create_requests WHERE seller_id=p_actor AND product_id=p_product AND completed_at IS NOT NULL) THEN
   RAISE EXCEPTION 'FOUNDATION_LEGACY_BLOCKED'; END IF;
 IF cardinality(p_assets) IS NULL OR cardinality(p_assets) NOT BETWEEN 1 AND 100
 OR (p_kind<>'bundle' AND cardinality(p_assets)<>1) THEN RAISE EXCEPTION 'FOUNDATION_INVALID_FILES'; END IF;
 -- Stable asset lock ordering for shared assets in concurrent drafts.
 PERFORM 1 FROM public.upload_assets WHERE id=ANY(p_assets) ORDER BY id FOR UPDATE;
 SELECT coalesce(max(sequence),0)+1 INTO seq FROM public.product_delivery_versions WHERE product_id=p_product;
 INSERT INTO public.product_delivery_versions(product_id,seller_id,sequence,delivery_kind,title,description)
 VALUES(p_product,p_actor,seq,p_kind,p_title,p_description) RETURNING id INTO v;
 INSERT INTO public.delivery_version_files(version_id,seller_id,asset_id,position)
 SELECT v,p_actor,a,ordinality::integer-1 FROM unnest(p_assets) WITH ORDINALITY AS f(a,ordinality);
 RETURN v;
END $$;

CREATE FUNCTION public.foundation_publish(p_actor uuid,p_version uuid,p_expected_revision integer) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v public.product_delivery_versions; h public.product_delivery_heads;
BEGIN
 SELECT * INTO v FROM public.product_delivery_versions WHERE id=p_version AND seller_id=p_actor;
 IF v.id IS NULL THEN RAISE EXCEPTION 'FOUNDATION_FORBIDDEN'; END IF;
 PERFORM 1 FROM public.products WHERE id=v.product_id AND user_id=p_actor FOR UPDATE;
 IF NOT FOUND OR NOT EXISTS(SELECT 1 FROM public.product_create_requests WHERE seller_id=p_actor AND product_id=v.product_id AND completed_at IS NOT NULL) THEN
   RAISE EXCEPTION 'FOUNDATION_LEGACY_BLOCKED'; END IF;
 SELECT * INTO v FROM public.product_delivery_versions WHERE id=p_version FOR UPDATE;
 SELECT * INTO h FROM public.product_delivery_heads WHERE product_id=v.product_id FOR UPDATE;
 IF h.version_id=p_version AND h.revision=p_expected_revision+1 THEN RETURN to_jsonb(h); END IF;
 IF p_expected_revision IS NULL OR coalesce(h.revision,0)<>p_expected_revision OR v.state<>'draft' THEN RAISE EXCEPTION 'FOUNDATION_CONFLICT'; END IF;
 UPDATE public.product_delivery_versions SET state='published',published_at=now() WHERE id=v.id;
 INSERT INTO public.product_delivery_heads(product_id,seller_id,version_id,revision) VALUES(v.product_id,p_actor,v.id,1)
 ON CONFLICT(product_id) DO UPDATE SET version_id=EXCLUDED.version_id,revision=public.product_delivery_heads.revision+1 RETURNING * INTO h;
 -- Deliberately no UPDATE of products/products_checkout, activation or financial call.
 RETURN to_jsonb(h);
END $$;

CREATE FUNCTION public.foundation_create_product(p_actor uuid,p_key uuid,p_payload jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE r public.product_create_requests; pid uuid; cid uuid; vid uuid; assets uuid[];
BEGIN
 IF p_payload->>'contract' IS DISTINCT FROM '1' OR p_payload->>'kind' NOT IN ('pdf','ebook','bundle')
 OR p_payload->>'price' IS NULL OR (p_payload->>'price') !~ '^[0-9]+(\.[0-9]{1,2})?$'
 OR (p_payload->>'price')::numeric<=0 OR length(btrim(p_payload->>'title')) NOT BETWEEN 1 AND 200 THEN
   RAISE EXCEPTION 'FOUNDATION_INVALID_INPUT'; END IF;
 INSERT INTO public.product_create_requests(seller_id,request_key,payload) VALUES(p_actor,p_key,p_payload)
 ON CONFLICT(seller_id,request_key) DO NOTHING;
 SELECT * INTO r FROM public.product_create_requests WHERE seller_id=p_actor AND request_key=p_key FOR UPDATE;
 IF r.payload IS DISTINCT FROM p_payload THEN RAISE EXCEPTION 'FOUNDATION_CONFLICT'; END IF;
 IF r.completed_at IS NOT NULL THEN RETURN jsonb_build_object('productId',r.product_id,'checkoutId',r.checkout_id,'versionId',r.version_id,'replayed',true); END IF;
 SELECT array_agg(value::uuid ORDER BY ordinality) INTO assets FROM jsonb_array_elements_text(p_payload->'assetIds') WITH ORDINALITY;
 IF cardinality(assets) IS NULL OR cardinality(assets) NOT BETWEEN 1 AND 100
 OR (p_payload->>'kind'<>'bundle' AND cardinality(assets)<>1) THEN RAISE EXCEPTION 'FOUNDATION_INVALID_FILES'; END IF;
 PERFORM 1 FROM public.upload_assets WHERE id=ANY(assets) ORDER BY id FOR UPDATE;
 INSERT INTO public.products(user_id,title,price,image_url,type,file_path)
 VALUES(p_actor,p_payload->>'title',p_payload->>'price',NULL,p_payload->>'kind',NULL) RETURNING id INTO pid;
 -- New commercial representation is withheld, never offered for sale in this phase.
 INSERT INTO public.products_checkout(user_id,product_id,title,description,price,type,checkout_slug,status,is_active,is_marketplace,file_path)
 VALUES(p_actor,pid,p_payload->>'title',p_payload->>'description',(p_payload->>'price')::numeric,
 p_payload->>'kind','foundation-'||pid::text,'draft',false,false,NULL) RETURNING id INTO cid;
 INSERT INTO public.product_delivery_versions(product_id,seller_id,sequence,delivery_kind,title,description)
 VALUES(pid,p_actor,1,p_payload->>'kind',p_payload->>'title',p_payload->>'description') RETURNING id INTO vid;
 INSERT INTO public.delivery_version_files(version_id,seller_id,asset_id,position)
 SELECT vid,p_actor,a,ordinality::integer-1 FROM unnest(assets) WITH ORDINALITY AS f(a,ordinality);
 UPDATE public.product_create_requests SET product_id=pid,checkout_id=cid,version_id=vid,completed_at=now()
 WHERE seller_id=p_actor AND request_key=p_key;
 RETURN jsonb_build_object('productId',pid,'checkoutId',cid,'versionId',vid,'replayed',false);
END $$;

CREATE FUNCTION public.foundation_create_status(p_actor uuid,p_key uuid) RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT jsonb_build_object('productId',product_id,'checkoutId',checkout_id,'versionId',version_id,'replayed',true)
 FROM public.product_create_requests WHERE seller_id=p_actor AND request_key=p_key AND completed_at IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION public.foundation_guard_version(),public.foundation_guard_file(),public.foundation_guard_asset(),public.foundation_guard_head(),public.foundation_guard_request(),
 public.foundation_upload_session(uuid,uuid),public.foundation_reserve_asset(uuid,uuid,uuid,jsonb),
 public.foundation_confirm_asset(uuid,uuid,jsonb),public.foundation_asset_status(uuid,uuid,boolean),
 public.foundation_new_draft(uuid,uuid,text,text,text,uuid[]),public.foundation_publish(uuid,uuid,integer),
 public.foundation_create_product(uuid,uuid,jsonb),public.foundation_create_status(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.foundation_upload_session(uuid,uuid),public.foundation_reserve_asset(uuid,uuid,uuid,jsonb),
 public.foundation_confirm_asset(uuid,uuid,jsonb),public.foundation_asset_status(uuid,uuid,boolean),
 public.foundation_new_draft(uuid,uuid,text,text,text,uuid[]),public.foundation_publish(uuid,uuid,integer),
 public.foundation_create_product(uuid,uuid,jsonb),public.foundation_create_status(uuid,uuid) TO service_role;
COMMIT;
