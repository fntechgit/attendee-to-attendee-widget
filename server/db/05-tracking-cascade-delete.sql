ALTER TABLE public.access_tracking 
DROP CONSTRAINT access_tracking_atendee_news_id_fkey;

ALTER TABLE public.access_tracking 
ADD CONSTRAINT access_tracking_atendee_news_id_fkey FOREIGN KEY (atendee_news_id) REFERENCES public.attendees_news (id)
ON DELETE CASCADE;