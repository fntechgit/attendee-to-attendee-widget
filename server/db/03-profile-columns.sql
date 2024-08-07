ALTER TABLE public.attendees_news
ADD COLUMN public_profile_show_full_name BOOLEAN DEFAULT FALSE;

ALTER TABLE public.attendees_news
ADD COLUMN public_profile_show_photo BOOLEAN DEFAULT FALSE;

ALTER TABLE public.attendees_news
ADD COLUMN public_profile_show_social_media_info BOOLEAN DEFAULT FALSE;

ALTER TABLE public.attendees_news
ADD COLUMN public_profile_show_bio BOOLEAN DEFAULT FALSE;


