SET LOCAL lock_timeout = '5s';
-- Public projections deliberately expose an explicit allowlist, never private columns.
-- Definer views are intentional here: callers cannot read other profiles directly.
CREATE VIEW public.public_profiles WITH (security_barrier=true) AS
SELECT id,username,bio,avatar_url,theme_color,background_color,button_style,
instagram,telegram,whatsapp,featured_text,featured_url,product_text_color,template,
is_pro,background_style,card_style,font_style FROM public.profiles;
REVOKE ALL ON public.public_profiles FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.public_profiles TO anon,authenticated,service_role;
DROP POLICY "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY "Users can insert their own profile" ON public.profiles;
DROP POLICY "Users can update own profile" ON public.profiles;
DROP POLICY "Users can update own username" ON public.profiles;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY "Allow all inserts" ON public.products;
DROP POLICY "Allow delete products" ON public.products;
DROP POLICY "Allow read products" ON public.products;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY "Allow all" ON public.links;
DROP POLICY "Allow delete" ON public.links;
DROP POLICY "Allow insert" ON public.links;
DROP POLICY "Allow select" ON public.links;
DROP POLICY "Allow update" ON public.links;
DROP POLICY "Public links are viewable by everyone" ON public.links;
DROP POLICY "Users can delete own links" ON public.links;
DROP POLICY "Users can insert their own links" ON public.links;
DROP POLICY "Users can update own links" ON public.links;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_clicks_daily ENABLE ROW LEVEL SECURITY;
DROP POLICY "Public checkout read" ON public.products_checkout;
DROP POLICY "Users can delete own products" ON public.products_checkout;
DROP POLICY "Users can insert own products" ON public.products_checkout;
DROP POLICY "Users can update own products" ON public.products_checkout;
DROP POLICY "Users can view own products" ON public.products_checkout;
ALTER TABLE public.products_checkout ENABLE ROW LEVEL SECURITY;
DROP POLICY "Allow customers to view modules" ON public.course_modules;
DROP POLICY "Users can delete own modules" ON public.course_modules;
DROP POLICY "Users can insert own modules" ON public.course_modules;
DROP POLICY "Users can update own modules" ON public.course_modules;
DROP POLICY "Users can view own modules" ON public.course_modules;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
DROP POLICY "Customers can view purchased lessons" ON public.course_lessons;
DROP POLICY "Users can delete own lessons" ON public.course_lessons;
DROP POLICY "Users can insert own lessons" ON public.course_lessons;
DROP POLICY "Users can update own lessons" ON public.course_lessons;
DROP POLICY "Users can view own lessons" ON public.course_lessons;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY phase_a_profile_read ON public.profiles FOR SELECT TO authenticated USING (id=(SELECT auth.uid()));
CREATE POLICY phase_a_profile_insert ON public.profiles FOR INSERT TO authenticated WITH CHECK (id=(SELECT auth.uid()));
CREATE POLICY phase_a_profile_update ON public.profiles FOR UPDATE TO authenticated USING (id=(SELECT auth.uid())) WITH CHECK (id=(SELECT auth.uid()));
REVOKE ALL ON public.profiles FROM anon;
REVOKE DELETE ON public.profiles FROM authenticated;
REVOKE INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER ON public.products FROM PUBLIC,anon;
CREATE POLICY phase_a_public_read ON public.products FOR SELECT TO anon,authenticated USING (true);
CREATE POLICY phase_a_owner_insert ON public.products FOR INSERT TO authenticated WITH CHECK (user_id=(SELECT auth.uid()));
CREATE POLICY phase_a_owner_update ON public.products FOR UPDATE TO authenticated USING (user_id=(SELECT auth.uid())) WITH CHECK (user_id=(SELECT auth.uid()));
CREATE POLICY phase_a_owner_delete ON public.products FOR DELETE TO authenticated USING (user_id=(SELECT auth.uid()));
REVOKE INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER ON public.links FROM PUBLIC,anon;
CREATE POLICY phase_a_public_read ON public.links FOR SELECT TO anon,authenticated USING (true);
CREATE POLICY phase_a_owner_insert ON public.links FOR INSERT TO authenticated WITH CHECK (user_id=(SELECT auth.uid()));
CREATE POLICY phase_a_owner_update ON public.links FOR UPDATE TO authenticated USING (user_id=(SELECT auth.uid())) WITH CHECK (user_id=(SELECT auth.uid()));
CREATE POLICY phase_a_owner_delete ON public.links FOR DELETE TO authenticated USING (user_id=(SELECT auth.uid()));
REVOKE INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER ON public.products_checkout FROM PUBLIC,anon;
CREATE POLICY phase_a_public_read ON public.products_checkout FOR SELECT TO anon,authenticated USING (true);
CREATE POLICY phase_a_owner_insert ON public.products_checkout FOR INSERT TO authenticated WITH CHECK (user_id=(SELECT auth.uid()) AND (product_id IS NULL OR EXISTS(SELECT 1 FROM public.products p WHERE p.id=product_id AND p.user_id=(SELECT auth.uid()))));
CREATE POLICY phase_a_owner_update ON public.products_checkout FOR UPDATE TO authenticated USING (user_id=(SELECT auth.uid())) WITH CHECK (user_id=(SELECT auth.uid()) AND (product_id IS NULL OR EXISTS(SELECT 1 FROM public.products p WHERE p.id=product_id AND p.user_id=(SELECT auth.uid()))));
CREATE POLICY phase_a_owner_delete ON public.products_checkout FOR DELETE TO authenticated USING (user_id=(SELECT auth.uid()));
REVOKE INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER ON public.link_clicks_daily FROM PUBLIC,anon,authenticated;
CREATE POLICY phase_a_click_read ON public.link_clicks_daily FOR SELECT TO authenticated USING (EXISTS(SELECT 1 FROM public.links l WHERE l.id=link_id AND l.user_id=(SELECT auth.uid())));
REVOKE EXECUTE ON FUNCTION public.increment_clicks(uuid),public.track_click_with_date(text) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.track_click_with_date(link_slug text) RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE target uuid;
BEGIN
 SELECT id INTO target FROM public.links WHERE slug=link_slug;
 IF target IS NULL THEN RETURN; END IF;
 UPDATE public.links SET clicks=coalesce(clicks,0)+1 WHERE id=target;
 INSERT INTO public.link_clicks_daily(link_id,click_date,click_count) VALUES(target,CURRENT_DATE,1)
 ON CONFLICT(link_id,click_date) DO UPDATE SET click_count=public.link_clicks_daily.click_count+1;
END $$;
GRANT EXECUTE ON FUNCTION public.track_click_with_date(text) TO service_role;
CREATE FUNCTION account_security.guard_link_counters() RETURNS trigger
LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
 IF current_user IN ('anon','authenticated') AND
 ((TG_OP='INSERT' AND coalesce(NEW.clicks,0)<>0) OR
 (TG_OP='UPDATE' AND NEW.clicks IS DISTINCT FROM OLD.clicks)) THEN
 RAISE EXCEPTION 'Tracking counters are server managed'; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION account_security.guard_link_counters() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER phase_a_link_counter_guard BEFORE INSERT OR UPDATE ON public.links
FOR EACH ROW EXECUTE FUNCTION account_security.guard_link_counters();
REVOKE INSERT,UPDATE,DELETE ON public.course_modules FROM PUBLIC,anon;
CREATE POLICY phase_a_course_owner_read ON public.course_modules FOR SELECT TO authenticated USING(user_id=(SELECT auth.uid()));
CREATE POLICY phase_a_course_owner_insert ON public.course_modules FOR INSERT TO authenticated WITH CHECK(user_id=(SELECT auth.uid()) AND EXISTS(SELECT 1 FROM public.products p WHERE p.id=course_id AND p.user_id=(SELECT auth.uid())));
CREATE POLICY phase_a_course_owner_update ON public.course_modules FOR UPDATE TO authenticated USING(user_id=(SELECT auth.uid())) WITH CHECK(user_id=(SELECT auth.uid()) AND EXISTS(SELECT 1 FROM public.products p WHERE p.id=course_id AND p.user_id=(SELECT auth.uid())));
CREATE POLICY phase_a_course_owner_delete ON public.course_modules FOR DELETE TO authenticated USING(user_id=(SELECT auth.uid()));
REVOKE INSERT,UPDATE,DELETE ON public.course_lessons FROM PUBLIC,anon;
CREATE POLICY phase_a_course_owner_read ON public.course_lessons FOR SELECT TO authenticated USING(user_id=(SELECT auth.uid()));
CREATE POLICY phase_a_course_owner_insert ON public.course_lessons FOR INSERT TO authenticated WITH CHECK(user_id=(SELECT auth.uid()) AND EXISTS(SELECT 1 FROM public.course_modules p WHERE p.id=module_id AND p.user_id=(SELECT auth.uid())));
CREATE POLICY phase_a_course_owner_update ON public.course_lessons FOR UPDATE TO authenticated USING(user_id=(SELECT auth.uid())) WITH CHECK(user_id=(SELECT auth.uid()) AND EXISTS(SELECT 1 FROM public.course_modules p WHERE p.id=module_id AND p.user_id=(SELECT auth.uid())));
CREATE POLICY phase_a_course_owner_delete ON public.course_lessons FOR DELETE TO authenticated USING(user_id=(SELECT auth.uid()));
CREATE POLICY phase_a_buyer_modules ON public.course_modules FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.customer_products cp WHERE cp.customer_id=(SELECT auth.uid()) AND cp.product_id=course_id AND cp.status='active' AND (cp.expires_at IS NULL OR cp.expires_at>now())));
CREATE POLICY phase_a_buyer_lessons ON public.course_lessons FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.customer_products cp JOIN public.course_modules cm ON cm.course_id=cp.product_id WHERE cm.id=module_id AND cp.customer_id=(SELECT auth.uid()) AND cp.status='active' AND (cp.expires_at IS NULL OR cp.expires_at>now())));
DROP POLICY "Upload avatars" ON storage.objects;
DROP POLICY "Upload avatars 1oj01fe_0" ON storage.objects;
DROP POLICY "Upload product images 1e6ovep_0" ON storage.objects;
DROP POLICY "Upload products" ON storage.objects;
DROP POLICY "View avatars" ON storage.objects;
DROP POLICY "View avatars 1oj01fe_0" ON storage.objects;
DROP POLICY "View product images 1e6ovep_0" ON storage.objects;
DROP POLICY "View products" ON storage.objects;
-- All uploads and paid signing go through authenticated server routes.
-- Public avatar/image download remains available through public bucket URLs.
CREATE POLICY phase_a_public_media_read ON storage.objects FOR SELECT TO anon,authenticated
USING(bucket_id IN ('avatars','products-images'));
-- No client INSERT/UPDATE/DELETE or paid-content SELECT policy.
CREATE FUNCTION public.phase_a_file_owned(p_path text,p_owner uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM storage.objects o WHERE o.bucket_id='products' AND o.name=p_path
 AND (o.owner_id=p_owner::text OR o.owner=p_owner OR
 (o.owner_id IS NULL AND o.owner IS NULL AND split_part(o.name,'/',1)=p_owner::text
 AND o.user_metadata->>'uploaded_by'=p_owner::text)))
$$;
REVOKE ALL ON FUNCTION public.phase_a_file_owned(text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.phase_a_file_owned(text,uuid) TO service_role;
-- Checkout catalog deliberately excludes paid file URLs and paths.
DROP POLICY phase_a_public_read ON public.products_checkout;
CREATE POLICY phase_a_checkout_owner_read ON public.products_checkout FOR SELECT TO authenticated USING(user_id=(SELECT auth.uid()));
REVOKE SELECT ON public.products_checkout FROM PUBLIC,anon;
CREATE VIEW public.public_checkouts WITH(security_barrier=true) AS
 SELECT id,user_id,title,description,price,image_url,checkout_slug,is_active,created_at,type,status,is_marketplace,affiliate_url,product_id
 FROM public.products_checkout WHERE is_active AND status='active';
REVOKE ALL ON public.public_checkouts FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.public_checkouts TO anon,authenticated,service_role;
-- Subscription state is billing authority, not a client-editable preference.
REVOKE INSERT,UPDATE,DELETE ON public.subscriptions FROM PUBLIC,anon,authenticated;
DROP POLICY "Users can insert own subscriptions" ON public.subscriptions;
DROP POLICY "Users can update own subscriptions" ON public.subscriptions;
DROP POLICY "Users can insert own lesson progress" ON public.lesson_progress;
DROP POLICY "Users can update own lesson progress" ON public.lesson_progress;
CREATE POLICY phase_a_progress_insert ON public.lesson_progress FOR INSERT TO authenticated
WITH CHECK(user_id=(SELECT auth.uid()) AND EXISTS(SELECT 1 FROM public.course_lessons l WHERE l.id=lesson_id));
CREATE POLICY phase_a_progress_update ON public.lesson_progress FOR UPDATE TO authenticated
USING(user_id=(SELECT auth.uid()))
WITH CHECK(user_id=(SELECT auth.uid()) AND EXISTS(SELECT 1 FROM public.course_lessons l WHERE l.id=lesson_id));
