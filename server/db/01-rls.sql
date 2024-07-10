-- Enable RLS

ALTER TABLE "public"."access_tracking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."attendees_news" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."summit_attendee_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."summit_entity_updates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."summit_getstream_apps" ENABLE ROW LEVEL SECURITY;

-- Policies

CREATE POLICY "Enable insert for authenticated users only" 
ON "public"."access_tracking" AS PERMISSIVE 
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users only" 
ON "public"."access_tracking" AS PERMISSIVE 
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users only" 
ON "public"."attendees_news" AS PERMISSIVE 
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users only" 
ON "public"."attendees_news" AS PERMISSIVE 
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable update for authenticated users only" 
ON "public"."attendees_news" AS PERMISSIVE 
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users only" 
ON "public"."summit_attendee_roles" AS PERMISSIVE 
FOR SELECT TO authenticated USING (true);

