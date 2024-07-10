ALTER TABLE public.attendees_news
ADD COLUMN public_profile_show_full_name BOOLEAN DEFAULT FALSE;

ALTER TABLE public.attendees_news
ADD COLUMN public_profile_allow_share_my_profile_pic BOOLEAN DEFAULT FALSE;

ALTER TABLE public.attendees_news
ADD COLUMN public_profile_allow_share_my_social_media_info BOOLEAN DEFAULT FALSE;
