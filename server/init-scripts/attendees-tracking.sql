-- ATTENDEES
create table public.attendees (
  id          uuid NOT NULL primary key, -- UUID from auth.users
  full_name   text NOT NULL,
  email		    text,
  company     text,
  title       text,
  pic_url	    text,
  idp_user_id int,
  is_online   boolean
);

--ACCESSES
create table public.accesses (
  id 			            bigint generated by default as identity primary key,
  attendee_id 	      uuid references public.attendees not null,
  inserted_at 	      timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at 	        timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  summit_id 	        int,
  current_url  	      text NOT NULL,
  attendee_ip	        text NOT NULL,
  browser_user_agent  text
);

--ACCESS_TRACKING
create table public.access_tracking (
  id                  bigint generated by default as identity primary key,
  access_id 	        bigint references public.accesses not null,
  inserted_at 	      timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  summit_id 	        int,
  url	                text NOT NULL,
  attendee_ip 	      text NOT NULL,
  browser_user_agent  text
);

comment on table public.access_tracking is 'Access tracking history';

--updated_at auto refresh
create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on accesses 
  for each row execute procedure moddatetime (updated_at);

-- alter table public.attendees enable row level security;
-- alter table public.accesses enable row level security;
-- alter table public.access_tracking enable row level security;

-- create policy "Allow logged-in read access" on public.accesses for select using ( auth.role() = 'authenticated' );
-- create policy "Allow individual insert access" on public.accesses for insert with check ( auth.uid() = id );
-- create policy "Allow individual update access" on public.accesses for update using ( auth.uid() = id );

-- create policy "Allow logged-in full access" on public.access_tracking for all using ( auth.role() = 'authenticated' );
-- create policy "Allow logged-in read access" on public.access_tracking using ( auth.role() = 'authenticated' );
-- create policy "Allow individual insert access" on public.access_tracking for insert with check ( auth.uid() = user_id );
-- create policy "Allow individual update access" on public.access_tracking for update using ( auth.uid() = user_id );

-- Send "previous data" on change 
alter table public.attendees replica identity full; 
alter table public.accesses replica identity full; 
alter table public.access_tracking replica identity full;

-- DUMMY DATA
--insert into public.attendees (id, full_name, email, pic_url)
--values
--    ('8d0fd2b3-9ca7-4d9e-a95f-9e13dded323e', 'Test User', 'dummy@nomail.com', 'https://i1.wp.com/dayinlab.com/wp-content/uploads/2018/04/iron-man.jpg?resize=470%2C260');

--insert into public.accesses (attendee_id, summit_id, current_url, attendee_ip, browser_user_agent)
--values ('8d0fd2b3-9ca7-4d9e-a95f-9e13dded323e', 8, 'https://infinityfestival2020.fnvirtual.app/a/', '190.211.134.2', 'Chrome');

--insert into public.access_tracking (access_id, summit_id, url, attendee_ip, browser_user_agent)
--values
--    (1, 8, 'https://infinityfestival2020.fnvirtual.app/', '190.211.134.2', 'Chrome'),
--    (1, 8, 'https://infinityfestival2020.fnvirtual.app/a/', '190.211.134.2', 'Chrome');