------------------------------------------------------------------------------------------------------
-- ATTENDEES NEWS
------------------------------------------------------------------------------------------------------

create table public.attendees_news (
  id 			            		          bigint generated by default as identity primary key,
  attendee_id 	      				      uuid references auth.users not null,
  summit_id 	        			        int not null,
  full_name                         text not null,
  email		                          text,
  company                           text,
  title                             text,
  pic_url	                          text,
  bio	                              text,
  idp_user_id                       int,
  is_online                         boolean,
  social_info                       jsonb,
  badges_info                       jsonb,
  public_profile_show_email         boolean,
  public_profile_allow_chat_with_me boolean,
  inserted_at 	      				      timestamp without time zone default timezone('utc'::text, now()) not null,
  updated_at 	        			        timestamp without time zone default timezone('utc'::text, now()) not null,
  current_url  	      				      text not null,
  attendee_ip	        			        text not null
);

create index IDX_IDP_USER_ID on public.attendees_news (idp_user_id, summit_id);
create index IDX_ATTENDEE_ID on public.attendees_news (attendee_id, summit_id);
create index IDX_EMAIL on public.attendees_news (((lower(email))), summit_id);

-- updated_at auto refresh
create extension if not exists moddatetime schema extensions;
create trigger handle_updated_at before update on public.attendees_news 
  for each row execute procedure moddatetime (updated_at);

-- Send "previous data" on change 
alter table public.attendees_news replica identity full; 

-- alter table public.attendees_news enable row level security;

-- create policy "Public profiles are viewable by the owner."
--   on public.attendees_news for select
--   using ( auth.uid() = attendee_id );

-- create policy "Attendees can insert news."
--   on public.attendees_news for insert
--   with check ( auth.uid() = attendee_id );

-- create policy "Attendees can update news."
--   on public.attendees_news for update
--   using ( auth.uid() = attendee_id );

-- Set up Realtime
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.attendees_news;

------------------------------------------------------------------------------------------------------
--ACCESS/NEWS TRACKING
------------------------------------------------------------------------------------------------------
create table public.access_tracking (
  id                  bigint generated by default as identity primary key,
  atendee_news_id     bigint references public.attendees_news not null,
  inserted_at 	      timestamp without time zone default timezone('utc'::text, now()) not null,
  summit_id 	        int,
  url	                text not null,
  attendee_ip 	      text not null,
  browser_user_agent  text
);

------------------------------------------------------------------------------------------------------
--SUMMIT ATTENDEE ROLES
------------------------------------------------------------------------------------------------------

create table public.summit_attendee_roles (
  id                bigint generated by default as identity primary key,
  inserted_at       timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at        timestamp with time zone default timezone('utc'::text, now()) not null,
  summit_id         bigint not null,
  summit_event_id   bigint,
  idp_user_id       bigint not null,
  member_id         bigint not null,
  full_name         text not null
);

comment on table public.summit_attendee_roles is 'Attendee Roles (QA/Help)';

create unique index IDX_SUMMIT_EVENT_MEMBER ON public.summit_attendee_roles (summit_id, summit_event_id, member_id);

------------------------------------------------------------------------------------------------------
--SUMMIT GETSTREAM APPS
------------------------------------------------------------------------------------------------------

CREATE TABLE public.summit_getstream_apps (
   summit_id bigint NOT NULL,
   api_key text NOT NULL,
   api_secret text NOT NULL
);

alter table public.summit_getstream_apps add column id bigint generated by default as identity primary key;

comment on table public.summit_getstream_apps is 'getstream.io applications';

create unique index IDX_SUMMIT ON public.summit_getstream_apps (summit_id);

------------------------------------------------------------------------------------------------------
--STORAGE
------------------------------------------------------------------------------------------------------

insert into storage.buckets (id, name)
values ('chat-room-images', 'chat-room-images');

create policy "Chat room images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'chat-room-images' );

create policy "Anyone can upload a chat room image."
  on storage.objects for insert
  with check ( bucket_id = 'chat-room-images' );

create policy "Anyone can update  chat room image."
  on storage.objects for update
  with check ( bucket_id = 'chat-room-images' );
